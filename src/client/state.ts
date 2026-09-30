/**
 * Skills Hub panel state machine — framework-free, so it is unit-testable
 * outside React.
 *
 * Ported from the reference desktop store (`desktop/src/stores/marketStore.ts`)
 * with the same invariants:
 *
 *  - **stale-response rejection**: every request family carries a monotonically
 *    increasing sequence; a response whose sequence is no longer current is
 *    dropped instead of overwriting newer state.
 *  - **merge by id**: a page append and an install/uninstall patch both merge on
 *    `NormalizedSkill.id`, and pagination never duplicates a skill the list
 *    already holds.
 *  - **in-flight guards**: one install/uninstall per id, one page per cursor, one
 *    detail/file request per target.
 *  - **detail snapshots**: reopening can show the previous copy immediately,
 *    while the Host rechecks its TTL and current install annotations.
 *  - **local management**: the InstalledSkills component independently lists what is already
 *    on disk (`fetchInstalled`) instead of asking the market, matching the
 *    contract's §5.3 behaviour.
 *
 * Aborts are control flow, never user-visible: the panel aborts superseded
 * requests on purpose, and `isAbortError` keeps those rejections out of
 * `state.error` / `state.notice`.
 */

import { useState, useSyncExternalStore } from 'react'
import type {
  MarketFileContent,
  MarketSource,
  NormalizedSkill,
  NormalizedSkillDetail,
  SecurityStatus,
  SourceStatusInfo,
} from '../market/types.ts'
import {
  fetchMarketList,
  fetchSkillDetail,
  fetchSkillFile,
  installSkill,
  isAbortError,
  uninstallSkill,
} from './api.ts'

/** One remote page (the reference store's `PAGE_SIZE`). */
const PAGE_SIZE = 24

/** Search debounce, mirroring the reference store: typing must not fire per keystroke. */
const SEARCH_DEBOUNCE_MS = 300

/** localStorage key of the dismissed disclaimer (frozen by docs/CONTRACT.md §5.3). */
const DISCLAIMER_STORAGE_KEY = 'dsh-skills-hub.disclaimer'

/**
 * Notice values that are dictionary *codes* rather than literal text.
 *
 * The controller has no locale (it is framework-free and testable), so it stores
 * a code for the panel to translate and stores a verbatim message for anything
 * that has no dictionary entry — which is exactly what a Host error is.
 */
export const MARKET_NOTICE_CODES = ['installDone', 'uninstallDone'] as const

/** A notice value the panel translates through its dictionary. */
export type MarketNoticeCode = (typeof MARKET_NOTICE_CODES)[number]

/** Whether a `state.notice` value is a dictionary code (as opposed to verbatim text). */
export function isMarketNoticeCode(notice: string): notice is MarketNoticeCode {
  return (MARKET_NOTICE_CODES as readonly string[]).includes(notice)
}

/** Active catalogue filters. */
export interface MarketFilters {
  q: string
  source: 'all' | MarketSource
  security: 'all' | SecurityStatus
  installed: 'all' | 'installed' | 'installable'
}

/** Everything the panel renders from. Immutable: each commit publishes a new object. */
export interface MarketState {
  filters: MarketFilters
  items: NormalizedSkill[]
  nextCursor: string | null
  sources: Record<MarketSource, SourceStatusInfo>
  /** Each card retains the provenance of its own page when more pages append. */
  itemStatuses: Record<string, SourceStatusInfo>
  loading: boolean
  loadingMore: boolean
  error: string | null
  view: { kind: 'home' } | { kind: 'detail'; id: string }
  detail: NormalizedSkillDetail | null
  /** Provenance of `detail`: when it was fetched upstream, and whether it is a snapshot. */
  detailStatus: SourceStatusInfo | null
  detailLoading: boolean
  detailError: string | null
  activeTab: 'overview' | 'files'
  file: MarketFileContent | null
  fileLoading: boolean
  installingIds: ReadonlySet<string>
  confirmInstallId: string | null
  disclaimerDismissed: boolean
  notice: string | null
}

/** Actions and state the panel root drives. */
export interface MarketController {
  state: MarketState
  readonly injected: MarketPageInjected
  /** `force` is the reader's refresh: it must not be answered from the cache. */
  refresh(options?: { force?: boolean }): Promise<void>
  loadMore(): Promise<void>
  setQuery(q: string): void
  setSource(source: MarketFilters['source']): void
  setSecurity(security: MarketFilters['security']): void
  setInstalledFilter(installed: MarketFilters['installed']): void
  openDetail(id: string, options?: { refresh?: boolean }): Promise<void>
  closeDetail(): void
  setTab(tab: 'overview' | 'files'): void
  selectFile(path: string): Promise<void>
  requestInstall(id: string): void
  cancelInstall(): void
  confirmInstall(): Promise<void>
  uninstall(id: string): Promise<void>
  dismissDisclaimer(): void
  dismissNotice(): void
}

