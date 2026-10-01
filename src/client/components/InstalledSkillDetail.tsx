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
  Chip,
  DetailColumns,
  InfoRow,
  SideCard,
  SkillDetailShell,
  TabCount,
  detailStyles,
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
  onOpenMarket: (id: string, owner?: string) => void
}): JSX.Element {
  const { item } = props
  const t = useT()
  const [detail, setDetail] = useState<LocalSkillDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [revision, setRevision] = useState(0)
  const [tab, setTab] = useState<'overview' | 'files'>('overview')
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

  const fileCount = detail?.files.length ?? item.fileCount
  const sourceName = item.source === 'local' ? t('localSkill') : t(`source.${item.source}`)

  return (
    <SkillDetailShell
      focusKey={item.key}
      onBack={props.onBack}
      backLabel={t('installedTitle')}
      avatar={<SkillAvatar name={item.name} source={item.source} size={72} />}
      name={item.name}
      version={item.version}
      meta={
        <>
          <span>{sourceName}</span>
          {installedAt !== '' && <span>{t('installedOn', { date: installedAt })}</span>}
          <span>
            {t('filesCount', { count: item.fileCount })} · {fileSizeText(item.bytes)}
          </span>
        </>
      }
      summary={item.summary}
      chips={
        <>
          <Chip tone={item.managed ? 'blue' : 'plain'}>{item.managed ? t('managedByHub') : t('unmanagedSkill')}</Chip>
          {item.linked && <Chip>{t('symlinkSkill')}</Chip>}
          {detail !== null && <Chip>{flatSkill ? t('flatSkill') : t('bundleSkill')}</Chip>}
        </>
      }
      actions={
        <>
          {marketId !== null && (
            <button
              type="button"
              className={detailStyles.secondaryButton}
              onClick={() => props.onOpenMarket(marketId, item.owner)}
            >
              {t('openInMarket')}
              <ExternalLinkIcon size={14} />
            </button>
          )}
          <button
            type="button"
            className={detailStyles.secondaryButton}
            disabled={!item.removable}
            title={item.removable ? t('uninstallConfirm') : t('uninstallDisabled')}
            onClick={() => props.onUninstall(item)}
          >
            <TrashIcon size={14} />
            {t('uninstall')}
          </button>
        </>
      }
      tabs={[
        { key: 'overview', label: t('overview') },
        { key: 'files', label: t('files'), badge: <TabCount value={fileCount} /> },
      ]}
      activeTab={tab}
      onTabChange={setTab}
      notice={
        <div className={styles.pathRow}>
          <FolderIcon size={14} className={styles.pathIcon} />
          <span className={styles.pathText} title={item.dirPath}>
            {item.dirPath}
          </span>
          <button
            type="button"
            className={styles.pathCopy}
            aria-label={copied ? t('copiedPath') : t('copyPath')}
            onClick={copyPath}
          >
            {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
            {copied ? t('copiedPath') : t('copyPath')}
          </button>
        </div>
      }
    >
      {tab === 'overview' && (
        <DetailColumns
          main={
            <section className={detailStyles.card}>
              {error !== null ? (
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
                  <header className={styles.docHeader}>
                    <span className={detailStyles.mono}>SKILL.md</span>
                  </header>
                  {/* Same shape as the market page: the document as prose, its
                      metadata as structure. The raw YAML stays reachable in the
                      Files tab's source view. */}
                  {body.trim() === '' ? (
                    <p className={detailStyles.muted}>{t('emptyDocument')}</p>
                  ) : (
                    <MarkdownView content={body} />
                  )}
                  {metadata !== null && (
                    <div className={detailStyles.frontmatter}>
                      <FrontmatterPanel data={metadata} />
                    </div>
                  )}
                </>
              )}
            </section>
          }
          side={
            <SideCard title={t('info')}>
              <dl className={detailStyles.info}>
                <InfoRow label={t('sourceLabel')} value={sourceName} />
                {item.version !== undefined && item.version !== '' && (
                  <InfoRow label={t('version')} value={`v${item.version}`} mono />
                )}
                {installedAt !== '' && <InfoRow label={t('installedAtLabel')} value={installedAt} />}
                {detail !== null && <InfoRow label={t('skillKind')} value={flatSkill ? t('flatSkill') : t('bundleSkill')} />}
                <InfoRow label={t('files')} value={`${t('filesCount', { count: item.fileCount })} · ${fileSizeText(item.bytes)}`} />
              </dl>
              {marketId !== null && <p className={styles.provenance}>{t('marketProvenance')}</p>}
            </SideCard>
          }
        />
      )}

      {tab === 'files' && (
        <section className={detailStyles.card}>
          {error !== null ? (
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
          )}
        </section>
      )}
    </SkillDetailShell>
  )
}
