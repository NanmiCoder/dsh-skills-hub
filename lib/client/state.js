/**
 * Skills Hub panel state machine — framework-free, so it is unit-testable
 * outside React.
 *
 * Ported from the reference desktop store (`desktop/src/stores/marketStore.ts`)
 * with the same invariants:
 *
 *  - **stale-response rejection**: every request family carries a monotonically
 *    increasing sequence; a response whose sequence is no longer current is
 *    dropped instead of overwriting newer state.
 *  - **merge by id**: a page append and an install/uninstall patch both merge on
 *    `NormalizedSkill.id`, and pagination never duplicates a skill the list
 *    already holds.
 *  - **in-flight guards**: one install/uninstall per id, one page per cursor, one
 *    detail/file request per target.
 *  - **detail/file caching**: reopening a skill is instant and cannot blank the
 *    pane with a spinner.
 *  - **local index**: `filters.installed === 'installed'` lists what is already
 *    on disk (`fetchInstalled`) instead of asking the market, matching the
 *    contract's §5.3 behaviour.
 *
 * Aborts are control flow, never user-visible: the panel aborts superseded
 * requests on purpose, and `isAbortError` keeps those rejections out of
 * `state.error` / `state.notice`.
 */
import { useState, useSyncExternalStore } from 'react';
import { fetchInstalled, fetchMarketList, fetchSkillDetail, fetchSkillFile, installSkill, isAbortError, uninstallSkill, } from "./api.js";
/** One remote page (the reference store's `PAGE_SIZE`). */
const PAGE_SIZE = 24;
/** Search debounce, mirroring the reference store: typing must not fire per keystroke. */
const SEARCH_DEBOUNCE_MS = 300;
/** localStorage key of the dismissed disclaimer (frozen by docs/CONTRACT.md §5.3). */
const DISCLAIMER_STORAGE_KEY = 'dsh-skills-hub.disclaimer';
/**
 * Notice values that are dictionary *codes* rather than literal text.
 *
 * The controller has no locale (it is framework-free and testable), so it stores
 * a code for the panel to translate and stores a verbatim message for anything
 * that has no dictionary entry — which is exactly what a Host error is.
 */
export const MARKET_NOTICE_CODES = ['installDone', 'uninstallDone'];
/** Whether a `state.notice` value is a dictionary code (as opposed to verbatim text). */
export function isMarketNoticeCode(notice) {
    return MARKET_NOTICE_CODES.includes(notice);
}
/** Baseline source health, mirroring the Host's own initial value (`{ status: 'ok' }` per source). */
function emptySources() {
    return { clawhub: { status: 'ok' }, skillhub: { status: 'ok' } };
}
function initialState() {
    return {
        filters: { q: '', source: 'all', security: 'all', installed: 'all' },
        items: [],
        nextCursor: null,
        sources: emptySources(),
        loading: false,
        loadingMore: false,
        error: null,
        view: { kind: 'home' },
        detail: null,
        detailLoading: false,
        detailError: null,
        activeTab: 'overview',
        file: null,
        fileLoading: false,
        installingIds: new Set(),
        confirmInstallId: null,
        disclaimerDismissed: readDisclaimerDismissed(),
        notice: null,
    };
}
/** Read the persisted disclaimer dismissal; storage may be unavailable (private mode, sandboxed frame). */
function readDisclaimerDismissed() {
    try {
        return globalThis.localStorage?.getItem(DISCLAIMER_STORAGE_KEY) === '1';
    }
    catch {
        return false;
    }
}
/** Persist the dismissal; a storage failure only means it is not remembered. */
function writeDisclaimerDismissed() {
    try {
        globalThis.localStorage?.setItem(DISCLAIMER_STORAGE_KEY, '1');
    }
    catch {
        // Ignored on purpose: the panel still hides the disclaimer for this session.
    }
}
function errorMessage(error) {
    return error instanceof Error ? error.message : String(error);
}
function withId(ids, id) {
    const next = new Set(ids);
    next.add(id);
    return next;
}
function withoutId(ids, id) {
    const next = new Set(ids);
    next.delete(id);
    return next;
}
function fileCacheKey(id, path) {
    return `${id}\u0000${path}`;
}
/** Replace one source's health without dropping the others. */
function mergeSourceStatus(sources, source, status) {
    return { ...sources, [source]: status };
}
/** Case-insensitive match over the fields the local index can search. */
function matchesQuery(skill, query) {
    if (query === '')
        return true;
    return (skill.name.toLowerCase().includes(query) ||
        skill.slug.toLowerCase().includes(query) ||
        skill.summary.toLowerCase().includes(query) ||
        skill.author.handle.toLowerCase().includes(query));
}
/**
 * Map one locally installed directory onto the card shape.
 *
 * `NormalizedSkill.source` is the two-value *market* union, so a directory with
 * no provenance sidecar (`source: 'local'`) has no truthful value there; it is
 * mapped onto the first market source purely to satisfy the display type. Its
 * `id` stays `local:<dir>`, so an uninstall attempt is rejected by the Host
 * (or by `parseMarketId`) rather than removing the wrong directory, and its
 * `securityStatus: 'unknown'` marks it as not market-audited in the UI.
 */
