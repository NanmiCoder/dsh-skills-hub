import { Button, Modal } from '@deepseek-ai/dsh-client-ui-primitives'
import type { MarketSource, SecurityStatus } from '../../market/types.ts'
import { useT } from '../locale-context.tsx'
import { formatAge, formatStamp } from '../relative-time.ts'
import { AlertIcon, DownloadIcon } from '../icons.tsx'
import { SecurityBadge } from './SecurityBadge.tsx'
import styles from './InstallConfirmDialog.module.css'

/** The subset of a skill the confirmation needs; the caller owns the source object. */
export interface InstallConfirmSkill {
  id: string
  name: string
  source: MarketSource
  version?: string
  securityStatus: SecurityStatus
  authorName: string
  /**
   * When the catalogue data behind this dialog was read from upstream, if it
   * came from a snapshot. Installing is a trust decision, so the confirmation
   * cannot present a cached security verdict as a fresh one.
   */
  snapshotAt?: number
}

/**
 * `source:slug` → the directory name the installer will create. The market id
 * is the only identifier this dialog receives, so the slug is derived here
 * rather than passed twice.
 */
function slugOf(id: string): string {
  const separator = id.indexOf(':')
  return separator >= 0 ? id.slice(separator + 1) : id
}

/**
 * Install confirmation.
 *
 * Mounted only while a confirmation is pending — the frozen props carry no
 * `skill | null` and no `open`, so the caller's conditional render *is* the
 * open state (the optional `open` prop exists only for a caller that prefers
 * to keep the element mounted).
 *
 * Escape and mask-click closing come from `Modal` itself; while `busy` both
 * are neutralised and the buttons are disabled, because an install already in
 * flight cannot be recalled and a dialog that vanishes mid-request reads as a
 * cancel that never happened.
 */
export function InstallConfirmDialog(props: {
  skill: InstallConfirmSkill
  busy: boolean
  onCancel: () => void
  onConfirm: () => void
  /** Optional: defaults to open, since conditional mounting is the usual call site. */
  open?: boolean
}): JSX.Element {
  const { skill, busy, onCancel, onConfirm, open = true } = props
  const t = useT()

  const sourceLabel = t(`source.${skill.source}`)
  const risky = skill.securityStatus === 'unknown' || skill.securityStatus === 'flagged'

  return (
    <Modal
      open={open}
      onClose={busy ? () => undefined : onCancel}
      title={t('install')}
      closeLabel={t('dismiss')}
      description={t('installConfirmMessage', { name: skill.name, source: sourceLabel })}
      footer={
        <div className={styles.actions}>
          <Button variant="outline" size="md" disabled={busy} onClick={onCancel}>
            {t('cancel')}
          </Button>
          <Button
            variant="primary"
            size="md"
            disabled={busy}
            icon={<DownloadIcon size={16} />}
            onClick={onConfirm}
          >
            {busy ? t('installing') : t('confirm')}
          </Button>
        </div>
      }
    >
      <dl className={styles.facts}>
        <div className={styles.row}>
          <dt className={styles.label}>{t('filter.source')}</dt>
          <dd className={styles.value}>{sourceLabel}</dd>
        </div>
        {skill.version !== undefined && skill.version !== '' && (
          <div className={styles.row}>
            <dt className={styles.label}>{t('version')}</dt>
            <dd className={styles.value}>v{skill.version}</dd>
          </div>
        )}
        <div className={styles.row}>
          <dt className={styles.label}>{t('author')}</dt>
          <dd className={styles.value}>{skill.authorName}</dd>
        </div>
        <div className={styles.row}>
          <dt className={styles.label}>{t('security')}</dt>
          <dd className={styles.value}>
            <SecurityBadge status={skill.securityStatus} />
          </dd>
        </div>
        <div className={styles.row}>
          <dt className={styles.label}>{t('installLocation')}</dt>
          <dd className={`${styles.value} ${styles.path}`}>…/skills/{slugOf(skill.id).toLowerCase()}/</dd>
        </div>
      </dl>

      {skill.snapshotAt !== undefined && (
        <p className={styles.risk} role="note" title={formatStamp(skill.snapshotAt)}>
          <AlertIcon size={16} className={styles.riskIcon} />
          <span>{t('installSnapshot', { age: formatAge(t, skill.snapshotAt) })}</span>
        </p>
      )}

      {risky && (
        <p className={styles.risk} role="note">
          <AlertIcon size={16} className={styles.riskIcon} />
          <span>{t('unoaudited')}</span>
        </p>
      )}
    </Modal>
  )
}
