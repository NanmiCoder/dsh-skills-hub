import type { NormalizedSkillDetail } from '../../market/types.ts';
import type { MarketController, MarketState } from '../state.ts';
import { type Translate } from '../locale-context.tsx';
import { type Capability } from '../skill-insights.ts';
/** Compact counts: 482069 → 482.1k. */
export declare function formatCount(value: number): string;
/** Upstream timestamps are epoch millis; render as an ISO date (stable across locales). */
export declare function formatDate(timestamp: number | undefined): string;
/** Only absolute http(s) links from upstream may become an `href`. */
export declare function safeUrl(url: string | undefined): string | undefined;
/** One capability, phrased with its evidence. */
export declare function capabilityText(t: Translate, capability: Capability): {
    title: string;
    detail: string;
};
/** Capabilities and triggers, derived once per detail. */
export declare function useSkillInsights(detail: NormalizedSkillDetail): {
    capabilities: Capability[];
    triggers: string[];
};
/**
 * Market skill detail page.
 *
 * Owns no data: tab, selected file and file contents live in `MarketState`.
 * Upstream facts (stats, version, scans, files) come from the live detail; the
 * catalogue adds category and the Chinese summary. "What this skill does" and
 * "when it triggers" are read off its own SKILL.md and file list by explicit
 * rules (`skill-insights.ts`) and are hidden when no rule fires.
 */
export declare function MarketSkillDetail(props: {
    detail: NormalizedSkillDetail;
    state: MarketState;
    controller: MarketController;
}): JSX.Element;