function installedRecordToSkill(record) {
    return {
        id: record.id,
        source: record.source === 'local' ? 'clawhub' : record.source,
        slug: record.slug,
        name: record.name,
        summary: record.summary ?? '',
        author: { handle: '' },
        stats: { downloads: 0 },
        tags: [],
        version: record.version,
        securityStatus: 'unknown',
        installState: 'installed',
        installedInfo: {
            version: record.version,
            installedAt: record.installedAt,
            dirName: record.dirName,
        },
    };
}
/** Copy the install-related fields of a fresh skill onto a cached detail. */
function patchDetail(detail, updated) {
    return {
        ...detail,
        installState: updated.installState,
        notInstallableReason: updated.notInstallableReason,
        installedInfo: updated.installedInfo,
    };
}
function createInternalController() {
    let state = initialState();
    const listeners = new Set();
    // Response caches survive navigation inside the panel; they are keyed by id so
    // a returning reader sees the skill they left, not a spinner.
    const detailCache = new Map();
    const fileCache = new Map();
    // Request bookkeeping. Sequences are *only* bumped by the family they belong
    // to; a stale response is dropped by comparing its captured sequence.
    let listSequence = 0;
    let detailSequence = 0;
    let fileSequence = 0;
    let listAbort = null;
    let detailAbort = null;
    let fileAbort = null;
    let inFlightList = null;
    let inFlightCursor = null;
    let inFlightFileKey = null;
    let debounceTimer = null;
    /**
     * Raw local index behind the installed filter.
     *
     * Kept alongside `state.items` because that branch is searched *in place*: the
     * index is already in memory, so a keystroke must not cost a round trip the way
     * a remote search does. `installedIndexLoaded` distinguishes "not fetched yet"
     * (a query change still needs the load) from "fetched and empty".
     */
    let installedRecords = [];
    let installedIndexLoaded = false;
    function commit(patch) {
        state = { ...state, ...patch };
        // Iterate a copy: a listener may unsubscribe while being notified.
        for (const listener of [...listeners])
            listener();
    }
    function getSnapshot() {
        return state;
    }
    function subscribe(listener) {
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    }
    function cancelDebounce() {
        if (debounceTimer === null)
            return;
        clearTimeout(debounceTimer);
        debounceTimer = null;
    }
    /** Identity of a list request: any filter change makes a different request. */
    function currentListKey() {
        const { q, source, security, installed } = state.filters;
        return JSON.stringify([q.trim(), source, security, installed]);
    }
    function setNotice(notice) {
        commit({ notice });
    }
    /** Whether a skill still belongs in the list under the active installed-filter. */
    function keepUnderInstalledFilter(skill) {
        if (state.filters.installed === 'installed')
            return skill.installState === 'installed';
        if (state.filters.installed === 'installable')
            return skill.installState !== 'installed';
        return true;
    }
    /** Project the cached local index through the current query, with no request. */
    function commitInstalledIndex(extra = {}) {
        const query = state.filters.q.trim().toLowerCase();
        commit({
            ...extra,
            items: installedRecords.map(installedRecordToSkill).filter((skill) => matchesQuery(skill, query)),
            nextCursor: null,
        });
    }
    /**
     * After an install/uninstall the directory listing is the authority for the
     * installed view, so re-read it when it is the view on screen.
     */
    function refreshInstalledIndexIfActive() {
        if (state.filters.installed !== 'installed')
            return;
        // Until the fresh listing lands, the cached one may not be projected again.
        installedIndexLoaded = false;
        void refresh();
    }
    /**
     * Apply the Host's authoritative skill record after an install/uninstall.
     *
     * The list, the open detail and the detail cache are patched together: leaving
     * the cache alone would resurrect the pre-install badge the next time the skill
     * is opened, which is exactly the stale state the reference store guards
     * against.
     */
    function applySkillUpdate(updated) {
        const items = state.items
            .map((item) => (item.id === updated.id ? { ...item, ...updated } : item))
            .filter(keepUnderInstalledFilter);
        const patch = { items };
        if (state.detail !== null && state.detail.id === updated.id) {
            const patched = patchDetail(state.detail, updated);
            detailCache.set(updated.id, patched);
            patch.detail = patched;
        }
        else {
            const cached = detailCache.get(updated.id);
            if (cached !== undefined)
                detailCache.set(updated.id, patchDetail(cached, updated));
        }
        commit(patch);
    }
    /**
     * Load the first page for the current filters.
     *
     * Concurrent callers asking for the *same* filters share one request: the panel
     * root and the catalogue component both kick off the first load, and React's
     * development double-invocation repeats it. A different filter set always
     * issues a fresh request.
     */
    async function refresh() {
        cancelDebounce();
        const key = currentListKey();
        const running = inFlightList;
        if (running !== null && running.key === key)
            return running.promise;
        const filters = state.filters;
        const sequence = ++listSequence;
        listAbort?.abort();
        const controller = new AbortController();
        listAbort = controller;
        inFlightCursor = null;
        // Clearing the page is deliberate (it is what the reference store does): the
        // grid must not show results that belong to the previous filters.
        commit({ loading: true, loadingMore: false, error: null, items: [], nextCursor: null });
        const promise = (async () => {
            try {
                if (filters.installed === 'installed') {
                    // Local index: what is already on disk, no upstream request.
                    const records = await fetchInstalled(controller.signal);
                    if (sequence !== listSequence)
                        return;
                    installedRecords = records;
                    installedIndexLoaded = true;
                    commitInstalledIndex({ loading: false });
                    return;
                }
                const result = await fetchMarketList({
                    q: filters.q.trim() || undefined,
                    source: filters.source,
                    security: filters.security,
                    installed: filters.installed,
                    limit: PAGE_SIZE,
                }, controller.signal);
                if (sequence !== listSequence)
                    return;
                commit({
                    items: result.items,
                    nextCursor: result.nextCursor,
                    sources: result.sources,
                    loading: false,
                });
            }
            catch (error) {
                // A superseded or aborted request must not write an error the reader
                // would see for a healthy panel.
                if (sequence !== listSequence || isAbortError(error))
                    return;
                commit({ error: errorMessage(error), loading: false });
            }
            finally {
                if (inFlightList?.sequence === sequence)
                    inFlightList = null;
            }
        })();
        inFlightList = { key, sequence, promise };
        return promise;
    }
    /** Append the next page, de-duplicating by id and by cursor. */
    async function loadMore() {
        const cursor = state.nextCursor;
        if (cursor === null || state.loadingMore || state.loading)
            return;
        // The observer can fire again before the page lands; one request per cursor.
        if (inFlightCursor === cursor)
            return;
        const filters = state.filters;
        const sequence = listSequence;
        inFlightCursor = cursor;
        commit({ loadingMore: true, error: null });
        try {
            const result = await fetchMarketList({
                q: filters.q.trim() || undefined,
                source: filters.source,
                security: filters.security,
                installed: filters.installed,
                cursor,
                limit: PAGE_SIZE,
            }, listAbort?.signal);
            if (sequence !== listSequence)
                return;
            const seen = new Set(state.items.map((item) => item.id));
            const appended = result.items.filter((item) => !seen.has(item.id));
            commit({
                items: [...state.items, ...appended],
                nextCursor: result.nextCursor,
                sources: result.sources,
                loadingMore: false,
            });
        }
        catch (error) {
            if (sequence !== listSequence || isAbortError(error))
                return;
            commit({ loadingMore: false, error: errorMessage(error) });
        }
        finally {
            if (inFlightCursor === cursor)
                inFlightCursor = null;
        }
    }
    /**
     * Typing rebuilds the catalogue after a pause, but the input stays controlled:
     * `filters.q` updates immediately so the field never lags the keyboard.
     */
    function setQuery(q) {
        commit({ filters: { ...state.filters, q } });
        cancelDebounce();
        // The local index is searched in place: it is already in memory, so a
        // keystroke must not cost a round trip (and must not re-list the directory).
        if (state.filters.installed === 'installed' && installedIndexLoaded) {
            commitInstalledIndex();
            return;
        }
        debounceTimer = setTimeout(() => {
            debounceTimer = null;
            void refresh();
        }, SEARCH_DEBOUNCE_MS);
    }
    function applyInstantFilter(patch) {
        commit({ filters: { ...state.filters, ...patch } });
        // The queued search debounce would ask for the same filters a moment later.
        cancelDebounce();
        void refresh();
    }
    function isCurrentDetail(id) {
        return state.view.kind === 'detail' && state.view.id === id;
    }
    async function loadDetail(id) {
        const sequence = ++detailSequence;
        detailAbort?.abort();
        const controller = new AbortController();
        detailAbort = controller;
        try {
            const { skill, sourceStatus } = await fetchSkillDetail(id, controller.signal);
            // The reader may have closed the panel view or opened another skill while
            // this was in flight; the newest request owns the pane.
            if (sequence !== detailSequence || !isCurrentDetail(id))
                return;
            detailCache.set(id, skill);
            commit({
                detail: skill,
                detailLoading: false,
                detailError: null,
                sources: mergeSourceStatus(state.sources, skill.source, sourceStatus),
            });
        }
        catch (error) {
            if (sequence !== detailSequence || isAbortError(error))
                return;
            commit({ detailLoading: false, detailError: errorMessage(error) });
        }
    }
    /** Open one skill: cache first, network only when the cache misses. */
    async function openDetail(id) {
        const cached = detailCache.get(id);
        commit({
            view: { kind: 'detail', id },
            activeTab: 'overview',
            file: null,
            fileLoading: false,
            detailError: null,
        });
        if (cached !== undefined) {
            commit({ detail: cached, detailLoading: false });
            return;
        }
        commit({ detail: null, detailLoading: true });
        await loadDetail(id);
    }
    function closeDetail() {
        // Bump both sequences: an in-flight response for the closed skill must not
        // land on the catalogue, and neither must a file for it.
        detailSequence += 1;
        fileSequence += 1;
        detailAbort?.abort();
        fileAbort?.abort();
        commit({
            view: { kind: 'home' },
            detail: null,
            detailLoading: false,
            detailError: null,
            file: null,
            fileLoading: false,
            activeTab: 'overview',
        });
    }
    function setTab(tab) {
        commit({ activeTab: tab });
        if (tab !== 'files')
            return;
        // Opening the Files tab with nothing selected would show an empty pane; the
        // first file is the skill's entry point in practice (SKILL.md).
        if (state.file !== null || state.fileLoading)
            return;
        const detail = state.detail;
        if (detail === null)
            return;
        const first = detail.files[0];
        if (first === undefined)
            return;
        void selectFile(first.path);
    }
    /** Load one file of the open skill, cache first and one request per path. */
    async function selectFile(path) {
        if (state.view.kind !== 'detail')
            return;
        const id = state.view.id;
        const key = fileCacheKey(id, path);
        const cached = fileCache.get(key);
        if (cached !== undefined) {
            commit({ file: cached, fileLoading: false });
            return;
        }
        if (inFlightFileKey === key)
            return;
        const sequence = ++fileSequence;
        fileAbort?.abort();
        const controller = new AbortController();
        fileAbort = controller;
        inFlightFileKey = key;
        commit({ file: null, fileLoading: true });
        try {
            const file = await fetchSkillFile(id, path, controller.signal);
            if (sequence !== fileSequence)
                return;
            fileCache.set(key, file);
            commit({ file, fileLoading: false });
        }
        catch (error) {
            if (sequence !== fileSequence || isAbortError(error))
                return;
            // A file failure is a notice, not a region error: the rest of the skill
            // detail is still perfectly readable.
            commit({ file: null, fileLoading: false, notice: errorMessage(error) });
        }
        finally {
            if (inFlightFileKey === key)
                inFlightFileKey = null;
        }
    }
    /** Ask for confirmation before installing; the dialog is the only way in. */
    function requestInstall(id) {
        if (state.installingIds.has(id))
            return;
        commit({ confirmInstallId: id, notice: null });
    }
    function cancelInstall() {
        const id = state.confirmInstallId;
        if (id === null)
            return;
        // While the install runs the dialog stays up (busy) — cancelling the view is
        // not cancelling the request, so the button is inert until it settles.
        if (state.installingIds.has(id))
            return;
        commit({ confirmInstallId: null });
    }
    async function confirmInstall() {
        const id = state.confirmInstallId;
        if (id === null || state.installingIds.has(id))
            return;
        commit({ installingIds: withId(state.installingIds, id), notice: null });
        try {
            const result = await installSkill(id);
            applySkillUpdate(result.skill);
            setNotice('installDone');
            // The installed view is the local index: a brand-new directory is only
            // visible once the Host has re-scanned it.
            refreshInstalledIndexIfActive();
        }
        catch (error) {
            if (!isAbortError(error))
                setNotice(errorMessage(error));
        }
        finally {
            // Close the dialog only once the request settled, so the busy state it
            // shows belongs to the request the reader confirmed.
            commit({ installingIds: withoutId(state.installingIds, id), confirmInstallId: null });
        }
    }
    /** Uninstall straight from a card or the detail rail — no confirmation dialog. */
    async function uninstall(id) {
        if (state.installingIds.has(id))
            return;
        commit({ installingIds: withId(state.installingIds, id), notice: null });
        try {
            const result = await uninstallSkill(id);
            applySkillUpdate(result.skill);
            setNotice('uninstallDone');
            // Same reason as install: the removed directory must not come back from a
            // stale in-memory listing when the reader narrows the query.
            refreshInstalledIndexIfActive();
        }
        catch (error) {
            if (!isAbortError(error))
                setNotice(errorMessage(error));
        }
        finally {
            commit({ installingIds: withoutId(state.installingIds, id) });
        }
    }
    function dismissDisclaimer() {
        commit({ disclaimerDismissed: true });
        writeDisclaimerDismissed();
    }
    function dismissNotice() {
        setNotice(null);
    }
    return {
        get state() {
            return state;
        },
        injected: { useMarketController },
        refresh,
        loadMore,
        setQuery,
        setSource: (source) => {
            applyInstantFilter({ source });
        },
        setSecurity: (security) => {
            applyInstantFilter({ security });
        },
        setInstalledFilter: (installed) => {
            applyInstantFilter({ installed });
        },
        openDetail,
        closeDetail,
        setTab,
        selectFile,
        requestInstall,
        cancelInstall,
        confirmInstall,
        uninstall,
        dismissDisclaimer,
        dismissNotice,
        subscribe,
        getSnapshot,
    };
}
/**
 * Create one panel controller.
 *
 * `useMarketController` calls this per mounted panel; `createMarketController` is
 * also the entry point for tests, which is why the factory performs no I/O — the
 * first request only happens when the panel asks for it.
 */
export function createMarketController() {
    return createInternalController();
}
/**
 * React binding.
 *
 * `useSyncExternalStore` is the whole subscription: React owns the subscribe /
 * unsubscribe pairing, so an unmount cannot leak a listener, and the initializer
 * runs at most twice under StrictMode's development double-invocation (the extra
 * controller is discarded and holds no resources — no request, timer or
 * subscription exists until the panel asks for one).
 *
 * There is deliberately no unmount disposer: a StrictMode cleanup would tear down
 * the controller React is still using, and a late response writing into this
 * store is inert — nothing but the snapshot identity of an external store
 * changes, so no React state update happens after unmount.
 */
export function useMarketController() {
    const [controller] = useState(createInternalController);
    useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
    return controller;
}
