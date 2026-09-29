import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button, Modal } from '@deepseek-ai/dsh-client-ui-primitives';
import { useT } from "../locale-context.js";
import { AlertIcon, DownloadIcon } from "../icons.js";
import { SecurityBadge } from "./SecurityBadge.js";
import styles from './InstallConfirmDialog.module.css';
/**
 * `source:slug` → the directory name the installer will create. The market id
 * is the only identifier this dialog receives, so the slug is derived here
 * rather than passed twice.
 */
function slugOf(id) {
    const separator = id.indexOf(':');
    return separator >= 0 ? id.slice(separator + 1) : id;
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
export function InstallConfirmDialog(props) {
    const { skill, busy, onCancel, onConfirm, open = true } = props;
    const t = useT();
    const sourceLabel = t(`source.${skill.source}`);
    const risky = skill.securityStatus === 'unknown' || skill.securityStatus === 'flagged';
    return (_jsxs(Modal, { open: open, onClose: busy ? () => undefined : onCancel, title: t('install'), closeLabel: t('dismiss'), description: t('installConfirmMessage', { name: skill.name, source: sourceLabel }), footer: _jsxs("div", { className: styles.actions, children: [_jsx(Button, { variant: "outline", size: "md", disabled: busy, onClick: onCancel, children: t('cancel') }), _jsx(Button, { variant: "primary", size: "md", disabled: busy, icon: _jsx(DownloadIcon, { size: 16 }), onClick: onConfirm, children: busy ? t('installing') : t('confirm') })] }), children: [_jsxs("dl", { className: styles.facts, children: [_jsxs("div", { className: styles.row, children: [_jsx("dt", { className: styles.label, children: t('filter.source') }), _jsx("dd", { className: styles.value, children: sourceLabel })] }), skill.version !== undefined && skill.version !== '' && (_jsxs("div", { className: styles.row, children: [_jsx("dt", { className: styles.label, children: t('version') }), _jsxs("dd", { className: styles.value, children: ["v", skill.version] })] })), _jsxs("div", { className: styles.row, children: [_jsx("dt", { className: styles.label, children: t('author') }), _jsx("dd", { className: styles.value, children: skill.authorName })] }), _jsxs("div", { className: styles.row, children: [_jsx("dt", { className: styles.label, children: t('security') }), _jsx("dd", { className: styles.value, children: _jsx(SecurityBadge, { status: skill.securityStatus }) })] }), _jsxs("div", { className: styles.row, children: [_jsx("dt", { className: styles.label, children: t('installLocation') }), _jsxs("dd", { className: `${styles.value} ${styles.path}`, children: ["\u2026/skills/", slugOf(skill.id).toLowerCase(), "/"] })] })] }), risky && (_jsxs("p", { className: styles.risk, role: "note", children: [_jsx(AlertIcon, { size: 16, className: styles.riskIcon }), _jsx("span", { children: t('unoaudited') })] }))] }));
}
