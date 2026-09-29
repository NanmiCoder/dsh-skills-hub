/**
 * Skills Market — shared types for the market aggregation layer.
 *
 * Upstream sources:
 *  - ClawHub  (https://clawhub.ai)      — cursor pagination, no security audits
 *  - SkillHub (https://api.skillhub.cn) — page/pageSize pagination, security reports
 */
export const MARKET_SOURCES = ['clawhub', 'skillhub'];
// ─── Error codes ─────────────────────────────────────────────────────────────
export const MARKET_ERROR_CODES = {
    upstreamError: 'MARKET_UPSTREAM_ERROR',
    upstreamTimeout: 'MARKET_UPSTREAM_TIMEOUT',
    upstreamBadResponse: 'MARKET_UPSTREAM_BAD_RESPONSE',
    installInProgress: 'MARKET_INSTALL_IN_PROGRESS',
    alreadyInstalled: 'MARKET_ALREADY_INSTALLED',
    notInstallable: 'MARKET_NOT_INSTALLABLE',
    checksumMismatch: 'MARKET_CHECKSUM_MISMATCH',
    diskError: 'MARKET_DISK_ERROR',
    notInstalled: 'MARKET_NOT_INSTALLED',
    notManaged: 'MARKET_NOT_MANAGED',
};
export class MarketUpstreamError extends Error {
    source;
    code;
    constructor(source, code, message) {
        super(message);
        this.source = source;
        this.code = code;
        this.name = 'MarketUpstreamError';
    }
}
// ─── Limits ──────────────────────────────────────────────────────────────────
export const MARKET_LIMITS = {
    /** Max bytes for a single skill file (install + preview) */
    maxFileSize: 5 * 1024 * 1024,
    /** Max total bytes for an installable skill */
    maxTotalSize: 20 * 1024 * 1024,
    /** Max file count for an installable skill */
    maxFileCount: 200,
    /** File preview content is truncated beyond this many bytes */
    previewTruncateBytes: 300 * 1024,
    /** ClawHub search has no pagination — cap merged search results */
    searchResultCap: 50,
};
export function skillId(source, slug) {
    return `${source}:${slug}`;
}
export function parseSkillId(id) {
    const idx = id.indexOf(':');
    if (idx <= 0)
        return null;
    const source = id.slice(0, idx);
    const slug = id.slice(idx + 1);
    if (!MARKET_SOURCES.includes(source) || !slug)
        return null;
    return { source: source, slug };
}
/** Directory-name whitelist: lowercase alnum, dash, underscore, dot (no leading dot). */
export function sanitizeDirName(slug) {
    // Upstream payloads are untrusted: a non-string slug is simply not a usable
    // directory name, and must degrade to "not installable" instead of throwing
    // from `slug.toLowerCase()` deep inside a list request.
    if (typeof slug !== 'string')
        return null;
    const name = slug.toLowerCase();
    if (!/^[a-z0-9][a-z0-9._-]*$/.test(name))
        return null;
    if (name.includes('..'))
        return null;
    return name;
}
const LANG_MAP = {
    md: 'markdown', ts: 'typescript', tsx: 'typescript',
    js: 'javascript', jsx: 'javascript', mjs: 'javascript', cjs: 'javascript',
    json: 'json', yaml: 'yaml', yml: 'yaml', sh: 'bash', bash: 'bash', zsh: 'bash',
    py: 'python', toml: 'toml', css: 'css', html: 'html',
    txt: 'text', xml: 'xml', sql: 'sql', rs: 'rust', go: 'go', rb: 'ruby',
};
export function detectMarketLanguage(filename) {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    return LANG_MAP[ext] || 'text';
}
