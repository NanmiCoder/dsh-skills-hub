import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { MarkdownView } from "./MarkdownView.js";
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, CodeBlock, SegmentedTabs, StateDot, fileSizeText, writeClipboard, } from '@deepseek-ai/dsh-client-ui-primitives';
import { useT } from "../locale-context.js";
import { AlertIcon, ArrowLeftIcon, CheckIcon, CopyIcon, DownloadIcon, FileIcon, TrashIcon } from "../icons.js";
import { FrontmatterPanel } from "./FrontmatterPanel.js";
import { InstallStateBadge } from "./InstallStateBadge.js";
import { SecurityBadge } from "./SecurityBadge.js";
import { SkillAvatar } from "./SkillAvatar.js";
import styles from './SkillDetailView.module.css';
/** How long the copy button stays in its confirmed state. */
const COPIED_RESET_MS = 2_000;
/** Stable DOM ids for the tab list and its panels; one detail view is mounted at a time. */
const TAB_ID = 'skills-hub-detail-tab';
const PANEL_ID = 'skills-hub-detail-panel';
/** Compact counts, matching the catalogue cards. */
function formatCount(value) {
    if (value >= 1_000_000)
        return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000)
        return `${(value / 1_000).toFixed(1)}k`;
    return String(value);
}
/** Upstream timestamps are epoch millis; an unparseable one renders as nothing. */
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString();
}
/**
 * A report link is only rendered for an absolute http(s) URL: the value comes
 * from an upstream catalogue, and `javascript:` in an `href` would execute in
 * the DSH page.
 */
function safeReportUrl(url) {
    return url !== undefined && /^https?:\/\//i.test(url) ? url : undefined;
}
/** One label/value row of the right-hand facts rail. */
function Fact(props) {
    return (_jsxs("div", { className: styles.fact, children: [_jsx("dt", { className: styles.factLabel, children: props.label }), _jsx("dd", { className: styles.factValue, children: props.children })] }));
}
/**
 * Skill detail page.
 *
 * Like the home page this component owns no data: the tab, the selected file
 * and the file contents all live in `MarketState`, so switching tabs or
 * re-opening a skill does not lose its place.
 *
 * The bundled GFM renderer handles catalogue Markdown without relying on a
 * host renderer delegate. Raw HTML is disabled and URLs use its safe default.
 */
