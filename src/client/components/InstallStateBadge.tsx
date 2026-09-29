import type { InstallState } from '../../market/types.ts'
import { useT } from '../locale-context.tsx'
import { AlertIcon, CheckIcon, DownloadIcon } from '../icons.tsx'
import styles from './InstallStateBadge.module.css'

/** Tone class per local install state. */
const TONES: Record<InstallState, string> = {
  installed: 'success',
  installable: 'brand',
  'not-installable': 'danger',
}

/**
 * Local install state chip.
 *
 * The three labels come from dictionary keys the contract already fixes —
 * `installed`, `installed.installable` and `notInstallable` — so this badge
 * adds no vocabulary of its own.
 */
export function InstallStateBadge(props: { state: InstallState }): JSX.Element {
  const { state } = props
  const t = useT()
  const label = state === 'installed' ? t('installed') : state === 'installable' ? t('installed.installable') : t('notInstallable')

  return (
    <span className={`${styles.badge} ${styles[TONES[state]] ?? ''}`} data-install-state={state}>
      {state === 'installed' ? <CheckIcon size={13} /> : state === 'installable' ? <DownloadIcon size={13} /> : <AlertIcon size={13} />}
      {label}
    </span>
  )
}
