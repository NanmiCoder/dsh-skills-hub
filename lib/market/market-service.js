/**
 * Skills Market — aggregation service (host half).
 *
 * Merges the two upstream providers into a single paginated feed with
 * cross-source dedupe, per-source health/degradation reporting, TTL caching
 * (stale-while-error) and locally-computed install state.
 *
 * The module is deliberately free of DSH services: the
 * "what is installed locally" question is answered by an injected
 * `InstalledLookup` (see `setInstalledLookup`), so this file can be unit-tested
 * by pointing the providers at a stub server.
 */
import { getSourceHealth, markSourceHealth, marketCache, noteMarketStat } from "./cache.js";
import { getProviderBase, withProviderConfiguration } from "./provider-fetch.js";
import { clawhubOwnerFor, clawhubProvider, setClawhubOwnerHints, withClawhubOwner } from "./clawhub-provider.js";
import { catalogCategories, catalogClawhubOwners, catalogEntryFor, catalogEntryToSkill, filterCatalog, getCatalog, } from "../catalog/catalog.js";
import { skillhubProvider } from "./skillhub-provider.js";
import { MARKET_LIMITS, MARKET_SOURCES, detectMarketLanguage, sanitizeDirName, skillId, } from "./types.js";
const providers = {
    clawhub: clawhubProvider,
    skillhub: skillhubProvider,
};
// Catalogue entries name an exact ClawHub owner; detail, files and install must
// resolve the same skill the card showed.
setClawhubOwnerHints(catalogClawhubOwners());
/** Nothing is installed until the host installs its real lookup. */
const EMPTY_INSTALLED_LOOKUP = {
    has: () => false,
    info: () => undefined,
};
let installedLookup = EMPTY_INSTALLED_LOOKUP;
export function setInstalledLookup(lookup) {
    installedLookup = lookup;
}
/** Test hook: fall back to "nothing installed" (also used when a plugin unloads). */
export function resetInstalledLookup() {
    installedLookup = EMPTY_INSTALLED_LOOKUP;
}
export function encodeCursor(cursor) {
    const keys = Object.keys(cursor);
    if (keys.length === 0)
        return null;
    return Buffer.from(JSON.stringify(cursor), 'utf-8').toString('base64url');
}
export function decodeCursor(raw) {
    if (!raw)
        return undefined;
    try {
        const parsed = JSON.parse(Buffer.from(raw, 'base64url').toString('utf-8'));
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed))
            return undefined;
        const cursor = {};
        const record = parsed;
        for (const source of MARKET_SOURCES) {
            const value = record[source];
            if (typeof value === 'string' && value)
                cursor[source] = value;
        }
        return cursor;
    }
    catch {
        return undefined;
    }
}
// ─── Install-state annotation ────────────────────────────────────────────────
/**
 * Stamp a market item with its local install state.
 *
 * Computed on every request (never cached): a skill installed a second ago must
 * show up as installed on the next list call. The reference version also probed
 * the skills directory for a name conflict; that check needs a filesystem, so it
 * now belongs to the install path, which refuses to overwrite a directory it did
 * not create.
 */
export function annotateInstallState(skill) {
    // A non-string slug is untrusted upstream data: degrade it to "not
    // installable" instead of throwing the whole list request away.
    const dirName = typeof skill.slug === 'string' ? sanitizeDirName(skill.slug) : null;
    if (!dirName) {
        return { ...skill, installState: 'not-installable', notInstallableReason: 'invalid-name' };
    }
    const id = skillId(skill.source, skill.slug);
    if (!installedLookup.has(id)) {
        return { ...skill, installState: 'installable', notInstallableReason: undefined, installedInfo: undefined };
    }
    const info = installedLookup.info(id);
    return {
        ...skill,
        installState: 'installed',
        notInstallableReason: undefined,
        installedInfo: {
            dirName: info?.dirName ?? dirName,
            version: info?.version,
            installedAt: info?.installedAt,
        },
    };
}
/** File-level installability checks — only possible once the file list is known. */
export function applyFileLimits(detail) {
    const files = detail.files.map((file) => ({ ...file, tooBig: file.size > MARKET_LIMITS.maxFileSize }));
    const result = { ...detail, files };
    if (result.installState !== 'installable')
        return result;
    if (files.length === 0 || !files.some((file) => file.path === 'SKILL.md')) {
        return { ...result, installState: 'not-installable', notInstallableReason: 'empty-file-list' };
    }
    if (files.length > MARKET_LIMITS.maxFileCount) {
        return { ...result, installState: 'not-installable', notInstallableReason: 'too-many-files' };
    }
    if (files.some((file) => file.tooBig) || result.totalSize > MARKET_LIMITS.maxTotalSize) {
        return { ...result, installState: 'not-installable', notInstallableReason: 'file-too-large' };
    }
    return result;
}
// ─── Cross-source dedupe ─────────────────────────────────────────────────────
/**
 * SkillHub mirrors ClawHub skills (source='clawhub' + upstream_url). When a
 * page contains both the mirror and the ClawHub original, merge them: the
 * ClawHub entry wins (fresher data), enriched with SkillHub-only fields.
 *
 * Unlike the reference this does not mutate its input: those items come from
 * the shared response cache, and mutating them made `mirrors` grow on every
 * repeat request.
 */