export function SkillDetailView(props) {
    const { detail, state, controller } = props;
    const t = useT();
    const headingRef = useRef(null);
    const [copied, setCopied] = useState(false);
    const resetTimer = useRef(undefined);
    // The list is replaced by this page without a route change, so focus has to
    // be moved by hand or a keyboard user is left at the top of the document.
    useEffect(() => {
        headingRef.current?.focus();
    }, [detail.id]);
    useEffect(() => () => {
        if (resetTimer.current !== undefined)
            clearTimeout(resetTimer.current);
    }, []);
    const copyFile = useCallback(() => {
        const content = state.file?.content;
        if (content === undefined)
            return;
        void writeClipboard(content).then((ok) => {
            if (!ok)
                return;
            setCopied(true);
            if (resetTimer.current !== undefined)
                clearTimeout(resetTimer.current);
            resetTimer.current = setTimeout(() => setCopied(false), COPIED_RESET_MS);
        });
    }, [state.file]);
    const tabs = [
        { value: 'overview', label: t('overview'), id: `${TAB_ID}-overview`, panelId: `${PANEL_ID}-overview` },
        {
            value: 'files',
            label: `${t('files')} (${detail.files.length})`,
            id: `${TAB_ID}-files`,
            panelId: `${PANEL_ID}-files`,
        },
    ];
    const installationInFlight = state.installingIds.has(detail.id);
    const author = detail.author.displayName ?? detail.author.handle;
    const file = state.file;
    const selectedPath = file?.path ?? null;
    const selectFile = (meta) => {
        if (meta.path === selectedPath)
            return;
        void controller.selectFile(meta.path);
    };
    return (_jsxs("div", { className: styles.detail, children: [_jsx("div", { className: styles.back, children: _jsx(Button, { variant: "ghost", size: "sm", icon: _jsx(ArrowLeftIcon, { size: 16 }), onClick: () => controller.closeDetail(), children: t('back') }) }), _jsxs("header", { className: styles.header, children: [_jsx(SkillAvatar, { name: detail.name, source: detail.source, iconUrl: detail.iconUrl, size: 84 }), _jsxs("div", { className: styles.headerText, children: [_jsxs("p", { className: styles.eyebrow, children: [_jsx("span", { className: styles.source, children: t(`source.${detail.source}`) }), detail.version !== undefined && detail.version !== '' && (_jsxs(_Fragment, { children: [_jsx("span", { "aria-hidden": "true", children: "\u00B7" }), _jsxs("span", { className: styles.version, children: ["v", detail.version] })] }))] }), _jsx("h1", { ref: headingRef, tabIndex: -1, className: styles.name, children: detail.name }), _jsxs("div", { className: styles.badges, children: [_jsx(SecurityBadge, { status: detail.securityStatus, reports: detail.securityReports }), _jsx(InstallStateBadge, { state: detail.installState })] }), detail.summary !== '' && _jsx("p", { className: styles.summary, children: detail.summary })] })] }), detail.installState === 'not-installable' && detail.notInstallableReason !== undefined && (_jsxs("p", { className: styles.warning, role: "note", title: detail.notInstallableReason, children: [_jsx(AlertIcon, { size: 16, className: styles.warningIcon }), _jsx("span", { children: t('notInstallable') })] })), detail.securityReports !== undefined && detail.securityReports.length > 0 && (_jsxs("div", { className: styles.reports, children: [_jsx("span", { className: styles.reportsLabel, children: t('security') }), detail.securityReports.map((report) => {
                        const url = safeReportUrl(report.reportUrl);
                        return (_jsxs("span", { className: styles.report, children: [_jsx("span", { className: styles.reportVendor, children: report.vendor }), _jsx("span", { className: styles.reportStatus, children: report.statusText }), url !== undefined && (_jsx("a", { className: styles.reportLink, href: url, target: "_blank", rel: "noreferrer noopener", children: t('viewReport') }))] }, `${report.vendor}:${report.status}`));
                    })] })), _jsxs("div", { className: styles.columns, children: [_jsxs("main", { className: styles.main, children: [_jsx(SegmentedTabs, { items: tabs, value: state.activeTab, onChange: (value) => controller.setTab(value), label: detail.name }), state.activeTab === 'overview' && (_jsxs("section", { className: styles.panel, id: `${PANEL_ID}-overview`, role: "tabpanel", "aria-labelledby": `${TAB_ID}-overview`, children: [detail.description.trim() !== '' ? (_jsx(MarkdownView, { content: detail.description })) : (detail.summary !== '' && _jsx("p", { className: styles.summary, children: detail.summary })), detail.descriptionFrontmatter !== undefined && Object.keys(detail.descriptionFrontmatter).length > 0 && (_jsx("div", { className: styles.frontmatter, children: _jsx(FrontmatterPanel, { data: detail.descriptionFrontmatter }) }))] })), state.activeTab === 'files' && (_jsx("section", { className: styles.panel, id: `${PANEL_ID}-files`, role: "tabpanel", "aria-labelledby": `${TAB_ID}-files`, children: detail.files.length === 0 ? (_jsx("p", { className: styles.muted, children: t('noFiles') })) : (_jsxs("div", { className: styles.files, children: [_jsx("ul", { className: styles.fileList, children: detail.files.map((meta) => {
                                                const active = meta.path === selectedPath;
                                                return (_jsx("li", { children: _jsxs("button", { type: "button", className: `${styles.fileItem} ${active ? styles.fileItemActive : ''}`, "aria-current": active ? 'true' : undefined, onClick: () => selectFile(meta), children: [_jsx(FileIcon, { size: 14, className: styles.fileIcon }), _jsx("span", { className: styles.filePath, title: meta.path, children: meta.path }), meta.tooBig && _jsx("span", { className: styles.fileFlag, children: t('fileTooLarge') }), _jsxs("span", { className: styles.fileMeta, children: [fileSizeText(meta.size), " \u00B7 ", meta.language] })] }) }, meta.path));
                                            }) }), _jsx("div", { className: styles.fileView, children: file === null ? (state.fileLoading ? (_jsxs("p", { className: styles.muted, role: "status", "aria-live": "polite", children: [_jsx(StateDot, { state: "ongoing", size: 14 }), " ", t('loading')] })) : null) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: styles.fileBar, children: [_jsx("span", { className: styles.fileBarPath, title: file.path, children: file.path }), _jsx(Button, { variant: "outline", size: "sm", className: styles.copy, "aria-label": copied ? t('copied') : t('copy'), onClick: copyFile, icon: copied ? _jsx(CheckIcon, { size: 14 }) : _jsx(CopyIcon, { size: 14 }), children: copied ? t('copied') : t('copy') })] }), file.truncated && _jsx("p", { className: styles.muted, children: t('fileTooLarge') }), _jsx(CodeBlock, { code: file.content, lang: file.language, showHeader: false, lineNumbers: true, copyLabel: t('copy'), copiedLabel: t('copied') }), _jsx("p", { className: styles.srOnly, role: "status", "aria-live": "polite", children: copied ? t('copied') : '' })] })) })] })) }))] }), _jsx("aside", { className: styles.rail, children: _jsxs("div", { className: styles.railCard, children: [_jsxs("div", { className: styles.railAction, children: [detail.installState === 'installable' && (_jsx(Button, { variant: "primary", size: "md", disabled: installationInFlight, icon: _jsx(DownloadIcon, { size: 16 }), onClick: () => controller.requestInstall(detail.id), children: installationInFlight ? t('installing') : t('install') })), detail.installState === 'installed' && (_jsx(Button, { variant: "outline", size: "md", disabled: installationInFlight, title: t('uninstallConfirm'), icon: _jsx(TrashIcon, { size: 16 }), onClick: () => void controller.uninstall(detail.id), children: t('uninstall') })), detail.installState === 'not-installable' && _jsx("p", { className: styles.muted, children: t('notInstallable') })] }), _jsxs("dl", { className: styles.facts, children: [_jsx(Fact, { label: t('author'), children: author }), _jsx(Fact, { label: t('downloads'), children: formatCount(detail.stats.downloads) }), detail.stats.installs !== undefined && _jsx(Fact, { label: t('installs'), children: formatCount(detail.stats.installs) }), detail.stats.stars !== undefined && _jsx(Fact, { label: t('stars'), children: formatCount(detail.stats.stars) }), detail.updatedAt !== undefined && _jsx(Fact, { label: t('updated'), children: formatDate(detail.updatedAt) }), detail.license !== undefined && detail.license !== '' && _jsx(Fact, { label: t('license'), children: detail.license }), detail.version !== undefined && detail.version !== '' && _jsxs(Fact, { label: t('version'), children: ["v", detail.version] })] })] }) })] })] }));
}
/** Keeps the detail layout stable while its network request is in flight. */
export function SkillDetailSkeleton({ onBack }) {
    const t = useT();
    return (_jsxs("div", { className: styles.detail, "aria-busy": "true", children: [_jsx("div", { className: styles.back, children: _jsx(Button, { variant: "ghost", size: "sm", icon: _jsx(ArrowLeftIcon, { size: 16 }), onClick: onBack, children: t('back') }) }), _jsx("div", { role: "status", "aria-label": t('loading'), children: _jsxs("div", { "aria-hidden": "true", children: [_jsxs("div", { className: styles.header, children: [_jsx("span", { className: styles.skeletonAvatar }), _jsxs("div", { className: styles.headerText, children: [_jsx("span", { className: styles.skeletonTitle }), _jsx("span", { className: styles.skeletonLine }), _jsx("span", { className: styles.skeletonLine })] })] }), _jsxs("div", { className: styles.columns, style: { marginTop: 24 }, children: [_jsx("div", { className: styles.main, children: _jsx("div", { className: styles.panel, children: Array.from({ length: 10 }, (_, index) => _jsx("span", { className: styles.skeletonLine }, index)) }) }), _jsx("div", { className: styles.rail, children: _jsx("div", { className: styles.panel, children: Array.from({ length: 5 }, (_, index) => _jsx("span", { className: styles.skeletonLine }, index)) }) })] })] }) })] }));
}
