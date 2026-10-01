/**
 * Skills Market — aggregation service (host half).
 *
 * Merges the two upstream providers into a single paginated feed with
 * cross-source dedupe, per-source health/degradation reporting, TTL caching
 * (stale-while-error) and locally-computed install state.
 *
 * The module is deliberately free of DSH services: the
 * "what is installed locally" question is answered by an injected
 * `InstalledLookup` (see `setInstalledLookup`), so this file can be unit-tested
 * by pointing the providers at a stub server.
 */
import { type MarketCategoriesResult, type MarketFileContent, type MarketListResult, type MarketSource, type NormalizedSkill, type NormalizedSkillDetail, type SecurityStatus, type SourceStatusInfo } from './types.ts';
/**
 * Local install state, injected by the plugin host (which owns the skills
 * directory). Both methods are synchronous: the host keeps an in-memory index
 * and rescans it after install/uninstall.
 */
export interface InstalledLookup {
    /** ids (`source:slug`) of skills already present in the local skills directory */
    has(id: string): boolean;
    info(id: string): {
        dirName: string;
        version?: string;
        installedAt?: string;
    } | undefined;
}
export declare function setInstalledLookup(lookup: InstalledLookup): void;
/** Test hook: fall back to "nothing installed" (also used when a plugin unloads). */
export declare function resetInstalledLookup(): void;
type MergedCursor = Partial<Record<MarketSource, string>>;
export declare function encodeCursor(cursor: MergedCursor): string | null;
export declare function decodeCursor(raw: string | null | undefined): MergedCursor | undefined;
/**
 * Stamp a market item with its local install state.
 *
 * Computed on every request (never cached): a skill installed a second ago must
 * show up as installed on the next list call. The reference version also probed
 * the skills directory for a name conflict; that check needs a filesystem, so it
 * now belongs to the install path, which refuses to overwrite a directory it did
 * not create.
 */
export declare function annotateInstallState<T extends NormalizedSkill>(skill: T): T;
/** File-level installability checks — only possible once the file list is known. */
export declare function applyFileLimits(detail: NormalizedSkillDetail): NormalizedSkillDetail;
/**
 * SkillHub mirrors ClawHub skills (source='clawhub' + upstream_url). When a
 * page contains both the mirror and the ClawHub original, merge them: the
 * ClawHub entry wins (fresher data), enriched with SkillHub-only fields.
 *
 * Unlike the reference this does not mutate its input: those items come from
 * the shared response cache, and mutating them made `mirrors` grow on every
 * repeat request.
 */
export declare function dedupeSkills(items: NormalizedSkill[]): NormalizedSkill[];
export interface ListMarketSkillsParams {
    q?: string;
    /**
     * `catalog` (default): the curated snapshot shipped with the plugin.
     * `market`: live upstream list/search across both registries.
     */
    scope?: 'catalog' | 'market';
    /** Catalogue category key; ignored by the live market scope. */
    category?: string;
    source: 'all' | MarketSource;
    security: 'all' | SecurityStatus;
    installed: 'all' | 'installed' | 'installable';
    cursor?: string;
    limit: number;
    /** Reader-requested refresh: ignore fresh entries (they are still rewritten). */
    refresh?: boolean;
}
export declare function listMarketSkills(params: ListMarketSkillsParams): Promise<MarketListResult>;
/**
 * One page of the curated catalogue.
 *
 * Everything is local, so every filter — security and installed included — runs
 * before pagination: a page is always full until the list is exhausted, which
 * is what keeps infinite scroll from stalling on a filtered-out page.
 */
export declare function listCatalogSkills(params: ListMarketSkillsParams): MarketListResult;
export declare function listMarketCategories(): MarketCategoriesResult;
export declare function getMarketSkillDetail(source: MarketSource, slug: string, options?: {
    force?: boolean;
    allowStale?: boolean;
    owner?: string;
}): Promise<{
    skill: NormalizedSkillDetail;
    sourceStatus: SourceStatusInfo;
}>;
export declare function isValidMarketFilePath(filePath: string): boolean;
export declare function getMarketFileContent(source: MarketSource, slug: string, filePath: string, owner?: string): Promise<MarketFileContent>;
/**
 * Pin a ClawHub read to the owner the reader asked for. ClawHub slugs are
 * shared across authors, so `clawhub:<slug>` alone does not name one skill.
 */
export declare function withMarketOwner<T>(source: MarketSource, slug: string, owner: string | undefined, operation: () => Promise<T>): Promise<T>;
export declare function getMarketStatus(): Record<MarketSource, SourceStatusInfo>;
/**
 * Look up a single skill for an install (the detail path, bypassing the list).
 *
 * Always forced: a cached manifest is a snapshot of the *catalogue*, and
 * installing is the one action that has to be authorized by what upstream says
 * right now — the file bytes are fetched fresh and hash-verified against the
 * list, so the list must come from the same generation as those bytes.
 */
export declare function resolveMarketSkill(source: MarketSource, slug: string, owner?: string): Promise<NormalizedSkillDetail>;
export {};
