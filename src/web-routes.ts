/**
 * Skills Hub HTTP surface.
 *
 * One `prefix` route (`/api/skills-hub`) owns the endpoints the panel
 * needs; every response is JSON with `Cache-Control: no-store`, because the
 * panel polls and every payload is either live upstream data or live disk state.
 *
 * Two properties matter more than the routing itself:
 *
 *  - **Nothing escapes as a non-JSON error.** The handler catches its own
 *    rejections, the web server's own catch-all would answer a thrown handler
 *    with a bare `400` and no body, and the browser client parses the
 *    `{ error: { code, message } }` envelope.
 *  - **The browser-trust gate runs first.** Raw `webServer` routes do not inherit
 *    the Connection service's Host/Origin fence, so a route registered here would
 *    otherwise be reachable by a cross-site request or a DNS-rebound page.
 */

import type { IncomingMessage, ServerResponse } from 'node:http'
import {
  installMarketSkill,
  MarketInstallError,
  uninstallMarketSkill,
} from './market/install-service.ts'
import {
  getMarketFileContent,
  getMarketSkillDetail,
  getMarketStatus,
  isValidMarketFilePath,
  listMarketCategories,
  listMarketSkills,
  type ListMarketSkillsParams,
} from './market/market-service.ts'
import { getMarketStats } from './market/cache.ts'
import { CLAWHUB_OWNER_PATTERN } from './market/clawhub-provider.ts'
import { readInstalledFile, readInstalledSkill, removeInstalledSkill } from './skills/management.ts'
import { scanInstalledSkills } from './skills/installed.ts'
import { resolveSkillsScanRoots } from './skills/root.ts'
import {
  MARKET_ERROR_CODES,
  MARKET_SOURCES,
  MarketUpstreamError,
  parseSkillId,
  type MarketListResult,
  type MarketSource,
  type SecurityStatus,
} from './market/types.ts'

/** Path prefix of the whole Skills Hub API. */
export const ROUTE_PREFIX = '/api/skills-hub'

/** Structural Web server contract (mirrors `WebServer.register`). */
export interface WebServerLike {
  register(route: {
    kind: 'exact' | 'prefix'
    path: string
    handler: (req: IncomingMessage, res: ServerResponse) => void | Promise<void>
  }): () => void
}

export interface SkillsHubRoutesDeps {
  skillsRoot: () => Promise<string>
  allowUninstall: () => boolean
  rescan: () => Promise<void>
  /** Initial local inventory scan, required before annotating persisted data. */
  ready?: () => Promise<void>
}

/**
 * Browser-trust gate, structurally equal to the frozen contract's predicate.
 *
 * The real `HostConnectionService.requestRejection` returns `401 | 403 |
 * undefined` rather than a boolean (see
 * `@deepseek-ai/dsh-client-connection/lib/types/rpc.d.ts`), so this plugin
 * accepts both shapes: see {@link evaluateGate} for why the numeric form is
 * worth preserving.
 */
export interface SkillsHubRequestGate {
  requestRejection(req: IncomingMessage, res: ServerResponse): boolean
}

/**
 * Resolves the gate for one request.
 *
 * A getter, not the service itself: Loader rows activate concurrently, so the
 * Connection service frequently appears *after* this plugin registered its
 * route. Snapshotting it at registration time silently produced an unfenced
 * marketplace (verified against a real host: official `/api/*` routes answered
 * `403` to an untrusted `Origin` while `/api/skills-hub/*` answered `200`).
 */
export type SkillsHubGateSource = () => SkillsHubRequestGate | undefined

/** Request bodies here are two-field JSON objects; anything larger is an attack. */
const MAX_BODY_BYTES = 64 * 1024
/** Default `limit` for `GET /skills`; `apply()` overwrites it from `Config.pageSize`. */
const DEFAULT_PAGE_SIZE = 24
/** Hard cap on `limit`, mirroring the reference API. */
const MAX_PAGE_SIZE = 100
/** Longest accepted `q` parameter. */
const MAX_QUERY_LENGTH = 200
/** Longest accepted opaque `cursor`. */
const MAX_CURSOR_LENGTH = 512
/** Longest accepted slug. */
const MAX_SLUG_LENGTH = 200

