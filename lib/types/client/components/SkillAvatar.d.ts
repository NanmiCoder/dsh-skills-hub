import type { MarketSource } from '../../market/types.ts';
/**
 * Skill icon tile.
 *
 * An `<img>` is rendered only for an `https:` URL: the string arrives from a
 * third-party catalogue, and allowing `javascript:` or `data:` here would turn
 * an upstream payload into script execution inside the DSH page.
 */
export declare function SkillAvatar(props: {
    name: string;
    source: MarketSource;
    iconUrl?: string;
    size: number;
}): JSX.Element;