/** The business face one `main` registration injects into the panel component. */
export interface MarketPageInjected {
  useMarketController: () => MarketController
}

/**
 * Internal twin of the frozen controller.
 *
 * `useSyncExternalStore` needs a `subscribe`/`getSnapshot` pair that the frozen
 * `MarketController` face (contract §5.3) deliberately does not carry — it is a
 * React binding detail, not panel API. Keeping the extra members on this twin
 * means the public interface stays exactly what the contract declares while the
 * hook can still drive a correct subscription.
 */
interface MarketControllerInternal extends MarketController {
  subscribe(listener: () => void): () => void
  getSnapshot(): MarketState
}

/** Baseline source health, mirroring the Host's own initial value (`{ status: 'ok' }` per source). */
function emptySources(): Record<MarketSource, SourceStatusInfo> {
  return { clawhub: { status: 'ok' }, skillhub: { status: 'ok' } }
}

function initialState(): MarketState {
  return {
    filters: { q: '', source: 'all', security: 'all', installed: 'all' },
    items: [],
    nextCursor: null,
    sources: emptySources(),
    itemStatuses: {},
    loading: false,
    loadingMore: false,
    error: null,
    view: { kind: 'home' },
    detail: null,
    detailStatus: null,
    detailLoading: false,
    detailError: null,
    activeTab: 'overview',
    file: null,
    fileLoading: false,
    installingIds: new Set<string>(),
    confirmInstallId: null,
    disclaimerDismissed: readDisclaimerDismissed(),
    notice: null,
  }
}

