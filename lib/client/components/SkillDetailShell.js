import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
import { useEffect, useRef } from 'react';
import { AlertIcon, ArrowLeftIcon, ShieldIcon } from "../icons.js";
import { useT } from "../locale-context.js";
import styles from './SkillDetailShell.module.css';
/** The shell's stylesheet, for callers composing shell-shaped fragments. */
export const detailStyles = styles;
export function SkillDetailShell(props) {
    const t = useT();
    const headingRef = useRef(null);
    // The list is replaced by this page without a route change, so focus has to
    // be moved by hand or a keyboard user is left at the top of the document.
    useEffect(() => {
        headingRef.current?.focus();
    }, [props.focusKey]);
    return (_jsxs("div", { className: styles.page, children: [_jsxs("div", { className: styles.top, children: [_jsxs("nav", { className: styles.crumbs, "aria-label": t('breadcrumb'), children: [_jsxs("button", { type: "button", className: styles.crumbBack, onClick: props.onBack, children: [_jsx(ArrowLeftIcon, { size: 14 }), props.backLabel] }), _jsx("span", { "aria-hidden": "true", children: "/" }), _jsx("span", { className: styles.crumbCurrent, children: props.name })] }), _jsxs("header", { className: styles.hero, children: [props.avatar, _jsxs("div", { className: styles.heroText, children: [_jsxs("div", { className: styles.titleRow, children: [_jsx("h1", { ref: headingRef, tabIndex: -1, className: styles.title, children: props.name }), props.version !== undefined && props.version !== '' && (_jsxs("span", { className: styles.versionChip, children: ["v", props.version] }))] }), props.meta !== undefined && _jsx("p", { className: styles.meta, children: props.meta }), props.summary !== undefined && props.summary !== '' && _jsx("p", { className: styles.summary, children: props.summary }), props.chips !== undefined && _jsx("div", { className: styles.chips, children: props.chips })] }), props.actions !== undefined && _jsx("div", { className: styles.actions, children: props.actions })] }), props.stats !== undefined && props.stats.length > 0 && (_jsx("dl", { className: styles.stats, children: props.stats.map((stat) => (_jsxs("div", { className: styles.stat, children: [_jsx("dt", { children: stat.label }), _jsx("dd", { children: stat.value })] }, stat.label))) })), _jsx("div", { className: styles.tabs, role: "tablist", "aria-label": props.name, children: props.tabs.map((tab) => (_jsxs("button", { type: "button", role: "tab", id: `skills-hub-tab-${tab.key}`, "aria-selected": props.activeTab === tab.key, "aria-controls": `skills-hub-panel-${tab.key}`, className: styles.tab, onClick: () => props.onTabChange(tab.key), children: [tab.label, tab.badge] }, tab.key))) })] }), _jsxs("div", { className: styles.body, role: "tabpanel", id: `skills-hub-panel-${props.activeTab}`, "aria-labelledby": `skills-hub-tab-${props.activeTab}`, children: [props.notice, props.children] })] }));
}
/** Document column plus side rail; the rail moves below on a narrow panel. */
export function DetailColumns(props) {
    return (_jsxs("div", { className: styles.columns, children: [_jsx("div", { className: styles.main, children: props.main }), _jsx("aside", { className: styles.side, children: props.side })] }));
}
export function SideCard(props) {
    return (_jsxs("section", { className: styles.sideCard, children: [_jsxs("header", { className: styles.sideHeader, children: [_jsx("h2", { className: styles.sideTitle, children: props.title }), props.extra] }), props.children] }));
}
export function InfoRow(props) {
    return (_jsxs("div", { className: styles.infoRow, children: [_jsx("dt", { children: props.label }), _jsx("dd", { className: props.mono === true ? styles.mono : undefined, children: props.value })] }));
}
/** Count in a tab label ("文件 15"). */
export function TabCount(props) {
    return _jsx("span", { className: styles.tabCount, children: props.value });
}
export function Chip(props) {
    const tone = props.tone ?? 'plain';
    return (_jsx("span", { className: `${styles.chip} ${tone === 'plain' ? '' : styles[`chip_${tone}`] ?? ''}`, title: props.title, children: props.children }));
}
const SECURITY_TONE = {
    verified: 'ok',
    benign: 'ok',
    unknown: 'plain',
    flagged: 'warn',
};
/** Upstream scan verdict, shared by the cards, the detail header and the install dialog. */
export function SecurityChip(props) {
    const t = useT();
    const tone = SECURITY_TONE[props.status];
    return (_jsxs(Chip, { tone: tone, children: [tone === 'warn' ? _jsx(AlertIcon, { size: 13 }) : _jsx(ShieldIcon, { size: 13 }), t(`${props.short === true ? 'scanShort' : 'scan'}.${props.status}`)] }));
}
/**
 * Keeps the detail layout stable while its request is in flight: the same
 * boxes as the real page rather than a spinner, so the page changes shape once.
 */
export function SkillDetailSkeleton({ onBack, backLabel }) {
    const t = useT();
    return (_jsxs("div", { className: styles.page, "aria-busy": "true", children: [_jsxs("div", { className: styles.top, children: [_jsx("nav", { className: styles.crumbs, children: _jsxs("button", { type: "button", className: styles.crumbBack, onClick: onBack, children: [_jsx(ArrowLeftIcon, { size: 14 }), backLabel ?? t('marketTab')] }) }), _jsx("div", { role: "status", "aria-label": t('loading'), children: _jsxs("div", { className: styles.hero, "aria-hidden": "true", children: [_jsx("span", { className: styles.skeletonAvatar }), _jsxs("div", { className: styles.heroText, children: [_jsx("span", { className: styles.skeletonTitle }), _jsx("span", { className: styles.skeletonLine }), _jsx("span", { className: styles.skeletonLine })] })] }) }), _jsx("div", { className: styles.tabs, "aria-hidden": "true" })] }), _jsx("div", { className: styles.body, "aria-hidden": "true", children: _jsxs("div", { className: styles.columns, children: [_jsx("div", { className: styles.main, children: _jsx("div", { className: styles.card, children: Array.from({ length: 9 }, (_, index) => _jsx("span", { className: styles.skeletonLine }, index)) }) }), _jsx("div", { className: styles.side, children: _jsx("div", { className: styles.sideCard, children: Array.from({ length: 5 }, (_, index) => _jsx("span", { className: styles.skeletonLine }, index)) }) })] }) })] }));
}
