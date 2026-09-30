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

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button, CodeBlock, StateDot, fileSizeText, writeClipboard } from '@deepseek-ai/dsh-client-ui-primitives'
import type { MarketFileContent } from '../../market/types.ts'
import { useT } from '../locale-context.tsx'
import { AlertIcon, CheckIcon, CopyIcon, FileIcon } from '../icons.tsx'
import { splitSkillFrontmatter } from '../skill-markdown.ts'
import { FrontmatterPanel } from './FrontmatterPanel.tsx'
import { MarkdownView } from './MarkdownView.tsx'
import { detailStyles as styles } from './SkillDetailShell.tsx'

/** How long the copy button stays in its confirmed state. */
const COPIED_RESET_MS = 2_000

/** The subset of a file row this control renders; both pages' metadata fits it. */
export interface SkillFileListItem {
  path: string
  size: number
  language: string
  /** Provider flagged the file as beyond the preview/install limit. */
  tooBig?: boolean
}

/** How a markdown document is shown; every other file only has `source`. */
type FileViewMode = 'preview' | 'source'

/**
 * A rendered markdown document: its metadata as structure, its body as prose.
 *
 * The split matters more than it looks: handed to the renderer, the closing
 * `---` of the frontmatter turns the whole block into one setext heading.
 */
function MarkdownFilePreview({ content }: { content: string }): JSX.Element {
  const split = useMemo(() => splitSkillFrontmatter(content), [content])
  return (
    <div className={styles.markdown}>
      {split.frontmatter !== null && (
        <div className={styles.frontmatter}>
          <FrontmatterPanel data={split.frontmatter} />
        </div>
      )}
      <MarkdownView content={split.body} />
    </div>
  )
}

export function SkillFiles(props: {
  files: SkillFileListItem[]
  /** Already-fetched document for the selected path, or `null` while none is loaded. */
  selected: MarketFileContent | null
  loading: boolean
  /** Reader-facing failure of the last selection, if any. */
  error?: string | null
  onSelect: (path: string) => void
}): JSX.Element {
  const { files, selected, loading, error = null, onSelect } = props
  const t = useT()
  const [copied, setCopied] = useState(false)
  const [mode, setMode] = useState<FileViewMode>('preview')
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => {
    if (resetTimer.current !== undefined) clearTimeout(resetTimer.current)
  }, [])

  const selectedPath = selected?.path ?? null
  /** Only markdown has a rendered form; a toggle on a script or a JSON file would be a lie. */
  const renderable = selected !== null && selected.language === 'markdown'

  // Opening another file starts from the rendered form again: the toggle is a
  // property of looking at *this* document, not a sticky preference.
  useEffect(() => {
    setMode('preview')
  }, [selectedPath])

  const copyFile = useCallback((): void => {
    const content = selected?.content
    if (content === undefined) return
    void writeClipboard(content).then((ok) => {
      if (!ok) return
      setCopied(true)
      if (resetTimer.current !== undefined) clearTimeout(resetTimer.current)
      resetTimer.current = setTimeout(() => setCopied(false), COPIED_RESET_MS)
    })
  }, [selected])

  // An empty list is also what the local page sees while its inventory is still
  // in flight, so the pending state has to be answered before "no files".
  if (files.length === 0) {
    return loading ? (
      <p className={styles.muted} role="status" aria-live="polite">
        <StateDot state="ongoing" size={14} /> {t('loading')}
      </p>
    ) : (
      <p className={styles.muted}>{t('noFiles')}</p>
    )
  }

  return (
    <div className={styles.files}>
      <ul className={styles.fileList}>
        {files.map((meta) => {
          const active = meta.path === selectedPath
          return (
            <li key={meta.path}>
              <button
                type="button"
                className={`${styles.fileItem} ${active ? styles.fileItemActive : ''}`}
                aria-current={active ? 'true' : undefined}
                onClick={() => onSelect(meta.path)}
              >
                <FileIcon size={14} className={styles.fileIcon} />
                <span className={styles.filePath} title={meta.path}>
                  {meta.path}
                </span>
                {meta.tooBig === true && <span className={styles.fileFlag}>{t('fileTooLarge')}</span>}
                <span className={styles.fileMeta}>
                  {fileSizeText(meta.size)} · {meta.language}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <div className={styles.fileView}>
        {error !== null ? (
          <p className={styles.muted} role="alert">
            <AlertIcon size={14} /> {error}
          </p>
        ) : selected === null ? (
          loading ? (
            <p className={styles.muted} role="status" aria-live="polite">
              <StateDot state="ongoing" size={14} /> {t('loading')}
            </p>
          ) : null
        ) : (
          <>
            <div className={styles.fileBar}>
              <span className={styles.fileBarPath} title={selected.path}>
                {selected.path}
              </span>
              {renderable && (
                <div className={styles.viewToggle} role="group" aria-label={t('fileView')}>
                  <button type="button" aria-pressed={mode === 'preview'} onClick={() => setMode('preview')}>
                    {t('filePreview')}
                  </button>
                  <button type="button" aria-pressed={mode === 'source'} onClick={() => setMode('source')}>
                    {t('fileSource')}
                  </button>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                className={styles.copy}
                aria-label={copied ? t('copied') : t('copy')}
                onClick={copyFile}
                icon={copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
              >
                {copied ? t('copied') : t('copy')}
              </Button>
            </div>
            {selected.truncated && <p className={styles.muted}>{t('fileTruncated')}</p>}
            {renderable && mode === 'preview' ? (
              <MarkdownFilePreview content={selected.content} />
            ) : (
              <CodeBlock
                code={selected.content}
                lang={selected.language}
                showHeader={false}
                lineNumbers
                copyLabel={t('copy')}
                copiedLabel={t('copied')}
              />
            )}
            <p className={styles.srOnly} role="status" aria-live="polite">
              {copied ? t('copied') : ''}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
