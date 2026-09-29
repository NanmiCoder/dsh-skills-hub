import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useT } from "../locale-context.js";
import { AlertIcon, CheckIcon, DownloadIcon } from "../icons.js";
import styles from './InstallStateBadge.module.css';
/** Tone class per local install state. */
const TONES = {
    installed: 'success',
    installable: 'brand',
    'not-installable': 'danger',
};
/**
 * Local install state chip.
 *
 * The three labels come from dictionary keys the contract already fixes —
 * `installed`, `installed.installable` and `notInstallable` — so this badge
 * adds no vocabulary of its own.
 */
export function InstallStateBadge(props) {
    const { state } = props;
    const t = useT();
    const label = state === 'installed' ? t('installed') : state === 'installable' ? t('installed.installable') : t('notInstallable');
    return (_jsxs("span", { className: `${styles.badge} ${styles[TONES[state]] ?? ''}`, "data-install-state": state, children: [state === 'installed' ? _jsx(CheckIcon, { size: 13 }) : state === 'installable' ? _jsx(DownloadIcon, { size: 13 }) : _jsx(AlertIcon, { size: 13 }), label] }));
}
