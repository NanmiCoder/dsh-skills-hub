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
import type { MarketCategory, MarketFileContent, MarketSource, NormalizedSkill, NormalizedSkillDetail, SecurityStatus, SourceStatusInfo } from '../market/types.ts';
/**
 * Notice values that are dictionary *codes* rather than literal text.
 *
 * The controller has no locale (it is framework-free and testable), so it stores
 * a code for the panel to translate and stores a verbatim message for anything
 * that has no dictionary entry — which is exactly what a Host error is.
 */
export declare const MARKET_NOTICE_CODES: readonly ["installDone", "uninstallDone"];
/** A notice value the panel translates through its dictionary. */
export type MarketNoticeCode = (typeof MARKET_NOTICE_CODES)[number];
/** Whether a `state.notice` value is a dictionary code (as opposed to verbatim text). */
export declare function isMarketNoticeCode(notice: string): notice is MarketNoticeCode;
/** Tabs of the market detail page. */
export type MarketDetailTab = 'overview' | 'files' | 'security' | 'changelog';
/** Active catalogue filters. */
export interface MarketFilters {
    q: string;
    /**
     * `catalog`: the curated list shipped with the plugin (default).
     * `market`: live search across both registries, entered explicitly from a
     * catalogue search; clearing the query returns to the catalogue.
     */
    scope: 'catalog' | 'market';
    /** Catalogue category key, or `'all'`. */
    category: string;
    source: 'all' | MarketSource;
    security: 'all' | SecurityStatus;
    installed: 'all' | 'installed' | 'installable';
}
/** Everything the panel renders from. Immutable: each commit publishes a new object. */
export interface MarketState {
    filters: MarketFilters;
    /** Category bar entries; empty until loaded. */
    categories: MarketCategory[];
    items: NormalizedSkill[];
    nextCursor: string | null;
    /** Matching skills in total, when the list knows it (the curated catalogue does). */
    total: number | null;
    sources: Record<MarketSource, SourceStatusInfo>;
    /** Each card retains the provenance of its own page when more pages append. */
    itemStatuses: Record<string, SourceStatusInfo>;
    loading: boolean;
    loadingMore: boolean;
    error: string | null;
    view: {
        kind: 'home';
    } | {
        kind: 'detail';
        id: string;
    };
    detail: NormalizedSkillDetail | null;
    /** Provenance of `detail`: when it was fetched upstream, and whether it is a snapshot. */
    detailStatus: SourceStatusInfo | null;
    detailLoading: boolean;
    detailError: string | null;
    activeTab: MarketDetailTab;
    file: MarketFileContent | null;
    fileLoading: boolean;
    installingIds: ReadonlySet<string>;
    confirmInstallId: string | null;
    disclaimerDismissed: boolean;
    notice: string | null;
}
/** Actions and state the panel root drives. */
export interface MarketController {
    state: MarketState;
    readonly injected: MarketPageInjected;
    /** `force` is the reader's refresh: it must not be answered from the cache. */
    refresh(options?: {
        force?: boolean;
    }): Promise<void>;
    loadMore(): Promise<void>;
    setQuery(q: string): void;
    setCategory(category: MarketFilters['category']): void;
    setScope(scope: MarketFilters['scope']): void;
    /** Load the category bar once per controller (repeat calls share it). */
    loadCategories(): Promise<void>;
    setSource(source: MarketFilters['source']): void;
    setSecurity(security: MarketFilters['security']): void;
    setInstalledFilter(installed: MarketFilters['installed']): void;
    /** `owner` names the registry author when the id alone is ambiguous (ClawHub). */
    openDetail(id: string, options?: {
        refresh?: boolean;
        owner?: string;
    }): Promise<void>;
    closeDetail(): void;
    setTab(tab: MarketDetailTab): void;
    selectFile(path: string): Promise<void>;
    requestInstall(id: string): void;
    cancelInstall(): void;
    confirmInstall(): Promise<void>;
    uninstall(id: string): Promise<void>;
    dismissDisclaimer(): void;
    dismissNotice(): void;
}
/** The business face one `main` registration injects into the panel component. */
export interface MarketPageInjected {
    useMarketController: () => MarketController;
}
/**
 * Create one panel controller.
 *
 * `useMarketController` calls this per mounted panel; `createMarketController` is
 * also the entry point for tests, which is why the factory performs no I/O — the
 * first request only happens when the panel asks for it.
 */
export declare function createMarketController(): MarketController;
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
export declare function useMarketController(): MarketController;