/** Read the persisted disclaimer dismissal; storage may be unavailable (private mode, sandboxed frame). */
function readDisclaimerDismissed(): boolean {
  try {
    return globalThis.localStorage?.getItem(DISCLAIMER_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

/** Persist the dismissal; a storage failure only means it is not remembered. */
function writeDisclaimerDismissed(): void {
  try {
    globalThis.localStorage?.setItem(DISCLAIMER_STORAGE_KEY, '1')
  } catch {
    // Ignored on purpose: the panel still hides the disclaimer for this session.
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function withId(ids: ReadonlySet<string>, id: string): Set<string> {
  const next = new Set(ids)
  next.add(id)
  return next
}

function withoutId(ids: ReadonlySet<string>, id: string): Set<string> {
  const next = new Set(ids)
  next.delete(id)
  return next
}

function fileCacheKey(id: string, path: string): string {
  return `${id}\u0000${path}`
}

/** Replace one source's health without dropping the others. */
function mergeSourceStatus(
  sources: Record<MarketSource, SourceStatusInfo>,
  source: MarketSource,
  status: SourceStatusInfo,
): Record<MarketSource, SourceStatusInfo> {
  return { ...sources, [source]: status }
}

function itemStatuses(items: NormalizedSkill[], sources: Record<MarketSource, SourceStatusInfo>): Record<string, SourceStatusInfo> {
  return Object.fromEntries(items.map((item) => [item.id, sources[item.source]]))
}

/** Copy the install-related fields of a fresh skill onto a cached detail. */
function patchDetail(detail: NormalizedSkillDetail, updated: NormalizedSkill): NormalizedSkillDetail {
  return {
    ...detail,
    installState: updated.installState,
    notInstallableReason: updated.notInstallableReason,
    installedInfo: updated.installedInfo,
  }
}

function createInternalController(): MarketControllerInternal {
  let state: MarketState = initialState()
  const listeners = new Set<() => void>()

  // Display snapshots keep navigation instant. Every reopening still asks the
  // Host, which owns the configured TTL and persistent upstream cache.
  const detailCache = new Map<string, { skill: NormalizedSkillDetail; status: SourceStatusInfo }>()

  // Request bookkeeping. Sequences are *only* bumped by the family they belong
  // to; a stale response is dropped by comparing its captured sequence.
  let listSequence = 0
  let detailSequence = 0
  let fileSequence = 0
  let listAbort: AbortController | null = null
  let detailAbort: AbortController | null = null
  let fileAbort: AbortController | null = null
  let inFlightList: { key: string; sequence: number; promise: Promise<void> } | null = null
  let inFlightCursor: string | null = null
  let inFlightFileKey: string | null = null
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  function commit(patch: Partial<MarketState>): void {
    state = { ...state, ...patch }
    // Iterate a copy: a listener may unsubscribe while being notified.
    for (const listener of [...listeners]) listener()
  }

  function getSnapshot(): MarketState {
    return state
  }

  function subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }

  function cancelDebounce(): void {
    if (debounceTimer === null) return
    clearTimeout(debounceTimer)
    debounceTimer = null
  }

  /** Identity of a list request: any filter change makes a different request. */
  function currentListKey(): string {
    const { q, source, security, installed } = state.filters
    return JSON.stringify([q.trim(), source, security, installed])
  }

  function setNotice(notice: string | null): void {
    commit({ notice })
  }

  /** Whether a skill still belongs in the list under the active installed-filter. */
  function keepUnderInstalledFilter(skill: NormalizedSkill): boolean {
    if (state.filters.installed === 'installed') return skill.installState === 'installed'
    if (state.filters.installed === 'installable') return skill.installState !== 'installed'
    return true
  }

  /**
   * Apply the Host's authoritative skill record after an install/uninstall.
   *
   * The list, the open detail and the detail cache are patched together: leaving
   * the cache alone would resurrect the pre-install badge the next time the skill
   * is opened, which is exactly the stale state the reference store guards
   * against.
   */
  function applySkillUpdate(updated: NormalizedSkill): void {
    const items = state.items
      .map((item) => (item.id === updated.id ? { ...item, ...updated } : item))
      .filter(keepUnderInstalledFilter)

    const patch: Partial<MarketState> = { items }
    if (state.detail !== null && state.detail.id === updated.id) {
      const patched = patchDetail(state.detail, updated)
      detailCache.set(updated.id, { skill: patched, status: state.detailStatus ?? { status: 'ok' } })
      patch.detail = patched
    } else {
      const cached = detailCache.get(updated.id)
      if (cached !== undefined) {
        detailCache.set(updated.id, { skill: patchDetail(cached.skill, updated), status: cached.status })
      }
    }
    commit(patch)
  }

  /**
   * Load the first page for the current filters.
   *
   * Concurrent callers asking for the *same* filters share one request: the panel
   * root and the catalogue component both kick off the first load, and React's
   * development double-invocation repeats it. A different filter set always
   * issues a fresh request.
   */
  async function refresh(options: { force?: boolean } = {}): Promise<void> {
    cancelDebounce()
    // A refresh also follows external local management changes.
    detailCache.clear()
    const key = currentListKey()
    const running = inFlightList
    if (running !== null && running.key === key) return running.promise

    const filters = state.filters
    const sequence = ++listSequence
    listAbort?.abort()
    const controller = new AbortController()
    listAbort = controller
    inFlightCursor = null
    // Clearing the page is deliberate (it is what the reference store does): the
    // grid must not show results that belong to the previous filters.
    commit({ loading: true, loadingMore: false, error: null, items: [], itemStatuses: {}, nextCursor: null })

    const promise = (async () => {
      try {
        const result = await fetchMarketList(
          {
            q: filters.q.trim() || undefined,
            source: filters.source,
            security: filters.security,
            installed: filters.installed,
            limit: PAGE_SIZE,
          },
          controller.signal,
          // The reader's refresh must reach the Host cache; an automatic load
          // is happy to be answered from it.
          { refresh: options.force === true },
        )
        if (sequence !== listSequence) return
        commit({
          items: result.items,
          nextCursor: result.nextCursor,
          sources: result.sources,
          itemStatuses: itemStatuses(result.items, result.sources),
          loading: false,
        })
      } catch (error) {
        // A superseded or aborted request must not write an error the reader
        // would see for a healthy panel.
        if (sequence !== listSequence || isAbortError(error)) return
        commit({ error: errorMessage(error), loading: false })
      } finally {
        if (inFlightList?.sequence === sequence) inFlightList = null
      }
    })()

    inFlightList = { key, sequence, promise }
    return promise
  }

  /** Append the next page, de-duplicating by id and by cursor. */
  async function loadMore(): Promise<void> {
    const cursor = state.nextCursor
    if (cursor === null || state.loadingMore || state.loading) return
    // The observer can fire again before the page lands; one request per cursor.
    if (inFlightCursor === cursor) return

    const filters = state.filters
    const sequence = listSequence
    inFlightCursor = cursor
    commit({ loadingMore: true, error: null })

    try {
      const result = await fetchMarketList(
        {
          q: filters.q.trim() || undefined,
          source: filters.source,
          security: filters.security,
          installed: filters.installed,
          cursor,
          limit: PAGE_SIZE,
        },
        listAbort?.signal,
      )
      if (sequence !== listSequence) return
      const seen = new Set(state.items.map((item) => item.id))
      const appended = result.items.filter((item) => !seen.has(item.id))
      commit({
        items: [...state.items, ...appended],
        nextCursor: result.nextCursor,
        sources: result.sources,
        itemStatuses: { ...state.itemStatuses, ...itemStatuses(appended, result.sources) },
        loadingMore: false,
      })
    } catch (error) {
      if (sequence !== listSequence || isAbortError(error)) return
      commit({ loadingMore: false, error: errorMessage(error) })
    } finally {
      if (inFlightCursor === cursor) inFlightCursor = null
    }
  }

  /**
   * Typing rebuilds the catalogue after a pause, but the input stays controlled:
   * `filters.q` updates immediately so the field never lags the keyboard.
   */
  function setQuery(q: string): void {
    commit({ filters: { ...state.filters, q } })
    cancelDebounce()
    debounceTimer = setTimeout(() => {
      debounceTimer = null
      void refresh()
    }, SEARCH_DEBOUNCE_MS)
  }

  function applyInstantFilter(patch: Partial<MarketFilters>): void {
    commit({ filters: { ...state.filters, ...patch } })
    // The queued search debounce would ask for the same filters a moment later.
    cancelDebounce()
    void refresh()
  }

  function isCurrentDetail(id: string): boolean {
    return state.view.kind === 'detail' && state.view.id === id
  }

  async function loadDetail(id: string, options: { refresh?: boolean } = {}): Promise<void> {
    const sequence = ++detailSequence
    detailAbort?.abort()
    const controller = new AbortController()
    detailAbort = controller
    try {
      const { skill, sourceStatus } = await fetchSkillDetail(id, controller.signal, {
        refresh: options.refresh === true,
      })
      // The reader may have closed the panel view or opened another skill while
      // this was in flight; the newest request owns the pane.
      if (sequence !== detailSequence || !isCurrentDetail(id)) return
      detailCache.set(id, { skill, status: sourceStatus })
      commit({
        detail: skill,
        detailStatus: sourceStatus,
        detailLoading: false,
        detailError: null,
        sources: mergeSourceStatus(state.sources, skill.source, sourceStatus),
      })
    } catch (error) {
      if (sequence !== detailSequence || isAbortError(error)) return
      // Only the Host may authorize stale fallback. A display snapshot must not
      // hide a failed revalidation or outlive the Host's retention limit.
      detailCache.delete(id)
      commit({ detail: null, detailStatus: null, detailLoading: false, detailError: errorMessage(error) })
    }
  }

  /** Show a previous copy immediately, then check the Host's authoritative cache. */
  async function openDetail(id: string, options: { refresh?: boolean } = {}): Promise<void> {
    const cached = options.refresh === true ? undefined : detailCache.get(id)
    fileSequence += 1
    fileAbort?.abort()
    inFlightFileKey = null
    commit({
      view: { kind: 'detail', id },
      activeTab: 'overview',
      file: null,
      fileLoading: false,
      detailError: null,
    })
    if (cached !== undefined) {
      // The stored provenance travels with the stored payload: a reader coming
      // back to this skill must not be told the copy is fresher than it is.
      commit({ detail: cached.skill, detailStatus: { ...cached.status, fromCache: true }, detailLoading: false })
    } else {
      commit({ detail: null, detailStatus: null, detailLoading: true })
    }
    await loadDetail(id, options)
  }

  function closeDetail(): void {
    // Bump both sequences: an in-flight response for the closed skill must not
    // land on the catalogue, and neither must a file for it.
    detailSequence += 1
    fileSequence += 1
    detailAbort?.abort()
    fileAbort?.abort()
    commit({
      view: { kind: 'home' },
      detail: null,
      detailStatus: null,
      detailLoading: false,
      detailError: null,
      file: null,
      fileLoading: false,
      activeTab: 'overview',
    })
  }

  function setTab(tab: 'overview' | 'files'): void {
    commit({ activeTab: tab })
    if (tab !== 'files') return
    // Opening the Files tab with nothing selected would show an empty pane; the
    // first file is the skill's entry point in practice (SKILL.md).
    if (state.file !== null || state.fileLoading) return
    const detail = state.detail
    if (detail === null) return
    const first = detail.files[0]
    if (first === undefined) return
    void selectFile(first.path)
  }

  /** Read through the Host's TTL cache, with one in-flight request per path. */
  async function selectFile(path: string): Promise<void> {
    if (state.view.kind !== 'detail') return
    const id = state.view.id
    const key = fileCacheKey(id, path)
    if (inFlightFileKey === key) return

    const sequence = ++fileSequence
    fileAbort?.abort()
    const controller = new AbortController()
    fileAbort = controller
    inFlightFileKey = key
    commit({ file: null, fileLoading: true })
    try {
      const file = await fetchSkillFile(id, path, controller.signal)
      if (sequence !== fileSequence) return
      commit({ file, fileLoading: false })
    } catch (error) {
      if (sequence !== fileSequence || isAbortError(error)) return
      // A file failure is a notice, not a region error: the rest of the skill
      // detail is still perfectly readable.
      commit({ file: null, fileLoading: false, notice: errorMessage(error) })
    } finally {
      if (inFlightFileKey === key) inFlightFileKey = null
    }
  }

  /** Ask for confirmation before installing; the dialog is the only way in. */
  function requestInstall(id: string): void {
    if (state.installingIds.has(id)) return
    commit({ confirmInstallId: id, notice: null })
  }

  function cancelInstall(): void {
    const id = state.confirmInstallId
    if (id === null) return
    // While the install runs the dialog stays up (busy) — cancelling the view is
    // not cancelling the request, so the button is inert until it settles.
    if (state.installingIds.has(id)) return
    commit({ confirmInstallId: null })
  }

  async function confirmInstall(): Promise<void> {
    const id = state.confirmInstallId
    if (id === null || state.installingIds.has(id)) return
    commit({ installingIds: withId(state.installingIds, id), notice: null })
    try {
      const result = await installSkill(id)
      applySkillUpdate(result.skill)
      setNotice('installDone')
    } catch (error) {
      if (!isAbortError(error)) setNotice(errorMessage(error))
    } finally {
      // Close the dialog only once the request settled, so the busy state it
      // shows belongs to the request the reader confirmed.
      commit({ installingIds: withoutId(state.installingIds, id), confirmInstallId: null })
    }
  }

  /** Uninstall straight from a card or the detail rail — no confirmation dialog. */
  async function uninstall(id: string): Promise<void> {
    if (state.installingIds.has(id)) return
    commit({ installingIds: withId(state.installingIds, id), notice: null })
    try {
      const result = await uninstallSkill(id)
      applySkillUpdate(result.skill)
      setNotice('uninstallDone')
    } catch (error) {
      if (!isAbortError(error)) setNotice(errorMessage(error))
    } finally {
      commit({ installingIds: withoutId(state.installingIds, id) })
    }
  }

  function dismissDisclaimer(): void {
    commit({ disclaimerDismissed: true })
    writeDisclaimerDismissed()
  }

  function dismissNotice(): void {
    setNotice(null)
  }

  return {
    get state() {
      return state
    },
    injected: { useMarketController },
    refresh,
    loadMore,
    setQuery,
    setSource: (source) => {
      applyInstantFilter({ source })
    },
    setSecurity: (security) => {
      applyInstantFilter({ security })
    },
    setInstalledFilter: (installed) => {
      applyInstantFilter({ installed })
    },
    openDetail,
    closeDetail,
    setTab,
    selectFile,
    requestInstall,
    cancelInstall,
    confirmInstall,
    uninstall,
    dismissDisclaimer,
    dismissNotice,
    subscribe,
    getSnapshot,
  }
}

/**
 * Create one panel controller.
 *
 * `useMarketController` calls this per mounted panel; `createMarketController` is
 * also the entry point for tests, which is why the factory performs no I/O — the
 * first request only happens when the panel asks for it.
 */
export function createMarketController(): MarketController {
  return createInternalController()
}

/**
 * React binding.
 *
 * `useSyncExternalStore` is the whole subscription: React owns the subscribe /
 * unsubscribe pairing, so an unmount cannot leak a listener, and the initializer
 * runs at most twice under StrictMode's development double-invocation (the extra
 * controller is discarded and holds no resources — no request, timer or
 * subscription exists until the panel asks for one).
 *
 * There is deliberately no unmount disposer: a StrictMode cleanup would tear down
 * the controller React is still using, and a late response writing into this
 * store is inert — nothing but the snapshot identity of an external store
 * changes, so no React state update happens after unmount.
 */
export function useMarketController(): MarketController {
  const [controller] = useState<MarketControllerInternal>(createInternalController)
  useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot)
  return controller
}
