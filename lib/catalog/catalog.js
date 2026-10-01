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
import data from './skills.json' with { type: 'json' };
import { skillId, } from "../market/types.js";
const catalog = data;
export function getCatalog() {
    return catalog;
}
const bySkillId = new Map(catalog.skills.map((entry) => [skillId(entry.source, entry.slug), entry]));
export function catalogEntryFor(source, slug) {
    return bySkillId.get(skillId(source, slug));
}
/** Category bar entries, in editorial order, with how many skills each holds. */
export function catalogCategories() {
    const counts = new Map();
    for (const entry of catalog.skills)
        counts.set(entry.category, (counts.get(entry.category) ?? 0) + 1);
    return catalog.categories
        .map((category, index) => ({ ...category, sortOrder: index, count: counts.get(category.key) ?? 0 }))
        .filter((category) => category.count > 0);
}
/** ClawHub owners the catalogue pins, for the provider's slug disambiguation. */
export function catalogClawhubOwners() {
    return catalog.skills.filter((entry) => entry.source === 'clawhub').map((entry) => [entry.slug, entry.owner]);
}
export function catalogEntryToSkill(entry) {
    return {
        id: skillId(entry.source, entry.slug),
        source: entry.source,
        slug: entry.slug,
        name: entry.name,
        summary: entry.summary,
        author: { handle: entry.owner },
        stats: { ...entry.stats },
        tags: [...entry.tags],
        category: entry.category,
        version: entry.version,
        updatedAt: entry.updatedAt,
        iconUrl: entry.iconUrl,
        securityStatus: entry.security,
        requiresApiKey: entry.requiresApiKey,
        featured: entry.featured === true ? true : undefined,
        installState: 'installable',
    };
}
/** Fold case and width so `GitHub`, `github` and full-width input all match. */
function fold(text) {
    return text.normalize('NFKC').toLowerCase();
}
/**
 * Entries matching every whitespace-separated term, in catalogue order.
 *
 * A name/slug hit ranks above a summary or tag hit: typing a skill's name
 * should put that skill first, not the one that mentions it most.
 */
export function filterCatalog(params) {
    const terms = fold(params.q ?? '').split(/\s+/).filter(Boolean);
    const strong = [];
    const weak = [];
    for (const entry of catalog.skills) {
        if (params.category && entry.category !== params.category)
            continue;
        if (params.source && params.source !== 'all' && entry.source !== params.source)
            continue;
        if (terms.length === 0) {
            strong.push(entry);
            continue;
        }
        const head = fold(`${entry.name} ${entry.slug}`);
        const body = fold(`${entry.summary} ${entry.summaryEn ?? ''} ${entry.tags.join(' ')} ${entry.owner}`);
        if (!terms.every((term) => head.includes(term) || body.includes(term)))
            continue;
        if (terms.every((term) => head.includes(term)))
            strong.push(entry);
        else
            weak.push(entry);
    }
    return [...strong, ...weak];
}
