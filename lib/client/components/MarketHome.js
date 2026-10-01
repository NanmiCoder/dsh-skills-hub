import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { Button, StateDot } from '@deepseek-ai/dsh-client-ui-primitives';
import { useT } from "../locale-context.js";
import { AlertIcon, RefreshIcon, SkillsHubIcon } from "../icons.js";
import { formatStamp } from "../relative-time.js";
import { CategoryBar } from "./CategoryBar.js";
import { FilterBar } from "./FilterBar.js";
import { MarketDisclaimer } from "./MarketDisclaimer.js";
import { SkillCard } from "./SkillCard.js";
import { SourceStatusBar } from "./SourceStatusBar.js";
import styles from './MarketHome.module.css';
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
const PREFETCH_MARGIN = '900px 0px';
/** Nearest scrollable ancestor, or `null` when the list scrolls with the document. */
function scrollContainerOf(element) {
    let node = element.parentElement;
    while (node !== null && node !== document.body) {
        const overflowY = getComputedStyle(node).overflowY;
        if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight)
            return node;
        node = node.parentElement;
    }
    return null;
}
/**
 * Market catalogue page.
 *
 * Presentational by contract: every interaction below is a call on the
 * controller, and every rendered value comes from `state`. That keeps the
 * whole page renderable in a bare test render with no services and no fetch.
 */
