import type { NormalizedSkillDetail } from '../../market/types.ts';
import type { MarketController, MarketState } from '../state.ts';
/**
 * Skill detail page.
 *
 * Like the home page this component owns no data: the tab, the selected file
 * and the file contents all live in `MarketState`, so switching tabs or
 * re-opening a skill does not lose its place.
 *
 * Overview renders the SKILL.md body with the primitives' `MarkdownText`,
 * which is a plain prop-driven component — it needs `labels`, not a provider,
 * so the contract's fallback ("a local markdown-lite renderer") was not
 * necessary. Frontmatter is shown as structure rather than markdown, because a
 * dozen short YAML fields rendered as prose is a wall of bold headings.
 */
export declare function SkillDetailView(props: {
    detail: NormalizedSkillDetail;
    state: MarketState;
    controller: MarketController;
}): JSX.Element;
