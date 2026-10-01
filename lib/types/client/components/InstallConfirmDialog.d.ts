import type { MarketSource, NormalizedSkillDetail, SecurityStatus } from '../../market/types.ts';
/** The subset of a skill the confirmation needs; the caller owns the source object. */
export interface InstallConfirmSkill {
    id: string;
    name: string;
    source: MarketSource;
    version?: string;
    iconUrl?: string;
    securityStatus: SecurityStatus;
    authorName: string;
    /**
     * The loaded detail, when the dialog was opened from the detail page: only
     * then are the skill's files known, and with them what it will be able to do.
     */
    detail?: NormalizedSkillDetail;
    /**
     * When the catalogue data behind this dialog was read from upstream, if it
     * came from a snapshot. Installing is a trust decision, so the confirmation
     * cannot present a cached security verdict as a fresh one.
     */
    snapshotAt?: number;
}
/**
 * Install confirmation (design: install dialog of the detail page).
 *
 * Mounted only while a confirmation is pending. A skill that is not scanned
 * clean (flagged or unknown) needs an explicit acknowledgement before the
 * confirm button arms: installing is a trust decision about a third party, and
 * the dialog says so instead of making it a reflex click. Escape and mask-click
 * come from `Modal`; while `busy` both are neutralised, because an install in
 * flight cannot be recalled.
 */
export declare function InstallConfirmDialog(props: {
    skill: InstallConfirmSkill;
    busy: boolean;
    onCancel: () => void;
    onConfirm: () => void;
    /** Optional: defaults to open, since conditional mounting is the usual call site. */
    open?: boolean;
}): JSX.Element;
