/**
 * Skills Hub HTTP surface.
 *
 * One `prefix` route (`/api/skills-hub`) owns the seven endpoints the panel
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
import { installMarketSkill, MarketInstallError, uninstallMarketSkill, } from "./market/install-service.js";
import { getMarketFileContent, getMarketSkillDetail, getMarketStatus, isValidMarketFilePath, listMarketSkills, } from "./market/market-service.js";
import { getMarketStats } from "./market/cache.js";
import { readInstalledFile, readInstalledSkill, removeInstalledSkill } from "./skills/management.js";
import { scanInstalledSkills } from "./skills/installed.js";
import { resolveSkillsScanRoots } from "./skills/root.js";
import { MARKET_ERROR_CODES, MARKET_SOURCES, MarketUpstreamError, parseSkillId, } from "./market/types.js";
/** Path prefix of the whole Skills Hub API. */
export const ROUTE_PREFIX = '/api/skills-hub';
/** Request bodies here are two-field JSON objects; anything larger is an attack. */
const MAX_BODY_BYTES = 64 * 1024;
/** Default `limit` for `GET /skills`; `apply()` overwrites it from `Config.pageSize`. */
const DEFAULT_PAGE_SIZE = 24;
/** Hard cap on `limit`, mirroring the reference API. */
const MAX_PAGE_SIZE = 100;
/** Longest accepted `q` parameter. */
const MAX_QUERY_LENGTH = 200;
/** Longest accepted opaque `cursor`. */
const MAX_CURSOR_LENGTH = 512;
/** Longest accepted slug. */
const MAX_SLUG_LENGTH = 200;
const SECURITY_FILTERS = ['verified', 'benign', 'unknown', 'flagged'];
const INSTALLED_FILTERS = ['all', 'installed', 'installable'];
/** Module-scoped default page size, set once by `apply()` (frozen deps carry no config). */
let defaultPageSize = DEFAULT_PAGE_SIZE;
/**
 * Set the default `/skills` page size from `Config.pageSize`.
 *
 * The frozen `SkillsHubRoutesDeps` has no config seat, and widening it would
 * change a frozen interface; this setter is the additive seam instead.
 */
export function setSkillsHubPageSize(pageSize) {
    if (Number.isFinite(pageSize) && pageSize >= 1)
        defaultPageSize = Math.min(MAX_PAGE_SIZE, Math.floor(pageSize));
}
/** A rejection produced by this module itself: status, envelope code and headers. */
class RouteError extends Error {
    status;
    code;
    allow;
    constructor(status, code, message, allow) {
        super(message);
        this.name = 'RouteError';
        this.status = status;
        this.code = code;
        this.allow = allow;
    }
}
/** One JSON response; the only place a body is written. */
function sendJson(res, status, payload, headers) {
    if (res.headersSent) {
        res.destroy();
        return;
    }
    res.writeHead(status, {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        ...headers,
    });
    res.end(JSON.stringify(payload));
}
function errorPayload(code, message) {
    return { error: { code, message } };
}
/**
 * Map any thrown value onto the envelope's status/code pair.
 *
 * The install service decides its own status (409 conflict, 400 not
 * installable, 502 checksum, 500 disk) and travels with it: the route never
 * re-derives a status from a code, so there is exactly one place that can get
 * the mapping wrong.
 */
function toHttpFailure(error) {
    if (error instanceof RouteError || error instanceof MarketInstallError) {
        const allow = error instanceof RouteError ? error.allow : undefined;
        return { status: error.status, code: error.code, message: error.message, allow };
    }
    if (error instanceof MarketUpstreamError) {
        // A malformed/absent upstream payload is "this skill does not exist";
        // every other upstream problem is a bad gateway.
        const status = error.code === MARKET_ERROR_CODES.upstreamBadResponse ? 404 : 502;
        return { status, code: error.code, message: error.message, allow: undefined };
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
    };
}
/** Answer one thrown value; the single exit for every failure path. */
function sendFailure(res, error) {
    const failure = toHttpFailure(error);
    sendJson(res, failure.status, errorPayload(failure.code, failure.message), failure.allow === undefined ? undefined : { allow: failure.allow });
}
/**
 * Run the browser-trust gate and return the rejection status, if any.
 *
 * The frozen gate type says `boolean`, the real service answers `401 | 403 |
 * undefined`; both are accepted so the envelope can report the true status when
 * the plugin is wired to the real Connection service, while a plain predicate
 * still works.
 */
