import type { MarketState, MarketController } from '../state.ts';
/**
 * Market catalogue page.
 *
 * Presentational by contract: every interaction below is a call on the
 * controller, and every rendered value comes from `state`. That keeps the
 * whole page renderable in a bare test render with no services and no fetch.
 */
export declare function MarketHome(props: {
    state: MarketState;
    controller: MarketController;
}): JSX.Element;
