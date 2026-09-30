import { MarkdownView } from './MarkdownView.tsx'
import { Button } from '@deepseek-ai/dsh-client-ui-primitives'
import type { NormalizedSkillDetail } from '../../market/types.ts'
import type { MarketController, MarketState } from '../state.ts'
import { useT } from '../locale-context.tsx'
import { AlertIcon, DownloadIcon, TrashIcon } from '../icons.tsx'
import { formatAge, formatStamp } from '../relative-time.ts'
import { FrontmatterPanel } from './FrontmatterPanel.tsx'
import { InstallStateBadge } from './InstallStateBadge.tsx'
import { SecurityBadge } from './SecurityBadge.tsx'
import { SkillAvatar } from './SkillAvatar.tsx'
import { SkillFiles } from './SkillFiles.tsx'
import { Fact, SkillDetailShell, detailStyles } from './SkillDetailShell.tsx'
import styles from './SkillDetailView.module.css'

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

/**
 * Market skill detail page.
 *
 * Like the home page this component owns no data: the tab, the selected file
 * and the file contents all live in `MarketState`, so switching tabs or
 * re-opening a skill does not lose its place. The reading surface itself — back
 * affordance, header, tabs, facts rail — is `SkillDetailShell`, which the local
 * installed page uses too.
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

  const installationInFlight = state.installingIds.has(detail.id)
  const author = detail.author.displayName ?? detail.author.handle
  const reports = detail.securityReports ?? []
  // A detail answered from the Host cache is a snapshot; say so, and offer the
  // one action that actually reaches upstream.
  const snapshotAt = state.detailStatus?.fromCache === true ? state.detailStatus.fetchedAt : undefined

  const notInstallable = detail.installState === 'not-installable' && detail.notInstallableReason !== undefined

  return (
    <SkillDetailShell
      focusKey={detail.id}
      onBack={() => controller.closeDetail()}
      backLabel={t('back')}
      avatar={<SkillAvatar name={detail.name} source={detail.source} iconUrl={detail.iconUrl} size={84} />}
      eyebrow={
        <>
          <span className={detailStyles.source}>{t(`source.${detail.source}`)}</span>
          {detail.version !== undefined && detail.version !== '' && (
            <>
              <span aria-hidden="true">·</span>
              <span className={detailStyles.version}>v{detail.version}</span>
            </>
          )}
        </>
      }
      name={detail.name}
      badges={
        <>
          <SecurityBadge status={detail.securityStatus} reports={detail.securityReports} />
          <InstallStateBadge state={detail.installState} />
        </>
      }
      summary={detail.summary}
      notice={
        <>
          {notInstallable && (
            <p className={styles.warning} role="note" title={detail.notInstallableReason}>
              <AlertIcon size={16} className={styles.warningIcon} />
              <span>{t('notInstallable')}</span>
            </p>
          )}

          {reports.length > 0 && (
            <div className={styles.reports}>
              <span className={styles.reportsLabel}>{t('security')}</span>
              {reports.map((report) => {
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

          {snapshotAt !== undefined && (
            <p className={styles.snapshot} role="note">
              <span title={formatStamp(snapshotAt)}>
                {t('detailSnapshot', { age: formatAge(t, snapshotAt) })}
              </span>
              <button
                type="button"
                className={styles.snapshotAction}
                disabled={state.detailLoading}
                onClick={() => void controller.openDetail(detail.id, { refresh: true })}
              >
                {t('refreshSnapshot')}
              </button>
            </p>
          )}
        </>
      }
      overviewLabel={t('overview')}
      filesLabel={`${t('files')} (${detail.files.length})`}
      activeTab={state.activeTab}
      onTabChange={(tab) => controller.setTab(tab)}
      overview={
        <>
          {detail.description.trim() !== '' ? (
            <MarkdownView content={detail.description} />
          ) : (
            detail.summary !== '' && <p className={detailStyles.summary}>{detail.summary}</p>
          )}
          {detail.descriptionFrontmatter !== undefined && Object.keys(detail.descriptionFrontmatter).length > 0 && (
            <div className={detailStyles.frontmatter}>
              <FrontmatterPanel data={detail.descriptionFrontmatter} />
            </div>
          )}
        </>
      }
      files={
        <SkillFiles
          files={detail.files}
          selected={state.file}
          loading={state.fileLoading}
          onSelect={(path) => void controller.selectFile(path)}
        />
      }
      rail={
        <>
          <div className={detailStyles.railAction}>
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
            {detail.installState === 'not-installable' && <p className={detailStyles.muted}>{t('notInstallable')}</p>}
          </div>

          <dl className={detailStyles.facts}>
            <Fact label={t('author')}>{author}</Fact>
            <Fact label={t('downloads')}>{formatCount(detail.stats.downloads)}</Fact>
            {detail.stats.installs !== undefined && <Fact label={t('installs')}>{formatCount(detail.stats.installs)}</Fact>}
            {detail.stats.stars !== undefined && <Fact label={t('stars')}>{formatCount(detail.stats.stars)}</Fact>}
            {detail.updatedAt !== undefined && <Fact label={t('updated')}>{formatDate(detail.updatedAt)}</Fact>}
            {detail.license !== undefined && detail.license !== '' && <Fact label={t('license')}>{detail.license}</Fact>}
            {detail.version !== undefined && detail.version !== '' && <Fact label={t('version')}>v{detail.version}</Fact>}
          </dl>
        </>
      }
    />
  )
}
