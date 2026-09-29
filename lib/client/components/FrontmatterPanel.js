import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useT } from "../locale-context.js";
import styles from './FrontmatterPanel.module.css';
/** Longest JSON we are willing to render inline, in characters. */
const MAX_JSON_LENGTH = 600;
/** Narrow an `unknown` frontmatter value to a plain object (arrays excluded). */
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
/** Scalar rendering for anything that is not an array, object or block string. */
function scalarText(value) {
    if (value === null || value === undefined)
        return '—';
    if (typeof value === 'string')
        return value;
    if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint')
        return String(value);
    if (typeof value === 'symbol')
        return value.description ?? 'symbol';
    if (typeof value === 'function')
        return 'fn';
    return '—';
}
/** Objects go out as JSON; a pathological value must not fill the whole rail. */
function jsonText(value) {
    try {
        const text = JSON.stringify(value, null, 2);
        if (text === undefined)
            return '—';
        return text.length > MAX_JSON_LENGTH ? `${text.slice(0, MAX_JSON_LENGTH)}…` : text;
    }
    catch {
        return '—';
    }
}
/** One value cell; the shape decides between a chip row, a code block and text. */
function ValueView({ value }) {
    if (Array.isArray(value)) {
        if (value.length === 0)
            return _jsx("span", { className: styles.text, children: "\u2014" });
        return (_jsx("span", { className: styles.chips, children: value.map((item, index) => (_jsx("span", { className: styles.chip, children: scalarText(item) }, `${String(index)}`))) }));
    }
    if (typeof value === 'boolean') {
        return _jsx("span", { className: `${styles.chip} ${value ? styles.chipOn : ''}`, children: value ? 'true' : 'false' });
    }
    if (typeof value === 'string' && value.includes('\n')) {
        return _jsx("pre", { className: styles.block, children: value });
    }
    if (isRecord(value)) {
        return _jsx("pre", { className: styles.block, children: jsonText(value) });
    }
    return _jsx("span", { className: styles.text, children: scalarText(value) });
}
/**
 * Structured view of a SKILL.md frontmatter block.
 *
 * SKILL.md metadata is data, not prose: pushing it through the markdown
 * renderer turns a dozen short fields into a wall of setext headings. It is
 * also reference material rather than the document itself, so it renders as a
 * label/value list under its own heading, with the list itself scrolling once a
 * skill declares more than a screenful of keys.
 *
 * `data` is typed `unknown`-valued on purpose — it is upstream YAML, and every
 * cell is derived defensively rather than trusted.
 */
export function FrontmatterPanel(props) {
    const { data } = props;
    const t = useT();
    const entries = Object.entries(data);
    // An empty block still returns an element: the prop is a required object, so
    // "nothing to show" must not become a `null` return.
    if (entries.length === 0)
        return _jsx(_Fragment, {});
    return (_jsxs("section", { className: styles.panel, children: [_jsxs("div", { className: styles.head, children: [_jsx("h3", { className: styles.title, children: t('frontmatter') }), _jsx("span", { className: styles.count, children: entries.length })] }), _jsx("dl", { className: styles.list, children: entries.map(([key, value]) => (_jsxs("div", { className: styles.row, children: [_jsx("dt", { className: styles.key, title: key, children: key }), _jsx("dd", { className: styles.value, children: _jsx(ValueView, { value: value }) })] }, key))) })] }));
}
