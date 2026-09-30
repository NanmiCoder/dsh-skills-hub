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

import { useEffect, useMemo, useRef, useState } from 'react'
import { Button, StateDot, fileSizeText, writeClipboard } from '@deepseek-ai/dsh-client-ui-primitives'
import type { MarketFileContent } from '../../market/types.ts'
import {
  fetchInstalledDetail,
  fetchInstalledFile,
  isAbortError,
  type InstalledSkillDetail as LocalSkillDetail,
  type InstalledSkillRecord,
} from '../api.ts'
import { parseSkillFrontmatter, stripSkillFrontmatter } from '../skill-markdown.ts'
import { useT } from '../locale-context.tsx'
import { CheckIcon, CopyIcon, ExternalLinkIcon, FolderIcon, TrashIcon } from '../icons.tsx'
import { FrontmatterPanel } from './FrontmatterPanel.tsx'
import { MarkdownView } from './MarkdownView.tsx'
import { SkillAvatar } from './SkillAvatar.tsx'
import { SkillFiles } from './SkillFiles.tsx'
import {
  Fact,
  SkillDetailShell,
  detailStyles,
  type SkillDetailTab,
} from './SkillDetailShell.tsx'
import styles from './InstalledSkillDetail.module.css'

/** How long the path copy button stays in its confirmed state. */
const COPIED_RESET_MS = 2_000

/** Reader-facing text for anything thrown by the client. */
function messageOf(reason: unknown): string {
  return reason instanceof Error ? reason.message : String(reason)
}

/** Local install timestamps are ISO strings; an unparseable one renders as nothing. */
function formatInstalledAt(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString()
}

