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

class MarketCache {
  private entries = new Map<string, CacheEntry>()

  get<T>(key: string): T | undefined {
    const entry = this.entries.get(key)
    if (!entry) return undefined
    if (Date.now() > entry.expiresAt) return undefined
    // LRU touch: re-insert so the oldest key is the least recently used one.
    this.entries.delete(key)
    this.entries.set(key, entry)
    return entry.value as T
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

/** Test hook: drop cached payloads and reset source health. */
export function resetMarketCache(): void {
  marketCache.clear()
  resetSourceHealth()
}
