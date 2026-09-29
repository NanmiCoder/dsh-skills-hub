import type { MarketFilters } from '../state.ts';
/**
 * Search field plus the three catalogue filters.
 *
 * Native `<select>`s rather than a menu primitive: the DSH `Menu` is an
 * anchored popover that needs its own open state and focus return, and three
 * of them side by side would be three focus traps in a row. A `<select>` gets
 * platform keyboard behaviour, a real label association, and renders inside a
 * 720px panel without a portal.
 *
 * The result count is announced through a visually hidden live region instead
 * of being printed twice: the visible count lives in the home header, and a
 * screen reader still hears it change when a filter narrows the list.
 */
export declare function FilterBar(props: {
    filters: MarketFilters;
    total: number;
    disabled: boolean;
    onChange: (patch: Partial<MarketFilters>) => void;
}): JSX.Element;
