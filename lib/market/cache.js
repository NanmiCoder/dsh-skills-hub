/**
 * Skills Market — in-memory TTL cache with stale-while-error support, plus
 * per-source health tracking.
 *
 * Only *upstream* data is cached here (list pages, details, file bodies).
 * Install state is derived per request from the injected installed-skill index
 * and is deliberately never cached: a skill installed a second ago must show up
 * as installed on the very next list call.
 *
 * Everything lives in module scope, so the module needs no DSH service and no
 * filesystem — a unit test can drive it with plain `node --test`.
 */
/** Hard cap so a long-lived host process cannot grow the map without bound. */
const MAX_ENTRIES = 500;
/** Per-payload TTLs: cheap-to-refetch list pages expire sooner than file bodies. */
export const MARKET_TTL = {
    list: 5 * 60_000,
    search: 2 * 60_000,
    detail: 10 * 60_000,
    files: 10 * 60_000,
    fileContent: 30 * 60_000,
};
const stats = {
    hits: 0,
    misses: 0,
    staleServed: 0,
    upstreamRequests: 0,
    forcedRefreshes: 0,
};
/** Record one cache event. Kept tiny so it can sit on the request path. */
export function noteMarketStat(entry) {
    stats[entry] += 1;
}
/** Snapshot of the counters; the caller cannot mutate the live object. */
export function getMarketStats() {
    return { ...stats };
}
class MarketCache {
    entries = new Map();
    /**
     * Read a fresh entry.
     *
     * The record carries `storedAt` on purpose: a hit is a *snapshot*, and the
     * caller must be able to say how old it is. Returning only the payload is how
     * the panel ended up reporting "fetched just now" for data it had not touched
     * in ten minutes.
     */
    getRecord(key) {
        const entry = this.entries.get(key);
        if (!entry)
            return undefined;
        if (Date.now() > entry.expiresAt)
            return undefined;
        // LRU touch: re-insert so the oldest key is the least recently used one.
        this.entries.delete(key);
        this.entries.set(key, entry);
        return { value: entry.value, storedAt: entry.storedAt };
    }
    /** Returns the entry even when expired — used for the stale-while-error fallback. */
    getStale(key) {
        const entry = this.entries.get(key);
        if (!entry)
            return undefined;
        return { value: entry.value, storedAt: entry.storedAt };
    }
    set(key, value, ttlMs) {
        if (this.entries.has(key))
            this.entries.delete(key);
        const now = Date.now();
        this.entries.set(key, { value, expiresAt: now + ttlMs, storedAt: now });
        if (this.entries.size > MAX_ENTRIES) {
            // Map iteration is insertion-ordered, so the first key is the oldest.
            const oldest = this.entries.keys().next().value;
            if (oldest !== undefined)
                this.entries.delete(oldest);
        }
    }
    clear() {
        this.entries.clear();
    }
}
export const marketCache = new MarketCache();
function freshHealth() {
    return {
        clawhub: { status: 'ok' },
        skillhub: { status: 'ok' },
    };
}
const sourceHealth = freshHealth();
/**
 * Record the outcome of one upstream interaction.
 *
 * A `failed` report is downgraded to `degraded` when the source succeeded
 * recently (it answered a moment ago, this request just went wrong) — repeated
 * failures after the last success report `failed`. This mirrors the reference
 * server's `recordSourceFailure`, which is what the UI's source bar was built
 * around; callers that genuinely know better can pass `degraded` explicitly.
 */
export function markSourceHealth(source, status, error) {
    const prev = sourceHealth[source];
    if (status === 'ok') {
        sourceHealth[source] = { status: 'ok', lastOkAt: Date.now() };
        return;
    }
    if (status === 'cached') {
        sourceHealth[source] = { status: 'cached', lastOkAt: prev.lastOkAt, lastError: error };
        return;
    }
    sourceHealth[source] = {
        status: status === 'degraded' || (prev.status === 'ok' && prev.lastOkAt !== undefined)
            ? 'degraded'
            : 'failed',
        lastOkAt: prev.lastOkAt,
        lastError: error,
    };
}
export function getSourceHealth(source) {
    const record = sourceHealth[source];
    return {
        status: record.status,
        fetchedAt: record.lastOkAt,
        error: record.lastError,
    };
}
/** Test hook: forget every recorded success/failure. */
export function resetSourceHealth() {
    const fresh = freshHealth();
    for (const source of Object.keys(fresh)) {
        sourceHealth[source] = fresh[source];
    }
}
/** Test hook: drop cached payloads, reset source health and the counters. */
export function resetMarketCache() {
    marketCache.clear();
    resetSourceHealth();
    for (const entry of Object.keys(stats))
        stats[entry] = 0;
}
