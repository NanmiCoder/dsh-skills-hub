import { MarkdownView } from './MarkdownView.tsx'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import {
  Button,
  CodeBlock,
  SegmentedTabs,
  StateDot,
  fileSizeText,
  writeClipboard,
  type SegmentedTab,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { MarketFileMeta, NormalizedSkillDetail } from '../../market/types.ts'
import type { MarketController, MarketState } from '../state.ts'
import { useT } from '../locale-context.tsx'
import { AlertIcon, ArrowLeftIcon, CheckIcon, CopyIcon, DownloadIcon, FileIcon, TrashIcon } from '../icons.tsx'
import { FrontmatterPanel } from './FrontmatterPanel.tsx'
import { InstallStateBadge } from './InstallStateBadge.tsx'
import { SecurityBadge } from './SecurityBadge.tsx'
import { SkillAvatar } from './SkillAvatar.tsx'
import styles from './SkillDetailView.module.css'

/** How long the copy button stays in its confirmed state. */
const COPIED_RESET_MS = 2_000

/** Stable DOM ids for the tab list and its panels; one detail view is mounted at a time. */
const TAB_ID = 'skills-hub-detail-tab'
const PANEL_ID = 'skills-hub-detail-panel'

/** Compact counts, matching the catalogue cards. */
function formatCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`
  return String(value)
}

/** Upstream timestamps are epoch millis; an unparseable one renders as nothing. */
function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString()
}

/**
 * A report link is only rendered for an absolute http(s) URL: the value comes
 * from an upstream catalogue, and `javascript:` in an `href` would execute in
 * the DSH page.
 */
function safeReportUrl(url: string | undefined): string | undefined {
  return url !== undefined && /^https?:\/\//i.test(url) ? url : undefined
}

/** One label/value row of the right-hand facts rail. */
function Fact(props: { label: string; children: ReactNode }): JSX.Element {
  return (
    <div className={styles.fact}>
      <dt className={styles.factLabel}>{props.label}</dt>
      <dd className={styles.factValue}>{props.children}</dd>
    </div>
  )
}

/**
 * Skill detail page.
 *
 * Like the home page this component owns no data: the tab, the selected file
 * and the file contents all live in `MarketState`, so switching tabs or
 * re-opening a skill does not lose its place.
 *
 * The bundled GFM renderer handles catalogue Markdown without relying on a
 * host renderer delegate. Raw HTML is disabled and URLs use its safe default.
 */
export function SkillDetailView(props: {
  detail: NormalizedSkillDetail
  state: MarketState
  controller: MarketController
}): JSX.Element {
  const { detail, state, controller } = props
  const t = useT()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const [copied, setCopied] = useState(false)
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // The list is replaced by this page without a route change, so focus has to
  // be moved by hand or a keyboard user is left at the top of the document.
  useEffect(() => {
    headingRef.current?.focus()
  }, [detail.id])

  useEffect(() => () => {
    if (resetTimer.current !== undefined) clearTimeout(resetTimer.current)
  }, [])

  const copyFile = useCallback((): void => {
    const content = state.file?.content
    if (content === undefined) return
    void writeClipboard(content).then((ok) => {
      if (!ok) return
      setCopied(true)
      if (resetTimer.current !== undefined) clearTimeout(resetTimer.current)
      resetTimer.current = setTimeout(() => setCopied(false), COPIED_RESET_MS)
    })
  }, [state.file])

  const tabs: [SegmentedTab<'overview' | 'files'>, ...SegmentedTab<'overview' | 'files'>[]] = [
    { value: 'overview', label: t('overview'), id: `${TAB_ID}-overview`, panelId: `${PANEL_ID}-overview` },
    {
      value: 'files',
      label: `${t('files')} (${detail.files.length})`,
      id: `${TAB_ID}-files`,
      panelId: `${PANEL_ID}-files`,
    },
  ]

  const installationInFlight = state.installingIds.has(detail.id)
  const author = detail.author.displayName ?? detail.author.handle
  const file = state.file
  const selectedPath = file?.path ?? null

  const selectFile = (meta: MarketFileMeta): void => {
    if (meta.path === selectedPath) return
    void controller.selectFile(meta.path)
  }

  return (
    <div className={styles.detail}>
      <div className={styles.back}>
        <Button variant="ghost" size="sm" icon={<ArrowLeftIcon size={16} />} onClick={() => controller.closeDetail()}>
          {t('back')}
        </Button>
      </div>

      <header className={styles.header}>
        <SkillAvatar name={detail.name} source={detail.source} iconUrl={detail.iconUrl} size={84} />
        <div className={styles.headerText}>
          <p className={styles.eyebrow}>
            <span className={styles.source}>{t(`source.${detail.source}`)}</span>
            {detail.version !== undefined && detail.version !== '' && (
              <>
                <span aria-hidden="true">·</span>
                <span className={styles.version}>v{detail.version}</span>
              </>
            )}
          </p>
          <h1 ref={headingRef} tabIndex={-1} className={styles.name}>
            {detail.name}
          </h1>
          <div className={styles.badges}>
            <SecurityBadge status={detail.securityStatus} reports={detail.securityReports} />
            <InstallStateBadge state={detail.installState} />
          </div>
          {detail.summary !== '' && <p className={styles.summary}>{detail.summary}</p>}
        </div>
      </header>

      {detail.installState === 'not-installable' && detail.notInstallableReason !== undefined && (
        <p className={styles.warning} role="note" title={detail.notInstallableReason}>
          <AlertIcon size={16} className={styles.warningIcon} />
          <span>{t('notInstallable')}</span>
        </p>
      )}

      {detail.securityReports !== undefined && detail.securityReports.length > 0 && (
        <div className={styles.reports}>
          <span className={styles.reportsLabel}>{t('security')}</span>
          {detail.securityReports.map((report) => {
            const url = safeReportUrl(report.reportUrl)
            return (
              <span key={`${report.vendor}:${report.status}`} className={styles.report}>
                <span className={styles.reportVendor}>{report.vendor}</span>
                <span className={styles.reportStatus}>{report.statusText}</span>
                {url !== undefined && (
                  <a className={styles.reportLink} href={url} target="_blank" rel="noreferrer noopener">
                    {t('viewReport')}
                  </a>
                )}
              </span>
            )
          })}
        </div>
      )}

      <div className={styles.columns}>
        <main className={styles.main}>
          <SegmentedTabs
            items={tabs}
            value={state.activeTab}
            onChange={(value) => controller.setTab(value)}
            label={detail.name}
          />

          {state.activeTab === 'overview' && (
            <section
              className={styles.panel}
              id={`${PANEL_ID}-overview`}
              role="tabpanel"
              aria-labelledby={`${TAB_ID}-overview`}
            >
              {detail.description.trim() !== '' ? (
                <MarkdownView content={detail.description} />
              ) : (
                detail.summary !== '' && <p className={styles.summary}>{detail.summary}</p>
              )}
              {detail.descriptionFrontmatter !== undefined && Object.keys(detail.descriptionFrontmatter).length > 0 && (
                <div className={styles.frontmatter}>
                  <FrontmatterPanel data={detail.descriptionFrontmatter} />
                </div>
              )}
            </section>
          )}

          {state.activeTab === 'files' && (
            <section
              className={styles.panel}
              id={`${PANEL_ID}-files`}
              role="tabpanel"
              aria-labelledby={`${TAB_ID}-files`}
            >
              {detail.files.length === 0 ? (
                <p className={styles.muted}>{t('noFiles')}</p>
              ) : (
                <div className={styles.files}>
                  <ul className={styles.fileList}>
                    {detail.files.map((meta) => {
                      const active = meta.path === selectedPath
                      return (
                        <li key={meta.path}>
                          <button
                            type="button"
                            className={`${styles.fileItem} ${active ? styles.fileItemActive : ''}`}
                            aria-current={active ? 'true' : undefined}
                            onClick={() => selectFile(meta)}
                          >
                            <FileIcon size={14} className={styles.fileIcon} />
                            <span className={styles.filePath} title={meta.path}>
                              {meta.path}
                            </span>
                            {meta.tooBig && <span className={styles.fileFlag}>{t('fileTooLarge')}</span>}
                            <span className={styles.fileMeta}>
                              {fileSizeText(meta.size)} · {meta.language}
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>

                  <div className={styles.fileView}>
                    {file === null ? (
                      state.fileLoading ? (
                        <p className={styles.muted} role="status" aria-live="polite">
                          <StateDot state="ongoing" size={14} /> {t('loading')}
                        </p>
                      ) : null
                    ) : (
                      <>
                        <div className={styles.fileBar}>
                          <span className={styles.fileBarPath} title={file.path}>
                            {file.path}
                          </span>
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
                        {file.truncated && <p className={styles.muted}>{t('fileTooLarge')}</p>}
                        <CodeBlock
                          code={file.content}
                          lang={file.language}
                          showHeader={false}
                          lineNumbers
                          copyLabel={t('copy')}
                          copiedLabel={t('copied')}
                        />
                        <p className={styles.srOnly} role="status" aria-live="polite">
                          {copied ? t('copied') : ''}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </section>
          )}
        </main>

        <aside className={styles.rail}>
          <div className={styles.railCard}>
            <div className={styles.railAction}>
              {detail.installState === 'installable' && (
                <Button
                  variant="primary"
                  size="md"
                  disabled={installationInFlight}
                  icon={<DownloadIcon size={16} />}
                  onClick={() => controller.requestInstall(detail.id)}
                >
                  {installationInFlight ? t('installing') : t('install')}
                </Button>
              )}
              {detail.installState === 'installed' && (
                <Button
                  variant="outline"
                  size="md"
                  disabled={installationInFlight}
                  title={t('uninstallConfirm')}
                  icon={<TrashIcon size={16} />}
                  onClick={() => void controller.uninstall(detail.id)}
                >
                  {t('uninstall')}
                </Button>
              )}
              {detail.installState === 'not-installable' && <p className={styles.muted}>{t('notInstallable')}</p>}
            </div>

            <dl className={styles.facts}>
              <Fact label={t('author')}>{author}</Fact>
              <Fact label={t('downloads')}>{formatCount(detail.stats.downloads)}</Fact>
              {detail.stats.installs !== undefined && <Fact label={t('installs')}>{formatCount(detail.stats.installs)}</Fact>}
              {detail.stats.stars !== undefined && <Fact label={t('stars')}>{formatCount(detail.stats.stars)}</Fact>}
              {detail.updatedAt !== undefined && <Fact label={t('updated')}>{formatDate(detail.updatedAt)}</Fact>}
              {detail.license !== undefined && detail.license !== '' && <Fact label={t('license')}>{detail.license}</Fact>}
              {detail.version !== undefined && detail.version !== '' && <Fact label={t('version')}>v{detail.version}</Fact>}
            </dl>
          </div>
        </aside>
      </div>
    </div>
  )
}

/** Keeps the detail layout stable while its network request is in flight. */
export function SkillDetailSkeleton({ onBack }: { onBack: () => void }): JSX.Element {
  const t = useT()
  return (
    <div className={styles.detail} aria-busy="true">
      <div className={styles.back}>
        <Button variant="ghost" size="sm" icon={<ArrowLeftIcon size={16} />} onClick={onBack}>{t('back')}</Button>
      </div>
      <div role="status" aria-label={t('loading')}>
        <div aria-hidden="true">
          <div className={styles.header}>
            <span className={styles.skeletonAvatar} />
            <div className={styles.headerText}>
              <span className={styles.skeletonTitle} />
              <span className={styles.skeletonLine} />
              <span className={styles.skeletonLine} />
            </div>
          </div>
          <div className={styles.columns} style={{ marginTop: 24 }}>
            <div className={styles.main}>
              <div className={styles.panel}>
                {Array.from({ length: 10 }, (_, index) => <span className={styles.skeletonLine} key={index} />)}
              </div>
            </div>
            <div className={styles.rail}>
              <div className={styles.panel}>
                {Array.from({ length: 5 }, (_, index) => <span className={styles.skeletonLine} key={index} />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
