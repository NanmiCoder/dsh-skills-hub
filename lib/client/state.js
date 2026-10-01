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
 *  - **detail snapshots**: reopening can show the previous copy immediately,
 *    while the Host rechecks its TTL and current install annotations.
 *  - **local management**: the InstalledSkills component independently lists what is already
 *    on disk (`fetchInstalled`) instead of asking the market, matching the
 *    contract's §5.3 behaviour.
 *
 * Aborts are control flow, never user-visible: the panel aborts superseded
 * requests on purpose, and `isAbortError` keeps those rejections out of
 * `state.error` / `state.notice`.
 */
import { useState, useSyncExternalStore } from 'react';
import { fetchMarketCategories, fetchMarketList, fetchSkillDetail, fetchSkillFile, installSkill, isAbortError, uninstallSkill, } from "./api.js";
/** One remote page (the reference store's `PAGE_SIZE`). */
const PAGE_SIZE = 24;
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
        filters: { q: '', scope: 'catalog', category: 'all', source: 'all', security: 'all', installed: 'all' },
        categories: [],
        items: [],
        nextCursor: null,
        total: null,
        sources: emptySources(),
        itemStatuses: {},
        loading: false,
        loadingMore: false,
        error: null,
        view: { kind: 'home' },
        detail: null,
        detailStatus: null,
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
function itemStatuses(items, sources) {
    return Object.fromEntries(items.map((item) => [item.id, sources[item.source]]));
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
    // Display snapshots keep navigation instant. Every reopening still asks the
    // Host, which owns the configured TTL and persistent upstream cache.
    const detailCache = new Map();
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
    // ClawHub slugs are shared across authors, so `clawhub:<slug>` does not name
    // one skill. Every card and detail records whose skill it showed, and every
    // later read or install of that id asks for that author.
    const owners = new Map();
    function rememberOwners(items) {
        for (const item of items) {
            if (item.source === 'clawhub' && item.author.handle)
                owners.set(item.id, item.author.handle);
        }
    }
    function ownerOf(id) {
        return owners.get(id);
    }
    function commit(patch) {
        if (patch.items)
            rememberOwners(patch.items);
        if (patch.detail)
            rememberOwners([patch.detail]);
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
    /** Identity of a list request: any filter change makes a different request. */
    function currentListKey() {
        const { q, scope, category, source, security, installed } = state.filters;
        return JSON.stringify([q.trim(), scope, category, source, security, installed]);
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
            detailCache.set(updated.id, { skill: patched, status: state.detailStatus ?? { status: 'ok' } });
            patch.detail = patched;
        }
        else {
            const cached = detailCache.get(updated.id);
            if (cached !== undefined) {
                detailCache.set(updated.id, { skill: patchDetail(cached.skill, updated), status: cached.status });
            }
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
    async function refresh(options = {}) {
        // A refresh also follows external local management changes.
        detailCache.clear();
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
        commit({ loading: true, loadingMore: false, error: null, items: [], itemStatuses: {}, nextCursor: null, total: null });
        const promise = (async () => {
            try {
                const result = await fetchMarketList({
                    q: filters.q.trim() || undefined,
                    scope: filters.scope,
                    category: filters.category,
                    source: filters.source,
                    security: filters.security,
                    installed: filters.installed,
                    limit: PAGE_SIZE,
                }, controller.signal, 
                // The reader's refresh must reach the Host cache; an automatic load
                // is happy to be answered from it.
                { refresh: options.force === true });
                if (sequence !== listSequence)
                    return;
                commit({
                    items: result.items,
                    nextCursor: result.nextCursor,
                    total: result.total ?? null,
                    sources: result.sources,
                    itemStatuses: itemStatuses(result.items, result.sources),
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
                scope: filters.scope,
                category: filters.category,
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
                itemStatuses: { ...state.itemStatuses, ...itemStatuses(appended, result.sources) },
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
     * Applies a submitted query. The search field keeps its own draft and only
     * calls this on Enter (or clear), so typing never reloads the catalogue.
     */
    function applyInstantFilter(patch) {
        commit({ filters: { ...state.filters, ...patch } });
        void refresh();
    }
    function setQuery(q) {
        // The live market is a search scope: with nothing to search it has no list
        // to show, so an emptied query returns to the catalogue.
        applyInstantFilter(q.trim() === '' ? { q, scope: 'catalog' } : { q });
    }
    let categoriesRequest = null;
    /**
     * The bar is navigation over the catalogue: a failure leaves it hidden and is
     * retried on the next call, never surfaced as a catalogue error.
     */
    function loadCategories() {
        if (categoriesRequest !== null)
            return categoriesRequest;
        const request = (async () => {
            try {
                const result = await fetchMarketCategories();
                commit({ categories: result.items });
                if (result.items.length === 0)
                    categoriesRequest = null;
            }
            catch {
                categoriesRequest = null;
            }
        })();
        categoriesRequest = request;
        return request;
    }
    function isCurrentDetail(id) {
        return state.view.kind === 'detail' && state.view.id === id;
    }
    async function loadDetail(id, options = {}) {
        const sequence = ++detailSequence;
        detailAbort?.abort();
        const controller = new AbortController();
        detailAbort = controller;
        try {
            const { skill, sourceStatus } = await fetchSkillDetail(id, controller.signal, {
                refresh: options.refresh === true,
                owner: ownerOf(id),
            });
            // The reader may have closed the panel view or opened another skill while
            // this was in flight; the newest request owns the pane.
            if (sequence !== detailSequence || !isCurrentDetail(id))
                return;
            detailCache.set(id, { skill, status: sourceStatus });
            commit({
                detail: skill,
                detailStatus: sourceStatus,
                detailLoading: false,
                detailError: null,
                sources: mergeSourceStatus(state.sources, skill.source, sourceStatus),
            });
        }
        catch (error) {
            if (sequence !== detailSequence || isAbortError(error))
                return;
            // Only the Host may authorize stale fallback. A display snapshot must not
            // hide a failed revalidation or outlive the Host's retention limit.
            detailCache.delete(id);
            commit({ detail: null, detailStatus: null, detailLoading: false, detailError: errorMessage(error) });
        }
    }
    /** Show a previous copy immediately, then check the Host's authoritative cache. */
    async function openDetail(id, options = {}) {
        if (options.owner)
            owners.set(id, options.owner);
        const cached = options.refresh === true ? undefined : detailCache.get(id);
        fileSequence += 1;
        fileAbort?.abort();
        inFlightFileKey = null;
        commit({
            view: { kind: 'detail', id },
            activeTab: 'overview',
            file: null,
            fileLoading: false,
            detailError: null,
        });
        if (cached !== undefined) {
            // The stored provenance travels with the stored payload: a reader coming
            // back to this skill must not be told the copy is fresher than it is.
            commit({ detail: cached.skill, detailStatus: { ...cached.status, fromCache: true }, detailLoading: false });
        }
        else {
            commit({ detail: null, detailStatus: null, detailLoading: true });
        }
        await loadDetail(id, options);
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
            detailStatus: null,
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
    /** Read through the Host's TTL cache, with one in-flight request per path. */
    async function selectFile(path) {
        if (state.view.kind !== 'detail')
            return;
        const id = state.view.id;
        const key = fileCacheKey(id, path);
        if (inFlightFileKey === key)
            return;
        const sequence = ++fileSequence;
        fileAbort?.abort();
        const controller = new AbortController();
        fileAbort = controller;
        inFlightFileKey = key;
        commit({ file: null, fileLoading: true });
        try {
            const file = await fetchSkillFile(id, path, controller.signal, ownerOf(id));
            if (sequence !== fileSequence)
                return;
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
            const result = await installSkill(id, ownerOf(id));
            applySkillUpdate(result.skill);
            setNotice('installDone');
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
        setCategory: (category) => {
            if (category === state.filters.category)
                return;
            applyInstantFilter({ category });
        },
        loadCategories,
        setScope: (scope) => {
            if (scope === state.filters.scope)
                return;
            applyInstantFilter({ scope });
        },
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
