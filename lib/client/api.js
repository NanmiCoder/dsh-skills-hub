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
/**
 * Host route prefix (docs/CONTRACT.md §5.2 `ROUTE_PREFIX`).
 *
 * Restated as a literal rather than imported: `ROUTE_PREFIX` is a runtime value
 * of a Node module, and a value import would both fail the client purity gate
 * and inline a second copy of the Host's module graph.
 */
const API_BASE = '/api/skills-hub';
/** One failure from the Skills Hub surface (transport, HTTP, or malformed body). */
export class SkillsHubApiError extends Error {
    /** Host error code (`MARKET_ERROR_CODES` value, `BAD_REQUEST`, …) or a client-side code. */
    code;
    /** HTTP status; `0` when the request never reached the Host. */
    status;
    constructor(code, status, message) {
        super(message);
        this.name = 'SkillsHubApiError';
        this.code = code;
        this.status = status;
    }
}
/** Client-side code for a request that never reached the Host (offline, DNS, CORS). */
const NETWORK_ERROR_CODE = 'NETWORK_ERROR';
/** Code the Host uses for a successful response whose body is not the promised JSON (contract §5.2). */
const BAD_RESPONSE_CODE = 'MARKET_UPSTREAM_BAD_RESPONSE';
/**
 * Whether a rejection is an aborted request.
 *
 * `AbortError` is control flow, not a failure: the controller aborts superseded
 * requests on purpose, and surfacing one as a user-facing error would put a
 * spurious banner in front of a perfectly healthy panel. Checked by `name`
 * (not `instanceof`) because an abort may cross realms (iframes, workers).
 * Exported so the state layer applies the exact same rule.
 */
