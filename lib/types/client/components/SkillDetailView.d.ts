import type { NormalizedSkillDetail } from '../../market/types.ts';
import type { MarketController, MarketState } from '../state.ts';
/**
 * Skill detail page.
 *
 * Like the home page this component owns no data: the tab, the selected file
 * and the file contents all live in `MarketState`, so switching tabs or
 * re-opening a skill does not lose its place.
 *
 * The bundled GFM renderer handles catalogue Markdown without relying on a
 * host renderer delegate. Raw HTML is disabled and URLs use its safe default.
 */
export declare function SkillDetailView(props: {
    detail: NormalizedSkillDetail;
    state: MarketState;
    controller: MarketController;
}): JSX.Element;
/** Keeps the detail layout stable while its network request is in flight. */
export declare function SkillDetailSkeleton({ onBack }: {
    onBack: () => void;
}): JSX.Element;
