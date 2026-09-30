import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * The detail surface shared by the market catalogue and the installed inventory.
 *
 * Both pages answer the same question — "what is inside this skill?" — and the
 * only real difference is where the facts come from: an upstream provider or the
 * filesystem. Everything that is *reading* rather than *fetching* therefore
 * lives here: the back affordance, the identity header, the two tabs, the
 * document column, the facts rail and the focus move that keeps a keyboard user
 * from being left at the top of the document when the list is replaced.
 *
 * The two pages are not identical, so the shell takes slots rather than a data
 * model: `badges`, `notice`, `overview`, `files` and `rail` are composed by the
 * caller, while each caller owns its own loading state and its own choice of tab
 * storage (the market page keeps it in `MarketState`, the local page in its own
 * component state).
 */
import { useEffect, useRef } from 'react';
import { Button, SegmentedTabs } from '@deepseek-ai/dsh-client-ui-primitives';
import { ArrowLeftIcon } from "../icons.js";
import { useT } from "../locale-context.js";
import styles from './SkillDetailShell.module.css';
/** Stable DOM ids for the tab list and its panels; one detail page is mounted at a time. */
const TAB_ID = 'skills-hub-detail-tab';
const PANEL_ID = 'skills-hub-detail-panel';
/**
 * The shell's stylesheet, re-exported for its callers.
 *
 * The pages built on this shell also render shell-shaped fragments (a report
 * row, a path line, a facts list) and reaching them through an import is more
 * honest than re-declaring near-copies of the same rules in a second module.
 */
export const detailStyles = styles;
/** One label/value row of the facts rail. */
export function Fact(props) {
    return (_jsxs("div", { className: styles.fact, children: [_jsx("dt", { className: styles.factLabel, children: props.label }), _jsx("dd", { className: styles.factValue, children: props.children })] }));
}
export function SkillDetailShell(props) {
    const { name, activeTab, onTabChange } = props;
    const headingRef = useRef(null);
    // The list is replaced by this page without a route change, so focus has to
    // be moved by hand or a keyboard user is left at the top of the document.
    useEffect(() => {
        headingRef.current?.focus();
    }, [props.focusKey]);
    const tabs = [
        { value: 'overview', label: props.overviewLabel, id: `${TAB_ID}-overview`, panelId: `${PANEL_ID}-overview` },
        { value: 'files', label: props.filesLabel, id: `${TAB_ID}-files`, panelId: `${PANEL_ID}-files` },
    ];
    return (_jsxs("div", { className: styles.detail, children: [_jsx("div", { className: styles.back, children: _jsx(Button, { variant: "ghost", size: "sm", icon: _jsx(ArrowLeftIcon, { size: 16 }), onClick: props.onBack, children: props.backLabel }) }), _jsxs("header", { className: styles.header, children: [props.avatar, _jsxs("div", { className: styles.headerText, children: [_jsx("p", { className: styles.eyebrow, children: props.eyebrow }), _jsx("h1", { ref: headingRef, tabIndex: -1, className: styles.name, children: name }), props.badges === undefined ? null : _jsx("div", { className: styles.badges, children: props.badges }), props.summary === undefined || props.summary === '' ? null : (_jsx("p", { className: styles.summary, children: props.summary }))] })] }), props.notice, _jsxs("div", { className: styles.columns, children: [_jsxs("main", { className: styles.main, children: [_jsx(SegmentedTabs, { items: tabs, value: activeTab, onChange: onTabChange, label: name }), activeTab === 'overview' && (_jsx("section", { className: styles.panel, id: `${PANEL_ID}-overview`, role: "tabpanel", "aria-labelledby": `${TAB_ID}-overview`, children: props.overview })), activeTab === 'files' && (_jsx("section", { className: styles.panel, id: `${PANEL_ID}-files`, role: "tabpanel", "aria-labelledby": `${TAB_ID}-files`, children: props.files }))] }), _jsx("aside", { className: styles.rail, children: _jsx("div", { className: styles.railCard, children: props.rail }) })] })] }));
}
/**
 * Keeps the detail layout stable while its request is in flight.
 *
 * It renders the same boxes as the real page rather than a spinner, because the
 * click that opens a detail is the moment the panel changes shape; a centered
 * "loading" line would make that change happen twice.
 */
export function SkillDetailSkeleton({ onBack }) {
    const t = useT();
    return (_jsxs("div", { className: styles.detail, "aria-busy": "true", children: [_jsx("div", { className: styles.back, children: _jsx(Button, { variant: "ghost", size: "sm", icon: _jsx(ArrowLeftIcon, { size: 16 }), onClick: onBack, children: t('back') }) }), _jsx("div", { role: "status", "aria-label": t('loading'), children: _jsxs("div", { "aria-hidden": "true", children: [_jsxs("div", { className: styles.header, children: [_jsx("span", { className: styles.skeletonAvatar }), _jsxs("div", { className: styles.headerText, children: [_jsx("span", { className: styles.skeletonTitle }), _jsx("span", { className: styles.skeletonLine }), _jsx("span", { className: styles.skeletonLine })] })] }), _jsxs("div", { className: styles.columns, style: { marginTop: 24 }, children: [_jsx("div", { className: styles.main, children: _jsx("div", { className: styles.panel, children: Array.from({ length: 10 }, (_, index) => _jsx("span", { className: styles.skeletonLine }, index)) }) }), _jsx("div", { className: styles.rail, children: _jsx("div", { className: styles.panel, children: Array.from({ length: 5 }, (_, index) => _jsx("span", { className: styles.skeletonLine }, index)) }) })] })] }) })] }));
}
