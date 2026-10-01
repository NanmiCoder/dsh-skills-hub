/**
 * ClawHub provider (https://clawhub.ai)
 *
 * Endpoints (verified against the live API):
 *  - GET /api/v1/skills?limit=&cursor=&sort=downloads → {items, nextCursor}
 *  - GET /api/v1/search?q=                            → {results} (no pagination)
 *  - GET /api/v1/skills/{slug}                        → {skill, latestVersion, owner, metadata, moderation}
 *  - GET /api/v1/skills/{slug}/versions/{v}           → {version:{license, files[], security}}
 *  - GET /api/v1/skills/{slug}/file?path=             → raw file text
 *
 * Slugs are not unique: every endpoint accepts `?owner=`, and without it a
 * shared slug answers 409 AMBIGUOUS_SKILL_SLUG. See `clawhubOwnerFor`.
 */
import { type MarketProvider } from './types.ts';
export type ParsedFrontmatter = {
    frontmatter: Record<string, unknown>;
    content: string;
};
/**
 * Split `---` frontmatter from a markdown body.
 *
 * The reference server delegated YAML to Bun.YAML / the `yaml` package; this
 * plugin must not add a runtime dependency, so `parseYamlSubset` below covers
 * the subset SKILL.md frontmatter actually uses (scalars, quoted strings, flow
 * collections, nested mappings, block sequences and block scalars) and any
 * value it cannot understand is dropped rather than throwing.
 */
export declare function parseFrontmatter(markdown: string): ParsedFrontmatter;
/** Shape of a ClawHub owner handle (also the route's validation rule). */
export declare const CLAWHUB_OWNER_PATTERN: RegExp;
export declare function setClawhubOwnerHints(hints: Iterable<readonly [string, string]>): void;
/**
 * Run one operation pinned to `owner` for `slug`. Without an owner the
 * operation runs unpinned and falls back to the hint/cache/probe order.
 */
export declare function withClawhubOwner<T>(slug: string, owner: string | undefined, operation: () => Promise<T>): Promise<T>;
/** The owner a read of `slug` will use right now, if one is known before asking upstream. */
export declare function clawhubOwnerFor(slug: string): string | undefined;
/** A release note worth showing: registries stamp placeholders on synced versions. */
export declare function meaningfulChangelog(text: unknown): string | undefined;
/** Test hook: forget which owner disambiguated an ambiguous slug. */
export declare function resetClawhubOwnerCache(): void;
export declare const clawhubProvider: MarketProvider;
