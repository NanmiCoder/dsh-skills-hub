import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { NormalizedSkillDetail, SecurityReport } from '../../market/types.ts'
import type { MarketController, MarketDetailTab, MarketState } from '../state.ts'
import { useT, type Translate } from '../locale-context.tsx'
import { AlertIcon, CheckIcon, DownloadIcon, ExternalLinkIcon, TrashIcon } from '../icons.tsx'
import { formatAge, formatStamp } from '../relative-time.ts'
import { detectCapabilities, extractTriggers, readingMinutes, type Capability } from '../skill-insights.ts'
import { MarkdownView } from './MarkdownView.tsx'
import { FrontmatterPanel } from './FrontmatterPanel.tsx'
import { SkillAvatar } from './SkillAvatar.tsx'
import { SkillFiles } from './SkillFiles.tsx'
import {
  Chip,
  DetailColumns,
  InfoRow,
  SecurityChip,
  SideCard,
  SkillDetailShell,
  TabCount,
  detailStyles as shell,
  type DetailTab,
} from './SkillDetailShell.tsx'
import styles from './MarketSkillDetail.module.css'

/** Compact counts: 482069 → 482.1k. */
export function formatCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`
  return String(value)
}

/** Upstream timestamps are epoch millis; render as an ISO date (stable across locales). */
export function formatDate(timestamp: number | undefined): string {
  if (timestamp === undefined) return ''
  const date = new Date(timestamp)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`
  return `${bytes} B`
}

/** Only absolute http(s) links from upstream may become an `href`. */
export function safeUrl(url: string | undefined): string | undefined {
  return url !== undefined && /^https?:\/\//i.test(url) ? url : undefined
}

/** One capability, phrased with its evidence. */
export function capabilityText(t: Translate, capability: Capability): { title: string; detail: string } {
  const evidence = capability.evidence.join(capability.kind === 'shell' ? ' / ' : '、')
  return {
    title: t(`cap.${capability.kind}`),
    detail: t(`cap.${capability.kind}.detail`, { evidence }),
  }
}

/** Capabilities and triggers, derived once per detail. */
export function useSkillInsights(detail: NormalizedSkillDetail): { capabilities: Capability[]; triggers: string[] } {
  return useMemo(() => {
    const description = detail.descriptionFrontmatter?.['description']
    return {
      capabilities: detectCapabilities({
        markdown: detail.description,
        frontmatter: detail.descriptionFrontmatter,
        files: detail.files,
      }),
      triggers: extractTriggers(typeof description === 'string' ? description : undefined),
    }
  }, [detail])
}

/** Markdown taller than this starts collapsed behind "expand". */
const COLLAPSED_HEIGHT = 720

function SkillDocument(props: { detail: NormalizedSkillDetail }): JSX.Element {
  const { detail } = props
  const t = useT()
  const bodyRef = useRef<HTMLDivElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [overflows, setOverflows] = useState(false)
  const skillMd = detail.files.find((file) => file.path === 'SKILL.md')

  useLayoutEffect(() => {
    const body = bodyRef.current
    if (body !== null) setOverflows(body.scrollHeight > COLLAPSED_HEIGHT + 80)
  }, [detail.description])
  useEffect(() => setExpanded(false), [detail.id])

  const collapsed = overflows && !expanded
  return (
    <section className={shell.card}>
      <header className={styles.docHeader}>
        <span className={shell.mono}>SKILL.md</span>
        <span>
          {skillMd !== undefined && `${formatBytes(skillMd.size)} · `}
          {t('readingTime', { minutes: readingMinutes(detail.description) })}
        </span>
      </header>
      <div ref={bodyRef} className={`${styles.docBody} ${collapsed ? styles.docCollapsed : ''}`}>
        {detail.description.trim() !== '' ? (
          <MarkdownView content={detail.description} />
        ) : (
          <p className={shell.muted}>{detail.summary}</p>
        )}
        {detail.descriptionFrontmatter !== undefined && Object.keys(detail.descriptionFrontmatter).length > 0 && (
          <div className={styles.frontmatter}>
            <FrontmatterPanel data={detail.descriptionFrontmatter} />
          </div>
        )}
      </div>
      {overflows && (
        <button type="button" className={styles.expand} onClick={() => setExpanded((value) => !value)}>
          {expanded ? t('collapse') : t('expand')}
        </button>
      )}
    </section>
  )
}

