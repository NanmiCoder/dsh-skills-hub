/**
 * The detail surface shared by the market catalogue and the installed inventory.
 *
 * Both pages answer the same question — "what is inside this skill?" — and the
 * only real difference is where the facts come from: an upstream provider or the
 * filesystem. Everything that is *reading* rather than *fetching* therefore
 * lives here: the back affordance, the identity header, the two tabs, the
 * document column, the facts rail and the focus move that keeps a keyboard user
 * from being left at the top of the document when the list is replaced.
 *
 * The two pages are not identical, so the shell takes slots rather than a data
 * model: `badges`, `notice`, `overview`, `files` and `rail` are composed by the
 * caller, while each caller owns its own loading state and its own choice of tab
 * storage (the market page keeps it in `MarketState`, the local page in its own
 * component state).
 */
import { type ReactNode } from 'react';
/** Tab values every detail page offers, in render order. */
export type SkillDetailTab = 'overview' | 'files';
/**
 * The shell's stylesheet, re-exported for its callers.
 *
 * The pages built on this shell also render shell-shaped fragments (a report
 * row, a path line, a facts list) and reaching them through an import is more
 * honest than re-declaring near-copies of the same rules in a second module.
 */
export declare const detailStyles: Record<string, string>;
/** One label/value row of the facts rail. */
export declare function Fact(props: {
    label: string;
    children: ReactNode;
}): JSX.Element;
export declare function SkillDetailShell(props: {
    /** Identity of the rendered subject; changing it moves focus back to the heading. */
    focusKey: string;
    onBack: () => void;
    backLabel: string;
    avatar: ReactNode;
    /** Small line above the name: source, version, provenance. */
    eyebrow: ReactNode;
    name: string;
    badges?: ReactNode;
    summary?: string;
    /** Full-width band under the header (warnings, security reports). */
    notice?: ReactNode;
    overviewLabel: string;
    filesLabel: string;
    activeTab: SkillDetailTab;
    onTabChange: (tab: SkillDetailTab) => void;
    overview: ReactNode;
    files: ReactNode;
    rail: ReactNode;
}): JSX.Element;
/**
 * Keeps the detail layout stable while its request is in flight.
 *
 * It renders the same boxes as the real page rather than a spinner, because the
 * click that opens a detail is the moment the panel changes shape; a centered
 * "loading" line would make that change happen twice.
 */
export declare function SkillDetailSkeleton({ onBack }: {
    onBack: () => void;
}): JSX.Element;
