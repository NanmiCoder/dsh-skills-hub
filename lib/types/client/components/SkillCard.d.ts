import type { NormalizedSkill } from '../../market/types.ts';
/**
 * One catalogue card.
 *
 * The open affordance is a single stretched `<button>` behind the content
 * instead of a click handler on the `<article>`: it is focusable, Enter/Space
 * work for free, and the card never pretends a div is a link. That button sits
 * under the content, so the content is `pointer-events: none` and the install
 * control opts back in — without that pair, either the card stops opening or
 * the install button becomes unclickable.
 */
export declare function SkillCard(props: {
    skill: NormalizedSkill;
    installing: boolean;
    onOpen: (id: string) => void;
    onInstall?: (id: string) => void;
}): JSX.Element;
