/**
 * Curated catalogue — the marketplace's home list.
 *
 * The upstream registries hold ~80k ClawHub and ~110k SkillHub skills; nobody
 * chooses from that. The home list is instead a few hundred skills reviewed in
 * this repository (`catalog/curation.json`) and snapshotted by
 * `scripts/catalog-refresh.mjs` into `skills.json`, which ships with the plugin.
 *
 * Only the *list* comes from the snapshot. Opening a card, reading a file and
 * installing still go to the owning registry (through the usual cache), so a
 * reader never installs the snapshot's version of anything.
 */
import { type MarketCategory, type MarketSource, type NormalizedSkill, type SecurityStatus } from '../market/types.ts';
export type CatalogEntry = {
    source: MarketSource;
    slug: string;
    /** Registry owner; disambiguates ClawHub slugs shared by several authors. */
    owner: string;
    name: string;
    /** Reader-facing summary (zh-CN). */
    summary: string;
    /** Original upstream summary, kept for English readers and search. */
    summaryEn?: string;
    /** Key into `categories`. */
    category: string;
    tags: string[];
    /** Editor's pick: listed first and marked on the card. */
    featured?: boolean;
    stats: {
        downloads: number;
        installs?: number;
        stars?: number;
    };
    version?: string;
    updatedAt?: number;
    iconUrl?: string;
    security: SecurityStatus;
    /** Why the security verdict is what it is, when it is not clean. */
    securityNote?: string;
    requiresApiKey?: boolean;
    license?: string;
};
export type CatalogFile = {
    version: 1;
    /** Epoch millis of the upstream reads behind this snapshot. */
    generatedAt: number;
    categories: Array<{
        key: string;
        name: string;
        nameEn: string;
    }>;
    skills: CatalogEntry[];
};
export declare function getCatalog(): CatalogFile;
export declare function catalogEntryFor(source: MarketSource, slug: string): CatalogEntry | undefined;
/** Category bar entries, in editorial order, with how many skills each holds. */
export declare function catalogCategories(): Array<MarketCategory & {
    count: number;
}>;
/** ClawHub owners the catalogue pins, for the provider's slug disambiguation. */
export declare function catalogClawhubOwners(): Array<readonly [string, string]>;
export declare function catalogEntryToSkill(entry: CatalogEntry): NormalizedSkill;
/**
 * Entries matching every whitespace-separated term, in catalogue order.
 *
 * A name/slug hit ranks above a summary or tag hit: typing a skill's name
 * should put that skill first, not the one that mentions it most.
 */
export declare function filterCatalog(params: {
    q?: string;
    category?: string;
    source?: 'all' | MarketSource;
}): CatalogEntry[];
