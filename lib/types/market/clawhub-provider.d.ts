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
/** Test hook: forget which owner disambiguated an ambiguous slug. */
export declare function resetClawhubOwnerCache(): void;
export declare const clawhubProvider: MarketProvider;
