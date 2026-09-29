import { Button } from '@deepseek-ai/dsh-client-ui-primitives'
import { useT } from '../locale-context.tsx'
import { AlertIcon, CloseIcon } from '../icons.tsx'
import styles from './MarketDisclaimer.module.css'

/**
 * Third-party risk notice shown above the catalogue until it is acknowledged.
 *
 * Purely presentational: persistence (`localStorage`, `disclaimerDismissed`)
 * belongs to the controller, so this component stays reusable in a bare test
 * render and cannot drift from the stored flag.
 */
export function MarketDisclaimer(props: { onDismiss: () => void }): JSX.Element {
  const { onDismiss } = props
  const t = useT()

  return (
    <div className={styles.banner} role="note">
      <AlertIcon size={16} className={styles.icon} />
      <p className={styles.text}>{t('disclaimer')}</p>
      <Button
        variant="ghost"
        size="sm"
        className={styles.dismiss}
        aria-label={t('dismiss')}
        onClick={onDismiss}
        icon={<CloseIcon size={16} />}
      />
    </div>
  )
}
