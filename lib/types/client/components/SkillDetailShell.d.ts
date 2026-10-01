/**
 * The detail surface shared by the market catalogue and the installed inventory
 * (design: "技能市场重构 – 详情页").
 *
 * Both pages answer the same question — "what is inside this skill?" — and the
 * only real difference is where the facts come from: an upstream provider or the
 * filesystem. The shell therefore owns everything that is *layout*: breadcrumb,
 * identity header, stats strip, underlined tabs, the grey canvas, and the
 * document/side-rail columns. Callers compose the header pieces and the active
 * tab's content, and keep their own tab state (the market page in
 * `MarketState`, the local page in component state).
 */
import { type ReactNode } from 'react';
import type { SecurityStatus } from '../../market/types.ts';
/** The shell's stylesheet, for callers composing shell-shaped fragments. */
export declare const detailStyles: Record<string, string>;
export interface DetailTab<K extends string> {
    key: K;
    label: string;
    /** Small trailing marker: a count, or a warning dot. */
    badge?: ReactNode;
}
export declare function SkillDetailShell<K extends string>(props: {
    /** Identity of the rendered subject; changing it moves focus to the heading. */
    focusKey: string;
    onBack: () => void;
    /** Breadcrumb root: the list this page was opened from. */
    backLabel: string;
    avatar: ReactNode;
    name: string;
    version?: string;
    /** One line of "by author · source · licence · updated" facts. */
    meta?: ReactNode;
    summary?: string;
    chips?: ReactNode;
    actions?: ReactNode;
    stats?: Array<{
        label: string;
        value: string;
    }>;
    tabs: Array<DetailTab<K>>;
    activeTab: K;
    onTabChange: (tab: K) => void;
    /** Notes above the tab content (snapshot age, location, warnings). */
    notice?: ReactNode;
    children: ReactNode;
}): JSX.Element;
/** Document column plus side rail; the rail moves below on a narrow panel. */
export declare function DetailColumns(props: {
    main: ReactNode;
    side: ReactNode;
}): JSX.Element;
export declare function SideCard(props: {
    title: string;
    extra?: ReactNode;
    children: ReactNode;
}): JSX.Element;
export declare function InfoRow(props: {
    label: string;
    value: ReactNode;
    mono?: boolean;
}): JSX.Element;
/** Count in a tab label ("文件 15"). */
export declare function TabCount(props: {
    value: number;
}): JSX.Element;
type ChipTone = 'plain' | 'ok' | 'warn' | 'blue';
export declare function Chip(props: {
    tone?: ChipTone;
    title?: string;
    children: ReactNode;
}): JSX.Element;
/** Upstream scan verdict, shared by the cards, the detail header and the install dialog. */
export declare function SecurityChip(props: {
    status: SecurityStatus;
    short?: boolean;
}): JSX.Element;
/**
 * Keeps the detail layout stable while its request is in flight: the same
 * boxes as the real page rather than a spinner, so the page changes shape once.
 */
export declare function SkillDetailSkeleton({ onBack, backLabel }: {
    onBack: () => void;
    backLabel?: string;
}): JSX.Element;
export {};