function CapabilityPanel(props: { capabilities: Capability[]; onReport: () => void }): JSX.Element {
  const t = useT()
  return (
    <section className={styles.capabilities} aria-labelledby="skills-hub-capabilities">
      <header className={styles.capHeader}>
        <h2 id="skills-hub-capabilities" className={styles.capTitle}>
          <AlertIcon size={18} />
          {t('capTitle')}
        </h2>
        <button type="button" className={`${shell.linkButton} ${styles.capLink}`} onClick={props.onReport}>
          {t('viewFullReport')}
        </button>
      </header>
      <ul className={styles.capGrid}>
        {props.capabilities.map((capability) => {
          const text = capabilityText(t, capability)
          return (
            <li key={capability.kind} className={styles.capCard}>
              <strong>{text.title}</strong>
              <span>{text.detail}</span>
            </li>
          )
        })}
      </ul>
      <p className={styles.capNote}>{t('capNote')}</p>
    </section>
  )
}

function Report(props: { report: SecurityReport }): JSX.Element {
  const t = useT()
  const { report } = props
  const url = safeUrl(report.reportUrl)
  const clean = /^(clean|benign|safe)/i.test(report.status)
  return (
    <li className={styles.report}>
      <div className={styles.reportHead}>
        <span className={styles.reportVendor}>{report.vendor}</span>
        <Chip tone={clean ? 'ok' : 'warn'}>{report.statusText}</Chip>
      </div>
      {report.summary !== undefined && <p className={styles.reportSummary}>{report.summary}</p>}
      {url !== undefined && (
        <a className={shell.link} href={url} target="_blank" rel="noreferrer noopener">
          {t('viewReport')} <ExternalLinkIcon size={12} />
        </a>
      )}
    </li>
  )
}

/**
 * Market skill detail page.
 *
 * Owns no data: tab, selected file and file contents live in `MarketState`.
 * Upstream facts (stats, version, scans, files) come from the live detail; the
 * catalogue adds category and the Chinese summary. "What this skill does" and
 * "when it triggers" are read off its own SKILL.md and file list by explicit
 * rules (`skill-insights.ts`) and are hidden when no rule fires.
 */
