import { useEffect, useRef, useState } from 'react'
import { Button, StateDot } from '@deepseek-ai/dsh-client-ui-primitives'
import type { MarketFilters, MarketState, MarketController } from '../state.ts'
import { useT } from '../locale-context.tsx'
import { AlertIcon, RefreshIcon, SkillsHubIcon } from '../icons.tsx'
import { formatStamp } from '../relative-time.ts'
import { CategoryBar } from './CategoryBar.tsx'
import { FilterBar } from './FilterBar.tsx'
import { MarketDisclaimer } from './MarketDisclaimer.tsx'
import { SkillCard } from './SkillCard.tsx'
import { SourceStatusBar } from './SourceStatusBar.tsx'
import styles from './MarketHome.module.css'

/**
 * How far ahead of the end of the list the next page is fetched.
 *
 * The catalogue scrolls inside the host's dock rather than the document, and an
 * observer whose root is the viewport is clipped by that dock: `rootMargin` on
 * the viewport is dead weight there (measured: the same sentinel reports
 * "not intersecting" 412px below the fold with a viewport root, and
 * "intersecting" with the dock as root). The margin therefore only means
 * anything once the observer is given the real scroll container.
 */
const PREFETCH_MARGIN = '900px 0px'

/** Nearest scrollable ancestor, or `null` when the list scrolls with the document. */
function scrollContainerOf(element: HTMLElement): HTMLElement | null {
  let node = element.parentElement
  while (node !== null && node !== document.body) {
    const overflowY = getComputedStyle(node).overflowY
    if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) return node
    node = node.parentElement
  }
  return null
}

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
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [scrolled, setScrolled] = useState(false)

  // Look-ahead is a *scrolling* optimisation, so it waits for a scroll. Arming it
  // on the tall header alone would fetch the second page for every reader who
  // opens the panel and leaves — traffic with nobody waiting for it. The scroll
  // may come from the host's dock rather than this subtree, so the listener
  // rides the capture phase on the document.
  useEffect(() => {
    if (scrolled) return
    const mark = (): void => setScrolled(true)
    document.addEventListener('scroll', mark, { capture: true, passive: true, once: true })
    return () => document.removeEventListener('scroll', mark, { capture: true })
  }, [scrolled])

  // Observe the end of the catalogue within the host's scrollable dock. Re-arm
  // after each page so a short page naturally fills the viewport.
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (sentinel === null || !scrolled || state.nextCursor === null || state.loading || state.loadingMore || state.error !== null) return
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) void controller.loadMore()
      // One screen of look-ahead: the page is fetched while the reader is still
      // a scroll away from it, so arriving at the sentinel finds the data (or a
      // request already in flight) instead of starting one. The request count is
      // unchanged — it only moves earlier, which is the whole point.
    }, { root: scrollContainerOf(sentinel), rootMargin: PREFETCH_MARGIN })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [controller, scrolled, state.nextCursor, state.loading, state.loadingMore, state.error])

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
  const searching = state.filters.q.trim() !== ''
  const isInitialLoad = state.loading && !hasItems
  // "Nothing matched" and "the shops are empty" are different problems, and the
  // dictionary already distinguishes them.
  const narrowed =
    state.filters.q !== '' || state.filters.category !== 'all' || state.filters.source !== 'all' || state.filters.security !== 'all' || state.filters.installed !== 'all'

  const catalogue = state.filters.scope === 'catalog'
  const catalogueAt = catalogue ? state.sources.clawhub.fetchedAt : undefined

  return (
    <div className={styles.home}>
      <div className={styles.top}>
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

        {catalogue && (
          <CategoryBar
            categories={state.categories}
            active={state.filters.category}
            disabled={state.loading}
            onSelect={(category) => controller.setCategory(category)}
          />
        )}

        <FilterBar filters={state.filters} total={state.items.length} disabled={state.loading} onChange={applyFilterPatch} />
      </div>

      <div className={styles.canvas}>
        <div className={styles.statusRow}>
          <p className={styles.count} aria-live="polite">
            {/* No count while the first page is in flight: "0 results" would be a claim. */}
            {isInitialLoad
              ? t('loading')
              : catalogue && state.total !== null
                ? t('catalogSummary', { count: state.total })
                : t(catalogue ? 'count' : 'liveResults', { count: state.items.length })}
            {catalogueAt !== undefined && (
              <span className={styles.countNote} title={formatStamp(catalogueAt)}>
                {t('catalogUpdated', { date: new Date(catalogueAt).toISOString().slice(0, 10) })}
              </span>
            )}
          </p>
          {/* Source health only describes live reads; the catalogue is a shipped snapshot. */}
          {!catalogue && (
            <SourceStatusBar
              sources={state.sources}
              onRefresh={() => void controller.refresh({ force: true })}
              refreshing={state.loading}
            />
          )}
        </div>

        {searching && (
          <p className={styles.scope}>
            {catalogue ? t('scope.catalogHint') : t('scope.marketHint')}
            <button
              type="button"
              className={styles.scopeSwitch}
              disabled={state.loading}
              onClick={() => controller.setScope(catalogue ? 'market' : 'catalog')}
            >
              {catalogue ? t('scope.searchMarket', { q: state.filters.q.trim() }) : t('scope.backToCatalog')}
            </button>
          </p>
        )}

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
              onClick={() => void (hasItems ? controller.loadMore() : controller.refresh())}
            >
              {t('retry')}
            </Button>
          </div>
        )}

        {state.error === null && isInitialLoad && (
          <div role="status" aria-label={t('loading')}>
            <div className={styles.grid} aria-hidden="true">
              {Array.from({ length: 8 }, (_, index) => (
                <div className={styles.skeletonCard} key={index}>
                  <div className={styles.skeletonHeader}>
                    <span className={styles.skeletonAvatar} />
                    <span className={styles.skeletonTitle} />
                  </div>
                  <span className={styles.skeletonLine} />
                  <span className={styles.skeletonLine} />
                  <span className={styles.skeletonShort} />
                </div>
              ))}
            </div>
          </div>
        )}

        {state.error === null && !state.loading && !hasItems && state.nextCursor === null && (
          <div className={styles.empty}>
            <SkillsHubIcon size={26} />
            <p className={styles.emptyTitle}>{narrowed ? t('emptySearch') : t('empty')}</p>
            <p className={styles.emptyText}>{narrowed ? t('emptySearchHint') : t('emptyHint')}</p>
          </div>
        )}

        {hasItems && (
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

          </>
        )}
        {state.nextCursor !== null && (
              <div ref={sentinelRef} className={styles.more}>
                {state.loadingMore && (
                  <p className={styles.loading} role="status" aria-live="polite">
                    <StateDot state="ongoing" size={16} />
                    {t('loadingMore')}
                  </p>
                )}
              </div>
            )}
      </div>
      </div>
    </div>
  )
}
