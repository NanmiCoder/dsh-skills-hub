import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useT } from "../locale-context.js";
import { AlertIcon, CheckIcon, DownloadIcon, ExternalLinkIcon, TrashIcon } from "../icons.js";
import { formatAge, formatStamp } from "../relative-time.js";
import { detectCapabilities, extractTriggers, readingMinutes } from "../skill-insights.js";
import { MarkdownView } from "./MarkdownView.js";
import { FrontmatterPanel } from "./FrontmatterPanel.js";
import { SkillAvatar } from "./SkillAvatar.js";
import { SkillFiles } from "./SkillFiles.js";
import { Chip, DetailColumns, InfoRow, SecurityChip, SideCard, SkillDetailShell, TabCount, detailStyles as shell, } from "./SkillDetailShell.js";
import styles from './MarketSkillDetail.module.css';
/** Compact counts: 482069 → 482.1k. */
export function formatCount(value) {
    if (value >= 1_000_000)
        return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000)
        return `${(value / 1_000).toFixed(1)}k`;
    return String(value);
}
/** Upstream timestamps are epoch millis; render as an ISO date (stable across locales). */
export function formatDate(timestamp) {
    if (timestamp === undefined)
        return '';
    const date = new Date(timestamp);
    return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
}
function formatBytes(bytes) {
    if (bytes >= 1024 * 1024)
        return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    if (bytes >= 1024)
        return `${Math.round(bytes / 1024)} KB`;
    return `${bytes} B`;
}
/** Only absolute http(s) links from upstream may become an `href`. */
export function safeUrl(url) {
    return url !== undefined && /^https?:\/\//i.test(url) ? url : undefined;
}
/** One capability, phrased with its evidence. */
export function capabilityText(t, capability) {
    const evidence = capability.evidence.join(capability.kind === 'shell' ? ' / ' : '、');
    return {
        title: t(`cap.${capability.kind}`),
        detail: t(`cap.${capability.kind}.detail`, { evidence }),
    };
}
/** Capabilities and triggers, derived once per detail. */
export function useSkillInsights(detail) {
    return useMemo(() => {
        const description = detail.descriptionFrontmatter?.['description'];
        return {
            capabilities: detectCapabilities({
                markdown: detail.description,
                frontmatter: detail.descriptionFrontmatter,
                files: detail.files,
            }),
            triggers: extractTriggers(typeof description === 'string' ? description : undefined),
        };
    }, [detail]);
}
/** Markdown taller than this starts collapsed behind "expand". */
const COLLAPSED_HEIGHT = 720;
function SkillDocument(props) {
    const { detail } = props;
    const t = useT();
    const bodyRef = useRef(null);
    const [expanded, setExpanded] = useState(false);
    const [overflows, setOverflows] = useState(false);
    const skillMd = detail.files.find((file) => file.path === 'SKILL.md');
    useLayoutEffect(() => {
        const body = bodyRef.current;
        if (body !== null)
            setOverflows(body.scrollHeight > COLLAPSED_HEIGHT + 80);
    }, [detail.description]);
    useEffect(() => setExpanded(false), [detail.id]);
    const collapsed = overflows && !expanded;
    return (_jsxs("section", { className: shell.card, children: [_jsxs("header", { className: styles.docHeader, children: [_jsx("span", { className: shell.mono, children: "SKILL.md" }), _jsxs("span", { children: [skillMd !== undefined && `${formatBytes(skillMd.size)} · `, t('readingTime', { minutes: readingMinutes(detail.description) })] })] }), _jsxs("div", { ref: bodyRef, className: `${styles.docBody} ${collapsed ? styles.docCollapsed : ''}`, children: [detail.description.trim() !== '' ? (_jsx(MarkdownView, { content: detail.description })) : (_jsx("p", { className: shell.muted, children: detail.summary })), detail.descriptionFrontmatter !== undefined && Object.keys(detail.descriptionFrontmatter).length > 0 && (_jsx("div", { className: styles.frontmatter, children: _jsx(FrontmatterPanel, { data: detail.descriptionFrontmatter }) }))] }), overflows && (_jsx("button", { type: "button", className: styles.expand, onClick: () => setExpanded((value) => !value), children: expanded ? t('collapse') : t('expand') }))] }));
}
function CapabilityPanel(props) {
    const t = useT();
    return (_jsxs("section", { className: styles.capabilities, "aria-labelledby": "skills-hub-capabilities", children: [_jsxs("header", { className: styles.capHeader, children: [_jsxs("h2", { id: "skills-hub-capabilities", className: styles.capTitle, children: [_jsx(AlertIcon, { size: 18 }), t('capTitle')] }), _jsx("button", { type: "button", className: `${shell.linkButton} ${styles.capLink}`, onClick: props.onReport, children: t('viewFullReport') })] }), _jsx("ul", { className: styles.capGrid, children: props.capabilities.map((capability) => {
                    const text = capabilityText(t, capability);
                    return (_jsxs("li", { className: styles.capCard, children: [_jsx("strong", { children: text.title }), _jsx("span", { children: text.detail })] }, capability.kind));
                }) }), _jsx("p", { className: styles.capNote, children: t('capNote') })] }));
}
function Report(props) {
    const t = useT();
    const { report } = props;
    const url = safeUrl(report.reportUrl);
    const clean = /^(clean|benign|safe)/i.test(report.status);
    return (_jsxs("li", { className: styles.report, children: [_jsxs("div", { className: styles.reportHead, children: [_jsx("span", { className: styles.reportVendor, children: report.vendor }), _jsx(Chip, { tone: clean ? 'ok' : 'warn', children: report.statusText })] }), report.summary !== undefined && _jsx("p", { className: styles.reportSummary, children: report.summary }), url !== undefined && (_jsxs("a", { className: shell.link, href: url, target: "_blank", rel: "noreferrer noopener", children: [t('viewReport'), " ", _jsx(ExternalLinkIcon, { size: 12 })] }))] }));
}
/**
 * Market skill detail page.
 *
 * Owns no data: tab, selected file and file contents live in `MarketState`.
 * Upstream facts (stats, version, scans, files) come from the live detail; the
 * catalogue adds category and the Chinese summary. "What this skill does" and
 * "when it triggers" are read off its own SKILL.md and file list by explicit
 * rules (`skill-insights.ts`) and are hidden when no rule fires.
 */
