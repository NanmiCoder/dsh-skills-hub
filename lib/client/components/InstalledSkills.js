import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Button, Modal } from '@deepseek-ai/dsh-client-ui-primitives';
import { fetchInstalled, fetchInstalledDetail, removeInstalled, isAbortError } from "../api.js";
import { stripSkillFrontmatter } from "../skill-markdown.js";
import { MarkdownView } from "./MarkdownView.js";
import { useT } from "../locale-context.js";
import styles from './InstalledSkills.module.css';
export function InstalledSkills({ onChanged }) {
    const t = useT();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [query, setQuery] = useState('');
    const [revision, setRevision] = useState(0);
    const [selected, setSelected] = useState(null);
    const [markdown, setMarkdown] = useState(null);
    const [detailError, setDetailError] = useState(null);
    const [pending, setPending] = useState(null);
    const [busy, setBusy] = useState(false);
    useEffect(() => {
        const abort = new AbortController();
        setLoading(true);
        setError(null);
        void fetchInstalled(abort.signal).then(result => { if (!abort.signal.aborted)
            setItems(result); }).catch(reason => {
            if (!abort.signal.aborted && !isAbortError(reason))
                setError(String(reason.message ?? reason));
        }).finally(() => { if (!abort.signal.aborted)
            setLoading(false); });
        return () => abort.abort();
    }, [revision]);
    useEffect(() => {
        setMarkdown(null);
        setDetailError(null);
        if (!selected)
            return;
        const abort = new AbortController();
        void fetchInstalledDetail(selected.key, abort.signal).then(result => { if (!abort.signal.aborted)
            setMarkdown(stripSkillFrontmatter(result.markdown)); }).catch(reason => {
            if (!abort.signal.aborted && !isAbortError(reason))
                setDetailError(String(reason.message ?? reason));
        });
        return () => abort.abort();
    }, [selected]);
    async function uninstall() {
        if (!pending || busy)
            return;
        setBusy(true);
        setError(null);
        try {
            await removeInstalled(pending.key);
            setItems(current => current.filter(item => item.key !== pending.key));
            if (selected?.key === pending.key)
                setSelected(null);
            setPending(null);
            onChanged();
        }
        catch (reason) {
            setError(reason instanceof Error ? reason.message : String(reason));
            setPending(null);
        }
        finally {
            setBusy(false);
        }
    }
    const needle = query.trim().toLocaleLowerCase();
    const visible = items.filter(item => `${item.name} ${item.summary ?? ''} ${item.dirPath}`.toLocaleLowerCase().includes(needle));
    return _jsxs("section", { className: styles.root, children: [_jsxs("header", { className: styles.header, children: [_jsxs("div", { children: [_jsx("h1", { children: t('installedTitle') }), _jsx("p", { children: t('installedScope') })] }), _jsx(Button, { variant: "outline", size: "sm", disabled: loading, onClick: () => setRevision(value => value + 1), children: t('refreshInstalled') })] }), _jsx("input", { className: styles.search, type: "search", "aria-label": t('installedSearch'), placeholder: t('installedSearch'), value: query, onChange: event => setQuery(event.target.value) }), error && _jsx("p", { role: "alert", className: styles.error, children: error }), loading ? _jsx("div", { role: "status", "aria-label": t('loading'), className: styles.list, children: Array.from({ length: 5 }, (_, index) => _jsx("div", { className: styles.skeleton }, index)) }) : _jsxs(_Fragment, { children: [_jsx("p", { className: styles.count, children: t('count', { count: visible.length }) }), visible.length === 0 ? _jsx("p", { className: styles.empty, children: t(items.length === 0 ? 'installedEmpty' : 'emptySearch') }) : _jsx("div", { className: styles.list, children: visible.map(item => _jsxs("article", { className: styles.card, children: [_jsxs("div", { className: styles.info, children: [_jsx("button", { className: styles.name, onClick: () => setSelected(item), children: item.name }), _jsx("span", { className: styles.badge, children: item.source === 'local' ? t('localSkill') : t(`source.${item.source}`) }), item.linked && _jsx("span", { className: styles.badge, children: t('linkedSkill') }), item.version && _jsxs("span", { className: styles.version, children: ["v", item.version] }), item.summary && _jsx("p", { className: styles.summary, children: item.summary }), _jsx("p", { className: styles.path, children: item.dirPath })] }), _jsxs("div", { className: styles.actions, children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => setSelected(item), children: t('viewInstalled') }), _jsx(Button, { variant: "outline", size: "sm", disabled: !item.removable, onClick: () => setPending(item), children: t('uninstall') })] })] }, item.key)) })] }), selected && _jsxs(Modal, { open: true, title: selected.name, closeLabel: t('close'), onClose: () => setSelected(null), children: [_jsx("p", { className: styles.path, children: selected.dirPath }), _jsx("div", { className: styles.preview, children: detailError ? _jsx("p", { role: "alert", children: detailError }) : markdown === null ? _jsxs("div", { role: "status", "aria-label": t('loading'), children: [_jsx("div", { className: styles.skeleton }), _jsx("div", { className: styles.skeleton })] }) : _jsx(MarkdownView, { content: markdown }) })] }), pending && _jsx(Modal, { open: true, title: t('uninstallTitle', { name: pending.name }), closeLabel: t('close'), description: t(pending.linked ? 'unlinkDescription' : 'localUninstallDescription'), onClose: () => { if (!busy)
                    setPending(null); }, footer: _jsxs("div", { className: styles.actions, children: [_jsx(Button, { variant: "outline", size: "md", disabled: busy, onClick: () => setPending(null), children: t('cancel') }), _jsx(Button, { variant: "primary", size: "md", disabled: busy, onClick: () => void uninstall(), children: t(busy ? 'uninstalling' : 'uninstallConfirm') })] }), children: _jsx("p", { className: styles.path, children: pending.dirPath }) })] });
}
