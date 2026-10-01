/**
 * Installed skill detail page.
 *
 * The list's "view" affordance used to open a 380px confirmation-style modal,
 * which is the wrong container for a document: SKILL.md is a page of prose with
 * tables and code, and the marketplace already answers the same question with a
 * full-panel page. This page is that same reading surface (`SkillDetailShell`),
 * fed by the filesystem instead of a provider.
 *
 * What it deliberately does *not* do is pretend a local skill is a market
 * entry. There is no author, download count or security report to show, so
 * those rows are absent rather than zero. Where the two identities do meet —
 * a skill installed from a market, proven by its `.skills-hub.json` sidecar —
 * the page links to the market detail instead of duplicating it, which keeps
 * upstream data upstream and this page readable with the network down.
 */
import { type InstalledSkillRecord } from '../api.ts';
export declare function InstalledSkillDetail(props: {
    item: InstalledSkillRecord;
    onBack: () => void;
    onUninstall: (item: InstalledSkillRecord) => void;
    /** Open the same skill's market page; only offered for market provenance. */
    onOpenMarket: (id: string, owner?: string) => void;
}): JSX.Element;