export function MarketSkillDetail(props) {
    const { detail, state, controller } = props;
    const t = useT();
    const { capabilities, triggers } = useSkillInsights(detail);
    const installing = state.installingIds.has(detail.id);
    const author = detail.author.displayName ?? detail.author.handle;
    const reports = detail.securityReports ?? [];
    const pageUrl = safeUrl(detail.pageUrl);
    const category = state.categories.find((entry) => entry.key === detail.category);
    const english = t('category.lang') === 'en';
    const categoryName = category === undefined ? undefined : (english && category.nameEn) || category.name;
    const snapshotAt = state.detailStatus?.fromCache === true ? state.detailStatus.fetchedAt : undefined;
    const updated = formatDate(detail.updatedAt);
    // A skill that ships its own changelog has the full history right here.
    const changelogFile = detail.files.find((file) => /^changelog(\.md)?$/i.test(file.path));
    const tabs = [
        { key: 'overview', label: t('overview') },
        { key: 'files', label: t('files'), badge: _jsx(TabCount, { value: detail.files.length }) },
        {
            key: 'security',
            label: t('securityReport'),
            badge: detail.securityStatus === 'flagged' ? _jsx("span", { className: shell.tabDot, "aria-label": t('scan.flagged') }) : undefined,
        },
        { key: 'changelog', label: t('changelog') },
    ];
    const stats = [
        { label: t('downloads'), value: formatCount(detail.stats.downloads) },
        ...(detail.stats.installs === undefined ? [] : [{ label: t('installs'), value: formatCount(detail.stats.installs) }]),
        ...(detail.stats.stars === undefined ? [] : [{ label: t('stars'), value: formatCount(detail.stats.stars) }]),
        { label: t('files'), value: String(detail.files.length) },
    ];
    return (_jsxs(SkillDetailShell, { focusKey: detail.id, onBack: () => controller.closeDetail(), backLabel: t('marketTab'), avatar: _jsx(SkillAvatar, { name: detail.name, source: detail.source, iconUrl: detail.iconUrl, size: 72 }), name: detail.name, version: detail.version, meta: _jsxs(_Fragment, { children: [author !== '' && (_jsxs("span", { children: ["by ", _jsx("strong", { children: author })] })), _jsx("span", { children: t(`source.${detail.source}`) }), detail.license !== undefined && detail.license !== '' && _jsx("span", { children: detail.license }), updated !== '' && _jsx("span", { children: t('updatedOn', { date: updated }) })] }), summary: detail.summary, chips: _jsxs(_Fragment, { children: [_jsx(SecurityChip, { status: detail.securityStatus }), detail.featured === true && _jsx(Chip, { tone: "blue", children: t('featured') }), categoryName !== undefined && _jsx(Chip, { children: categoryName }), detail.tags.slice(0, 2).map((tag) => (_jsx(Chip, { children: tag }, tag))), detail.requiresApiKey === true && _jsx(Chip, { children: t('needsApiKey') })] }), actions: _jsxs(_Fragment, { children: [pageUrl !== undefined && (_jsxs("a", { className: shell.secondaryButton, href: pageUrl, target: "_blank", rel: "noreferrer noopener", children: [t('sourcePage'), _jsx(ExternalLinkIcon, { size: 14 })] })), detail.installState === 'installable' && (_jsxs("button", { type: "button", className: shell.primaryButton, disabled: installing, onClick: () => controller.requestInstall(detail.id), children: [_jsx(DownloadIcon, { size: 16 }), installing ? t('installing') : t('install')] })), detail.installState === 'installed' && (_jsxs(_Fragment, { children: [_jsxs("span", { className: shell.installedMark, children: [_jsx(CheckIcon, { size: 14 }), t('installed')] }), _jsxs("button", { type: "button", className: shell.secondaryButton, disabled: installing, onClick: () => void controller.uninstall(detail.id), children: [_jsx(TrashIcon, { size: 14 }), t('uninstall')] })] })), detail.installState === 'not-installable' && (_jsx("span", { className: shell.notInstallable, title: detail.notInstallableReason, children: t('notInstallable') }))] }), stats: stats, tabs: tabs, activeTab: state.activeTab, onTabChange: (tab) => controller.setTab(tab), notice: snapshotAt === undefined ? undefined : (_jsxs("p", { className: shell.snapshot, role: "note", children: [_jsx("span", { title: formatStamp(snapshotAt), children: t('detailSnapshot', { age: formatAge(t, snapshotAt) }) }), _jsx("button", { type: "button", className: shell.linkButton, disabled: state.detailLoading, onClick: () => void controller.openDetail(detail.id, { refresh: true }), children: t('refreshSnapshot') })] })), children: [state.activeTab === 'overview' && (_jsx(DetailColumns, { main: _jsxs(_Fragment, { children: [capabilities.length > 0 && (_jsx(CapabilityPanel, { capabilities: capabilities, onReport: () => controller.setTab('security') })), _jsx(SkillDocument, { detail: detail })] }), side: _jsxs(_Fragment, { children: [triggers.length > 0 && (_jsx(SideCard, { title: t('whenToUse'), children: _jsx("ol", { className: styles.triggers, children: triggers.map((trigger, index) => (_jsxs("li", { children: [_jsx("span", { className: styles.triggerIndex, children: index + 1 }), _jsx("span", { children: trigger })] }, trigger))) }) })), _jsx(SideCard, { title: t('info'), children: _jsxs("dl", { className: shell.info, children: [author !== '' && _jsx(InfoRow, { label: t('author'), value: author }), _jsx(InfoRow, { label: t('filter.source'), value: t(`source.${detail.source}`) }), categoryName !== undefined && _jsx(InfoRow, { label: t('category.label'), value: categoryName }), detail.version !== undefined && detail.version !== '' && (_jsx(InfoRow, { label: t('version'), value: `v${detail.version}`, mono: true })), detail.license !== undefined && detail.license !== '' && _jsx(InfoRow, { label: t('license'), value: detail.license }), updated !== '' && _jsx(InfoRow, { label: t('updated'), value: updated, mono: true })] }) }), detail.changelog !== undefined && (_jsxs(SideCard, { title: t('latestUpdate'), extra: detail.changelog.version === undefined ? undefined : (_jsx("span", { className: shell.mono, children: detail.changelog.version })), children: [_jsx("p", { className: styles.changelogText, children: detail.changelog.text }), _jsx("button", { type: "button", className: shell.linkButton, onClick: () => controller.setTab('changelog'), children: t('fullChangelog') })] }))] }) })), state.activeTab === 'files' && (_jsx("section", { className: shell.card, children: _jsx(SkillFiles, { files: detail.files, selected: state.file, loading: state.fileLoading, onSelect: (path) => void controller.selectFile(path) }) })), state.activeTab === 'security' && (_jsxs("div", { className: shell.stack, children: [capabilities.length > 0 && (_jsx(CapabilityPanel, { capabilities: capabilities, onReport: () => controller.setTab('files') })), _jsxs("section", { className: shell.card, children: [_jsx("h2", { className: shell.cardTitle, children: t('scanReports') }), reports.length > 0 ? (_jsx("ul", { className: styles.reports, children: reports.map((report) => (_jsx(Report, { report: report }, `${report.vendor}:${report.status}`))) })) : (_jsx("p", { className: shell.muted, children: t('noReports') })), _jsx("p", { className: styles.capNote, children: t('scanDisclaimer') })] })] })), state.activeTab === 'changelog' && (_jsxs("section", { className: shell.card, children: [_jsx("h2", { className: shell.cardTitle, children: t('changelog') }), detail.changelog !== undefined ? (_jsxs("article", { className: styles.release, children: [_jsxs("header", { className: styles.releaseHead, children: [_jsx("span", { className: shell.versionChip, children: detail.changelog.version ?? detail.version ?? '' }), detail.changelog.publishedAt !== undefined && (_jsx("span", { className: shell.muted, children: formatDate(detail.changelog.publishedAt) }))] }), _jsx("p", { className: styles.changelogText, children: detail.changelog.text })] })) : (_jsx("p", { className: shell.muted, children: t('noChangelog') })), _jsxs("div", { className: styles.linkRow, children: [changelogFile !== undefined && (_jsx("button", { type: "button", className: shell.linkButton, onClick: () => {
                                    controller.setTab('files');
                                    void controller.selectFile(changelogFile.path);
                                }, children: t('openChangelogFile', { path: changelogFile.path }) })), pageUrl !== undefined && (_jsxs("a", { className: shell.link, href: pageUrl, target: "_blank", rel: "noreferrer noopener", children: [t('olderVersions'), " ", _jsx(ExternalLinkIcon, { size: 12 })] }))] })] }))] }));
}
