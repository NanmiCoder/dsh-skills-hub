/**
 * Skills Market — memory + persistent TTL cache with stale-while-error support, plus
 * per-source health tracking.
 *
 * Only *upstream* data is cached here (list pages, details, file bodies).
 * Install state is derived per request from the injected installed-skill index
 * and is deliberately never cached: a skill installed a second ago must show up
 * as installed on the very next list call.
 *
 * The host configures disk storage at activation. Without a directory the
 * cache stays memory-only, so provider tests never touch a user's Harness home.
 */
import { DiskMarketCache, MAX_CACHE_ENTRIES, MAX_STALE_AGE_MS } from "./disk-cache.js";
/** Default snapshot lifetime; activation can override it with cacheTtlMinutes. */
export const MARKET_TTL = {
    list: 60 * 60_000,
    search: 60 * 60_000,
    detail: 60 * 60_000,
    files: 60 * 60_000,
    fileContent: 60 * 60_000,
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
export class MarketCache {
    options;
    entries = new Map();
    disk;
    warned = false;
    ttlMs;
    constructor(options = {}) {
        this.options = options;
        this.ttlMs = options.ttlMs ?? MARKET_TTL.list;
        if (options.directory)
            this.disk = new DiskMarketCache(options.directory);
    }
    warn(error) {
        if (this.warned)
            return;
        this.warned = true;
        this.options.onError?.(error);
    }
    remember(key, entry) {
        this.entries.delete(key);
        this.entries.set(key, entry);
        if (this.entries.size > MAX_CACHE_ENTRIES) {
            const oldest = this.entries.keys().next().value;
            if (oldest !== undefined)
                this.entries.delete(oldest);
        }
    }
    async read(key) {
        const existing = this.entries.get(key);
        if (existing)
            return existing;
        try {
            const restored = await this.disk?.read(key);
            // A concurrent upstream response may have replaced the snapshot while
            // the disk read was pending. Never overwrite that newer memory entry.
            const current = this.entries.get(key);
            if (current)
                return current;
            if (restored)
                this.remember(key, restored);
            return restored;
        }
        catch (error) {
            // A corrupt or unwritable cache must never break the market request.
            this.warn(error);
            return undefined;
        }
    }
    /**
     * Read a fresh entry.
     *
     * The record carries `storedAt` on purpose: a hit is a *snapshot*, and the
     * caller must be able to say how old it is. Returning only the payload is how
     * the panel ended up reporting "fetched just now" for data it had not touched
     * in ten minutes.
     */
    async getRecord(key) {
        const entry = await this.read(key);
        if (!entry)
            return undefined;
        if (Date.now() >= Math.min(entry.expiresAt, entry.storedAt + this.ttlMs))
            return undefined;
        // LRU touch: re-insert so the oldest key is the least recently used one.
        this.entries.delete(key);
        this.entries.set(key, entry);
        return { value: entry.value, storedAt: entry.storedAt };
    }
    /** Returns the entry even when expired — used for the stale-while-error fallback. */
    async getStale(key) {
        const entry = await this.read(key);
        if (!entry || Date.now() - entry.storedAt > MAX_STALE_AGE_MS)
            return undefined;
        return { value: entry.value, storedAt: entry.storedAt };
    }
    async set(key, value, ttlMs = this.ttlMs) {
        const now = Date.now();
        const entry = { value, expiresAt: now + ttlMs, storedAt: now };
        this.remember(key, entry);
        try {
            await this.disk?.write(key, entry);
        }
        catch (error) {
            this.warn(error);
        }
        return now;
    }
    clear() {
        this.entries.clear();
    }
}
export let marketCache = new MarketCache();
/** Replace memory state when activating a profile; disk entries are read lazily. */
export function configureMarketCache(options) {
    marketCache = new MarketCache(options);
}
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
/** Test hook: drop memory payloads, reset source health and the counters. */
export function resetMarketCache() {
    marketCache.clear();
    resetSourceHealth();
    for (const entry of Object.keys(stats))
        stats[entry] = 0;
}
