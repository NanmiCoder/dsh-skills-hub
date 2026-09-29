import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useT } from "../locale-context.js";
import { AlertIcon, ShieldIcon } from "../icons.js";
import styles from './SecurityBadge.module.css';
/** Tone class per audit verdict; `unknown` is a neutral fact, not a warning. */
const TONES = {
    verified: 'success',
    benign: 'success',
    unknown: 'neutral',
    flagged: 'danger',
};
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
export function SecurityBadge(props) {
    const { status, reports, compact = false } = props;
    const t = useT();
    const report = reports?.[0];
    const detail = report ? `${report.vendor}: ${report.statusText}` : undefined;
    return (_jsxs("span", { className: `${styles.badge} ${styles[TONES[status]] ?? ''} ${compact ? styles.compact : ''}`, title: detail, "data-security-status": status, children: [!compact && (status === 'flagged' ? _jsx(AlertIcon, { size: 13 }) : _jsx(ShieldIcon, { size: 13 })), t(`security.${status}`)] }));
}