export function dedupeSkills(items) {
    const copies = items.map((item) => ({ ...item }));
    const byClawhubSlug = new Map();
    for (const item of copies) {
        if (item.source === 'clawhub')
            byClawhubSlug.set(item.slug, item);
    }
    const result = [];
    for (const item of copies) {
        if (item.source === 'skillhub' && item.upstream?.slug) {
            const original = byClawhubSlug.get(item.upstream.slug);
            // Same slug, different author: the mirror copies another skill.
            const sameAuthor = !item.upstream.owner || !original?.author.handle || item.upstream.owner === original.author.handle;
            if (original && sameAuthor) {
                original.mirrors = [...(original.mirrors ?? []), item.id];
                // Enrich the original with SkillHub-only data.
                if (!original.iconUrl && item.iconUrl)
                    original.iconUrl = item.iconUrl;
                if (original.securityStatus === 'unknown' && item.securityStatus !== 'unknown') {
                    original.securityStatus = item.securityStatus;
                }
                if (item.tags.length && original.tags.length === 0)
                    original.tags = item.tags;
                continue;
            }
        }
        result.push(item);
    }
    return result;
}
/**
 * Cache key for one provider page.
 *
 * The fields are JSON-encoded rather than `:`-joined: with a joined key,
 * `q="alpha"` + `cursor="x:y"` and `q="alpha:x"` + `cursor="y"` produced the same
 * string, so one request was served the other's page. `source` stays a leading
 * segment so every key is obviously source-scoped.
 */
