/**
 * Skills Market — shared upstream fetch helper.
 *
 * Every upstream request goes through `providerFetch` so timeouts, retries,
 * redirect following (SkillHub file downloads 302 to COS) and per-source health
 * bookkeeping stay in one place.
 *
 * Base URLs, timeout and retry budget are injected with `configureProviderFetch`
 * — the plugin passes its resolved Config in `apply()`. Nothing is read from
 * `process.env` at module scope, so the module (and every provider built on it)
 * is directly unit-testable by pointing the bases at a local stub.
 */
import { MarketUpstreamError, type MarketSource } from './types.ts';
export interface ProviderEndpointConfig {
    clawhubBaseUrl: string;
    skillhubBaseUrl: string;
    timeoutMs: number;
    retries: number;
    userAgent: string;
}
/** Keep cache keys and all chained upstream reads on one configuration snapshot. */
export declare function withProviderConfiguration<T>(operation: () => Promise<T>): Promise<T>;
/**
 * Point the providers at different hosts / limits. Called by the plugin with the
 * resolved Config; tests call it to aim the providers at a local stub server.
 * Unspecified fields keep their current value, so a partial override can never
 * silently blank the other source.
 */
export declare function configureProviderFetch(config: Partial<ProviderEndpointConfig>): void;
/** Base URL of one upstream, as resolved from the active configuration. */
export declare function getProviderBase(source: MarketSource): string;
/**
 * An upstream answered with a non-2xx status (or a retryable 429/5xx).
 *
 * Extends `MarketUpstreamError` so the existing `instanceof MarketUpstreamError`
 * handling (and its `code`) keeps working, and adds the HTTP `status` so the
 * route layer can tell "skill not found" apart from "upstream is broken".
 */
export declare class MarketHttpError extends MarketUpstreamError {
    readonly status: number;
    constructor(source: MarketSource, status: number, code: string, message: string);
}
/**
 * Fetch an upstream URL with timeout and retries.
 *
 * `retries` is the number of *extra* attempts (the contract's default of 1 means
 * two attempts), matching the reference server. A 429 or 5xx counts as a failed
 * attempt; every other status — including 404 — is returned to the caller so the
 * provider can map it to a meaningful error.
 */
export declare function providerFetch(source: MarketSource, url: string, init?: RequestInit): Promise<Response>;
/** `providerFetch` plus JSON decoding and non-2xx/parse-failure classification. */
export declare function providerFetchJson<T>(source: MarketSource, url: string, init?: RequestInit): Promise<T>;
/**
 * Read a response body as text, aborting as soon as it exceeds `maxBytes`.
 *
 * `content-length` is only a hint (redirects and chunked responses omit it), so
 * the body is streamed and counted rather than trusted.
 */
export declare function readResponseTextWithLimit(source: MarketSource, response: Response, maxBytes: number, label: string): Promise<{
    content: string;
    size: number;
}>;
