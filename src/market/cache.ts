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

import type { MarketSource, SourceHealthStatus, SourceStatusInfo } from './types.ts'

type CacheEntry = {
  value: unknown
  expiresAt: number
  storedAt: number
}

/** Hard cap so a long-lived host process cannot grow the map without bound. */
const MAX_ENTRIES = 500

/** Per-payload TTLs: cheap-to-refetch list pages expire sooner than file bodies. */
export const MARKET_TTL = {
  list: 5 * 60_000,
  search: 2 * 60_000,
  detail: 10 * 60_000,
  files: 10 * 60_000,
  fileContent: 30 * 60_000,
} as const

/** One fresh hit, together with the moment its payload was actually fetched. */
export interface MarketCacheRecord<T> {
  value: T
  /** Epoch millis of the upstream read this payload came from. */
  storedAt: number
}

/**
 * Counters describing what the cache actually did.
 *
 * "How much traffic does the cache save" used to be an argument. Every claim
 * about hits, misses and needless upstream reads can now be checked against
 * these numbers on a real machine instead of reasoned about.
 */
export interface MarketCacheStats {
  /** Answers served from a fresh in-memory entry. */
  hits: number
  /** Lookups that had to go upstream (including forced refreshes). */
  misses: number
  /** Answers served from an expired entry because the source failed. */
  staleServed: number
  /** Upstream page/detail requests actually issued. */
  upstreamRequests: number
  /** Refreshes a reader explicitly asked for. */
  forcedRefreshes: number
}

const stats: MarketCacheStats = {
  hits: 0,
  misses: 0,
  staleServed: 0,
  upstreamRequests: 0,
  forcedRefreshes: 0,
}

/** Record one cache event. Kept tiny so it can sit on the request path. */
export function noteMarketStat(entry: keyof MarketCacheStats): void {
  stats[entry] += 1
}

/** Snapshot of the counters; the caller cannot mutate the live object. */
export function getMarketStats(): MarketCacheStats {
  return { ...stats }
}

class MarketCache {
  private entries = new Map<string, CacheEntry>()

  /**
   * Read a fresh entry.
   *
   * The record carries `storedAt` on purpose: a hit is a *snapshot*, and the
   * caller must be able to say how old it is. Returning only the payload is how
   * the panel ended up reporting "fetched just now" for data it had not touched
   * in ten minutes.
   */
  getRecord<T>(key: string): MarketCacheRecord<T> | undefined {
    const entry = this.entries.get(key)
    if (!entry) return undefined
    if (Date.now() > entry.expiresAt) return undefined
    // LRU touch: re-insert so the oldest key is the least recently used one.
    this.entries.delete(key)
    this.entries.set(key, entry)
    return { value: entry.value as T, storedAt: entry.storedAt }
  }

  /** Returns the entry even when expired — used for the stale-while-error fallback. */
  getStale<T>(key: string): { value: T; storedAt: number } | undefined {
    const entry = this.entries.get(key)
    if (!entry) return undefined
    return { value: entry.value as T, storedAt: entry.storedAt }
  }

  set(key: string, value: unknown, ttlMs: number): void {
    if (this.entries.has(key)) this.entries.delete(key)
    const now = Date.now()
    this.entries.set(key, { value, expiresAt: now + ttlMs, storedAt: now })
    if (this.entries.size > MAX_ENTRIES) {
      // Map iteration is insertion-ordered, so the first key is the oldest.
      const oldest = this.entries.keys().next().value
      if (oldest !== undefined) this.entries.delete(oldest)
    }
  }

  clear(): void {
    this.entries.clear()
  }
}

export const marketCache = new MarketCache()

// ─── Source health ───────────────────────────────────────────────────────────

type HealthRecord = {
  status: SourceHealthStatus
  lastOkAt?: number
  lastError?: string
}

function freshHealth(): Record<MarketSource, HealthRecord> {
  return {
    clawhub: { status: 'ok' },
    skillhub: { status: 'ok' },
  }
}

const sourceHealth: Record<MarketSource, HealthRecord> = freshHealth()

/**
 * Record the outcome of one upstream interaction.
 *
 * A `failed` report is downgraded to `degraded` when the source succeeded
 * recently (it answered a moment ago, this request just went wrong) — repeated
 * failures after the last success report `failed`. This mirrors the reference
 * server's `recordSourceFailure`, which is what the UI's source bar was built
 * around; callers that genuinely know better can pass `degraded` explicitly.
 */
export function markSourceHealth(source: MarketSource, status: SourceHealthStatus, error?: string): void {
  const prev = sourceHealth[source]
  if (status === 'ok') {
    sourceHealth[source] = { status: 'ok', lastOkAt: Date.now() }
    return
  }
  if (status === 'cached') {
    sourceHealth[source] = { status: 'cached', lastOkAt: prev.lastOkAt, lastError: error }
    return
  }
  sourceHealth[source] = {
    status: status === 'degraded' || (prev.status === 'ok' && prev.lastOkAt !== undefined)
      ? 'degraded'
      : 'failed',
    lastOkAt: prev.lastOkAt,
    lastError: error,
  }
}

export function getSourceHealth(source: MarketSource): SourceStatusInfo {
  const record = sourceHealth[source]
  return {
    status: record.status,
    fetchedAt: record.lastOkAt,
    error: record.lastError,
  }
}

/** Test hook: forget every recorded success/failure. */
export function resetSourceHealth(): void {
  const fresh = freshHealth()
  for (const source of Object.keys(fresh) as MarketSource[]) {
    sourceHealth[source] = fresh[source]
  }
}

/** Test hook: drop cached payloads, reset source health and the counters. */
export function resetMarketCache(): void {
  marketCache.clear()
  resetSourceHealth()
  for (const entry of Object.keys(stats) as Array<keyof MarketCacheStats>) stats[entry] = 0
}