function providerPageCacheKey(source, kind, params) {
    return `${kind}:${source}:${JSON.stringify([getProviderBase(source), params.q ?? null, params.cursor ?? null, params.limit])}`;
}
async function fetchProviderPage(source, params, cache, options = {}) {
    const isSearch = Boolean(params.q);
    const cacheKey = providerPageCacheKey(source, isSearch ? 'search' : 'list', params);
    const forced = options.force === true;
    if (forced) {
        // A reader asked for this page on purpose; the entry is still rewritten
        // below, so the refresh costs one request and then serves everyone again.
        noteMarketStat('forcedRefreshes');
    }
    else {
        const hit = await cache.getRecord(cacheKey);
        if (hit) {
            noteMarketStat('hits');
            // The real fetch time travels with the payload: a hit is a snapshot, and
            // the panel has to be able to say how old it is.
            return { page: hit.value, status: { status: 'ok', fetchedAt: hit.storedAt, fromCache: true } };
        }
    }
    noteMarketStat('misses');
    try {
        const q = params.q;
        const page = isSearch && q !== undefined
            ? await providers[source].search({ q, cursor: params.cursor, limit: params.limit })
            : await providers[source].list({ cursor: params.cursor, limit: params.limit });
        noteMarketStat('upstreamRequests');
        const storedAt = await cache.set(cacheKey, page);
        return { page, status: { status: 'ok', fetchedAt: storedAt, fromCache: false } };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        // A provider that rejects a well-formed HTTP 200 (missing `items`, a
        // non-zero SkillHub envelope code) never reaches the fetch layer's failure
        // bookkeeping, so record it here — otherwise the source bar keeps claiming
        // the registry is healthy while every request fails.
        markSourceHealth(source, 'failed', message);
        // Stale-while-error: a degraded source still serves its last good page, so a
        // temporary upstream outage does not empty the panel.
        const stale = await cache.getStale(cacheKey);
        if (stale) {
            noteMarketStat('staleServed');
            return {
                page: stale.value,
                status: { status: 'cached', fetchedAt: stale.storedAt, fromCache: true, error: message },
            };
        }
        return { page: null, status: { ...getSourceHealth(source), fromCache: false, error: message } };
    }
}
export function listMarketSkills(params) {
    if (params.scope !== 'market')
        return Promise.resolve(listCatalogSkills(params));
    const cache = marketCache;
    return withProviderConfiguration(() => listMarketSkillsWithCache(params, cache));
}
async function listMarketSkillsWithCache(params, cache) {
    const cursor = decodeCursor(params.cursor);
    const isFirstPage = !params.cursor;
    const activeSources = params.source === 'all' ? MARKET_SOURCES : [params.source];
    const q = params.q;
    const outcomes = new Map();
    await Promise.all(activeSources.map(async (source) => {
        // A source absent from a non-first-page cursor is exhausted.
        const providerCursor = cursor?.[source];
        if (!isFirstPage && !providerCursor) {
            outcomes.set(source, { page: { items: [] }, status: { status: 'ok', fromCache: true } });
            return;
        }
        // ClawHub search has no pagination: ask it for one big page and let the
        // aggregate cap apply, instead of pretending a second page exists.
        const limit = q && source === 'clawhub' ? MARKET_LIMITS.searchResultCap : params.limit;
        outcomes.set(source, await fetchProviderPage(source, { q, cursor: providerCursor, limit }, cache, { force: params.refresh === true }));
    }));
    let merged = [];
    const nextCursor = {};
    const sources = {};
    for (const source of MARKET_SOURCES) {
        const outcome = outcomes.get(source);
        if (!outcome) {
            sources[source] = { status: 'ok', fromCache: false };
            continue;
        }
        sources[source] = outcome.status;
        if (outcome.page) {
            merged.push(...outcome.page.items);
            if (outcome.page.nextCursor)
                nextCursor[source] = outcome.page.nextCursor;
        }
    }
    merged = dedupeSkills(merged);
    merged.sort((a, b) => b.stats.downloads - a.stats.downloads);
    merged = merged.map((item) => annotateInstallState(item));
    if (params.security !== 'all') {
        merged = merged.filter((item) => item.securityStatus === params.security);
    }
    if (params.installed !== 'all') {
        merged = merged.filter((item) => params.installed === 'installed'
            ? item.installState === 'installed'
            : item.installState !== 'installed');
    }
    return { items: merged, nextCursor: encodeCursor(nextCursor), sources };
}
// ─── Curated catalogue ───────────────────────────────────────────────────────
const CATALOG_CURSOR_PREFIX = 'catalog:';
/** Provenance of every catalogue answer: one snapshot, read when it was generated. */
function catalogStatus() {
    return { status: 'ok', fetchedAt: getCatalog().generatedAt, fromCache: true };
}
/**
 * One page of the curated catalogue.
 *
 * Everything is local, so every filter — security and installed included — runs
 * before pagination: a page is always full until the list is exhausted, which
 * is what keeps infinite scroll from stalling on a filtered-out page.
 */
export function listCatalogSkills(params) {
    let items = filterCatalog({ q: params.q, category: params.category, source: params.source })
        .map(catalogEntryToSkill)
        .map((item) => annotateInstallState(item));
    if (params.security !== 'all')
        items = items.filter((item) => item.securityStatus === params.security);
    if (params.installed !== 'all') {
        items = items.filter((item) => params.installed === 'installed' ? item.installState === 'installed' : item.installState !== 'installed');
    }
    const raw = params.cursor?.startsWith(CATALOG_CURSOR_PREFIX) ? params.cursor.slice(CATALOG_CURSOR_PREFIX.length) : '';
    const offset = Math.max(0, Number.parseInt(raw, 10) || 0);
    const end = offset + params.limit;
    const status = catalogStatus();
    return {
        items: items.slice(offset, end),
        nextCursor: end < items.length ? `${CATALOG_CURSOR_PREFIX}${end}` : null,
        total: items.length,
        sources: { clawhub: status, skillhub: status },
    };
}
export function listMarketCategories() {
    return { items: catalogCategories(), status: catalogStatus() };
}
// ─── Detail / file content ───────────────────────────────────────────────────
export function getMarketSkillDetail(source, slug, options = {}) {
    const cache = marketCache;
    return withProviderConfiguration(() => withMarketOwner(source, slug, options.owner, () => getMarketSkillDetailWithCache(source, slug, options, cache))).then((result) => ({ ...result, skill: withCatalogMetadata(result.skill) }));
}
/**
 * Overlay the catalogue's editorial fields on a live detail.
 *
 * Upstream stays authoritative for everything it owns (version, files,
 * security, stats); the catalogue only adds what upstream does not have — our
 * category, the editor's pick and the reader-facing Chinese summary.
 */
