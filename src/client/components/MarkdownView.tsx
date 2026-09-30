import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import styles from './SkillDetailShell.module.css'

/**
 * Self-contained GFM rendering for untrusted marketplace and local skill docs.
 *
 * Raw HTML is skipped and external links are opened with `noopener noreferrer`;
 * the typography lives in the detail shell so a rendered document looks the same
 * in the overview tab and in the file viewer.
 */
export function MarkdownView({ content }: { content: string }): JSX.Element {
  return (
    <div className={styles.markdown}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        components={{ a: ({ children, node: _node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer">{children}</a> }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