export function MarketHome(props) {
    const { state, controller } = props;
    const t = useT();
    const sentinelRef = useRef(null);
    const [scrolled, setScrolled] = useState(false);
    // Look-ahead is a *scrolling* optimisation, so it waits for a scroll. Arming it
    // on the tall header alone would fetch the second page for every reader who
    // opens the panel and leaves — traffic with nobody waiting for it. The scroll
    // may come from the host's dock rather than this subtree, so the listener
    // rides the capture phase on the document.
    useEffect(() => {
        if (scrolled)
            return;
        const mark = () => setScrolled(true);
        document.addEventListener('scroll', mark, { capture: true, passive: true, once: true });
        return () => document.removeEventListener('scroll', mark, { capture: true });
    }, [scrolled]);
    // Observe the end of the catalogue within the host's scrollable dock. Re-arm
    // after each page so a short page naturally fills the viewport.
    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (sentinel === null || !scrolled || state.nextCursor === null || state.loading || state.loadingMore || state.error !== null)
            return;
        const observer = new IntersectionObserver((entries) => {
            if (entries.some((entry) => entry.isIntersecting))
                void controller.loadMore();
            // One screen of look-ahead: the page is fetched while the reader is still
            // a scroll away from it, so arriving at the sentinel finds the data (or a
            // request already in flight) instead of starting one. The request count is
            // unchanged — it only moves earlier, which is the whole point.
        }, { root: scrollContainerOf(sentinel), rootMargin: PREFETCH_MARGIN });
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [controller, scrolled, state.nextCursor, state.loading, state.loadingMore, state.error]);
    /**
     * The filter bar reports a patch; the controller exposes one setter per
     * field. Each branch is guarded so an unrelated key in the patch cannot
     * trigger a redundant reload.
     */
    const applyFilterPatch = (patch) => {
        if (patch.q !== undefined)
            controller.setQuery(patch.q);
        if (patch.source !== undefined)
            controller.setSource(patch.source);
        if (patch.security !== undefined)
            controller.setSecurity(patch.security);
        if (patch.installed !== undefined)
            controller.setInstalledFilter(patch.installed);
    };
    const hasItems = state.items.length > 0;
    const searching = state.filters.q.trim() !== '';
    const isInitialLoad = state.loading && !hasItems;
    // "Nothing matched" and "the shops are empty" are different problems, and the
    // dictionary already distinguishes them.
    const narrowed = state.filters.q !== '' || state.filters.category !== 'all' || state.filters.source !== 'all' || state.filters.security !== 'all' || state.filters.installed !== 'all';
    const catalogue = state.filters.scope === 'catalog';
    const catalogueAt = catalogue ? state.sources.clawhub.fetchedAt : undefined;
    return (_jsxs("div", { className: styles.home, children: [_jsxs("div", { className: styles.top, children: [_jsxs("header", { className: styles.masthead, children: [_jsx("span", { className: styles.mark, "aria-hidden": "true", children: _jsx(SkillsHubIcon, { size: 22 }) }), _jsxs("div", { className: styles.mastheadText, children: [_jsx("h1", { className: styles.title, children: t('title') }), _jsx("p", { className: styles.subtitle, children: t('subtitle') })] })] }), !state.disclaimerDismissed && _jsx(MarketDisclaimer, { onDismiss: () => controller.dismissDisclaimer() }), catalogue && (_jsx(CategoryBar, { categories: state.categories, active: state.filters.category, disabled: state.loading, onSelect: (category) => controller.setCategory(category) })), _jsx(FilterBar, { filters: state.filters, total: state.items.length, disabled: state.loading, onChange: applyFilterPatch })] }), _jsxs("div", { className: styles.canvas, children: [_jsxs("div", { className: styles.statusRow, children: [_jsxs("p", { className: styles.count, "aria-live": "polite", children: [isInitialLoad
                                        ? t('loading')
                                        : catalogue && state.total !== null
                                            ? t('catalogSummary', { count: state.total })
                                            : t(catalogue ? 'count' : 'liveResults', { count: state.items.length }), catalogueAt !== undefined && (_jsx("span", { className: styles.countNote, title: formatStamp(catalogueAt), children: t('catalogUpdated', { date: new Date(catalogueAt).toISOString().slice(0, 10) }) }))] }), !catalogue && (_jsx(SourceStatusBar, { sources: state.sources, onRefresh: () => void controller.refresh({ force: true }), refreshing: state.loading }))] }), searching && (_jsxs("p", { className: styles.scope, children: [catalogue ? t('scope.catalogHint') : t('scope.marketHint'), _jsx("button", { type: "button", className: styles.scopeSwitch, disabled: state.loading, onClick: () => controller.setScope(catalogue ? 'market' : 'catalog'), children: catalogue ? t('scope.searchMarket', { q: state.filters.q.trim() }) : t('scope.backToCatalog') })] })), _jsxs("div", { className: styles.body, "aria-busy": state.loading, children: [state.error !== null && (_jsxs("div", { className: styles.error, role: "alert", children: [_jsx(AlertIcon, { size: 22, className: styles.errorIcon }), _jsx("p", { className: styles.errorTitle, children: t('error') }), _jsx("p", { className: styles.errorDetail, children: state.error }), _jsx(Button, { variant: "outline", size: "md", icon: _jsx(RefreshIcon, { size: 16 }), onClick: () => void (hasItems ? controller.loadMore() : controller.refresh()), children: t('retry') })] })), state.error === null && isInitialLoad && (_jsx("div", { role: "status", "aria-label": t('loading'), children: _jsx("div", { className: styles.grid, "aria-hidden": "true", children: Array.from({ length: 8 }, (_, index) => (_jsxs("div", { className: styles.skeletonCard, children: [_jsxs("div", { className: styles.skeletonHeader, children: [_jsx("span", { className: styles.skeletonAvatar }), _jsx("span", { className: styles.skeletonTitle })] }), _jsx("span", { className: styles.skeletonLine }), _jsx("span", { className: styles.skeletonLine }), _jsx("span", { className: styles.skeletonShort })] }, index))) }) })), state.error === null && !state.loading && !hasItems && state.nextCursor === null && (_jsxs("div", { className: styles.empty, children: [_jsx(SkillsHubIcon, { size: 26 }), _jsx("p", { className: styles.emptyTitle, children: narrowed ? t('emptySearch') : t('empty') }), _jsx("p", { className: styles.emptyText, children: narrowed ? t('emptySearchHint') : t('emptyHint') })] })), hasItems && (_jsx(_Fragment, { children: _jsx("div", { className: styles.grid, children: state.items.map((skill) => (_jsx(SkillCard, { skill: skill, installing: state.installingIds.has(skill.id), onOpen: (id) => void controller.openDetail(id), onInstall: (id) => controller.requestInstall(id) }, skill.id))) }) })), state.nextCursor !== null && (_jsx("div", { ref: sentinelRef, className: styles.more, children: state.loadingMore && (_jsxs("p", { className: styles.loading, role: "status", "aria-live": "polite", children: [_jsx(StateDot, { state: "ongoing", size: 16 }), t('loadingMore')] })) }))] })] })] }));
}