function evaluateGate(gate, req, res) {
    const outcome = gate.requestRejection(req, res);
    if (outcome === undefined || outcome === false || outcome === null)
        return undefined;
    return typeof outcome === 'number' ? outcome : 403;
}
/**
 * Read a bounded JSON object body.
 *
 * Mirrors `readJsonRequest` in `dsh-agent-teams/src/web-routes.ts`: an oversized
 * body stops being buffered immediately and the socket is drained, so a hostile
 * `Content-Length` cannot pin memory in the host process.
 */
async function readJsonBody(req, maxBytes = MAX_BODY_BYTES) {
    const raw = await new Promise((resolve, reject) => {
        let size = 0;
        let settled = false;
        const chunks = [];
        const finish = (error) => {
            if (settled)
                return;
            settled = true;
            req.off('data', onData);
            req.off('end', onEnd);
            req.off('aborted', onAborted);
            req.off('error', onError);
            if (error !== undefined) {
                chunks.length = 0;
                req.once('error', () => undefined);
                req.resume();
                reject(error);
                return;
            }
            resolve(Buffer.concat(chunks).toString('utf8'));
        };
        const onData = (chunk) => {
            const part = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
            size += part.length;
            if (size > maxBytes) {
                finish(new RouteError(400, 'BAD_REQUEST', `Request body exceeds ${maxBytes} bytes`));
            }
            else {
                chunks.push(part);
            }
        };
        const onEnd = () => finish();
        const onAborted = () => finish(new RouteError(400, 'BAD_REQUEST', 'Request body was aborted'));
        const onError = () => finish(new RouteError(400, 'BAD_REQUEST', 'Invalid request body'));
        req.on('data', onData);
        req.once('end', onEnd);
        req.once('aborted', onAborted);
        req.once('error', onError);
    });
    let value;
    try {
        value = raw.trim() === '' ? {} : JSON.parse(raw);
    }
    catch {
        throw new RouteError(400, 'BAD_REQUEST', 'Invalid JSON body');
    }
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        throw new RouteError(400, 'BAD_REQUEST', 'Body must be a JSON object');
    }
    return value;
}
/** Decode the path segments below {@link ROUTE_PREFIX}, rejecting malformed encoding. */
function parseSegments(pathname) {
    if (pathname !== ROUTE_PREFIX && !pathname.startsWith(`${ROUTE_PREFIX}/`)) {
        throw new RouteError(404, 'NOT_FOUND', `Unknown route: ${pathname}`);
    }
    return pathname
        .slice(ROUTE_PREFIX.length)
        .split('/')
        .filter((segment) => segment !== '')
        .map((segment) => {
        try {
            return decodeURIComponent(segment);
        }
        catch {
            throw new RouteError(400, 'BAD_REQUEST', 'Malformed percent-encoding in the request path');
        }
    });
}
function requireMethod(method, expected) {
    if (method !== expected) {
        throw new RouteError(405, 'METHOD_NOT_ALLOWED', `Method ${method} is not allowed here`, expected);
    }
}
/** Validate one path segment against the frozen market source list. */
function parseSourceSegment(segment) {
    if (segment !== undefined && MARKET_SOURCES.includes(segment))
        return segment;
    throw new RouteError(400, 'BAD_REQUEST', `Invalid market source: ${segment ?? ''}`);
}
/** Reject anything that could escape a path when joined onto a URL or a file path. */
function parseSlug(segment) {
    if (segment === undefined || segment === '')
        throw new RouteError(400, 'BAD_REQUEST', 'Missing skill slug');
    if (segment.length > MAX_SLUG_LENGTH)
        throw new RouteError(400, 'BAD_REQUEST', 'Skill slug is too long');
    if (segment.includes('/') || segment.includes('\\') || segment.includes('..')) {
        throw new RouteError(400, 'BAD_REQUEST', `Invalid skill slug: ${segment}`);
    }
    return segment;
}
/** Bounded optional string query parameter. */
function optionalQuery(url, name, maxLength) {
    const value = url.searchParams.get(name)?.trim();
    if (value === undefined || value === '')
        return undefined;
    if (value.length > maxLength) {
        throw new RouteError(400, 'BAD_REQUEST', `Query parameter "${name}" exceeds ${maxLength} characters`);
    }
    return value;
}
/** Closed-set query parameter with a fallback. */
function enumQuery(url, name, allowed, fallback) {
    const raw = url.searchParams.get(name);
    if (raw === null || raw === '')
        return fallback;
    if (allowed.includes(raw))
        return raw;
    throw new RouteError(400, 'BAD_REQUEST', `Invalid ${name} filter: ${raw}`);
}
/** `limit` query parameter, clamped into the documented range. */
function parseLimit(url) {
    const raw = url.searchParams.get('limit');
    if (raw === null || raw.trim() === '')
        return defaultPageSize;
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isFinite(parsed))
        throw new RouteError(400, 'BAD_REQUEST', `Invalid limit: ${raw}`);
    return Math.min(MAX_PAGE_SIZE, Math.max(1, parsed));
}
/** `{ id: "source:slug" }` body of the install/uninstall endpoints. */
function parseBodyId(body) {
    const id = typeof body['id'] === 'string' ? body['id'] : '';
    const parsed = parseSkillId(id);
    if (parsed === null)
        throw new RouteError(400, 'BAD_REQUEST', `Invalid skill id: ${id === '' ? '(missing)' : id}`);
    return parsed;
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
function parseRefresh(url) {
    const raw = url.searchParams.get('refresh');
    if (raw === null || raw === '' || raw === '0' || raw === 'false')
        return false;
    if (raw === '1' || raw === 'true')
        return true;
    throw new RouteError(400, 'BAD_REQUEST', `Invalid refresh flag: ${raw}`);
}
async function handleStatus(res) {
    sendJson(res, 200, { sources: getMarketStatus() });
}
/** Cache and upstream counters: the evidence behind every traffic claim. */
async function handleStats(res) {
    sendJson(res, 200, { stats: getMarketStats() });
}
async function handleList(url, res) {
    const params = {
        q: optionalQuery(url, 'q', MAX_QUERY_LENGTH),
        source: enumQuery(url, 'source', ['all', ...MARKET_SOURCES], 'all'),
        security: enumQuery(url, 'security', ['all', ...SECURITY_FILTERS], 'all'),
        installed: enumQuery(url, 'installed', INSTALLED_FILTERS, 'all'),
        cursor: optionalQuery(url, 'cursor', MAX_CURSOR_LENGTH),
        limit: parseLimit(url),
        refresh: parseRefresh(url),
    };
    const result = await listMarketSkills(params);
    sendJson(res, 200, result);
}
async function handleDetail(source, slug, url, res) {
    sendJson(res, 200, await getMarketSkillDetail(source, slug, { force: parseRefresh(url) }));
}
async function handleFile(source, slug, url, res) {
    const filePath = url.searchParams.get('path') ?? '';
    if (!isValidMarketFilePath(filePath)) {
        throw new RouteError(400, 'BAD_REQUEST', `Invalid file path: ${filePath}`);
    }
    sendJson(res, 200, { file: await getMarketFileContent(source, slug, filePath) });
}
/**
 * List installed skills from disk.
 *
 * The frozen deps surface exposes the resolved root rather than the in-memory
 * index, so the list is produced by scanning the same roots the lookup uses:
 * disk is the single source of truth, and a skill the user copied in by hand
 * shows up next to the ones this plugin installed.
 */
async function handleInstalled(deps, res) {
    const roots = await resolveSkillsScanRoots(await deps.skillsRoot());
    sendJson(res, 200, { items: (await scanInstalledSkills(roots)).map(item => ({ ...item, removable: deps.allowUninstall() })) });
}
async function handleInstall(req, deps, res) {
    const { source, slug } = parseBodyId(await readJsonBody(req));
    const result = await installMarketSkill(source, slug, {
        skillsRoot: await deps.skillsRoot(),
        allowUninstall: deps.allowUninstall(),
    });
    // Refresh before answering, so the next /skills or /installed call is correct.
    await deps.rescan().catch(() => undefined);
    sendJson(res, 200, { ok: true, installedPath: result.installedPath, skill: result.skill });
}
async function handleUninstall(req, deps, res) {
    const { source, slug } = parseBodyId(await readJsonBody(req));
    const result = await uninstallMarketSkill(source, slug, {
        skillsRoot: await deps.skillsRoot(),
        allowUninstall: deps.allowUninstall(),
    });
    await deps.rescan().catch(() => undefined);
    sendJson(res, 200, { ok: true, removedPath: result.removedPath, skill: result.skill });
}
async function handle(req, res, gate, deps) {
    // Raw Web routes bypass the Connection fence; ask it before doing any work.
    // The source is resolved per request: the Connection service can be
    // contributed after this route was registered (Loader rows activate
    // concurrently), and a gate captured once would silently stay absent —
    // leaving the whole marketplace readable and installable from any web page.
    const resolvedGate = gate();
    if (resolvedGate !== undefined) {
        const rejection = evaluateGate(resolvedGate, req, res);
        if (rejection !== undefined) {
            sendJson(res, rejection, errorPayload(rejection === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN', rejection === 401 ? 'unauthorized' : 'forbidden'));
            return;
        }
    }
    await deps.ready?.();
    const url = new URL(req.url ?? '/', 'http://localhost');
    const segments = parseSegments(url.pathname);
    const method = req.method ?? 'GET';
    const [head, second, third, fourth] = segments;
    if (head === 'status' && segments.length === 1) {
        requireMethod(method, 'GET');
        await handleStatus(res);
        return;
    }
    if (head === 'stats' && segments.length === 1) {
        requireMethod(method, 'GET');
        await handleStats(res);
        return;
    }
    if (head === 'installed' && segments.length === 2 && second === 'detail') {
        requireMethod(method, 'GET');
        const roots = await resolveSkillsScanRoots(await deps.skillsRoot());
        sendJson(res, 200, await readInstalledSkill(roots, url.searchParams.get('key') ?? ''));
        return;
    }
    if (head === 'installed' && segments.length === 2 && second === 'file') {
        requireMethod(method, 'GET');
        const roots = await resolveSkillsScanRoots(await deps.skillsRoot());
        // Both parameters are validated inside: a key must resolve to a freshly
        // discovered entry, and the path must stay inside that entry.
        const file = await readInstalledFile(roots, url.searchParams.get('key') ?? '', url.searchParams.get('path') ?? '');
        sendJson(res, 200, { file });
        return;
    }
    if (head === 'installed' && segments.length === 2 && second === 'uninstall') {
        requireMethod(method, 'POST');
        const body = await readJsonBody(req);
        const roots = await resolveSkillsScanRoots(await deps.skillsRoot());
        const item = await removeInstalledSkill(roots, typeof body['key'] === 'string' ? body['key'] : '', deps.allowUninstall());
        await deps.rescan().catch(() => undefined);
        sendJson(res, 200, { ok: true, removedPath: item.dirPath, item });
        return;
    }
    if (head === 'installed' && segments.length === 1) {
        requireMethod(method, 'GET');
        await handleInstalled(deps, res);
        return;
    }
    if (head === 'install' && segments.length === 1) {
        requireMethod(method, 'POST');
        await handleInstall(req, deps, res);
        return;
    }
    if (head === 'uninstall' && segments.length === 1) {
        requireMethod(method, 'POST');
        await handleUninstall(req, deps, res);
        return;
    }
    if (head === 'skills') {
        if (segments.length === 1) {
            requireMethod(method, 'GET');
            await handleList(url, res);
            return;
        }
        // Shape first: an unknown depth stays a 404 even when the segments that
        // would have been parsed happen to be invalid.
        if (segments.length === 3 || (segments.length === 4 && fourth === 'file')) {
            const source = parseSourceSegment(second);
            const slug = parseSlug(third);
            requireMethod(method, 'GET');
            if (segments.length === 3) {
                await handleDetail(source, slug, url, res);
            }
            else {
                await handleFile(source, slug, url, res);
            }
            return;
        }
    }
    throw new RouteError(404, 'NOT_FOUND', `Unknown route: ${url.pathname}`);
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
export function registerSkillsHubRoutes(webServer, gate, deps) {
    return webServer.register({
        kind: 'prefix',
        path: ROUTE_PREFIX,
        handler: async (req, res) => {
            try {
                await handle(req, res, gate, deps);
            }
            catch (error) {
                // Every rejection becomes the documented envelope: the transport keeps
                // working for the next request instead of letting the web server write
                // its own bodyless 400.
                sendFailure(res, error);
            }
        },
    });
}
