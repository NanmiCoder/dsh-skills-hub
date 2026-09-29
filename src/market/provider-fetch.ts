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

import { markSourceHealth } from './cache.ts'
import { MARKET_ERROR_CODES, MARKET_LIMITS, MarketUpstreamError, type MarketSource } from './types.ts'

export interface ProviderEndpointConfig {
  clawhubBaseUrl: string
  skillhubBaseUrl: string
  timeoutMs: number
  retries: number
  userAgent: string
}

const DEFAULT_CONFIG: ProviderEndpointConfig = {
  clawhubBaseUrl: 'https://clawhub.ai',
  skillhubBaseUrl: 'https://api.skillhub.cn',
  timeoutMs: 15_000,
  retries: 1,
  userAgent: 'dsh-skills-hub',
}

let currentConfig: ProviderEndpointConfig = { ...DEFAULT_CONFIG }

/** Strip trailing slashes so `new URL('/api/...', base)` never doubles a separator. */
function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, '')
}

/**
 * Point the providers at different hosts / limits. Called by the plugin with the
 * resolved Config; tests call it to aim the providers at a local stub server.
 * Unspecified fields keep their current value, so a partial override can never
 * silently blank the other source.
 */
export function configureProviderFetch(config: Partial<ProviderEndpointConfig>): void {
  const next: ProviderEndpointConfig = { ...currentConfig }
  if (typeof config.clawhubBaseUrl === 'string' && config.clawhubBaseUrl) {
    next.clawhubBaseUrl = normalizeBaseUrl(config.clawhubBaseUrl)
  }
  if (typeof config.skillhubBaseUrl === 'string' && config.skillhubBaseUrl) {
    next.skillhubBaseUrl = normalizeBaseUrl(config.skillhubBaseUrl)
  }
  if (typeof config.timeoutMs === 'number' && Number.isFinite(config.timeoutMs) && config.timeoutMs > 0) {
    next.timeoutMs = config.timeoutMs
  }
  if (typeof config.retries === 'number' && Number.isFinite(config.retries) && config.retries >= 0) {
    next.retries = Math.floor(config.retries)
  }
  if (typeof config.userAgent === 'string' && config.userAgent) {
    next.userAgent = config.userAgent
  }
  currentConfig = next
}

/** Base URL of one upstream, as resolved from the active configuration. */
export function getProviderBase(source: MarketSource): string {
  return source === 'clawhub' ? currentConfig.clawhubBaseUrl : currentConfig.skillhubBaseUrl
}

/**
 * An upstream answered with a non-2xx status (or a retryable 429/5xx).
 *
 * Extends `MarketUpstreamError` so the existing `instanceof MarketUpstreamError`
 * handling (and its `code`) keeps working, and adds the HTTP `status` so the
 * route layer can tell "skill not found" apart from "upstream is broken".
 */
export class MarketHttpError extends MarketUpstreamError {
  readonly status: number

  constructor(source: MarketSource, status: number, code: string, message: string) {
    super(source, code, message)
    this.name = 'MarketHttpError'
    this.status = status
  }
}

function errorFrom(source: MarketSource, message: string): MarketUpstreamError {
  return new MarketUpstreamError(source, MARKET_ERROR_CODES.upstreamError, message)
}

/** Merge the caller's headers over our defaults without losing either. */
function requestHeaders(init: RequestInit | undefined, userAgent: string): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/json, text/plain, */*',
    'User-Agent': userAgent,
  }
  if (!init?.headers) return headers
  new Headers(init.headers).forEach((value, key) => {
    headers[key] = value
  })
  return headers
}

/**
 * Fetch an upstream URL with timeout and retries.
 *
 * `retries` is the number of *extra* attempts (the contract's default of 1 means
 * two attempts), matching the reference server. A 429 or 5xx counts as a failed
 * attempt; every other status — including 404 — is returned to the caller so the
 * provider can map it to a meaningful error.
 */
