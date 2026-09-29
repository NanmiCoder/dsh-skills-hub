/**
 * Skills Market — shared types for the market aggregation layer.
 *
 * Upstream sources:
 *  - ClawHub  (https://clawhub.ai)      — cursor pagination, no security audits
 *  - SkillHub (https://api.skillhub.cn) — page/pageSize pagination, security reports
 */
export type MarketSource = 'clawhub' | 'skillhub';
export declare const MARKET_SOURCES: MarketSource[];
export type SecurityStatus = 'verified' | 'benign' | 'unknown' | 'flagged';
export type InstallState = 'installed' | 'installable' | 'not-installable';
export type SourceHealthStatus = 'ok' | 'degraded' | 'failed' | 'cached';
export type NotInstallableReason = 'empty-file-list' | 'file-too-large' | 'too-many-files' | 'invalid-name' | 'name-conflict' | 'source-unavailable';
export type SecurityReport = {
    vendor: string;
    status: string;
    statusText: string;
    reportUrl?: string;
};
export type NormalizedSkill = {
    /** `${source}:${slug}` — globally unique */
    id: string;
    source: MarketSource;
    slug: string;
    name: string;
    summary: string;
    author: {
        handle: string;
        displayName?: string;
        avatarUrl?: string;
    };
    stats: {
        downloads: number;
        installs?: number;
        stars?: number;
    };
    tags: string[];
    category?: string;
    version?: string;
    updatedAt?: number;
    iconUrl?: string;
    securityStatus: SecurityStatus;
    securityReports?: SecurityReport[];
    requiresApiKey?: boolean;
    verified?: boolean;
    /** Set on SkillHub entries that mirror a ClawHub skill */
    upstream?: {
        source: MarketSource;
        slug: string;
    };
    /** After dedupe: ids of merged duplicate entries from other sources */
    mirrors?: string[];
    installState: InstallState;
    notInstallableReason?: NotInstallableReason;
    installedInfo?: {
        version?: string;
        installedAt?: string;
        dirName: string;
    };
};
export type MarketFileMeta = {
    path: string;
    size: number;
    sha256?: string;
    contentType?: string;
    language: string;
    /** File exceeds the preview/install size limit */
    tooBig: boolean;
};
export type NormalizedSkillDetail = NormalizedSkill & {
    /** Full SKILL.md body (markdown, frontmatter stripped) */
    description: string;
    /** Raw frontmatter parsed from SKILL.md description, when present */
    descriptionFrontmatter?: Record<string, unknown>;
    license?: string;
    files: MarketFileMeta[];
    totalSize: number;
};
export type MarketFileContent = {
    path: string;
    content: string;
    language: string;
    size: number;
    truncated: boolean;
};
export type SourceStatusInfo = {
    status: SourceHealthStatus;
    fetchedAt?: number;
    fromCache?: boolean;
    error?: string;
};
export type MarketListResult = {
    items: NormalizedSkill[];
    nextCursor: string | null;
    sources: Record<MarketSource, SourceStatusInfo>;
};
export type ProviderListPage = {
    items: NormalizedSkill[];
    /** Provider-native cursor for the next page; undefined = exhausted */
    nextCursor?: string;
    total?: number;
};
export type ProviderFileEntry = {
    path: string;
    size: number;
    sha256?: string;
    contentType?: string;
};
export interface MarketProvider {
    readonly source: MarketSource;
    list(params: {
        cursor?: string;
        limit: number;
    }): Promise<ProviderListPage>;
    search(params: {
        q: string;
        cursor?: string;
        limit: number;
    }): Promise<ProviderListPage>;
    detail(slug: string): Promise<NormalizedSkillDetail>;
    listFiles(slug: string, version?: string): Promise<ProviderFileEntry[]>;
    fetchFile(slug: string, filePath: string): Promise<{
        content: string;
        size: number;
    }>;
}
export declare const MARKET_ERROR_CODES: {
    readonly upstreamError: "MARKET_UPSTREAM_ERROR";
    readonly upstreamTimeout: "MARKET_UPSTREAM_TIMEOUT";
    readonly upstreamBadResponse: "MARKET_UPSTREAM_BAD_RESPONSE";
    readonly installInProgress: "MARKET_INSTALL_IN_PROGRESS";
    readonly alreadyInstalled: "MARKET_ALREADY_INSTALLED";
    readonly notInstallable: "MARKET_NOT_INSTALLABLE";
    readonly checksumMismatch: "MARKET_CHECKSUM_MISMATCH";
    readonly diskError: "MARKET_DISK_ERROR";
    readonly notInstalled: "MARKET_NOT_INSTALLED";
    readonly notManaged: "MARKET_NOT_MANAGED";
};
export declare class MarketUpstreamError extends Error {
    source: MarketSource;
    code: string;
    constructor(source: MarketSource, code: string, message: string);
}
export declare const MARKET_LIMITS: {
    /** Max bytes for a single skill file (install + preview) */
    readonly maxFileSize: number;
    /** Max total bytes for an installable skill */
    readonly maxTotalSize: number;
    /** Max file count for an installable skill */
    readonly maxFileCount: 200;
    /** File preview content is truncated beyond this many bytes */
    readonly previewTruncateBytes: number;
    /** ClawHub search has no pagination — cap merged search results */
    readonly searchResultCap: 50;
};
export declare function skillId(source: MarketSource, slug: string): string;
export declare function parseSkillId(id: string): {
    source: MarketSource;
    slug: string;
} | null;
/** Directory-name whitelist: lowercase alnum, dash, underscore, dot (no leading dot). */
export declare function sanitizeDirName(slug: string): string | null;
export declare function detectMarketLanguage(filename: string): string;
