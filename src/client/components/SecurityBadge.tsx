import type { SecurityReport, SecurityStatus } from '../../market/types.ts'
import { useT } from '../locale-context.tsx'
import { AlertIcon, ShieldIcon } from '../icons.tsx'
import styles from './SecurityBadge.module.css'

/** Tone class per audit verdict; `unknown` is a neutral fact, not a warning. */
const TONES: Record<SecurityStatus, string> = {
  verified: 'success',
  benign: 'success',
  unknown: 'neutral',
  flagged: 'danger',
}

/**
 * Audit verdict chip.
 *
 * Shows a shield for every verdict except `flagged`, which uses the warning
 * triangle: a scan that found something must not look like a scan that merely
 * ran, and shape reads faster than color alone.
 *
 * `reports` supplies the upstream status line for the hover title, so the chip
 * can stay a two-word summary without hiding what the vendor actually said.
 */
export function SecurityBadge(props: { status: SecurityStatus; reports?: SecurityReport[]; compact?: boolean }): JSX.Element {
  const { status, reports, compact = false } = props
  const t = useT()
  const report = reports?.[0]
  const detail = report ? `${report.vendor}: ${report.statusText}` : undefined

  return (
    <span
      className={`${styles.badge} ${styles[TONES[status]] ?? ''} ${compact ? styles.compact : ''}`}
      title={detail}
      data-security-status={status}
    >
      {!compact && (status === 'flagged' ? <AlertIcon size={13} /> : <ShieldIcon size={13} />)}
      {t(`security.${status}`)}
    </span>
  )
}
