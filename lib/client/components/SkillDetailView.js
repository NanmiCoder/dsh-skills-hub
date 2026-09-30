import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { MarkdownView } from "./MarkdownView.js";
import { Button } from '@deepseek-ai/dsh-client-ui-primitives';
import { useT } from "../locale-context.js";
import { AlertIcon, DownloadIcon, TrashIcon } from "../icons.js";
import { formatAge, formatStamp } from "../relative-time.js";
import { FrontmatterPanel } from "./FrontmatterPanel.js";
import { InstallStateBadge } from "./InstallStateBadge.js";
import { SecurityBadge } from "./SecurityBadge.js";
import { SkillAvatar } from "./SkillAvatar.js";
import { SkillFiles } from "./SkillFiles.js";
import { Fact, SkillDetailShell, detailStyles } from "./SkillDetailShell.js";
import styles from './SkillDetailView.module.css';
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
/**
 * Market skill detail page.
 *
 * Like the home page this component owns no data: the tab, the selected file
 * and the file contents all live in `MarketState`, so switching tabs or
 * re-opening a skill does not lose its place. The reading surface itself — back
 * affordance, header, tabs, facts rail — is `SkillDetailShell`, which the local
 * installed page uses too.
 *
 * The bundled GFM renderer handles catalogue Markdown without relying on a
 * host renderer delegate. Raw HTML is disabled and URLs use its safe default.
 */
export function SkillDetailView(props) {
    const { detail, state, controller } = props;
    const t = useT();
    const installationInFlight = state.installingIds.has(detail.id);
    const author = detail.author.displayName ?? detail.author.handle;
    const reports = detail.securityReports ?? [];
    // A detail answered from the Host cache is a snapshot; say so, and offer the
    // one action that actually reaches upstream.
    const snapshotAt = state.detailStatus?.fromCache === true ? state.detailStatus.fetchedAt : undefined;
    const notInstallable = detail.installState === 'not-installable' && detail.notInstallableReason !== undefined;
    return (_jsx(SkillDetailShell, { focusKey: detail.id, onBack: () => controller.closeDetail(), backLabel: t('back'), avatar: _jsx(SkillAvatar, { name: detail.name, source: detail.source, iconUrl: detail.iconUrl, size: 84 }), eyebrow: _jsxs(_Fragment, { children: [_jsx("span", { className: detailStyles.source, children: t(`source.${detail.source}`) }), detail.version !== undefined && detail.version !== '' && (_jsxs(_Fragment, { children: [_jsx("span", { "aria-hidden": "true", children: "\u00B7" }), _jsxs("span", { className: detailStyles.version, children: ["v", detail.version] })] }))] }), name: detail.name, badges: _jsxs(_Fragment, { children: [_jsx(SecurityBadge, { status: detail.securityStatus, reports: detail.securityReports }), _jsx(InstallStateBadge, { state: detail.installState })] }), summary: detail.summary, notice: _jsxs(_Fragment, { children: [notInstallable && (_jsxs("p", { className: styles.warning, role: "note", title: detail.notInstallableReason, children: [_jsx(AlertIcon, { size: 16, className: styles.warningIcon }), _jsx("span", { children: t('notInstallable') })] })), reports.length > 0 && (_jsxs("div", { className: styles.reports, children: [_jsx("span", { className: styles.reportsLabel, children: t('security') }), reports.map((report) => {
                            const url = safeReportUrl(report.reportUrl);
                            return (_jsxs("span", { className: styles.report, children: [_jsx("span", { className: styles.reportVendor, children: report.vendor }), _jsx("span", { className: styles.reportStatus, children: report.statusText }), url !== undefined && (_jsx("a", { className: styles.reportLink, href: url, target: "_blank", rel: "noreferrer noopener", children: t('viewReport') }))] }, `${report.vendor}:${report.status}`));
                        })] })), snapshotAt !== undefined && (_jsxs("p", { className: styles.snapshot, role: "note", children: [_jsx("span", { title: formatStamp(snapshotAt), children: t('detailSnapshot', { age: formatAge(t, snapshotAt) }) }), _jsx("button", { type: "button", className: styles.snapshotAction, disabled: state.detailLoading, onClick: () => void controller.openDetail(detail.id, { refresh: true }), children: t('refreshSnapshot') })] }))] }), overviewLabel: t('overview'), filesLabel: `${t('files')} (${detail.files.length})`, activeTab: state.activeTab, onTabChange: (tab) => controller.setTab(tab), overview: _jsxs(_Fragment, { children: [detail.description.trim() !== '' ? (_jsx(MarkdownView, { content: detail.description })) : (detail.summary !== '' && _jsx("p", { className: detailStyles.summary, children: detail.summary })), detail.descriptionFrontmatter !== undefined && Object.keys(detail.descriptionFrontmatter).length > 0 && (_jsx("div", { className: detailStyles.frontmatter, children: _jsx(FrontmatterPanel, { data: detail.descriptionFrontmatter }) }))] }), files: _jsx(SkillFiles, { files: detail.files, selected: state.file, loading: state.fileLoading, onSelect: (path) => void controller.selectFile(path) }), rail: _jsxs(_Fragment, { children: [_jsxs("div", { className: detailStyles.railAction, children: [detail.installState === 'installable' && (_jsx(Button, { variant: "primary", size: "md", disabled: installationInFlight, icon: _jsx(DownloadIcon, { size: 16 }), onClick: () => controller.requestInstall(detail.id), children: installationInFlight ? t('installing') : t('install') })), detail.installState === 'installed' && (_jsx(Button, { variant: "outline", size: "md", disabled: installationInFlight, title: t('uninstallConfirm'), icon: _jsx(TrashIcon, { size: 16 }), onClick: () => void controller.uninstall(detail.id), children: t('uninstall') })), detail.installState === 'not-installable' && _jsx("p", { className: detailStyles.muted, children: t('notInstallable') })] }), _jsxs("dl", { className: detailStyles.facts, children: [_jsx(Fact, { label: t('author'), children: author }), _jsx(Fact, { label: t('downloads'), children: formatCount(detail.stats.downloads) }), detail.stats.installs !== undefined && _jsx(Fact, { label: t('installs'), children: formatCount(detail.stats.installs) }), detail.stats.stars !== undefined && _jsx(Fact, { label: t('stars'), children: formatCount(detail.stats.stars) }), detail.updatedAt !== undefined && _jsx(Fact, { label: t('updated'), children: formatDate(detail.updatedAt) }), detail.license !== undefined && detail.license !== '' && _jsx(Fact, { label: t('license'), children: detail.license }), detail.version !== undefined && detail.version !== '' && _jsxs(Fact, { label: t('version'), children: ["v", detail.version] })] })] }) }));
}
