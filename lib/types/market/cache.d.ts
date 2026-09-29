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
import type { MarketSource, SourceHealthStatus, SourceStatusInfo } from './types.ts';
/** Per-payload TTLs: cheap-to-refetch list pages expire sooner than file bodies. */
export declare const MARKET_TTL: {
    readonly list: number;
    readonly search: number;
    readonly detail: number;
    readonly files: number;
    readonly fileContent: number;
};
declare class MarketCache {
    private entries;
    get<T>(key: string): T | undefined;
    /** Returns the entry even when expired — used for the stale-while-error fallback. */
    getStale<T>(key: string): {
        value: T;
        storedAt: number;
    } | undefined;
    set(key: string, value: unknown, ttlMs: number): void;
    clear(): void;
}
export declare const marketCache: MarketCache;
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
/** Test hook: drop cached payloads and reset source health. */
export declare function resetMarketCache(): void;
export {};
