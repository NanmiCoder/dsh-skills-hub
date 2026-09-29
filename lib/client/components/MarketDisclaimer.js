import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from '@deepseek-ai/dsh-client-ui-primitives';
import { useT } from "../locale-context.js";
import { AlertIcon, CloseIcon } from "../icons.js";
import styles from './MarketDisclaimer.module.css';
/**
 * Third-party risk notice shown above the catalogue until it is acknowledged.
 *
 * Purely presentational: persistence (`localStorage`, `disclaimerDismissed`)
 * belongs to the controller, so this component stays reusable in a bare test
 * render and cannot drift from the stored flag.
 */
export function MarketDisclaimer(props) {
    const { onDismiss } = props;
    const t = useT();
    return (_jsxs("div", { className: styles.banner, role: "note", children: [_jsx(AlertIcon, { size: 16, className: styles.icon }), _jsx("p", { className: styles.text, children: t('disclaimer') }), _jsx(Button, { variant: "ghost", size: "sm", className: styles.dismiss, "aria-label": t('dismiss'), onClick: onDismiss, icon: _jsx(CloseIcon, { size: 16 }) })] }));
}
