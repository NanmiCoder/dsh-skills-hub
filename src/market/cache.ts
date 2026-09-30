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

import type { MarketSource, SourceHealthStatus, SourceStatusInfo } from './types.ts'
import { DiskMarketCache, MAX_CACHE_ENTRIES, MAX_STALE_AGE_MS, type CacheEntry } from './disk-cache.ts'

/** Default snapshot lifetime; activation can override it with cacheTtlMinutes. */
export const MARKET_TTL = {
  list: 60 * 60_000,
  search: 60 * 60_000,
  detail: 60 * 60_000,
  files: 60 * 60_000,
  fileContent: 60 * 60_000,
} as const

export interface MarketCacheOptions {
  directory?: string
  ttlMs?: number
  onError?: (error: unknown) => void
}

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
  /** Answers served from a fresh memory or disk entry. */
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

export class MarketCache {
  private entries = new Map<string, CacheEntry>()
  private disk?: DiskMarketCache
  private warned = false
  private ttlMs: number

  constructor(private options: MarketCacheOptions = {}) {
    this.ttlMs = options.ttlMs ?? MARKET_TTL.list
    if (options.directory) this.disk = new DiskMarketCache(options.directory)
  }

  private warn(error: unknown): void {
    if (this.warned) return
    this.warned = true
    this.options.onError?.(error)
  }

  private remember(key: string, entry: CacheEntry): void {
    this.entries.delete(key)
    this.entries.set(key, entry)
    if (this.entries.size > MAX_CACHE_ENTRIES) {
      const oldest = this.entries.keys().next().value
      if (oldest !== undefined) this.entries.delete(oldest)
    }
  }

  private async read(key: string): Promise<CacheEntry | undefined> {
    const existing = this.entries.get(key)
    if (existing) return existing
    try {
      const restored = await this.disk?.read(key)
      // A concurrent upstream response may have replaced the snapshot while
      // the disk read was pending. Never overwrite that newer memory entry.
      const current = this.entries.get(key)
      if (current) return current
      if (restored) this.remember(key, restored)
      return restored
    } catch (error) {
      // A corrupt or unwritable cache must never break the market request.
      this.warn(error)
      return undefined
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
  async getRecord<T>(key: string): Promise<MarketCacheRecord<T> | undefined> {
    const entry = await this.read(key)
    if (!entry) return undefined
    if (Date.now() >= Math.min(entry.expiresAt, entry.storedAt + this.ttlMs)) return undefined
    // LRU touch: re-insert so the oldest key is the least recently used one.
    this.entries.delete(key)
    this.entries.set(key, entry)
    return { value: entry.value as T, storedAt: entry.storedAt }
  }

  /** Returns the entry even when expired — used for the stale-while-error fallback. */
  async getStale<T>(key: string): Promise<MarketCacheRecord<T> | undefined> {
    const entry = await this.read(key)
    if (!entry || Date.now() - entry.storedAt > MAX_STALE_AGE_MS) return undefined
    return { value: entry.value as T, storedAt: entry.storedAt }
  }

  async set(key: string, value: unknown, ttlMs = this.ttlMs): Promise<number> {
    const now = Date.now()
    const entry = { value, expiresAt: now + ttlMs, storedAt: now }
    this.remember(key, entry)
    try {
      await this.disk?.write(key, entry)
    } catch (error) {
      this.warn(error)
    }
    return now
  }

  clear(): void {
    this.entries.clear()
  }
}

export let marketCache = new MarketCache()

/** Replace memory state when activating a profile; disk entries are read lazily. */
export function configureMarketCache(options: MarketCacheOptions): void {
  marketCache = new MarketCache(options)
}

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

/** Test hook: drop memory payloads, reset source health and the counters. */
export function resetMarketCache(): void {
  marketCache.clear()
  resetSourceHealth()
  for (const entry of Object.keys(stats) as Array<keyof MarketCacheStats>) stats[entry] = 0
}