const SECURITY_FILTERS: readonly SecurityStatus[] = ['verified', 'benign', 'unknown', 'flagged']
const INSTALLED_FILTERS = ['all', 'installed', 'installable'] as const

/** Module-scoped default page size, set once by `apply()` (frozen deps carry no config). */
let defaultPageSize = DEFAULT_PAGE_SIZE

/**
 * Set the default `/skills` page size from `Config.pageSize`.
 *
 * The frozen `SkillsHubRoutesDeps` has no config seat, and widening it would
 * change a frozen interface; this setter is the additive seam instead.
 */
export function setSkillsHubPageSize(pageSize: number): void {
  if (Number.isFinite(pageSize) && pageSize >= 1) defaultPageSize = Math.min(MAX_PAGE_SIZE, Math.floor(pageSize))
}

/** A rejection produced by this module itself: status, envelope code and headers. */
class RouteError extends Error {
  readonly status: number
  readonly code: string
  readonly allow: string | undefined

  constructor(status: number, code: string, message: string, allow?: string) {
    super(message)
    this.name = 'RouteError'
    this.status = status
    this.code = code
    this.allow = allow
  }
}

/** One JSON response; the only place a body is written. */
function sendJson(res: ServerResponse, status: number, payload: unknown, headers?: Record<string, string>): void {
  if (res.headersSent) {
    res.destroy()
    return
  }
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    ...headers,
  })
  res.end(JSON.stringify(payload))
}

function errorPayload(code: string, message: string): { error: { code: string; message: string } } {
  return { error: { code, message } }
}

/**
 * Map any thrown value onto the envelope's status/code pair.
 *
 * The install service decides its own status (409 conflict, 400 not
 * installable, 502 checksum, 500 disk) and travels with it: the route never
 * re-derives a status from a code, so there is exactly one place that can get
 * the mapping wrong.
 */
function toHttpFailure(error: unknown): { status: number; code: string; message: string; allow: string | undefined } {
  if (error instanceof RouteError || error instanceof MarketInstallError) {
    const allow = error instanceof RouteError ? error.allow : undefined
    return { status: error.status, code: error.code, message: error.message, allow }
  }
  if (error instanceof MarketUpstreamError) {
    // A malformed/absent upstream payload is "this skill does not exist";
    // every other upstream problem is a bad gateway.
    const status = error.code === MARKET_ERROR_CODES.upstreamBadResponse ? 404 : 502
    return { status, code: error.code, message: error.message, allow: undefined }
  }
  // Unexpected failure: answer with a fixed sentence. Raw `error.message` values
  // are Node filesystem errors carrying absolute paths ("EEXIST: … mkdir
  // '/var/folders/…'"), which must not be echoed to the browser. Documented
  // MarketInstallError / MarketUpstreamError messages above are passed through
  // verbatim; the diagnostic detail of an *unexpected* error has no logger seat
  // on the frozen deps surface, so it is dropped here.
  return {
    status: 500,
    code: 'INTERNAL_ERROR',
    message: 'internal error',
    allow: undefined,
  }
}

/** Answer one thrown value; the single exit for every failure path. */
function sendFailure(res: ServerResponse, error: unknown): void {
  const failure = toHttpFailure(error)
  sendJson(
    res,
    failure.status,
    errorPayload(failure.code, failure.message),
    failure.allow === undefined ? undefined : { allow: failure.allow },
  )
}

/**
 * Run the browser-trust gate and return the rejection status, if any.
 *
 * The frozen gate type says `boolean`, the real service answers `401 | 403 |
 * undefined`; both are accepted so the envelope can report the true status when
 * the plugin is wired to the real Connection service, while a plain predicate
 * still works.
 */
function evaluateGate(gate: SkillsHubRequestGate, req: IncomingMessage, res: ServerResponse): number | undefined {
  const outcome = (gate.requestRejection as (request: IncomingMessage, response: ServerResponse) => unknown)(req, res)
  if (outcome === undefined || outcome === false || outcome === null) return undefined
  return typeof outcome === 'number' ? outcome : 403
}

