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
import type { MarketSource, SourceHealthStatus, SourceStatusInfo } from './types.ts';
/** Default snapshot lifetime; activation can override it with cacheTtlMinutes. */
export declare const MARKET_TTL: {
    readonly list: number;
    readonly search: number;
    readonly detail: number;
    readonly files: number;
    readonly fileContent: number;
};
export interface MarketCacheOptions {
    directory?: string;
    ttlMs?: number;
    onError?: (error: unknown) => void;
}
/** One fresh hit, together with the moment its payload was actually fetched. */
export interface MarketCacheRecord<T> {
    value: T;
    /** Epoch millis of the upstream read this payload came from. */
    storedAt: number;
}
/**
 * Counters describing what the cache actually did.
 *
 * "How much traffic does the cache save" used to be an argument. Every claim
 * about hits, misses and needless upstream reads can now be checked against
 * these numbers on a real machine instead of reasoned about.
 */
export interface MarketCacheStats {
    /** Answers served from a fresh memory or disk entry. */
    hits: number;
    /** Lookups that had to go upstream (including forced refreshes). */
    misses: number;
    /** Answers served from an expired entry because the source failed. */
    staleServed: number;
    /** Upstream page/detail requests actually issued. */
    upstreamRequests: number;
    /** Refreshes a reader explicitly asked for. */
    forcedRefreshes: number;
}
/** Record one cache event. Kept tiny so it can sit on the request path. */
export declare function noteMarketStat(entry: keyof MarketCacheStats): void;
/** Snapshot of the counters; the caller cannot mutate the live object. */
export declare function getMarketStats(): MarketCacheStats;
export declare class MarketCache {
    private options;
    private entries;
    private disk?;
    private warned;
    private ttlMs;
    constructor(options?: MarketCacheOptions);
    private warn;
    private remember;
    private read;
    /**
     * Read a fresh entry.
     *
     * The record carries `storedAt` on purpose: a hit is a *snapshot*, and the
     * caller must be able to say how old it is. Returning only the payload is how
     * the panel ended up reporting "fetched just now" for data it had not touched
     * in ten minutes.
     */
    getRecord<T>(key: string): Promise<MarketCacheRecord<T> | undefined>;
    /** Returns the entry even when expired — used for the stale-while-error fallback. */
    getStale<T>(key: string): Promise<MarketCacheRecord<T> | undefined>;
    set(key: string, value: unknown, ttlMs?: number): Promise<number>;
    clear(): void;
}
export declare let marketCache: MarketCache;
/** Replace memory state when activating a profile; disk entries are read lazily. */
export declare function configureMarketCache(options: MarketCacheOptions): void;
/**
 * Record the outcome of one upstream interaction.
 *
 * A `failed` report is downgraded to `degraded` when the source succeeded
 * recently (it answered a moment ago, this request just went wrong) — repeated
 * failures after the last success report `failed`. This mirrors the reference
 * server's `recordSourceFailure`, which is what the UI's source bar was built
 * around; callers that genuinely know better can pass `degraded` explicitly.
 */
export declare function markSourceHealth(source: MarketSource, status: SourceHealthStatus, error?: string): void;
export declare function getSourceHealth(source: MarketSource): SourceStatusInfo;
/** Test hook: forget every recorded success/failure. */
export declare function resetSourceHealth(): void;
/** Test hook: drop memory payloads, reset source health and the counters. */
export declare function resetMarketCache(): void;
