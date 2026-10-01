import type { MarketCategory } from '../../market/types.ts';
/**
 * Category chips above the curated catalogue.
 *
 * The categories are the catalogue's own, so every chip has skills behind it
 * and its count is exact. Rendered only once they loaded.
 */
export declare function CategoryBar(props: {
    categories: MarketCategory[];
    active: string;
    disabled: boolean;
    onSelect: (category: string) => void;
}): JSX.Element | null;