/**
 * Read a bounded JSON object body.
 *
 * Mirrors `readJsonRequest` in `dsh-agent-teams/src/web-routes.ts`: an oversized
 * body stops being buffered immediately and the socket is drained, so a hostile
 * `Content-Length` cannot pin memory in the host process.
 */
async function readJsonBody(req: IncomingMessage, maxBytes = MAX_BODY_BYTES): Promise<Record<string, unknown>> {
  const raw = await new Promise<string>((resolve, reject) => {
    let size = 0
    let settled = false
    const chunks: Buffer[] = []
    const finish = (error?: Error): void => {
      if (settled) return
      settled = true
      req.off('data', onData)
      req.off('end', onEnd)
      req.off('aborted', onAborted)
      req.off('error', onError)
      if (error !== undefined) {
        chunks.length = 0
        req.once('error', () => undefined)
        req.resume()
        reject(error)
        return
      }
      resolve(Buffer.concat(chunks).toString('utf8'))
    }
    const onData = (chunk: Buffer | string): void => {
      const part = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
      size += part.length
      if (size > maxBytes) {
        finish(new RouteError(400, 'BAD_REQUEST', `Request body exceeds ${maxBytes} bytes`))
      } else {
        chunks.push(part)
      }
    }
    const onEnd = (): void => finish()
    const onAborted = (): void => finish(new RouteError(400, 'BAD_REQUEST', 'Request body was aborted'))
    const onError = (): void => finish(new RouteError(400, 'BAD_REQUEST', 'Invalid request body'))
    req.on('data', onData)
    req.once('end', onEnd)
    req.once('aborted', onAborted)
    req.once('error', onError)
  })

  let value: unknown
  try {
    value = raw.trim() === '' ? {} : JSON.parse(raw)
  } catch {
    throw new RouteError(400, 'BAD_REQUEST', 'Invalid JSON body')
  }
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new RouteError(400, 'BAD_REQUEST', 'Body must be a JSON object')
  }
  return value as Record<string, unknown>
}

/** Decode the path segments below {@link ROUTE_PREFIX}, rejecting malformed encoding. */
function parseSegments(pathname: string): string[] {
  if (pathname !== ROUTE_PREFIX && !pathname.startsWith(`${ROUTE_PREFIX}/`)) {
    throw new RouteError(404, 'NOT_FOUND', `Unknown route: ${pathname}`)
  }
  return pathname
    .slice(ROUTE_PREFIX.length)
    .split('/')
    .filter((segment) => segment !== '')
    .map((segment) => {
      try {
        return decodeURIComponent(segment)
      } catch {
        throw new RouteError(400, 'BAD_REQUEST', 'Malformed percent-encoding in the request path')
      }
    })
}

function requireMethod(method: string, expected: 'GET' | 'POST'): void {
  if (method !== expected) {
    throw new RouteError(405, 'METHOD_NOT_ALLOWED', `Method ${method} is not allowed here`, expected)
  }
}

/** Validate one path segment against the frozen market source list. */
function parseSourceSegment(segment: string | undefined): MarketSource {
  if (segment !== undefined && MARKET_SOURCES.includes(segment as MarketSource)) return segment as MarketSource
  throw new RouteError(400, 'BAD_REQUEST', `Invalid market source: ${segment ?? ''}`)
}

/** Reject anything that could escape a path when joined onto a URL or a file path. */
function parseSlug(segment: string | undefined): string {
  if (segment === undefined || segment === '') throw new RouteError(400, 'BAD_REQUEST', 'Missing skill slug')
  if (segment.length > MAX_SLUG_LENGTH) throw new RouteError(400, 'BAD_REQUEST', 'Skill slug is too long')
  if (segment.includes('/') || segment.includes('\\') || segment.includes('..')) {
    throw new RouteError(400, 'BAD_REQUEST', `Invalid skill slug: ${segment}`)
  }
  return segment
}

/** Bounded optional string query parameter. */
function optionalQuery(url: URL, name: string, maxLength: number): string | undefined {
  const value = url.searchParams.get(name)?.trim()
  if (value === undefined || value === '') return undefined
  if (value.length > maxLength) {
    throw new RouteError(400, 'BAD_REQUEST', `Query parameter "${name}" exceeds ${maxLength} characters`)
  }
  return value
}

