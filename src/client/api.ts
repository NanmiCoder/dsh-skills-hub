/**
 * Skills Hub HTTP client (browser half).
 *
 * Every request goes to the Host surface documented in docs/CONTRACT.md §5.2:
 * one prefix route under `/api/skills-hub`, JSON in and JSON out, errors always
 * shaped `{ error: { code, message } }`.
 *
 * Client purity: this module imports *types only* from the shared wire layer —
 * never a value from the Host's `src/market/*`, which would drag Node code into
 * the browser bundle (contract §2).
 */

import type {
  MarketCategoriesResult,
  MarketFileContent,
  MarketListResult,
  MarketSource,
  NormalizedSkill,
  NormalizedSkillDetail,
  SecurityStatus,
  SourceStatusInfo,
} from '../market/types.ts'

/**
 * Host route prefix (docs/CONTRACT.md §5.2 `ROUTE_PREFIX`).
 *
 * Restated as a literal rather than imported: `ROUTE_PREFIX` is a runtime value
 * of a Node module, and a value import would both fail the client purity gate
 * and inline a second copy of the Host's module graph.
 */
const API_BASE = '/api/skills-hub'

/**
 * Structural mirror of the Host's `InstalledSkillRecord`
 * (`src/skills/installed.ts`, contract §5.2).
 *
 * Declared here instead of `import type`-ing the Host module on purpose: that
 * module reads the filesystem through `node:fs`, so pulling it into the browser
 * program would drag Node-only code (and its missing `node:*` declarations)
 * across the client purity boundary. The client only ever *reads* this shape out
 * of JSON, so a structural mirror is sufficient — the wire contract stays the
 * single source of truth.
 */
export interface InstalledSkillRecord {
  key: string
  linked: boolean
  removable: boolean
  /** `source:slug` when the provenance sidecar exists, else `local:<dir>`. */
  id: string
  source: MarketSource | 'local'
  slug: string
  /** Registry author recorded at install time, when known. */
  owner?: string
  name: string
  dirName: string
  dirPath: string
  version?: string
  summary?: string
  installedAt?: string
  /** Installed by this plugin (the `.skills-hub.json` sidecar is present). */
  managed: boolean
  bytes: number
  fileCount: number
}

/** List query accepted by `GET /api/skills-hub/skills`. */
export interface MarketQuery {
  q?: string
  /** `catalog` (default): the curated list. `market`: live upstream search. */
  scope?: 'catalog' | 'market'
  /** Catalogue category key; `'all'` (or absent) means no category filter. */
  category?: string
  source: 'all' | MarketSource
  security: 'all' | SecurityStatus
  installed: 'all' | 'installed' | 'installable'
  cursor?: string
  limit?: number
}

/** One failure from the Skills Hub surface (transport, HTTP, or malformed body). */
export class SkillsHubApiError extends Error {
  /** Host error code (`MARKET_ERROR_CODES` value, `BAD_REQUEST`, …) or a client-side code. */
  readonly code: string
  /** HTTP status; `0` when the request never reached the Host. */
  readonly status: number

  constructor(code: string, status: number, message: string) {
    super(message)
    this.name = 'SkillsHubApiError'
    this.code = code
    this.status = status
  }
}

/** Client-side code for a request that never reached the Host (offline, DNS, CORS). */
const NETWORK_ERROR_CODE = 'NETWORK_ERROR'

/** Code the Host uses for a successful response whose body is not the promised JSON (contract §5.2). */
const BAD_RESPONSE_CODE = 'MARKET_UPSTREAM_BAD_RESPONSE'

/**
 * Whether a rejection is an aborted request.
 *
 * `AbortError` is control flow, not a failure: the controller aborts superseded
 * requests on purpose, and surfacing one as a user-facing error would put a
 * spurious banner in front of a perfectly healthy panel. Checked by `name`
 * (not `instanceof`) because an abort may cross realms (iframes, workers).
 * Exported so the state layer applies the exact same rule.
 */
export function isAbortError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { name?: unknown }).name === 'AbortError'
}

/** `fetch` wrapper turning every failure mode into either an abort or a `SkillsHubApiError`. */
async function send(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init)
  } catch (error) {
    // An abort must stay recognizable as an abort for the caller's stale-response logic.
    if (isAbortError(error)) throw error
    throw new SkillsHubApiError(
      NETWORK_ERROR_CODE,
      0,
      error instanceof Error ? error.message : String(error),
    )
  }
}

