import type { MarketSource, SourceStatusInfo } from '../../market/types.ts';
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
export declare function SourceStatusBar(props: {
    sources: Record<MarketSource, SourceStatusInfo>;
    onRefresh: () => void;
    refreshing: boolean;
}): JSX.Element;
