import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Installed skill detail page.
 *
 * The list's "view" affordance used to open a 380px confirmation-style modal,
 * which is the wrong container for a document: SKILL.md is a page of prose with
 * tables and code, and the marketplace already answers the same question with a
 * full-panel page. This page is that same reading surface (`SkillDetailShell`),
 * fed by the filesystem instead of a provider.
 *
 * What it deliberately does *not* do is pretend a local skill is a market
 * entry. There is no author, download count or security report to show, so
 * those rows are absent rather than zero. Where the two identities do meet —
 * a skill installed from a market, proven by its `.skills-hub.json` sidecar —
 * the page links to the market detail instead of duplicating it, which keeps
 * upstream data upstream and this page readable with the network down.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, StateDot, fileSizeText, writeClipboard } from '@deepseek-ai/dsh-client-ui-primitives';
import { fetchInstalledDetail, fetchInstalledFile, isAbortError, } from "../api.js";
import { parseSkillFrontmatter, stripSkillFrontmatter } from "../skill-markdown.js";
import { useT } from "../locale-context.js";
import { CheckIcon, CopyIcon, ExternalLinkIcon, FolderIcon, TrashIcon } from "../icons.js";
import { FrontmatterPanel } from "./FrontmatterPanel.js";
import { MarkdownView } from "./MarkdownView.js";
import { SkillAvatar } from "./SkillAvatar.js";
import { SkillFiles } from "./SkillFiles.js";
import { Fact, SkillDetailShell, detailStyles, } from "./SkillDetailShell.js";
import styles from './InstalledSkillDetail.module.css';
/** How long the path copy button stays in its confirmed state. */
const COPIED_RESET_MS = 2_000;
/** Reader-facing text for anything thrown by the client. */
function messageOf(reason) {
    return reason instanceof Error ? reason.message : String(reason);
}
/** Local install timestamps are ISO strings; an unparseable one renders as nothing. */
function formatInstalledAt(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleString();
}
export function InstalledSkillDetail(props) {
    const { item } = props;
    const t = useT();
    const [detail, setDetail] = useState(null);
    const [error, setError] = useState(null);
    const [revision, setRevision] = useState(0);
    const [tab, setTab] = useState('overview');
    const [selectedPath, setSelectedPath] = useState(null);
    const [file, setFile] = useState(null);
    const [fileLoading, setFileLoading] = useState(false);
    const [fileError, setFileError] = useState(null);
    const [copied, setCopied] = useState(false);
    const resetTimer = useRef(undefined);
    useEffect(() => {
        const abort = new AbortController();
        setError(null);
        void fetchInstalledDetail(item.key, abort.signal)
            .then((result) => {
            if (!abort.signal.aborted)
                setDetail(result);
        })
            .catch((reason) => {
            if (!abort.signal.aborted && !isAbortError(reason))
                setError(messageOf(reason));
        });
        return () => abort.abort();
    }, [item.key, revision]);
    // The file viewer opens on the skill document itself when the tab is first
    // used: that is what the reader came for, and it is always one of the files.
    useEffect(() => {
        if (tab !== 'files' || detail === null || selectedPath !== null)
            return;
        const preferred = detail.files.find((entry) => entry.path.toLowerCase() === 'skill.md') ?? detail.files[0];
        if (preferred !== undefined)
            setSelectedPath(preferred.path);
    }, [tab, detail, selectedPath]);
    useEffect(() => {
        if (selectedPath === null)
            return;
        const abort = new AbortController();
        setFileLoading(true);
        setFileError(null);
        void fetchInstalledFile(item.key, selectedPath, abort.signal)
            .then((result) => {
            if (!abort.signal.aborted)
                setFile(result);
        })
            .catch((reason) => {
            if (abort.signal.aborted || isAbortError(reason))
                return;
            setFile(null);
            setFileError(messageOf(reason));
        })
            .finally(() => {
            if (!abort.signal.aborted)
                setFileLoading(false);
        });
        return () => abort.abort();
    }, [item.key, selectedPath]);
    useEffect(() => () => {
        if (resetTimer.current !== undefined)
            clearTimeout(resetTimer.current);
    }, []);
    const copyPath = () => {
        void writeClipboard(item.dirPath).then((ok) => {
            if (!ok)
                return;
            setCopied(true);
            if (resetTimer.current !== undefined)
                clearTimeout(resetTimer.current);
            resetTimer.current = setTimeout(() => setCopied(false), COPIED_RESET_MS);
        });
    };
    // Only a valid sidecar proves the market identity behind this directory; a
    // hand-placed skill has no market page to open.
    const marketId = item.managed && item.source !== 'local' ? item.id : null;
    const body = detail === null ? '' : stripSkillFrontmatter(detail.markdown);
    // The Host already bounded and extracted the raw block; parsing it here keeps
    // one metadata model for both detail pages.
    const metadata = useMemo(() => (detail?.frontmatter == null ? null : parseSkillFrontmatter(detail.frontmatter)), [detail]);
    const baseName = item.dirPath.split(/[\\/]/).pop() ?? item.dirName;
    const flatSkill = detail !== null && detail.files.length === 1 && detail.files[0]?.path === baseName;
    const installedAt = item.installedAt === undefined ? '' : formatInstalledAt(item.installedAt);
    return (_jsx(SkillDetailShell, { focusKey: item.key, onBack: props.onBack, backLabel: t('back'), avatar: _jsx(SkillAvatar, { name: item.name, source: item.source, size: 84 }), eyebrow: _jsxs(_Fragment, { children: [_jsx("span", { className: detailStyles.source, children: t(`source.${item.source}`) }), item.version !== undefined && item.version !== '' && (_jsxs(_Fragment, { children: [_jsx("span", { "aria-hidden": "true", children: "\u00B7" }), _jsxs("span", { className: detailStyles.version, children: ["v", item.version] })] }))] }), name: item.name, badges: _jsxs(_Fragment, { children: [_jsx("span", { className: `${styles.chip} ${item.managed ? styles.chipOn : ''}`, children: item.managed ? t('managedByHub') : t('unmanagedSkill') }), item.linked && _jsx("span", { className: styles.chip, children: t('symlinkSkill') })] }), summary: item.summary, notice: _jsxs("div", { className: styles.pathRow, children: [_jsx(FolderIcon, { size: 14, className: styles.pathIcon }), _jsx("span", { className: styles.pathText, title: item.dirPath, children: item.dirPath }), _jsx(Button, { variant: "ghost", size: "sm", className: styles.pathCopy, "aria-label": copied ? t('copiedPath') : t('copyPath'), onClick: copyPath, icon: copied ? _jsx(CheckIcon, { size: 14 }) : _jsx(CopyIcon, { size: 14 }), children: copied ? t('copiedPath') : t('copyPath') })] }), overviewLabel: t('overview'), filesLabel: `${t('files')} (${detail?.files.length ?? item.fileCount})`, activeTab: tab, onTabChange: setTab, overview: error !== null ? (_jsxs("div", { className: styles.failure, role: "alert", children: [_jsx("p", { className: styles.failureTitle, children: t('installedReadFailed') }), _jsx("p", { className: styles.failureText, children: error }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setRevision((value) => value + 1), children: t('retry') })] })) : detail === null ? (_jsxs("p", { className: detailStyles.muted, role: "status", "aria-live": "polite", children: [_jsx(StateDot, { state: "ongoing", size: 14 }), " ", t('loading')] })) : (_jsxs(_Fragment, { children: [metadata !== null && (_jsx("div", { className: detailStyles.frontmatter, children: _jsx(FrontmatterPanel, { data: metadata }) })), body.trim() === '' ? (_jsx("p", { className: detailStyles.muted, children: t('emptyDocument') })) : (_jsx(MarkdownView, { content: body }))] })), files: error !== null ? (_jsx("p", { className: detailStyles.muted, role: "alert", children: t('installedReadFailed') })) : (_jsx(SkillFiles, { files: detail?.files ?? [], selected: file, loading: fileLoading || detail === null, error: fileError, onSelect: (path) => {
                // Drop the previous document first: keeping it on screen while the
                // next one loads would label the old bytes with the new path.
                setFile(null);
                setSelectedPath(path);
            } })), rail: _jsxs(_Fragment, { children: [_jsxs("div", { className: detailStyles.railAction, children: [_jsx(Button, { variant: "outline", size: "md", disabled: !item.removable, title: item.removable ? t('uninstallConfirm') : t('uninstallDisabled'), icon: _jsx(TrashIcon, { size: 16 }), onClick: () => props.onUninstall(item), children: t('uninstall') }), marketId !== null && (_jsx(Button, { variant: "ghost", size: "md", icon: _jsx(ExternalLinkIcon, { size: 16 }), onClick: () => props.onOpenMarket(marketId), children: t('openInMarket') }))] }), _jsxs("dl", { className: detailStyles.facts, children: [_jsx(Fact, { label: t('sourceLabel'), children: t(`source.${item.source}`) }), item.version !== undefined && item.version !== '' && (_jsxs(Fact, { label: t('version'), children: ["v", item.version] })), installedAt !== '' && _jsx(Fact, { label: t('installedAtLabel'), children: installedAt }), detail !== null && (_jsx(Fact, { label: t('skillKind'), children: flatSkill ? t('flatSkill') : t('bundleSkill') })), _jsxs(Fact, { label: t('files'), children: [t('filesCount', { count: item.fileCount }), " \u00B7 ", fileSizeText(item.bytes)] })] }), marketId !== null && _jsx("p", { className: styles.provenance, children: t('marketProvenance') })] }) }));
}