/** Parse the Host's `{ error: { code, message } }` envelope, degrading to the status line. */
async function toApiError(response: Response): Promise<SkillsHubApiError> {
  let code = `HTTP_${response.status}`
  let message = `HTTP ${response.status}${response.statusText ? ` ${response.statusText}` : ''}`
  try {
    const payload = (await response.json()) as { error?: { code?: unknown; message?: unknown } }
    const envelope = payload?.error
    if (envelope && typeof envelope.code === 'string' && envelope.code !== '') code = envelope.code
    if (envelope && typeof envelope.message === 'string' && envelope.message !== '') message = envelope.message
  } catch {
    // Non-JSON error body (proxy page, truncated stream): the status line above is the best available text.
  }
  return new SkillsHubApiError(code, response.status, message)
}

/** Decode a successful JSON body, mapping a malformed one onto the Host's bad-response code. */
async function toJson<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T
  } catch {
    throw new SkillsHubApiError(
      BAD_RESPONSE_CODE,
      response.status,
      'The Skills Hub returned a response that is not valid JSON',
    )
  }
}

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  // `same-origin` credentials: the panel is served by the Host itself, and the
  // connection gate (when present) authenticates through the session cookie.
  const response = await send(`${API_BASE}${path}`, {
    method: 'GET',
    credentials: 'same-origin',
    headers: { accept: 'application/json' },
    signal,
  })
  if (!response.ok) throw await toApiError(response)
  return toJson<T>(response)
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await send(`${API_BASE}${path}`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { accept: 'application/json', 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) throw await toApiError(response)
  return toJson<T>(response)
}

/** Split a `source:slug` skill id, rejecting anything the Host routes cannot address. */
function parseMarketId(id: string): { source: MarketSource; slug: string } {
  const separator = id.indexOf(':')
  const source = separator > 0 ? id.slice(0, separator) : ''
  const slug = separator > 0 ? id.slice(separator + 1) : ''
  if ((source === 'clawhub' || source === 'skillhub') && slug !== '') {
    return { source, slug }
  }
  // A local (`local:<dir>`) or malformed id can never be addressed by a market
  // route; failing here keeps the request off the wire entirely.
  throw new SkillsHubApiError(
    'BAD_REQUEST',
    400,
    `"${id}" is not a market skill id (expected "<source>:<slug>")`,
  )
}

/** Search the catalogue (market sources) — the remote list page. */
export async function fetchMarketList(
  query: MarketQuery,
  signal?: AbortSignal,
  options: { refresh?: boolean } = {},
): Promise<MarketListResult> {
  const search = new URLSearchParams()
  const q = query.q?.trim()
  if (q) search.set('q', q)
  if (query.scope === 'market') search.set('scope', 'market')
  else if (query.category && query.category !== 'all') search.set('category', query.category)
  // `all` is the route's default; omitting it keeps the URL (and cache keys) canonical.
  if (query.source !== 'all') search.set('source', query.source)
  if (query.security !== 'all') search.set('security', query.security)
  if (query.installed !== 'all') search.set('installed', query.installed)
  if (query.cursor) search.set('cursor', query.cursor)
  if (typeof query.limit === 'number' && Number.isFinite(query.limit)) search.set('limit', String(query.limit))
  // A reader-requested refresh has to reach the Host: without the flag the
  // request is indistinguishable from an automatic one and comes back cached.
  if (options.refresh === true) search.set('refresh', '1')
  const suffix = search.toString()
  return getJson<MarketListResult>(`/skills${suffix === '' ? '' : `?${suffix}`}`, signal)
}

/** The category bar's entries (curated catalogue), with the snapshot's provenance. */
export async function fetchMarketCategories(signal?: AbortSignal): Promise<MarketCategoriesResult> {
  return getJson<MarketCategoriesResult>('/categories', signal)
}

