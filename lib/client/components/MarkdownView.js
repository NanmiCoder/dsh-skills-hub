import { jsx as _jsx } from "react/jsx-runtime";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './SkillDetailView.module.css';
/** Self-contained GFM rendering for untrusted marketplace and local skill docs. */
export function MarkdownView({ content }) {
    return (_jsx("div", { className: styles.markdown, children: _jsx(ReactMarkdown, { remarkPlugins: [remarkGfm], skipHtml: true, components: { a: ({ children, node: _node, ...props }) => _jsx("a", { ...props, target: "_blank", rel: "noopener noreferrer", children: children }) }, children: content }) }));
}