function withCatalogMetadata(detail) {
    const entry = catalogEntryFor(detail.source, detail.slug);
    if (!entry)
        return detail;
    return {
        ...detail,
        category: entry.category,
        featured: entry.featured === true ? true : undefined,
        summary: entry.summary || detail.summary,
        tags: detail.tags.length > 0 ? detail.tags : [...entry.tags],
    };
}
async function getMarketSkillDetailWithCache(source, slug, options, cache) {
    const cacheKey = `detail:${source}:${JSON.stringify([getProviderBase(source), slug, ...ownerKeyPart(source, slug)])}`;
    const forced = options.force === true;
    if (forced)
        noteMarketStat('forcedRefreshes');
    const hit = forced ? undefined : await cache.getRecord(cacheKey);
    let detail;
    let sourceStatus;
    if (hit) {
        noteMarketStat('hits');
        detail = hit.value;
        sourceStatus = { status: 'ok', fetchedAt: hit.storedAt, fromCache: true };
    }
    else {
        noteMarketStat('misses');
        try {
            detail = await providers[source].detail(slug);
            noteMarketStat('upstreamRequests');
            const storedAt = await cache.set(cacheKey, detail);
            sourceStatus = { status: 'ok', fetchedAt: storedAt, fromCache: false };
        }
        catch (error) {
            if (options.allowStale === false)
                throw error;
            const stale = await cache.getStale(cacheKey);
            if (!stale)
                throw error;
            noteMarketStat('staleServed');
            detail = stale.value;
            sourceStatus = {
                status: 'cached',
                fetchedAt: stale.storedAt,
                fromCache: true,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }
    const annotated = applyFileLimits(annotateInstallState(detail));
    return { skill: annotated, sourceStatus };
}
export function isValidMarketFilePath(filePath) {
    if (!filePath || filePath.length > 512)
        return false;
    if (filePath.startsWith('/') || filePath.startsWith('\\'))
        return false;
    if (filePath.includes('..') || filePath.includes('\0'))
        return false;
    return true;
}
export function getMarketFileContent(source, slug, filePath, owner) {
    const cache = marketCache;
    return withProviderConfiguration(() => withMarketOwner(source, slug, owner, () => getMarketFileContentWithCache(source, slug, filePath, cache)));
}
/**
 * Pin a ClawHub read to the owner the reader asked for. ClawHub slugs are
 * shared across authors, so `clawhub:<slug>` alone does not name one skill.
 */
export function withMarketOwner(source, slug, owner, operation) {
    return source === 'clawhub' ? withClawhubOwner(slug, owner, operation) : operation();
}
/**
 * Cache keys of owner-dependent reads carry the owner the read will use, so a
 * snapshot of one author's skill is never served for another's. Appended only
 * when known, keeping unambiguous slugs' keys unchanged.
 */
function ownerKeyPart(source, slug) {
    const owner = source === 'clawhub' ? clawhubOwnerFor(slug) : undefined;
    return owner ? [`owner=${owner}`] : [];
}
async function getMarketFileContentWithCache(source, slug, filePath, cache) {
    // JSON-encoded for the same reason as the list keys: slug and filePath are
    // both caller-controlled, so a `:`-joined key is ambiguous.
    const cacheKey = `file:${source}:${JSON.stringify([getProviderBase(source), slug, filePath, ...ownerKeyPart(source, slug)])}`;
    const cached = await cache.getRecord(cacheKey);
    if (cached) {
        noteMarketStat('hits');
        return cached.value;
    }
    noteMarketStat('misses');
    const fetched = await providers[source].fetchFile(slug, filePath);
    let content = fetched.content;
    let truncated = false;
    if (Buffer.byteLength(content, 'utf-8') > MARKET_LIMITS.previewTruncateBytes) {
        content = Buffer.from(content, 'utf-8').subarray(0, MARKET_LIMITS.previewTruncateBytes).toString('utf-8');
        truncated = true;
    }
    const result = {
        path: filePath,
        content,
        language: detectMarketLanguage(filePath),
        size: fetched.size,
        truncated,
    };
    await cache.set(cacheKey, result);
    return result;
}
// ─── Status ──────────────────────────────────────────────────────────────────
export function getMarketStatus() {
    return {
        clawhub: getSourceHealth('clawhub'),
        skillhub: getSourceHealth('skillhub'),
    };
}
/**
 * Look up a single skill for an install (the detail path, bypassing the list).
 *
 * Always forced: a cached manifest is a snapshot of the *catalogue*, and
 * installing is the one action that has to be authorized by what upstream says
 * right now — the file bytes are fetched fresh and hash-verified against the
 * list, so the list must come from the same generation as those bytes.
 */
export async function resolveMarketSkill(source, slug, owner) {
    const { skill } = await getMarketSkillDetail(source, slug, { force: true, allowStale: false, owner });
    return skill;
}
