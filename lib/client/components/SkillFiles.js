import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Files tab body, shared by the two detail pages.
 *
 * The market page lists provider file metadata and the local page lists the
 * bytes on disk, but both are the same control: a picker on the left, one
 * document on the right, and a copy button that confirms itself. The only
 * difference the caller keeps is how a selection is fetched.
 *
 * A markdown document opens *rendered*: SKILL.md is prose meant to be read, and
 * showing its source first answers a question nobody asked. Installing still has
 * to be a trust decision, though, so the raw bytes are one toggle away — with
 * line numbers and the copy button pointed at exactly what is on disk. Other
 * files have no rendered form and stay source-only.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, CodeBlock, StateDot, fileSizeText, writeClipboard } from '@deepseek-ai/dsh-client-ui-primitives';
import { useT } from "../locale-context.js";
import { AlertIcon, CheckIcon, CopyIcon, FileIcon } from "../icons.js";
import { splitSkillFrontmatter } from "../skill-markdown.js";
import { FrontmatterPanel } from "./FrontmatterPanel.js";
import { MarkdownView } from "./MarkdownView.js";
import { detailStyles as styles } from "./SkillDetailShell.js";
/** How long the copy button stays in its confirmed state. */
const COPIED_RESET_MS = 2_000;
/**
 * A rendered markdown document: its metadata as structure, its body as prose.
 *
 * The split matters more than it looks: handed to the renderer, the closing
 * `---` of the frontmatter turns the whole block into one setext heading.
 */
function MarkdownFilePreview({ content }) {
    const split = useMemo(() => splitSkillFrontmatter(content), [content]);
    return (_jsxs("div", { className: styles.markdown, children: [split.frontmatter !== null && (_jsx("div", { className: styles.frontmatter, children: _jsx(FrontmatterPanel, { data: split.frontmatter }) })), _jsx(MarkdownView, { content: split.body })] }));
}
export function SkillFiles(props) {
    const { files, selected, loading, error = null, onSelect } = props;
    const t = useT();
    const [copied, setCopied] = useState(false);
    const [mode, setMode] = useState('preview');
    const resetTimer = useRef(undefined);
    useEffect(() => () => {
        if (resetTimer.current !== undefined)
            clearTimeout(resetTimer.current);
    }, []);
    const selectedPath = selected?.path ?? null;
    /** Only markdown has a rendered form; a toggle on a script or a JSON file would be a lie. */
    const renderable = selected !== null && selected.language === 'markdown';
    // Opening another file starts from the rendered form again: the toggle is a
    // property of looking at *this* document, not a sticky preference.
    useEffect(() => {
        setMode('preview');
    }, [selectedPath]);
    const copyFile = useCallback(() => {
        const content = selected?.content;
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
    }, [selected]);
    // An empty list is also what the local page sees while its inventory is still
    // in flight, so the pending state has to be answered before "no files".
    if (files.length === 0) {
        return loading ? (_jsxs("p", { className: styles.muted, role: "status", "aria-live": "polite", children: [_jsx(StateDot, { state: "ongoing", size: 14 }), " ", t('loading')] })) : (_jsx("p", { className: styles.muted, children: t('noFiles') }));
    }
    return (_jsxs("div", { className: styles.files, children: [_jsx("ul", { className: styles.fileList, children: files.map((meta) => {
                    const active = meta.path === selectedPath;
                    return (_jsx("li", { children: _jsxs("button", { type: "button", className: `${styles.fileItem} ${active ? styles.fileItemActive : ''}`, "aria-current": active ? 'true' : undefined, onClick: () => onSelect(meta.path), children: [_jsx(FileIcon, { size: 14, className: styles.fileIcon }), _jsx("span", { className: styles.filePath, title: meta.path, children: meta.path }), meta.tooBig === true && _jsx("span", { className: styles.fileFlag, children: t('fileTooLarge') }), _jsxs("span", { className: styles.fileMeta, children: [fileSizeText(meta.size), " \u00B7 ", meta.language] })] }) }, meta.path));
                }) }), _jsx("div", { className: styles.fileView, children: error !== null ? (_jsxs("p", { className: styles.muted, role: "alert", children: [_jsx(AlertIcon, { size: 14 }), " ", error] })) : selected === null ? (loading ? (_jsxs("p", { className: styles.muted, role: "status", "aria-live": "polite", children: [_jsx(StateDot, { state: "ongoing", size: 14 }), " ", t('loading')] })) : null) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: styles.fileBar, children: [_jsx("span", { className: styles.fileBarPath, title: selected.path, children: selected.path }), renderable && (_jsxs("div", { className: styles.viewToggle, role: "group", "aria-label": t('fileView'), children: [_jsx("button", { type: "button", "aria-pressed": mode === 'preview', onClick: () => setMode('preview'), children: t('filePreview') }), _jsx("button", { type: "button", "aria-pressed": mode === 'source', onClick: () => setMode('source'), children: t('fileSource') })] })), _jsx(Button, { variant: "outline", size: "sm", className: styles.copy, "aria-label": copied ? t('copied') : t('copy'), onClick: copyFile, icon: copied ? _jsx(CheckIcon, { size: 14 }) : _jsx(CopyIcon, { size: 14 }), children: copied ? t('copied') : t('copy') })] }), selected.truncated && _jsx("p", { className: styles.muted, children: t('fileTruncated') }), renderable && mode === 'preview' ? (_jsx(MarkdownFilePreview, { content: selected.content })) : (_jsx(CodeBlock, { code: selected.content, lang: selected.language, showHeader: false, lineNumbers: true, copyLabel: t('copy'), copiedLabel: t('copied') })), _jsx("p", { className: styles.srOnly, role: "status", "aria-live": "polite", children: copied ? t('copied') : '' })] })) })] }));
}
