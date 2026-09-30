import type { NormalizedSkillDetail } from '../../market/types.ts';
import type { MarketController, MarketState } from '../state.ts';
/**
 * Market skill detail page.
 *
 * Like the home page this component owns no data: the tab, the selected file
 * and the file contents all live in `MarketState`, so switching tabs or
 * re-opening a skill does not lose its place. The reading surface itself — back
 * affordance, header, tabs, facts rail — is `SkillDetailShell`, which the local
 * installed page uses too.
 *
 * The bundled GFM renderer handles catalogue Markdown without relying on a
 * host renderer delegate. Raw HTML is disabled and URLs use its safe default.
 */
export declare function SkillDetailView(props: {
    detail: NormalizedSkillDetail;
    state: MarketState;
    controller: MarketController;
}): JSX.Element;
