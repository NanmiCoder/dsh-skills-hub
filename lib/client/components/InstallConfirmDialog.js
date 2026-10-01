import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useId, useState } from 'react';
import { Modal } from '@deepseek-ai/dsh-client-ui-primitives';
import { useT } from "../locale-context.js";
import { formatAge, formatStamp } from "../relative-time.js";
import { AlertIcon, DownloadIcon, FolderIcon } from "../icons.js";
import { capabilityText, useSkillInsights } from "./MarketSkillDetail.js";
import { SkillAvatar } from "./SkillAvatar.js";
import styles from './InstallConfirmDialog.module.css';
/** `source:slug` → the directory name the installer will create. */
function slugOf(id) {
    const separator = id.indexOf(':');
    return separator >= 0 ? id.slice(separator + 1) : id;
}
function CapabilityList(props) {
    const t = useT();
    const { capabilities } = useSkillInsights(props.detail);
    if (capabilities.length === 0)
        return null;
    return (_jsxs("section", { className: styles.section, children: [_jsx("h3", { className: styles.sectionTitle, children: t('willGet') }), _jsx("ul", { className: styles.capabilities, children: capabilities.map((capability) => {
                    const text = capabilityText(t, capability);
                    return (_jsxs("li", { className: styles.capability, children: [_jsxs("span", { className: styles.capabilityText, children: [_jsx("span", { children: text.title }), _jsx("span", { className: styles.capabilityDetail, children: text.detail })] }), _jsx("span", { className: `${styles.level} ${styles[`level_${capability.level}`] ?? ''}`, children: t(`level.${capability.level}`) })] }, capability.kind));
                }) })] }));
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
export function InstallConfirmDialog(props) {
    const { skill, busy, onCancel, onConfirm, open = true } = props;
    const t = useT();
    const ackId = useId();
    const [acknowledged, setAcknowledged] = useState(false);
    useEffect(() => setAcknowledged(false), [skill.id]);
    const sourceLabel = t(`source.${skill.source}`);
    const risky = skill.securityStatus === 'unknown' || skill.securityStatus === 'flagged';
    const armed = !busy && (!risky || acknowledged);
    const meta = [sourceLabel, skill.authorName, skill.version ? `v${skill.version}` : ''].filter(Boolean).join(' · ');
    return (_jsx(Modal, { open: open, onClose: busy ? () => undefined : onCancel, title: t('installTitle', { name: skill.name }), closeLabel: t('dismiss'), description: meta, footer: _jsxs("div", { className: styles.actions, children: [_jsx("button", { type: "button", className: styles.secondary, disabled: busy, onClick: onCancel, children: t('cancel') }), _jsxs("button", { type: "button", className: styles.primary, disabled: !armed, onClick: onConfirm, children: [_jsx(DownloadIcon, { size: 16 }), busy ? t('installing') : t('confirmInstall')] })] }), children: _jsxs("div", { className: styles.body, children: [_jsxs("div", { className: styles.identity, children: [_jsx(SkillAvatar, { name: skill.name, source: skill.source, iconUrl: skill.iconUrl, size: 48 }), _jsx("p", { className: styles.identityText, children: t('installConfirmMessage', { name: skill.name, source: sourceLabel }) })] }), risky && (_jsxs("p", { className: styles.warning, role: "note", children: [_jsx(AlertIcon, { size: 16, className: styles.warningIcon }), _jsx("span", { children: t(skill.securityStatus === 'flagged' ? 'installWarnFlagged' : 'installWarnUnknown') })] })), skill.detail !== undefined && _jsx(CapabilityList, { detail: skill.detail }), _jsxs("section", { className: styles.section, children: [_jsx("h3", { className: styles.sectionTitle, children: t('installLocation') }), _jsxs("p", { className: styles.location, children: [_jsx(FolderIcon, { size: 14 }), _jsxs("span", { children: ["\u2026/skills/", slugOf(skill.id).toLowerCase(), "/"] })] })] }), skill.snapshotAt !== undefined && (_jsx("p", { className: styles.note, role: "note", title: formatStamp(skill.snapshotAt), children: t('installSnapshot', { age: formatAge(t, skill.snapshotAt) }) })), risky && (_jsxs("label", { className: styles.ack, htmlFor: ackId, children: [_jsx("input", { id: ackId, type: "checkbox", checked: acknowledged, disabled: busy, onChange: (event) => setAcknowledged(event.currentTarget.checked) }), _jsx("span", { children: t('ack') })] }))] }) }));
}
