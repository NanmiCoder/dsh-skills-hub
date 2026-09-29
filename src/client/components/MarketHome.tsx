import { Button, StateDot } from '@deepseek-ai/dsh-client-ui-primitives'
import type { MarketFilters, MarketState, MarketController } from '../state.ts'
import { useT } from '../locale-context.tsx'
import { AlertIcon, DownloadIcon, RefreshIcon, SkillsHubIcon } from '../icons.tsx'
import { FilterBar } from './FilterBar.tsx'
import { MarketDisclaimer } from './MarketDisclaimer.tsx'
import { SkillCard } from './SkillCard.tsx'
import { SourceStatusBar } from './SourceStatusBar.tsx'
import styles from './MarketHome.module.css'

/**
 * Market catalogue page.
 *
 * Presentational by contract: every interaction below is a call on the
 * controller, and every rendered value comes from `state`. That keeps the
 * whole page renderable in a bare test render with no services and no fetch.
 */
export function MarketHome(props: { state: MarketState; controller: MarketController }): JSX.Element {
  const { state, controller } = props
  const t = useT()

  /**
   * The filter bar reports a patch; the controller exposes one setter per
   * field. Each branch is guarded so an unrelated key in the patch cannot
   * trigger a redundant reload.
   */
  const applyFilterPatch = (patch: Partial<MarketFilters>): void => {
    if (patch.q !== undefined) controller.setQuery(patch.q)
    if (patch.source !== undefined) controller.setSource(patch.source)
    if (patch.security !== undefined) controller.setSecurity(patch.security)
    if (patch.installed !== undefined) controller.setInstalledFilter(patch.installed)
  }

  const hasItems = state.items.length > 0
  const isInitialLoad = state.loading && !hasItems
  // "Nothing matched" and "the shops are empty" are different problems, and the
  // dictionary already distinguishes them.
  const narrowed =
    state.filters.q !== '' || state.filters.source !== 'all' || state.filters.security !== 'all' || state.filters.installed !== 'all'

  return (
    <div className={styles.home}>
      <header className={styles.masthead}>
        <span className={styles.mark} aria-hidden="true">
          <SkillsHubIcon size={22} />
        </span>
        <div className={styles.mastheadText}>
          <h1 className={styles.title}>{t('title')}</h1>
          <p className={styles.subtitle}>{t('subtitle')}</p>
        </div>
      </header>

      {!state.disclaimerDismissed && <MarketDisclaimer onDismiss={() => controller.dismissDisclaimer()} />}

      <div className={styles.statusRow}>
        <p className={styles.count} aria-live="polite">
          {t('count', { count: state.items.length })}
        </p>
        <SourceStatusBar
          sources={state.sources}
          onRefresh={() => void controller.refresh()}
          refreshing={state.loading}
        />
      </div>

      <FilterBar filters={state.filters} total={state.items.length} disabled={state.loading} onChange={applyFilterPatch} />

      <div className={styles.body} aria-busy={state.loading}>
        {state.error !== null && (
          <div className={styles.error} role="alert">
            <AlertIcon size={22} className={styles.errorIcon} />
            <p className={styles.errorTitle}>{t('error')}</p>
            <p className={styles.errorDetail}>{state.error}</p>
            <Button
              variant="outline"
              size="md"
              icon={<RefreshIcon size={16} />}
              onClick={() => void controller.refresh()}
            >
              {t('retry')}
            </Button>
          </div>
        )}

        {state.error === null && isInitialLoad && (
          <p className={styles.loading} role="status" aria-live="polite">
            <StateDot state="ongoing" size={16} />
            {t('loading')}
          </p>
        )}

        {state.error === null && !state.loading && !hasItems && (
          <div className={styles.empty}>
            <SkillsHubIcon size={26} />
            <p className={styles.emptyTitle}>{narrowed ? t('emptySearch') : t('empty')}</p>
            <p className={styles.emptyText}>{narrowed ? t('emptySearchHint') : t('emptyHint')}</p>
          </div>
        )}

        {state.error === null && hasItems && (
          <>
            <div className={styles.grid}>
              {state.items.map((skill) => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  installing={state.installingIds.has(skill.id)}
                  onOpen={(id) => void controller.openDetail(id)}
                  onInstall={(id) => controller.requestInstall(id)}
                />
              ))}
            </div>

            {state.nextCursor !== null && (
              <div className={styles.more}>
                {state.loadingMore ? (
                  <p className={styles.loading} role="status" aria-live="polite">
                    <StateDot state="ongoing" size={16} />
                    {t('loadingMore')}
                  </p>
                ) : (
                  <Button
                    variant="outline"
                    size="md"
                    disabled={state.loading}
                    icon={<DownloadIcon size={16} />}
                    onClick={() => void controller.loadMore()}
                  >
                    {t('loadMore')}
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
