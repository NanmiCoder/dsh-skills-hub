/**
 * ClawHub provider (https://clawhub.ai)
 *
 * Endpoints (verified against the live API):
 *  - GET /api/v1/skills?limit=&cursor=&sort=downloads → {items, nextCursor}
 *  - GET /api/v1/search?q=                            → {results} (no pagination)
 *  - GET /api/v1/skills/{slug}                        → {skill, latestVersion, owner, metadata, moderation}
 *  - GET /api/v1/skills/{slug}/versions/{v}           → {version:{license, files[], security}}
 *  - GET /api/v1/skills/{slug}/file?path=             → raw file text
 */
import { getProviderBase, providerFetch, providerFetchJson, readResponseTextWithLimit, MarketHttpError, } from "./provider-fetch.js";
import { markSourceHealth } from "./cache.js";
import { detectMarketLanguage, MARKET_ERROR_CODES, MARKET_LIMITS, MarketUpstreamError, skillId, } from "./types.js";
// ─── Frontmatter ─────────────────────────────────────────────────────────────
/**
 * Frontmatter delimiters must start at column zero: an indented `---` may be
 * YAML block-scalar content, and treating it as the close would drop fields.
 */
const FRONTMATTER_REGEX = /^---[\t ]*\r?\n([\s\S]*?)^---[\t ]*(?:\r?\n[\t \r\n]*|$)/m;
const BLOCK_SCALAR = /^[|>][+-]?\d*$/;
const SKIPPABLE_LINE = /^\s*(?:#.*)?$/;
/**
 * Split `---` frontmatter from a markdown body.
 *
 * The reference server delegated YAML to Bun.YAML / the `yaml` package; this
 * plugin must not add a runtime dependency, so `parseYamlSubset` below covers
 * the subset SKILL.md frontmatter actually uses (scalars, quoted strings, flow
 * collections, nested mappings, block sequences and block scalars) and any
 * value it cannot understand is dropped rather than throwing.
 */
export function parseFrontmatter(markdown) {
    const match = FRONTMATTER_REGEX.exec(markdown);
    if (!match)
        return { frontmatter: {}, content: markdown };
    const content = markdown.slice(match[0].length);
    let frontmatter = {};
    try {
        frontmatter = parseYamlSubset(match[1] ?? '');
    }
    catch {
        // Broken frontmatter must not break the preview — keep the body only.
    }
    return { frontmatter, content };
}
function parseYamlSubset(text) {
    const [mapping] = parseMapping(text.split(/\r?\n/), 0, 0);
    return mapping;
}
function indentWidth(line) {
    return /^[ \t]*/.exec(line)?.[0].length ?? 0;
}
function isSkippable(line) {
    return SKIPPABLE_LINE.test(line);
}
/** Index of the `:` that separates a mapping key from its value, or -1. */
function findKeySeparator(body) {
    let quote = null;
    for (let i = 0; i < body.length; i++) {
        const char = body[i];
        if (quote) {
            if (char === '\\' && quote === '"')
                i++;
            else if (char === quote)
                quote = null;
            continue;
        }
        if (char === '"' || char === "'") {
            quote = char;
            continue;
        }
        if (char === ':' && (i + 1 === body.length || body[i + 1] === ' ' || body[i + 1] === '\t'))
            return i;
    }
    return -1;
}
function unquoteKey(key) {
    if (key.length >= 2 && key.startsWith('"') && key.endsWith('"'))
        return decodeDoubleQuoted(key);
    if (key.length >= 2 && key.startsWith("'") && key.endsWith("'"))
        return key.slice(1, -1);
    return key;
}
const UNESCAPE = {
    '"': '"', '\\': '\\', '/': '/', b: '\b', f: '\f', n: '\n', r: '\r', t: '\t',
};
function decodeDoubleQuoted(value) {
    try {
        const parsed = JSON.parse(value);
        if (typeof parsed === 'string')
            return parsed;
    }
    catch {
        // Not JSON-escaped — decode the common escapes by hand below.
    }
    return value
        .slice(1, -1)
        .replace(/\\(["\\/bfnrt])/g, (_match, char) => UNESCAPE[char] ?? char);
}
function stripInlineComment(value) {
    const index = value.search(/\s#/);
    return (index === -1 ? value : value.slice(0, index)).trim();
}
function parseScalar(raw) {
    const value = raw.trim();
    if (value === '')
        return null;
    if (value.length >= 2 && value.startsWith('"') && value.endsWith('"'))
        return decodeDoubleQuoted(value);
    if (value.length >= 2 && value.startsWith("'") && value.endsWith("'")) {
        return value.slice(1, -1).replace(/''/g, "'");
    }
    if (value.startsWith('[') || value.startsWith('{')) {
        // Real ClawHub skills embed JSON-ish flow collections (e.g. `metadata: {...}`).
        try {
            return JSON.parse(value);
        }
        catch {
            return parseFlowCollection(value);
        }
    }
    if (value === 'null' || value === '~')
        return null;
    if (value === 'true')
        return true;
    if (value === 'false')
        return false;
    if (/^[+-]?\d+$/.test(value))
        return Number.parseInt(value, 10);
    if (/^[+-]?(?:\d+\.\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(value))
        return Number.parseFloat(value);
    return stripInlineComment(value);
}
/** Split on commas that are not nested inside quotes, brackets or braces. */
function splitTopLevel(value) {
    const parts = [];
    let current = '';
    let depth = 0;
    let quote = null;
    for (let i = 0; i < value.length; i++) {
        const char = value[i];
        if (quote) {
            current += char;
            if (char === '\\' && quote === '"') {
                current += value[i + 1] ?? '';
                i++;
            }
            else if (char === quote) {
                quote = null;
            }
            continue;
        }
        if (char === '"' || char === "'") {
            quote = char;
            current += char;
            continue;
        }
        if (char === '[' || char === '{')
            depth++;
        if (char === ']' || char === '}')
            depth--;
        if (char === ',' && depth === 0) {
            parts.push(current);
            current = '';
            continue;
        }
        current += char;
    }
    parts.push(current);
    return parts.map((part) => part.trim()).filter((part) => part !== '');
}
function parseFlowCollection(value) {
    const inner = value.slice(1, -1).trim();
    if (inner === '')
        return value.startsWith('[') ? [] : {};
    const parts = splitTopLevel(inner);
    if (value.startsWith('['))
        return parts.map((part) => parseScalar(part));
    const out = {};
    for (const part of parts) {
        const separator = findKeySeparator(part);
        if (separator <= 0)
            continue;
        out[unquoteKey(part.slice(0, separator).trim())] = parseScalar(part.slice(separator + 1));
    }
    return out;
}
/** Indentation-aware `key: value` block; stops at the first line that dedents. */
function parseMapping(lines, start, indent) {
    const out = {};
    let i = start;
    while (i < lines.length) {
        const line = lines[i] ?? '';
        if (isSkippable(line)) {
            i++;
            continue;
        }
        const width = indentWidth(line);
        const body = line.slice(width);
        if (width < indent)
            break;
        if (width > indent) {
            // A deeper line belongs to the value above; a stray one is ignored rather
            // than truncating every key that follows it.
            i++;
            continue;
        }
        if (body.startsWith('-'))
            break;
        const separator = findKeySeparator(body);
        if (separator < 0) {
            i++;
            continue;
        }
        const key = unquoteKey(body.slice(0, separator).trim());
        const rest = body.slice(separator + 1).trim();
        if (rest === '' || rest.startsWith('#')) {
            const [value, next] = parseNested(lines, i + 1, width);
            out[key] = value;
            i = next;
            continue;
        }
        if (BLOCK_SCALAR.test(rest)) {
            const [value, next] = parseBlockScalar(lines, i + 1, width, rest.startsWith('>'));
            out[key] = value;
            i = next;
            continue;
        }
        out[key] = parseScalar(rest);
        i++;
    }
    return [out, i];
}
/** Value of a `key:` with nothing after the colon: nested block, sequence, or null. */
function parseNested(lines, start, parentIndent) {
    let i = start;
    while (i < lines.length && isSkippable(lines[i] ?? ''))
        i++;
    const line = lines[i];
    if (line === undefined)
        return [null, i];
    const width = indentWidth(line);
    if (width <= parentIndent)
        return [null, start];
    const body = line.slice(width);
    if (body.startsWith('-'))
        return parseSequence(lines, i, width);
    return parseMapping(lines, i, width);
}
function parseSequence(lines, start, indent) {
    const items = [];
    let i = start;
    while (i < lines.length) {
        const line = lines[i] ?? '';
        if (isSkippable(line)) {
            i++;
            continue;
        }
        const width = indentWidth(line);
        const body = line.slice(width);
        if (width !== indent || !body.startsWith('-'))
            break;
        const rest = body.slice(1).trim();
        if (rest === '' || rest.startsWith('#')) {
            const [value, next] = parseNested(lines, i + 1, width);
            items.push(value);
            i = next;
            continue;
        }
        if (findKeySeparator(rest) > 0) {
            // `- key: value` opens an inline mapping item; re-indent it and parse as a block.
            const patched = [...lines];
            patched[i] = `${' '.repeat(width + 2)}${rest}`;
            const [mapping, next] = parseMapping(patched, i, width + 2);
            items.push(mapping);
            i = next;
            continue;
        }
        items.push(parseScalar(rest));
        i++;
    }
    return [items, i];
}
function parseBlockScalar(lines, start, parentIndent, folded) {
    const collected = [];
    let blockIndent = -1;
    let i = start;
    while (i < lines.length) {
        const line = lines[i] ?? '';
        if (line.trim() === '') {
            collected.push('');
            i++;
            continue;
        }
        const width = indentWidth(line);
        if (width <= parentIndent)
            break;
        if (blockIndent === -1)
            blockIndent = width;
        collected.push(line.slice(Math.min(blockIndent, width)));
        i++;
    }
    // Trailing blank lines belong to the next key, not to this scalar.
    while (collected.length > 0 && collected[collected.length - 1] === '')
        collected.pop();
    return [collected.join(folded ? ' ' : '\n'), i];
}
// ─── Untrusted-payload helpers ───────────────────────────────────────────────
/**
 * Upstream JSON is untrusted input: a field declared `string` in the ported
 * types can arrive as an object, an array or a number. These helpers keep every
 * `NormalizedSkill` field at its declared runtime type, so a hostile or broken
 * upstream cannot crash the aggregation layer (or React, downstream).
 */
function asString(value) {
    return typeof value === 'string' ? value : undefined;
}
function asNumber(value) {
    return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}
/** A usable slug is a non-empty string — anything else is not a skill entry. */
function hasUsableSlug(item) {
    if (typeof item !== 'object' || item === null)
        return false;
    const slug = item.slug;
    return typeof slug === 'string' && slug.trim() !== '';
}
/** File entries are only useful with a string path; sizes default to 0. */
function usableFileEntries(files) {
    if (!Array.isArray(files))
        return [];
    const out = [];
    for (const file of files) {
        if (typeof file !== 'object' || file === null)
            continue;
        const record = file;
        if (typeof record.path !== 'string' || record.path === '')
            continue;
        out.push({
            path: record.path,
            size: asNumber(record.size) ?? 0,
            sha256: asString(record.sha256),
            contentType: asString(record.contentType),
        });
    }
    return out;
}
// ClawHub slugs are not unique across owners. Ambiguous slugs return
// 409 AMBIGUOUS_SKILL_SLUG with candidate owners; disambiguate via ?owner=
// (first match = primary listing) and remember the resolution.
const ownerCache = new Map();
async function clawhubFetch(url, slug) {
    const cachedOwner = ownerCache.get(slug);
    if (cachedOwner && !url.searchParams.has('owner')) {
        url.searchParams.set('owner', cachedOwner);
    }
    const res = await providerFetch('clawhub', url.toString());
    if (res.status !== 409)
        return res;
    let body = null;
    try {
        const { content } = await readResponseTextWithLimit('clawhub', res, MARKET_LIMITS.maxTotalSize, 'ambiguous-slug response body');
        try {
            body = JSON.parse(content);
        }
        catch {
            body = null;
        }
    }
    catch (error) {
        if (error instanceof MarketUpstreamError)
            throw error;
        body = null;
    }
    const resolvedOwner = body?.code === 'AMBIGUOUS_SKILL_SLUG' ? asString(body.matches?.[0]?.ownerHandle) : undefined;
    if (!resolvedOwner) {
        throw new MarketHttpError('clawhub', 409, MARKET_ERROR_CODES.upstreamError, `clawhub responded 409 for ${url.pathname}`);
    }
    ownerCache.set(slug, resolvedOwner);
    url.searchParams.set('owner', resolvedOwner);
    return providerFetch('clawhub', url.toString());
}
async function clawhubFetchJson(url, slug) {
    const res = await clawhubFetch(url, slug);
    if (!res.ok) {
        throw new MarketHttpError('clawhub', res.status, res.status === 404 ? MARKET_ERROR_CODES.upstreamBadResponse : MARKET_ERROR_CODES.upstreamError, `clawhub responded ${res.status} for ${url.pathname}`);
    }
    const { content } = await readResponseTextWithLimit('clawhub', res, MARKET_LIMITS.maxTotalSize, 'skill response body');
    try {
        return JSON.parse(content);
    }
    catch {
        throw new MarketUpstreamError('clawhub', MARKET_ERROR_CODES.upstreamBadResponse, 'clawhub returned invalid JSON');
    }
}
function mapSecurity(security) {
    const vendorStatus = asString(security?.status);
    if (!vendorStatus)
        return { status: 'unknown', reports: [] };
    const clean = vendorStatus === 'clean';
    return {
        status: clean ? 'benign' : 'flagged',
        reports: [
            {
                vendor: 'clawhub-scan',
                status: vendorStatus,
                statusText: clean
                    ? security?.hasWarnings === true ? 'Clean (with warnings)' : 'Clean'
                    : `Scan status: ${vendorStatus}`,
                reportUrl: asString(security?.virustotalUrl),
            },
        ],
    };
}
function normalizeListItem(item) {
    return {
        id: skillId('clawhub', item.slug),
        source: 'clawhub',
        slug: item.slug,
        name: asString(item.displayName) || item.slug,
        summary: asString(item.summary) ?? '',
        author: { handle: '' },
        stats: {
            downloads: asNumber(item.stats?.downloads) ?? 0,
            installs: asNumber(item.stats?.installs),
            stars: asNumber(item.stats?.stars),
        },
        tags: Array.isArray(item.topics) ? item.topics.filter((tag) => typeof tag === 'string') : [],
        version: asString(item.latestVersion?.version),
        updatedAt: asNumber(item.updatedAt),
        securityStatus: 'unknown',
        installState: 'installable',
    };
}
function normalizeSearchResult(result) {
    return {
        id: skillId('clawhub', result.slug),
        source: 'clawhub',
        slug: result.slug,
        name: asString(result.displayName) || result.slug,
        summary: asString(result.summary) ?? '',
        author: {
            handle: asString(result.owner?.handle) || asString(result.ownerHandle) || '',
            displayName: asString(result.owner?.displayName),
            avatarUrl: asString(result.owner?.image),
        },
        stats: { downloads: asNumber(result.downloads) ?? 0 },
        tags: [],
        updatedAt: asNumber(result.updatedAt),
        securityStatus: 'unknown',
        installState: 'installable',
    };
}
/** Test hook: forget which owner disambiguated an ambiguous slug. */
export function resetClawhubOwnerCache() {
    ownerCache.clear();
}
export const clawhubProvider = {
    source: 'clawhub',
    async list({ cursor, limit }) {
        const base = getProviderBase('clawhub');
        const url = new URL('/api/v1/skills', base);
        url.searchParams.set('limit', String(limit));
        url.searchParams.set('sort', 'downloads');
        if (cursor)
            url.searchParams.set('cursor', cursor);
        const data = await providerFetchJson('clawhub', url.toString());
        if (!Array.isArray(data.items)) {
            throw new MarketUpstreamError('clawhub', MARKET_ERROR_CODES.upstreamBadResponse, 'clawhub list missing items');
        }
        const usable = data.items.filter(hasUsableSlug);
        if (usable.length === 0 && data.items.length > 0) {
            // Every entry was malformed. Dropping them silently would leave the
            // aggregation layer serving an empty page while `/status` still claims the
            // source is healthy — report the payload instead.
            const error = new MarketUpstreamError('clawhub', MARKET_ERROR_CODES.upstreamBadResponse, 'clawhub list contained no usable items');
            markSourceHealth('clawhub', 'degraded', error.message);
            throw error;
        }
        if (usable.length !== data.items.length) {
            markSourceHealth('clawhub', 'degraded', 'clawhub list contained malformed items');
        }
        return {
            items: usable.map(normalizeListItem),
            // Cursor pagination is upstream-native: pass the opaque token straight back.
            nextCursor: asString(data.nextCursor) || undefined,
        };
    },
    async search({ q, limit }) {
        const base = getProviderBase('clawhub');
        const url = new URL('/api/v1/search', base);
        url.searchParams.set('q', q);
        const data = await providerFetchJson('clawhub', url.toString());
        if (!Array.isArray(data.results)) {
            throw new MarketUpstreamError('clawhub', MARKET_ERROR_CODES.upstreamBadResponse, 'clawhub search missing results');
        }
        // Search also aggregates external registries, which cannot use ClawHub's
        // detail/file endpoints. Older native results omit source/install metadata.
        // Filter before capping so external results do not consume native slots —
        // and note the search endpoint has no pagination, so there is no nextCursor.
        const usable = data.results.filter(hasUsableSlug);
        if (usable.length === 0 && data.results.length > 0) {
            const error = new MarketUpstreamError('clawhub', MARKET_ERROR_CODES.upstreamBadResponse, 'clawhub search contained no usable results');
            markSourceHealth('clawhub', 'degraded', error.message);
            throw error;
        }
        const nativeResults = usable.filter((result) => (result.source === undefined || result.source === 'clawhub')
            && (result.install?.kind === undefined || result.install.kind === 'clawhub'));
        return { items: nativeResults.slice(0, limit).map(normalizeSearchResult) };
    },
    async detail(slug) {
        const base = getProviderBase('clawhub');
        const data = await clawhubFetchJson(new URL(`/api/v1/skills/${encodeURIComponent(slug)}`, base), slug);
        if (typeof data.skill?.slug !== 'string' || data.skill.slug.trim() === '') {
            throw new MarketUpstreamError('clawhub', MARKET_ERROR_CODES.upstreamBadResponse, 'clawhub detail missing skill');
        }
        const version = asString(data.latestVersion?.version) || asString(data.skill.latestVersion?.version);
        let rawFiles;
        let license = asString(data.latestVersion?.license);
        let security = { status: 'unknown', reports: [] };
        if (version) {
            try {
                const versionDetail = await clawhubFetchJson(new URL(`/api/v1/skills/${encodeURIComponent(slug)}/versions/${encodeURIComponent(version)}`, base), slug);
                rawFiles = versionDetail.version?.files;
                license = asString(versionDetail.version?.license) || license;
                security = mapSecurity(versionDetail.version?.security);
            }
            catch {
                // Version detail is best-effort; the skill detail is still useful without files.
            }
        }
        const files = usableFileEntries(rawFiles);
        // Some catalogue responses omit the document; retrieve SKILL.md rather
        // than showing an empty overview for an otherwise installable skill.
        let rawDescription = asString(data.skill.description) ?? '';
        if (rawDescription.trim() === '') {
            try {
                rawDescription = (await clawhubProvider.fetchFile(slug, 'SKILL.md')).content;
            }
            catch {
                // File delivery can fail independently of catalogue metadata.
                rawDescription = asString(data.skill.summary) ?? '';
            }
        }
        let body = rawDescription;
        let frontmatter;
        if (rawDescription.startsWith('---')) {
            const parsed = parseFrontmatter(rawDescription);
            body = parsed.content;
            frontmatter = parsed.frontmatter;
        }
        const item = normalizeListItem(data.skill);
        return {
            ...item,
            version,
            author: {
                handle: asString(data.owner?.handle) || '',
                displayName: asString(data.owner?.displayName),
                avatarUrl: asString(data.owner?.image),
            },
            securityStatus: security.status,
            securityReports: security.reports.length ? security.reports : undefined,
            description: body,
            descriptionFrontmatter: frontmatter,
            license,
            files: files.map((file) => ({
                path: file.path,
                size: file.size,
                sha256: file.sha256,
                contentType: file.contentType,
                language: detectMarketLanguage(file.path),
                tooBig: false,
            })),
            totalSize: files.reduce((sum, file) => sum + file.size, 0),
        };
    },
    async listFiles(slug, version) {
        const base = getProviderBase('clawhub');
        let resolvedVersion = version;
        if (!resolvedVersion) {
            const data = await clawhubFetchJson(new URL(`/api/v1/skills/${encodeURIComponent(slug)}`, base), slug);
            resolvedVersion = asString(data.latestVersion?.version) || asString(data.skill?.latestVersion?.version);
        }
        if (!resolvedVersion)
            return [];
        const versionDetail = await clawhubFetchJson(new URL(`/api/v1/skills/${encodeURIComponent(slug)}/versions/${encodeURIComponent(resolvedVersion)}`, base), slug);
        return usableFileEntries(versionDetail.version?.files);
    },
    async fetchFile(slug, filePath) {
        const base = getProviderBase('clawhub');
        const url = new URL(`/api/v1/skills/${encodeURIComponent(slug)}/file`, base);
        url.searchParams.set('path', filePath);
        const res = await clawhubFetch(url, slug);
        if (!res.ok) {
            throw new MarketHttpError('clawhub', res.status, res.status === 404 ? MARKET_ERROR_CODES.upstreamBadResponse : MARKET_ERROR_CODES.upstreamError, `clawhub file fetch failed (${res.status})`);
        }
        return await readResponseTextWithLimit('clawhub', res, MARKET_LIMITS.maxFileSize, `file ${filePath}`);
    },
};