/** One skill's full detail plus the health of the source that served it. */
export async function fetchSkillDetail(
  id: string,
  signal?: AbortSignal,
  options: { refresh?: boolean; owner?: string } = {},
): Promise<{ skill: NormalizedSkillDetail; sourceStatus: SourceStatusInfo }> {
  const { source, slug } = parseMarketId(id)
  const search = new URLSearchParams()
  if (options.refresh === true) search.set('refresh', '1')
  // ClawHub slugs are shared across authors: name the one the card showed.
  if (options.owner) search.set('owner', options.owner)
  const suffix = search.size > 0 ? `?${search.toString()}` : ''
  return getJson<{ skill: NormalizedSkillDetail; sourceStatus: SourceStatusInfo }>(
    `/skills/${source}/${encodeURIComponent(slug)}${suffix}`,
    signal,
  )
}

/** One file of a skill, for the Files tab. */
export async function fetchSkillFile(
  id: string,
  path: string,
  signal?: AbortSignal,
  owner?: string,
): Promise<MarketFileContent> {
  const { source, slug } = parseMarketId(id)
  const ownerParam = owner ? `&owner=${encodeURIComponent(owner)}` : ''
  const payload = await getJson<{ file: MarketFileContent }>(
    `/skills/${source}/${encodeURIComponent(slug)}/file?path=${encodeURIComponent(path)}${ownerParam}`,
    signal,
  )
  return payload.file
}

/** Health of every market source, refreshed independently of the list. */
export async function fetchSourceStatus(signal?: AbortSignal): Promise<Record<MarketSource, SourceStatusInfo>> {
  const payload = await getJson<{ sources: Record<MarketSource, SourceStatusInfo> }>('/status', signal)
  return payload.sources
}

/**
 * Every skill DSH can currently see, including directories this plugin did not
 * install (`managed: false`). This is the local index behind the "installed"
 * filter — no upstream request is involved.
 */
export async function fetchInstalled(signal?: AbortSignal): Promise<InstalledSkillRecord[]> {
  const payload = await getJson<{ items: InstalledSkillRecord[] }>('/installed', signal)
  return payload.items
}

/** Install a market skill into the local skills directory. */
export async function installSkill(id: string, owner?: string): Promise<{ installedPath: string; skill: NormalizedSkill }> {
  const payload = await postJson<{ ok: boolean; installedPath: string; skill: NormalizedSkill }>(
    '/install',
    owner ? { id, owner } : { id },
  )
  return { installedPath: payload.installedPath, skill: payload.skill }
}

/** Remove a skill this plugin installed (the Host refuses unmanaged directories). */
export async function uninstallSkill(id: string): Promise<{ removedPath: string; skill: NormalizedSkill }> {
  const payload = await postJson<{ ok: boolean; removedPath: string; skill: NormalizedSkill }>('/uninstall', { id })
  return { removedPath: payload.removedPath, skill: payload.skill }
}

/**
 * One file of an installed skill, as the file tab lists it.
 *
 * `language` is the Host's mapping from the file extension and `size` is the
 * real size on disk, so a truncated preview still reports the document it came
 * from rather than the bytes that fit through the endpoint.
 */
export interface InstalledFileEntry {
  path: string
  size: number
  language: string
}

/**
 * The local skill page's payload.
 *
 * `markdown` is the whole SKILL.md (frontmatter included) and `frontmatter` is
 * that same header as YAML text: the market detail's structured metadata panel
 * is fed by upstream JSON, and a hand-written skill has no such record.
 */
export interface InstalledSkillDetail {
  item: InstalledSkillRecord
  markdown: string
  frontmatter: string | null
  files: InstalledFileEntry[]
}

/** Preview the exact local copy without consulting a market provider. */
export function fetchInstalledDetail(key: string, signal?: AbortSignal): Promise<InstalledSkillDetail> {
  return getJson(`/installed/detail?key=${encodeURIComponent(key)}`, signal)
}

/** One file of an installed skill; the Host validates the key and contains the path. */
export async function fetchInstalledFile(
  key: string,
  path: string,
  signal?: AbortSignal,
): Promise<MarketFileContent> {
  const payload = await getJson<{ file: MarketFileContent }>(
    `/installed/file?key=${encodeURIComponent(key)}&path=${encodeURIComponent(path)}`,
    signal,
  )
  return payload.file
}

/** Remove a specifically selected local entry after the management UI confirmation. */
export function removeInstalled(key: string): Promise<{ item: InstalledSkillRecord; removedPath: string }> {
  return postJson('/installed/uninstall', { key })
}
