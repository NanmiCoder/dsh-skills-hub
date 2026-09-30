import type { MarketSource, SecurityStatus } from '../../market/types.ts';
/** The subset of a skill the confirmation needs; the caller owns the source object. */
export interface InstallConfirmSkill {
    id: string;
    name: string;
    source: MarketSource;
    version?: string;
    securityStatus: SecurityStatus;
    authorName: string;
    /**
     * When the catalogue data behind this dialog was read from upstream, if it
     * came from a snapshot. Installing is a trust decision, so the confirmation
     * cannot present a cached security verdict as a fresh one.
     */
    snapshotAt?: number;
}
/**
 * Install confirmation.
 *
 * Mounted only while a confirmation is pending — the frozen props carry no
 * `skill | null` and no `open`, so the caller's conditional render *is* the
 * open state (the optional `open` prop exists only for a caller that prefers
 * to keep the element mounted).
 *
 * Escape and mask-click closing come from `Modal` itself; while `busy` both
 * are neutralised and the buttons are disabled, because an install already in
 * flight cannot be recalled and a dialog that vanishes mid-request reads as a
 * cancel that never happened.
 */
export declare function InstallConfirmDialog(props: {
    skill: InstallConfirmSkill;
    busy: boolean;
    onCancel: () => void;
    onConfirm: () => void;
    /** Optional: defaults to open, since conditional mounting is the usual call site. */
    open?: boolean;
}): JSX.Element;