export async function providerFetch(
  source: MarketSource,
  url: string,
  init?: RequestInit,
): Promise<Response> {
  const config = currentConfig
  const attempts = Math.max(1, config.retries + 1)
  let lastError: MarketUpstreamError | undefined

  for (let attempt = 0; attempt < attempts; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), config.timeoutMs)
    try {
      // Respect a caller-supplied signal (request cancellation) alongside ours.
      const signal = init?.signal ? AbortSignal.any([init.signal, controller.signal]) : controller.signal
      const res = await fetch(url, {
        ...init,
        headers: requestHeaders(init, config.userAgent),
        redirect: 'follow',
        signal,
      })
      if (res.status === 429 || res.status >= 500) {
        lastError = new MarketHttpError(
          source,
          res.status,
          MARKET_ERROR_CODES.upstreamError,
          `${source} responded ${res.status}`,
        )
        continue
      }
      markSourceHealth(source, 'ok')
      return res
    } catch (error) {
      if (error instanceof MarketUpstreamError) {
        lastError = error
        continue
      }
      const isAbort = error instanceof Error && error.name === 'AbortError'
      lastError = new MarketUpstreamError(
        source,
        isAbort ? MARKET_ERROR_CODES.upstreamTimeout : MARKET_ERROR_CODES.upstreamError,
        isAbort
          ? `${source} request timed out`
          : `${source} request failed: ${error instanceof Error ? error.message : String(error)}`,
      )
    } finally {
      clearTimeout(timer)
    }
  }

  const finalError = lastError ?? errorFrom(source, `${source} request failed`)
  markSourceHealth(source, 'failed', finalError.message)
  throw finalError
}

/** `providerFetch` plus JSON decoding and non-2xx/parse-failure classification. */
export async function providerFetchJson<T>(
  source: MarketSource,
  url: string,
  init?: RequestInit,
): Promise<T> {
  const res = await providerFetch(source, url, init)
  if (!res.ok) {
    const error = new MarketHttpError(
      source,
      res.status,
      MARKET_ERROR_CODES.upstreamError,
      `${source} responded ${res.status} for ${safePathname(url)}`,
    )
    markSourceHealth(source, 'failed', error.message)
    throw error
  }
  // A JSON body is capped exactly like a file body: `res.text()` would buffer
  // whatever the upstream (or an attacker in front of it) sends, and a chunked
  // response without `content-length` can be arbitrarily large.
  let text: string
  try {
    ({ content: text } = await readResponseTextWithLimit(
      source,
      res,
      MARKET_LIMITS.maxTotalSize,
      'JSON response body',
    ))
  } catch (error) {
    const failure = error instanceof MarketUpstreamError
      ? error
      : new MarketUpstreamError(source, MARKET_ERROR_CODES.upstreamBadResponse, `${source} response could not be read`)
    markSourceHealth(source, 'failed', failure.message)
    throw failure
  }
  try {
    return JSON.parse(text) as T
  } catch {
    const error = new MarketUpstreamError(
      source,
      MARKET_ERROR_CODES.upstreamBadResponse,
      `${source} returned invalid JSON`,
    )
    markSourceHealth(source, 'failed', error.message)
    throw error
  }
}

/** `new URL()` throws on relative input; error messages must never mask the real cause. */
function safePathname(url: string): string {
  try {
    return new URL(url).pathname
  } catch {
    return url
  }
}

function responseTooLarge(source: MarketSource, label: string, maxBytes: number): MarketUpstreamError {
  return new MarketUpstreamError(
    source,
    MARKET_ERROR_CODES.upstreamBadResponse,
    `${source} ${label} exceeds the actual size limit (${maxBytes} bytes)`,
  )
}

/**
 * Read a response body as text, aborting as soon as it exceeds `maxBytes`.
 *
 * `content-length` is only a hint (redirects and chunked responses omit it), so
 * the body is streamed and counted rather than trusted.
 */
export async function readResponseTextWithLimit(
  source: MarketSource,
  response: Response,
  maxBytes: number,
  label: string,
): Promise<{ content: string; size: number }> {
  const contentLength = Number(response.headers.get('content-length'))
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    throw responseTooLarge(source, label, maxBytes)
  }
  if (!response.body) return { content: '', size: 0 }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  const chunks: string[] = []
  let total = 0
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      if (value) {
        total += value.byteLength
        if (total > maxBytes) {
          await reader.cancel().catch(() => {})
          throw responseTooLarge(source, label, maxBytes)
        }
        chunks.push(decoder.decode(value, { stream: true }))
      }
    }
    chunks.push(decoder.decode())
    return { content: chunks.join(''), size: total }
  } finally {
    reader.releaseLock()
  }
}
