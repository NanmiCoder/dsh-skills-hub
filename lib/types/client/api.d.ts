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
import type { MarketFileContent, MarketListResult, MarketSource, NormalizedSkill, NormalizedSkillDetail, SecurityStatus, SourceStatusInfo } from '../market/types.ts';
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
    key: string;
    linked: boolean;
    removable: boolean;
    /** `source:slug` when the provenance sidecar exists, else `local:<dir>`. */
    id: string;
    source: MarketSource | 'local';
    slug: string;
    name: string;
    dirName: string;
    dirPath: string;
    version?: string;
    summary?: string;
    installedAt?: string;
    /** Installed by this plugin (the `.skills-hub.json` sidecar is present). */
    managed: boolean;
    bytes: number;
    fileCount: number;
}
/** List query accepted by `GET /api/skills-hub/skills`. */
export interface MarketQuery {
    q?: string;
    source: 'all' | MarketSource;
    security: 'all' | SecurityStatus;
    installed: 'all' | 'installed' | 'installable';
    cursor?: string;
    limit?: number;
}
/** One failure from the Skills Hub surface (transport, HTTP, or malformed body). */
export declare class SkillsHubApiError extends Error {
    /** Host error code (`MARKET_ERROR_CODES` value, `BAD_REQUEST`, …) or a client-side code. */
    readonly code: string;
    /** HTTP status; `0` when the request never reached the Host. */
    readonly status: number;
    constructor(code: string, status: number, message: string);
}
/**
 * Whether a rejection is an aborted request.
 *
 * `AbortError` is control flow, not a failure: the controller aborts superseded
 * requests on purpose, and surfacing one as a user-facing error would put a
 * spurious banner in front of a perfectly healthy panel. Checked by `name`
 * (not `instanceof`) because an abort may cross realms (iframes, workers).
 * Exported so the state layer applies the exact same rule.
 */
export declare function isAbortError(error: unknown): boolean;
/** Search the catalogue (market sources) — the remote list page. */
export declare function fetchMarketList(query: MarketQuery, signal?: AbortSignal): Promise<MarketListResult>;
/** One skill's full detail plus the health of the source that served it. */
export declare function fetchSkillDetail(id: string, signal?: AbortSignal): Promise<{
    skill: NormalizedSkillDetail;
    sourceStatus: SourceStatusInfo;
}>;
/** One file of a skill, for the Files tab. */
export declare function fetchSkillFile(id: string, path: string, signal?: AbortSignal): Promise<MarketFileContent>;
/** Health of every market source, refreshed independently of the list. */
export declare function fetchSourceStatus(signal?: AbortSignal): Promise<Record<MarketSource, SourceStatusInfo>>;
/**
 * Every skill DSH can currently see, including directories this plugin did not
 * install (`managed: false`). This is the local index behind the "installed"
 * filter — no upstream request is involved.
 */
export declare function fetchInstalled(signal?: AbortSignal): Promise<InstalledSkillRecord[]>;
/** Install a market skill into the local skills directory. */
export declare function installSkill(id: string): Promise<{
    installedPath: string;
    skill: NormalizedSkill;
}>;
/** Remove a skill this plugin installed (the Host refuses unmanaged directories). */
export declare function uninstallSkill(id: string): Promise<{
    removedPath: string;
    skill: NormalizedSkill;
}>;
/** Preview the exact local copy without consulting a market provider. */
export declare function fetchInstalledDetail(key: string, signal?: AbortSignal): Promise<{
    item: InstalledSkillRecord;
    markdown: string;
}>;
/** Remove a specifically selected local entry after the management UI confirmation. */
export declare function removeInstalled(key: string): Promise<{
    item: InstalledSkillRecord;
    removedPath: string;
}>;