export function InstalledSkillDetail(props: {
  item: InstalledSkillRecord
  onBack: () => void
  onUninstall: (item: InstalledSkillRecord) => void
  /** Open the same skill's market page; only offered for market provenance. */
  onOpenMarket: (id: string) => void
}): JSX.Element {
  const { item } = props
  const t = useT()
  const [detail, setDetail] = useState<LocalSkillDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [revision, setRevision] = useState(0)
  const [tab, setTab] = useState<SkillDetailTab>('overview')
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [file, setFile] = useState<MarketFileContent | null>(null)
  const [fileLoading, setFileLoading] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    const abort = new AbortController()
    setError(null)
    void fetchInstalledDetail(item.key, abort.signal)
      .then((result) => {
        if (!abort.signal.aborted) setDetail(result)
      })
      .catch((reason: unknown) => {
        if (!abort.signal.aborted && !isAbortError(reason)) setError(messageOf(reason))
      })
    return () => abort.abort()
  }, [item.key, revision])

  // The file viewer opens on the skill document itself when the tab is first
  // used: that is what the reader came for, and it is always one of the files.
  useEffect(() => {
    if (tab !== 'files' || detail === null || selectedPath !== null) return
    const preferred =
      detail.files.find((entry) => entry.path.toLowerCase() === 'skill.md') ?? detail.files[0]
    if (preferred !== undefined) setSelectedPath(preferred.path)
  }, [tab, detail, selectedPath])

  useEffect(() => {
    if (selectedPath === null) return
    const abort = new AbortController()
    setFileLoading(true)
    setFileError(null)
    void fetchInstalledFile(item.key, selectedPath, abort.signal)
      .then((result) => {
        if (!abort.signal.aborted) setFile(result)
      })
      .catch((reason: unknown) => {
        if (abort.signal.aborted || isAbortError(reason)) return
        setFile(null)
        setFileError(messageOf(reason))
      })
      .finally(() => {
        if (!abort.signal.aborted) setFileLoading(false)
      })
    return () => abort.abort()
  }, [item.key, selectedPath])

  useEffect(() => () => {
    if (resetTimer.current !== undefined) clearTimeout(resetTimer.current)
  }, [])

  const copyPath = (): void => {
    void writeClipboard(item.dirPath).then((ok) => {
      if (!ok) return
      setCopied(true)
      if (resetTimer.current !== undefined) clearTimeout(resetTimer.current)
      resetTimer.current = setTimeout(() => setCopied(false), COPIED_RESET_MS)
    })
  }

  // Only a valid sidecar proves the market identity behind this directory; a
  // hand-placed skill has no market page to open.
  const marketId = item.managed && item.source !== 'local' ? item.id : null
  const body = detail === null ? '' : stripSkillFrontmatter(detail.markdown)
  // The Host already bounded and extracted the raw block; parsing it here keeps
  // one metadata model for both detail pages.
  const metadata = useMemo(
    () => (detail?.frontmatter == null ? null : parseSkillFrontmatter(detail.frontmatter)),
    [detail],
  )
  const baseName = item.dirPath.split(/[\\/]/).pop() ?? item.dirName
  const flatSkill =
    detail !== null && detail.files.length === 1 && detail.files[0]?.path === baseName
  const installedAt = item.installedAt === undefined ? '' : formatInstalledAt(item.installedAt)

  return (
    <SkillDetailShell
      focusKey={item.key}
      onBack={props.onBack}
      backLabel={t('back')}
      avatar={<SkillAvatar name={item.name} source={item.source} size={84} />}
      eyebrow={
        <>
          <span className={detailStyles.source}>{t(`source.${item.source}`)}</span>
          {item.version !== undefined && item.version !== '' && (
            <>
              <span aria-hidden="true">·</span>
              <span className={detailStyles.version}>v{item.version}</span>
            </>
          )}
        </>
      }
      name={item.name}
      badges={
        <>
          <span className={`${styles.chip} ${item.managed ? styles.chipOn : ''}`}>
            {item.managed ? t('managedByHub') : t('unmanagedSkill')}
          </span>
          {item.linked && <span className={styles.chip}>{t('symlinkSkill')}</span>}
        </>
      }
      summary={item.summary}
      notice={
        <div className={styles.pathRow}>
          <FolderIcon size={14} className={styles.pathIcon} />
          <span className={styles.pathText} title={item.dirPath}>
            {item.dirPath}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className={styles.pathCopy}
            aria-label={copied ? t('copiedPath') : t('copyPath')}
            onClick={copyPath}
            icon={copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
          >
            {copied ? t('copiedPath') : t('copyPath')}
          </Button>
        </div>
      }
      overviewLabel={t('overview')}
      filesLabel={`${t('files')} (${detail?.files.length ?? item.fileCount})`}
      activeTab={tab}
      onTabChange={setTab}
      overview={
        error !== null ? (
          <div className={styles.failure} role="alert">
            <p className={styles.failureTitle}>{t('installedReadFailed')}</p>
            <p className={styles.failureText}>{error}</p>
            <Button variant="outline" size="sm" onClick={() => setRevision((value) => value + 1)}>
              {t('retry')}
            </Button>
          </div>
        ) : detail === null ? (
          <p className={detailStyles.muted} role="status" aria-live="polite">
            <StateDot state="ongoing" size={14} /> {t('loading')}
          </p>
        ) : (
          <>
            {/* Same shape as the market page's overview: metadata as structure,
                the document as prose. The raw YAML block stays reachable in the
                Files tab's source view. */}
            {metadata !== null && (
              <div className={detailStyles.frontmatter}>
                <FrontmatterPanel data={metadata} />
              </div>
            )}
            {body.trim() === '' ? (
              <p className={detailStyles.muted}>{t('emptyDocument')}</p>
            ) : (
              <MarkdownView content={body} />
            )}
          </>
        )
      }
      files={
        error !== null ? (
          <p className={detailStyles.muted} role="alert">
            {t('installedReadFailed')}
          </p>
        ) : (
          <SkillFiles
            files={detail?.files ?? []}
            selected={file}
            loading={fileLoading || detail === null}
            error={fileError}
            onSelect={(path) => {
              // Drop the previous document first: keeping it on screen while the
              // next one loads would label the old bytes with the new path.
              setFile(null)
              setSelectedPath(path)
            }}
          />
        )
      }
      rail={
        <>
          <div className={detailStyles.railAction}>
            <Button
              variant="outline"
              size="md"
              disabled={!item.removable}
              title={item.removable ? t('uninstallConfirm') : t('uninstallDisabled')}
              icon={<TrashIcon size={16} />}
              onClick={() => props.onUninstall(item)}
            >
              {t('uninstall')}
            </Button>
            {marketId !== null && (
              <Button
                variant="ghost"
                size="md"
                icon={<ExternalLinkIcon size={16} />}
                onClick={() => props.onOpenMarket(marketId)}
              >
                {t('openInMarket')}
              </Button>
            )}
          </div>

          <dl className={detailStyles.facts}>
            <Fact label={t('sourceLabel')}>{t(`source.${item.source}`)}</Fact>
            {item.version !== undefined && item.version !== '' && (
              <Fact label={t('version')}>v{item.version}</Fact>
            )}
            {installedAt !== '' && <Fact label={t('installedAtLabel')}>{installedAt}</Fact>}
            {detail !== null && (
              <Fact label={t('skillKind')}>{flatSkill ? t('flatSkill') : t('bundleSkill')}</Fact>
            )}
            <Fact label={t('files')}>
              {t('filesCount', { count: item.fileCount })} · {fileSizeText(item.bytes)}
            </Fact>
          </dl>

          {marketId !== null && <p className={styles.provenance}>{t('marketProvenance')}</p>}
        </>
      }
    />
  )
}
