import type { SecurityReport, SecurityStatus } from '../../market/types.ts';
/**
 * Audit verdict chip.
 *
 * Shows a shield for every verdict except `flagged`, which uses the warning
 * triangle: a scan that found something must not look like a scan that merely
 * ran, and shape reads faster than color alone.
 *
 * `reports` supplies the upstream status line for the hover title, so the chip
 * can stay a two-word summary without hiding what the vendor actually said.
 */
export declare function SecurityBadge(props: {
    status: SecurityStatus;
    reports?: SecurityReport[];
    compact?: boolean;
}): JSX.Element;