/** Closed-set query parameter with a fallback. */
function enumQuery<T extends string>(url: URL, name: string, allowed: readonly T[], fallback: T): T {
  const raw = url.searchParams.get(name)
  if (raw === null || raw === '') return fallback
  if ((allowed as readonly string[]).includes(raw)) return raw as T
  throw new RouteError(400, 'BAD_REQUEST', `Invalid ${name} filter: ${raw}`)
}

/** Shape of a catalogue category key. */
const CATEGORY_KEY_PATTERN = /^[a-z0-9][a-z0-9-]{0,63}$/

/** `category` query parameter: a catalogue category key, shape-checked only. */
function parseCategory(url: URL): string | undefined {
  const raw = url.searchParams.get('category')
  if (raw === null || raw === '' || raw === 'all') return undefined
  if (!CATEGORY_KEY_PATTERN.test(raw)) throw new RouteError(400, 'BAD_REQUEST', `Invalid category: ${raw}`)
  return raw
}

/**
 * Optional registry owner. ClawHub slugs are shared across authors, so the
 * panel names the author of the card it opened; a malformed owner is refused
 * rather than silently dropped (that would fall back to guessing).
 */
function parseOwner(raw: unknown): string | undefined {
  if (raw === undefined || raw === null || raw === '') return undefined
  if (typeof raw !== 'string' || !CLAWHUB_OWNER_PATTERN.test(raw)) {
    throw new RouteError(400, 'BAD_REQUEST', `Invalid owner: ${String(raw)}`)
  }
  return raw
}

/** `limit` query parameter, clamped into the documented range. */
function parseLimit(url: URL): number {
  const raw = url.searchParams.get('limit')
  if (raw === null || raw.trim() === '') return defaultPageSize
  const parsed = Number.parseInt(raw, 10)
  if (!Number.isFinite(parsed)) throw new RouteError(400, 'BAD_REQUEST', `Invalid limit: ${raw}`)
  return Math.min(MAX_PAGE_SIZE, Math.max(1, parsed))
}

/** `{ id: "source:slug" }` body of the install/uninstall endpoints. */
function parseBodyId(body: Record<string, unknown>): { source: MarketSource; slug: string } {
  const id = typeof body['id'] === 'string' ? body['id'] : ''
  const parsed = parseSkillId(id)
  if (parsed === null) throw new RouteError(400, 'BAD_REQUEST', `Invalid skill id: ${id === '' ? '(missing)' : id}`)
  return parsed
}

/**
 * `refresh` query parameter.
 *
 * A reader who presses refresh means "do not answer me from your cache". Before
 * this existed the request looked exactly like the automatic one, so the panel
 * re-rendered the same cached page and presented it as fresh. Only the explicit
 * spellings are accepted; anything else is a bad request rather than a silently
 * ignored intent.
 */
function parseRefresh(url: URL): boolean {
  const raw = url.searchParams.get('refresh')
  if (raw === null || raw === '' || raw === '0' || raw === 'false') return false
  if (raw === '1' || raw === 'true') return true
  throw new RouteError(400, 'BAD_REQUEST', `Invalid refresh flag: ${raw}`)
}

async function handleStatus(res: ServerResponse): Promise<void> {
  sendJson(res, 200, { sources: getMarketStatus() })
}

/** Cache and upstream counters: the evidence behind every traffic claim. */
async function handleStats(res: ServerResponse): Promise<void> {
  sendJson(res, 200, { stats: getMarketStats() })
}

