import { useEffect, useId, useState } from 'react'
import { Modal } from '@deepseek-ai/dsh-client-ui-primitives'
import type { MarketSource, NormalizedSkillDetail, SecurityStatus } from '../../market/types.ts'
import { useT } from '../locale-context.tsx'
import { formatAge, formatStamp } from '../relative-time.ts'
import { AlertIcon, DownloadIcon, FolderIcon } from '../icons.tsx'
import { capabilityText, useSkillInsights } from './MarketSkillDetail.tsx'
import { SkillAvatar } from './SkillAvatar.tsx'
import styles from './InstallConfirmDialog.module.css'

/** The subset of a skill the confirmation needs; the caller owns the source object. */
export interface InstallConfirmSkill {
  id: string
  name: string
  source: MarketSource
  version?: string
  iconUrl?: string
  securityStatus: SecurityStatus
  authorName: string
  /**
   * The loaded detail, when the dialog was opened from the detail page: only
   * then are the skill's files known, and with them what it will be able to do.
   */
  detail?: NormalizedSkillDetail
  /**
   * When the catalogue data behind this dialog was read from upstream, if it
   * came from a snapshot. Installing is a trust decision, so the confirmation
   * cannot present a cached security verdict as a fresh one.
   */
  snapshotAt?: number
}

/** `source:slug` → the directory name the installer will create. */
function slugOf(id: string): string {
  const separator = id.indexOf(':')
  return separator >= 0 ? id.slice(separator + 1) : id
}

function CapabilityList(props: { detail: NormalizedSkillDetail }): JSX.Element | null {
  const t = useT()
  const { capabilities } = useSkillInsights(props.detail)
  if (capabilities.length === 0) return null
  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>{t('willGet')}</h3>
      <ul className={styles.capabilities}>
        {capabilities.map((capability) => {
          const text = capabilityText(t, capability)
          return (
            <li key={capability.kind} className={styles.capability}>
              <span className={styles.capabilityText}>
                <span>{text.title}</span>
                <span className={styles.capabilityDetail}>{text.detail}</span>
              </span>
              <span className={`${styles.level} ${styles[`level_${capability.level}`] ?? ''}`}>
                {t(`level.${capability.level}`)}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/**
 * Install confirmation (design: install dialog of the detail page).
 *
 * Mounted only while a confirmation is pending. A skill that is not scanned
 * clean (flagged or unknown) needs an explicit acknowledgement before the
 * confirm button arms: installing is a trust decision about a third party, and
 * the dialog says so instead of making it a reflex click. Escape and mask-click
 * come from `Modal`; while `busy` both are neutralised, because an install in
 * flight cannot be recalled.
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
  const ackId = useId()
  const [acknowledged, setAcknowledged] = useState(false)
  useEffect(() => setAcknowledged(false), [skill.id])

  const sourceLabel = t(`source.${skill.source}`)
  const risky = skill.securityStatus === 'unknown' || skill.securityStatus === 'flagged'
  const armed = !busy && (!risky || acknowledged)
  const meta = [sourceLabel, skill.authorName, skill.version ? `v${skill.version}` : ''].filter(Boolean).join(' · ')

  return (
    <Modal
      open={open}
      onClose={busy ? () => undefined : onCancel}
      title={t('installTitle', { name: skill.name })}
      closeLabel={t('dismiss')}
      description={meta}
      footer={
        <div className={styles.actions}>
          <button type="button" className={styles.secondary} disabled={busy} onClick={onCancel}>
            {t('cancel')}
          </button>
          <button type="button" className={styles.primary} disabled={!armed} onClick={onConfirm}>
            <DownloadIcon size={16} />
            {busy ? t('installing') : t('confirmInstall')}
          </button>
        </div>
      }
    >
      <div className={styles.body}>
        <div className={styles.identity}>
          <SkillAvatar name={skill.name} source={skill.source} iconUrl={skill.iconUrl} size={48} />
          <p className={styles.identityText}>{t('installConfirmMessage', { name: skill.name, source: sourceLabel })}</p>
        </div>

        {risky && (
          <p className={styles.warning} role="note">
            <AlertIcon size={16} className={styles.warningIcon} />
            <span>{t(skill.securityStatus === 'flagged' ? 'installWarnFlagged' : 'installWarnUnknown')}</span>
          </p>
        )}

        {skill.detail !== undefined && <CapabilityList detail={skill.detail} />}

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>{t('installLocation')}</h3>
          <p className={styles.location}>
            <FolderIcon size={14} />
            <span>…/skills/{slugOf(skill.id).toLowerCase()}/</span>
          </p>
        </section>

        {skill.snapshotAt !== undefined && (
          <p className={styles.note} role="note" title={formatStamp(skill.snapshotAt)}>
            {t('installSnapshot', { age: formatAge(t, skill.snapshotAt) })}
          </p>
        )}

        {risky && (
          <label className={styles.ack} htmlFor={ackId}>
            <input
              id={ackId}
              type="checkbox"
              checked={acknowledged}
              disabled={busy}
              onChange={(event) => setAcknowledged(event.currentTarget.checked)}
            />
            <span>{t('ack')}</span>
          </label>
        )}
      </div>
    </Modal>
  )
}