export function isAbortError(error) {
    return typeof error === 'object' && error !== null && error.name === 'AbortError';
}
/** `fetch` wrapper turning every failure mode into either an abort or a `SkillsHubApiError`. */
async function send(url, init) {
    try {
        return await fetch(url, init);
    }
    catch (error) {
        // An abort must stay recognizable as an abort for the caller's stale-response logic.
        if (isAbortError(error))
            throw error;
        throw new SkillsHubApiError(NETWORK_ERROR_CODE, 0, error instanceof Error ? error.message : String(error));
    }
}
/** Parse the Host's `{ error: { code, message } }` envelope, degrading to the status line. */
async function toApiError(response) {
    let code = `HTTP_${response.status}`;
    let message = `HTTP ${response.status}${response.statusText ? ` ${response.statusText}` : ''}`;
    try {
        const payload = (await response.json());
        const envelope = payload?.error;
        if (envelope && typeof envelope.code === 'string' && envelope.code !== '')
            code = envelope.code;
        if (envelope && typeof envelope.message === 'string' && envelope.message !== '')
            message = envelope.message;
    }
    catch {
        // Non-JSON error body (proxy page, truncated stream): the status line above is the best available text.
    }
    return new SkillsHubApiError(code, response.status, message);
}
/** Decode a successful JSON body, mapping a malformed one onto the Host's bad-response code. */
async function toJson(response) {
    try {
        return (await response.json());
    }
    catch {
        throw new SkillsHubApiError(BAD_RESPONSE_CODE, response.status, 'The Skills Hub returned a response that is not valid JSON');
    }
}
async function getJson(path, signal) {
    // `same-origin` credentials: the panel is served by the Host itself, and the
    // connection gate (when present) authenticates through the session cookie.
    const response = await send(`${API_BASE}${path}`, {
        method: 'GET',
        credentials: 'same-origin',
        headers: { accept: 'application/json' },
        signal,
    });
    if (!response.ok)
        throw await toApiError(response);
    return toJson(response);
}
async function postJson(path, body) {
    const response = await send(`${API_BASE}${path}`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { accept: 'application/json', 'content-type': 'application/json' },
        body: JSON.stringify(body),
    });
    if (!response.ok)
        throw await toApiError(response);
    return toJson(response);
}
/** Split a `source:slug` skill id, rejecting anything the Host routes cannot address. */
function parseMarketId(id) {
    const separator = id.indexOf(':');
    const source = separator > 0 ? id.slice(0, separator) : '';
    const slug = separator > 0 ? id.slice(separator + 1) : '';
    if ((source === 'clawhub' || source === 'skillhub') && slug !== '') {
        return { source, slug };
    }
    // A local (`local:<dir>`) or malformed id can never be addressed by a market
    // route; failing here keeps the request off the wire entirely.
    throw new SkillsHubApiError('BAD_REQUEST', 400, `"${id}" is not a market skill id (expected "<source>:<slug>")`);
}
/** Search the catalogue (market sources) — the remote list page. */
export async function fetchMarketList(query, signal, options = {}) {
    const search = new URLSearchParams();
    const q = query.q?.trim();
    if (q)
        search.set('q', q);
    if (query.scope === 'market')
        search.set('scope', 'market');
    else if (query.category && query.category !== 'all')
        search.set('category', query.category);
    // `all` is the route's default; omitting it keeps the URL (and cache keys) canonical.
    if (query.source !== 'all')
        search.set('source', query.source);
    if (query.security !== 'all')
        search.set('security', query.security);
    if (query.installed !== 'all')
        search.set('installed', query.installed);
    if (query.cursor)
        search.set('cursor', query.cursor);
    if (typeof query.limit === 'number' && Number.isFinite(query.limit))
        search.set('limit', String(query.limit));
    // A reader-requested refresh has to reach the Host: without the flag the
    // request is indistinguishable from an automatic one and comes back cached.
    if (options.refresh === true)
        search.set('refresh', '1');
    const suffix = search.toString();
    return getJson(`/skills${suffix === '' ? '' : `?${suffix}`}`, signal);
}
/** The category bar's entries (curated catalogue), with the snapshot's provenance. */
export async function fetchMarketCategories(signal) {
    return getJson('/categories', signal);
}
/** One skill's full detail plus the health of the source that served it. */
export async function fetchSkillDetail(id, signal, options = {}) {
    const { source, slug } = parseMarketId(id);
    const search = new URLSearchParams();
    if (options.refresh === true)
        search.set('refresh', '1');
    // ClawHub slugs are shared across authors: name the one the card showed.
    if (options.owner)
        search.set('owner', options.owner);
    const suffix = search.size > 0 ? `?${search.toString()}` : '';
    return getJson(`/skills/${source}/${encodeURIComponent(slug)}${suffix}`, signal);
}
/** One file of a skill, for the Files tab. */
export async function fetchSkillFile(id, path, signal, owner) {
    const { source, slug } = parseMarketId(id);
    const ownerParam = owner ? `&owner=${encodeURIComponent(owner)}` : '';
    const payload = await getJson(`/skills/${source}/${encodeURIComponent(slug)}/file?path=${encodeURIComponent(path)}${ownerParam}`, signal);
    return payload.file;
}
/** Health of every market source, refreshed independently of the list. */
export async function fetchSourceStatus(signal) {
    const payload = await getJson('/status', signal);
    return payload.sources;
}
/**
 * Every skill DSH can currently see, including directories this plugin did not
 * install (`managed: false`). This is the local index behind the "installed"
 * filter — no upstream request is involved.
 */
export async function fetchInstalled(signal) {
    const payload = await getJson('/installed', signal);
    return payload.items;
}
/** Install a market skill into the local skills directory. */
export async function installSkill(id, owner) {
    const payload = await postJson('/install', owner ? { id, owner } : { id });
    return { installedPath: payload.installedPath, skill: payload.skill };
}
/** Remove a skill this plugin installed (the Host refuses unmanaged directories). */
export async function uninstallSkill(id) {
    const payload = await postJson('/uninstall', { id });
    return { removedPath: payload.removedPath, skill: payload.skill };
}
/** Preview the exact local copy without consulting a market provider. */
export function fetchInstalledDetail(key, signal) {
    return getJson(`/installed/detail?key=${encodeURIComponent(key)}`, signal);
}
/** One file of an installed skill; the Host validates the key and contains the path. */
export async function fetchInstalledFile(key, path, signal) {
    const payload = await getJson(`/installed/file?key=${encodeURIComponent(key)}&path=${encodeURIComponent(path)}`, signal);
    return payload.file;
}
/** Remove a specifically selected local entry after the management UI confirmation. */
export function removeInstalled(key) {
    return postJson('/installed/uninstall', { key });
}
