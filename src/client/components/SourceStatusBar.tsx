import { Button, StateDot, Tooltip, type StateDotState } from '@deepseek-ai/dsh-client-ui-primitives'
import type { MarketSource, SourceHealthStatus, SourceStatusInfo } from '../../market/types.ts'
import { useT } from '../locale-context.tsx'
import { formatAge, formatStamp } from '../relative-time.ts'
import { RefreshIcon } from '../icons.tsx'
import styles from './SourceStatusBar.module.css'

/**
 * Display order, declared locally rather than imported: `MARKET_SOURCES` is a
 * runtime value in `src/market/types.ts`, and a value import from that module
 * would pull host-facing code into the browser bundle (contract §4).
 */
const SOURCES: readonly MarketSource[] = ['clawhub', 'skillhub']

/** Upstream health mapped onto the primitive's five-way state vocabulary. */
const DOT_STATES: Record<SourceHealthStatus, StateDotState> = {
  ok: 'done',
  degraded: 'warning',
  failed: 'error',
  cached: 'idle',
}

/**
 * Per-source health strip.
 *
 * The upstream error string rides the pill's `title` instead of being printed:
 * a 720px panel has no room for a stack trace next to two source names, and an
 * operator who needs it can hover.
 *
 * The snapshot age *is* printed: a healthy source can still be answering from a
 * cache, and a reader deciding whether to install third-party code is entitled
 * to see that the page in front of them was read minutes ago rather than now.
 */
export function SourceStatusBar(props: { sources: Record<MarketSource, SourceStatusInfo>; onRefresh: () => void; refreshing: boolean }): JSX.Element {
  const { sources, onRefresh, refreshing } = props
  const t = useT()

  return (
    <div className={styles.bar}>
      <ul className={styles.list}>
        {SOURCES.map((source) => {
          const info = sources[source]
          const snapshotAt = info.fromCache === true ? info.fetchedAt : undefined
          return (
            <li key={source} className={styles.item} title={info.error}>
              <StateDot state={DOT_STATES[info.status]} className={styles.dot} />
              <span className={styles.name}>{t(`source.${source}`)}</span>
              <span className={styles.status}>{t(`sourceStatus.${info.status}`)}</span>
              {snapshotAt !== undefined && (
                <span className={styles.snapshot} title={formatStamp(snapshotAt)}>
                  {t('snapshotAge', { age: formatAge(t, snapshotAt) })}
                </span>
              )}
            </li>
          )
        })}
      </ul>
      <Tooltip label={t('refreshNow')}>
        <Button
          variant="ghost"
          size="sm"
          className={styles.refresh}
          disabled={refreshing}
          aria-label={t('refreshNow')}
          onClick={onRefresh}
          icon={<RefreshIcon size={16} className={refreshing ? styles.spinning : undefined} />}
        />
      </Tooltip>
    </div>
  )
}