export function MarketSkillDetail(props: {
  detail: NormalizedSkillDetail
  state: MarketState
  controller: MarketController
}): JSX.Element {
  const { detail, state, controller } = props
  const t = useT()
  const { capabilities, triggers } = useSkillInsights(detail)

  const installing = state.installingIds.has(detail.id)
  const author = detail.author.displayName ?? detail.author.handle
  const reports = detail.securityReports ?? []
  const pageUrl = safeUrl(detail.pageUrl)
  const category = state.categories.find((entry) => entry.key === detail.category)
  const english = t('category.lang') === 'en'
  const categoryName = category === undefined ? undefined : (english && category.nameEn) || category.name
  const snapshotAt = state.detailStatus?.fromCache === true ? state.detailStatus.fetchedAt : undefined
  const updated = formatDate(detail.updatedAt)
  // A skill that ships its own changelog has the full history right here.
  const changelogFile = detail.files.find((file) => /^changelog(\.md)?$/i.test(file.path))

  const tabs: Array<DetailTab<MarketDetailTab>> = [
    { key: 'overview', label: t('overview') },
    { key: 'files', label: t('files'), badge: <TabCount value={detail.files.length} /> },
    {
      key: 'security',
      label: t('securityReport'),
      badge: detail.securityStatus === 'flagged' ? <span className={shell.tabDot} aria-label={t('scan.flagged')} /> : undefined,
    },
    { key: 'changelog', label: t('changelog') },
  ]

  const stats = [
    { label: t('downloads'), value: formatCount(detail.stats.downloads) },
    ...(detail.stats.installs === undefined ? [] : [{ label: t('installs'), value: formatCount(detail.stats.installs) }]),
    ...(detail.stats.stars === undefined ? [] : [{ label: t('stars'), value: formatCount(detail.stats.stars) }]),
    { label: t('files'), value: String(detail.files.length) },
  ]

  return (
    <SkillDetailShell
      focusKey={detail.id}
      onBack={() => controller.closeDetail()}
      backLabel={t('marketTab')}
      avatar={<SkillAvatar name={detail.name} source={detail.source} iconUrl={detail.iconUrl} size={72} />}
      name={detail.name}
      version={detail.version}
      meta={
        <>
          {author !== '' && (
            <span>
              by <strong>{author}</strong>
            </span>
          )}
          <span>{t(`source.${detail.source}`)}</span>
          {detail.license !== undefined && detail.license !== '' && <span>{detail.license}</span>}
          {updated !== '' && <span>{t('updatedOn', { date: updated })}</span>}
        </>
      }
      summary={detail.summary}
      chips={
        <>
          <SecurityChip status={detail.securityStatus} />
          {detail.featured === true && <Chip tone="blue">{t('featured')}</Chip>}
          {categoryName !== undefined && <Chip>{categoryName}</Chip>}
          {detail.tags.slice(0, 2).map((tag) => (
            <Chip key={tag}>{tag}</Chip>
          ))}
          {detail.requiresApiKey === true && <Chip>{t('needsApiKey')}</Chip>}
        </>
      }
      actions={
        <>
          {pageUrl !== undefined && (
            <a className={shell.secondaryButton} href={pageUrl} target="_blank" rel="noreferrer noopener">
              {t('sourcePage')}
              <ExternalLinkIcon size={14} />
            </a>
          )}
          {detail.installState === 'installable' && (
            <button
              type="button"
              className={shell.primaryButton}
              disabled={installing}
              onClick={() => controller.requestInstall(detail.id)}
            >
              <DownloadIcon size={16} />
              {installing ? t('installing') : t('install')}
            </button>
          )}
          {detail.installState === 'installed' && (
            <>
              <span className={shell.installedMark}>
                <CheckIcon size={14} />
                {t('installed')}
              </span>
              <button
                type="button"
                className={shell.secondaryButton}
                disabled={installing}
                onClick={() => void controller.uninstall(detail.id)}
              >
                <TrashIcon size={14} />
                {t('uninstall')}
              </button>
            </>
          )}
          {detail.installState === 'not-installable' && (
            <span className={shell.notInstallable} title={detail.notInstallableReason}>
              {t('notInstallable')}
            </span>
          )}
        </>
      }
      stats={stats}
      tabs={tabs}
      activeTab={state.activeTab}
      onTabChange={(tab) => controller.setTab(tab)}
      notice={
        snapshotAt === undefined ? undefined : (
          <p className={shell.snapshot} role="note">
            <span title={formatStamp(snapshotAt)}>{t('detailSnapshot', { age: formatAge(t, snapshotAt) })}</span>
            <button
              type="button"
              className={shell.linkButton}
              disabled={state.detailLoading}
              onClick={() => void controller.openDetail(detail.id, { refresh: true })}
            >
              {t('refreshSnapshot')}
            </button>
          </p>
        )
      }
    >
      {state.activeTab === 'overview' && (
        <DetailColumns
          main={
            <>
              {capabilities.length > 0 && (
                <CapabilityPanel capabilities={capabilities} onReport={() => controller.setTab('security')} />
              )}
              <SkillDocument detail={detail} />
            </>
          }
          side={
            <>
              {triggers.length > 0 && (
                <SideCard title={t('whenToUse')}>
                  <ol className={styles.triggers}>
                    {triggers.map((trigger, index) => (
                      <li key={trigger}>
                        <span className={styles.triggerIndex}>{index + 1}</span>
                        <span>{trigger}</span>
                      </li>
                    ))}
                  </ol>
                </SideCard>
              )}
              <SideCard title={t('info')}>
                <dl className={shell.info}>
                  {author !== '' && <InfoRow label={t('author')} value={author} />}
                  <InfoRow label={t('filter.source')} value={t(`source.${detail.source}`)} />
                  {categoryName !== undefined && <InfoRow label={t('category.label')} value={categoryName} />}
                  {detail.version !== undefined && detail.version !== '' && (
                    <InfoRow label={t('version')} value={`v${detail.version}`} mono />
                  )}
                  {detail.license !== undefined && detail.license !== '' && <InfoRow label={t('license')} value={detail.license} />}
                  {updated !== '' && <InfoRow label={t('updated')} value={updated} mono />}
                </dl>
              </SideCard>
              {detail.changelog !== undefined && (
                <SideCard
                  title={t('latestUpdate')}
                  extra={detail.changelog.version === undefined ? undefined : (
                    <span className={shell.mono}>{detail.changelog.version}</span>
                  )}
                >
                  <p className={styles.changelogText}>{detail.changelog.text}</p>
                  <button type="button" className={shell.linkButton} onClick={() => controller.setTab('changelog')}>
                    {t('fullChangelog')}
                  </button>
                </SideCard>
              )}
            </>
          }
        />
      )}

      {state.activeTab === 'files' && (
        <section className={shell.card}>
          <SkillFiles
            files={detail.files}
            selected={state.file}
            loading={state.fileLoading}
            onSelect={(path) => void controller.selectFile(path)}
          />
        </section>
      )}

      {state.activeTab === 'security' && (
        <div className={shell.stack}>
          {capabilities.length > 0 && (
            <CapabilityPanel capabilities={capabilities} onReport={() => controller.setTab('files')} />
          )}
          <section className={shell.card}>
            <h2 className={shell.cardTitle}>{t('scanReports')}</h2>
            {reports.length > 0 ? (
              <ul className={styles.reports}>
                {reports.map((report) => (
                  <Report key={`${report.vendor}:${report.status}`} report={report} />
                ))}
              </ul>
            ) : (
              <p className={shell.muted}>{t('noReports')}</p>
            )}
            <p className={styles.capNote}>{t('scanDisclaimer')}</p>
          </section>
        </div>
      )}

      {state.activeTab === 'changelog' && (
        <section className={shell.card}>
          <h2 className={shell.cardTitle}>{t('changelog')}</h2>
          {detail.changelog !== undefined ? (
            <article className={styles.release}>
              <header className={styles.releaseHead}>
                <span className={shell.versionChip}>{detail.changelog.version ?? detail.version ?? ''}</span>
                {detail.changelog.publishedAt !== undefined && (
                  <span className={shell.muted}>{formatDate(detail.changelog.publishedAt)}</span>
                )}
              </header>
              <p className={styles.changelogText}>{detail.changelog.text}</p>
            </article>
          ) : (
            <p className={shell.muted}>{t('noChangelog')}</p>
          )}
          <div className={styles.linkRow}>
            {changelogFile !== undefined && (
              <button
                type="button"
                className={shell.linkButton}
                onClick={() => {
                  controller.setTab('files')
                  void controller.selectFile(changelogFile.path)
                }}
              >
                {t('openChangelogFile', { path: changelogFile.path })}
              </button>
            )}
            {pageUrl !== undefined && (
              <a className={shell.link} href={pageUrl} target="_blank" rel="noreferrer noopener">
                {t('olderVersions')} <ExternalLinkIcon size={12} />
              </a>
            )}
          </div>
        </section>
      )}
    </SkillDetailShell>
  )
}