async function handleList(url: URL, res: ServerResponse): Promise<void> {
  const params: ListMarketSkillsParams = {
    q: optionalQuery(url, 'q', MAX_QUERY_LENGTH),
    scope: enumQuery<'catalog' | 'market'>(url, 'scope', ['catalog', 'market'], 'catalog'),
    category: parseCategory(url),
    source: enumQuery<'all' | MarketSource>(url, 'source', ['all', ...MARKET_SOURCES], 'all'),
    security: enumQuery<'all' | SecurityStatus>(url, 'security', ['all', ...SECURITY_FILTERS], 'all'),
    installed: enumQuery<(typeof INSTALLED_FILTERS)[number]>(url, 'installed', INSTALLED_FILTERS, 'all'),
    cursor: optionalQuery(url, 'cursor', MAX_CURSOR_LENGTH),
    limit: parseLimit(url),
    refresh: parseRefresh(url),
  }
  const result: MarketListResult = await listMarketSkills(params)
  sendJson(res, 200, result)
}

async function handleCategories(res: ServerResponse): Promise<void> {
  sendJson(res, 200, listMarketCategories())
}

async function handleDetail(source: MarketSource, slug: string, url: URL, res: ServerResponse): Promise<void> {
  const owner = parseOwner(url.searchParams.get('owner'))
  sendJson(res, 200, await getMarketSkillDetail(source, slug, { force: parseRefresh(url), owner }))
}

async function handleFile(source: MarketSource, slug: string, url: URL, res: ServerResponse): Promise<void> {
  const filePath = url.searchParams.get('path') ?? ''
  if (!isValidMarketFilePath(filePath)) {
    throw new RouteError(400, 'BAD_REQUEST', `Invalid file path: ${filePath}`)
  }
  const owner = parseOwner(url.searchParams.get('owner'))
  sendJson(res, 200, { file: await getMarketFileContent(source, slug, filePath, owner) })
}

/**
 * List installed skills from disk.
 *
 * The frozen deps surface exposes the resolved root rather than the in-memory
 * index, so the list is produced by scanning the same roots the lookup uses:
 * disk is the single source of truth, and a skill the user copied in by hand
 * shows up next to the ones this plugin installed.
 */
async function handleInstalled(deps: SkillsHubRoutesDeps, res: ServerResponse): Promise<void> {
  const roots = await resolveSkillsScanRoots(await deps.skillsRoot())
  sendJson(res, 200, { items: (await scanInstalledSkills(roots)).map(item => ({ ...item, removable: deps.allowUninstall() })) })
}

async function handleInstall(req: IncomingMessage, deps: SkillsHubRoutesDeps, res: ServerResponse): Promise<void> {
  const body = await readJsonBody(req)
  const { source, slug } = parseBodyId(body)
  const result = await installMarketSkill(source, slug, {
    skillsRoot: await deps.skillsRoot(),
    allowUninstall: deps.allowUninstall(),
    owner: parseOwner(body['owner']),
  })
  // Refresh before answering, so the next /skills or /installed call is correct.
  await deps.rescan().catch(() => undefined)
  sendJson(res, 200, { ok: true, installedPath: result.installedPath, skill: result.skill })
}

async function handleUninstall(req: IncomingMessage, deps: SkillsHubRoutesDeps, res: ServerResponse): Promise<void> {
  const { source, slug } = parseBodyId(await readJsonBody(req))
  const result = await uninstallMarketSkill(source, slug, {
    skillsRoot: await deps.skillsRoot(),
    allowUninstall: deps.allowUninstall(),
  })
  await deps.rescan().catch(() => undefined)
  sendJson(res, 200, { ok: true, removedPath: result.removedPath, skill: result.skill })
}

