import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button, Input } from '@deepseek-ai/dsh-client-ui-primitives';
import { useT } from "../locale-context.js";
import { CloseIcon, SearchIcon } from "../icons.js";
import styles from './FilterBar.module.css';
/** Option order for each select; the values are the frozen filter unions. */
const SOURCE_OPTIONS = ['all', 'clawhub', 'skillhub'];
const SECURITY_OPTIONS = ['all', 'verified', 'benign', 'unknown', 'flagged'];
const INSTALLED_OPTIONS = ['all', 'installable'];
/**
 * Search field plus the three catalogue filters.
 *
 * Native `<select>`s rather than a menu primitive: the DSH `Menu` is an
 * anchored popover that needs its own open state and focus return, and three
 * of them side by side would be three focus traps in a row. A `<select>` gets
 * platform keyboard behaviour, a real label association, and renders inside a
 * 720px panel without a portal.
 *
 * The result count is announced through a visually hidden live region instead
 * of being printed twice: the visible count lives in the home header, and a
 * screen reader still hears it change when a filter narrows the list.
 */
export function FilterBar(props) {
    const { filters, total, disabled, onChange } = props;
    const t = useT();
    return (_jsxs("div", { className: styles.bar, children: [_jsxs("div", { className: styles.search, children: [_jsx(Input, { className: styles.searchInput, icon: _jsx(SearchIcon, { size: 16 }), value: filters.q, disabled: disabled, placeholder: t('searchPlaceholder'), "aria-label": t('searchPlaceholder'), onChange: (event) => onChange({ q: event.currentTarget.value }) }), filters.q !== '' && (_jsx(Button, { variant: "ghost", size: "sm", className: styles.clear, disabled: disabled, "aria-label": t('clearSearch'), onClick: () => onChange({ q: '' }), icon: _jsx(CloseIcon, { size: 14 }) }))] }), _jsxs("label", { className: styles.field, children: [_jsx("span", { className: styles.fieldLabel, children: t('filter.source') }), _jsx("select", { className: styles.select, value: filters.source, disabled: disabled, onChange: (event) => onChange({ source: event.currentTarget.value }), children: SOURCE_OPTIONS.map((value) => (_jsx("option", { value: value, children: t(`source.${value}`) }, value))) })] }), _jsxs("label", { className: styles.field, children: [_jsx("span", { className: styles.fieldLabel, children: t('filter.security') }), _jsx("select", { className: styles.select, value: filters.security, disabled: disabled, onChange: (event) => onChange({ security: event.currentTarget.value }), children: SECURITY_OPTIONS.map((value) => (_jsx("option", { value: value, children: t(`security.${value}`) }, value))) })] }), _jsxs("label", { className: styles.field, children: [_jsx("span", { className: styles.fieldLabel, children: t('filter.installed') }), _jsx("select", { className: styles.select, value: filters.installed, disabled: disabled, onChange: (event) => onChange({ installed: event.currentTarget.value }), children: INSTALLED_OPTIONS.map((value) => (_jsx("option", { value: value, children: t(`installed.${value}`) }, value))) })] }), _jsx("p", { className: styles.srOnly, role: "status", "aria-live": "polite", children: t('count', { count: total }) })] }));
}