async function handle(
  req: IncomingMessage,
  res: ServerResponse,
  gate: SkillsHubGateSource,
  deps: SkillsHubRoutesDeps,
): Promise<void> {
  // Raw Web routes bypass the Connection fence; ask it before doing any work.
  // The source is resolved per request: the Connection service can be
  // contributed after this route was registered (Loader rows activate
  // concurrently), and a gate captured once would silently stay absent —
  // leaving the whole marketplace readable and installable from any web page.
  const resolvedGate = gate()
  if (resolvedGate !== undefined) {
    const rejection = evaluateGate(resolvedGate, req, res)
    if (rejection !== undefined) {
      sendJson(
        res,
        rejection,
        errorPayload(rejection === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN', rejection === 401 ? 'unauthorized' : 'forbidden'),
      )
      return
    }
  }

  await deps.ready?.()
  const url = new URL(req.url ?? '/', 'http://localhost')
  const segments = parseSegments(url.pathname)
  const method = req.method ?? 'GET'
  const [head, second, third, fourth] = segments

  if (head === 'status' && segments.length === 1) {
    requireMethod(method, 'GET')
    await handleStatus(res)
    return
  }
  if (head === 'categories' && segments.length === 1) {
    requireMethod(method, 'GET')
    await handleCategories(res)
    return
  }
  if (head === 'stats' && segments.length === 1) {
    requireMethod(method, 'GET')
    await handleStats(res)
    return
  }
  if (head === 'installed' && segments.length === 2 && second === 'detail') {
    requireMethod(method, 'GET')
    const roots = await resolveSkillsScanRoots(await deps.skillsRoot())
    sendJson(res, 200, await readInstalledSkill(roots, url.searchParams.get('key') ?? ''))
    return
  }
  if (head === 'installed' && segments.length === 2 && second === 'file') {
    requireMethod(method, 'GET')
    const roots = await resolveSkillsScanRoots(await deps.skillsRoot())
    // Both parameters are validated inside: a key must resolve to a freshly
    // discovered entry, and the path must stay inside that entry.
    const file = await readInstalledFile(
      roots,
      url.searchParams.get('key') ?? '',
      url.searchParams.get('path') ?? '',
    )
    sendJson(res, 200, { file })
    return
  }
  if (head === 'installed' && segments.length === 2 && second === 'uninstall') {
    requireMethod(method, 'POST')
    const body = await readJsonBody(req)
    const roots = await resolveSkillsScanRoots(await deps.skillsRoot())
    const item = await removeInstalledSkill(roots, typeof body['key'] === 'string' ? body['key'] : '', deps.allowUninstall())
    await deps.rescan().catch(() => undefined)
    sendJson(res, 200, { ok: true, removedPath: item.dirPath, item })
    return
  }
  if (head === 'installed' && segments.length === 1) {
    requireMethod(method, 'GET')
    await handleInstalled(deps, res)
    return
  }
  if (head === 'install' && segments.length === 1) {
    requireMethod(method, 'POST')
    await handleInstall(req, deps, res)
    return
  }
  if (head === 'uninstall' && segments.length === 1) {
    requireMethod(method, 'POST')
    await handleUninstall(req, deps, res)
    return
  }
  if (head === 'skills') {
    if (segments.length === 1) {
      requireMethod(method, 'GET')
      await handleList(url, res)
      return
    }
    // Shape first: an unknown depth stays a 404 even when the segments that
    // would have been parsed happen to be invalid.
    if (segments.length === 3 || (segments.length === 4 && fourth === 'file')) {
      const source = parseSourceSegment(second)
      const slug = parseSlug(third)
      requireMethod(method, 'GET')
      if (segments.length === 3) {
        await handleDetail(source, slug, url, res)
      } else {
        await handleFile(source, slug, url, res)
      }
      return
    }
  }

  throw new RouteError(404, 'NOT_FOUND', `Unknown route: ${url.pathname}`)
}

/**
 * Register the Skills Hub prefix route.
 *
 * @param webServer - the `webServer`/`httpServer` service (`ctx.get` guarded by the caller).
 * @param gate - resolves the browser-trust gate (`ctx.get('connection')`) *per
 *   request*; `undefined` means the composition has no Connection fence to
 *   consult. It is a function rather than a snapshot because the Connection row
 *   may activate after this route is registered.
 * @param deps - resolved skills root, the uninstall switch, and the index refresh.
 * @returns the route disposer (yield it from `ctx.effect`).
 */
export function registerSkillsHubRoutes(
  webServer: WebServerLike,
  gate: SkillsHubGateSource,
  deps: SkillsHubRoutesDeps,
): () => void {
  return webServer.register({
    kind: 'prefix',
    path: ROUTE_PREFIX,
    handler: async (req, res) => {
      try {
        await handle(req, res, gate, deps)
      } catch (error) {
        // Every rejection becomes the documented envelope: the transport keeps
        // working for the next request instead of letting the web server write
        // its own bodyless 400.
        sendFailure(res, error)
      }
    },
  })
}
