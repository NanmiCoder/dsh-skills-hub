import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Button, StateDot } from '@deepseek-ai/dsh-client-ui-primitives';
import { useT } from "../locale-context.js";
import { AlertIcon, DownloadIcon, RefreshIcon, SkillsHubIcon } from "../icons.js";
import { FilterBar } from "./FilterBar.js";
import { MarketDisclaimer } from "./MarketDisclaimer.js";
import { SkillCard } from "./SkillCard.js";
import { SourceStatusBar } from "./SourceStatusBar.js";
import styles from './MarketHome.module.css';
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
    const isInitialLoad = state.loading && !hasItems;
    // "Nothing matched" and "the shops are empty" are different problems, and the
    // dictionary already distinguishes them.
    const narrowed = state.filters.q !== '' || state.filters.source !== 'all' || state.filters.security !== 'all' || state.filters.installed !== 'all';
    return (_jsxs("div", { className: styles.home, children: [_jsxs("header", { className: styles.masthead, children: [_jsx("span", { className: styles.mark, "aria-hidden": "true", children: _jsx(SkillsHubIcon, { size: 22 }) }), _jsxs("div", { className: styles.mastheadText, children: [_jsx("h1", { className: styles.title, children: t('title') }), _jsx("p", { className: styles.subtitle, children: t('subtitle') })] })] }), !state.disclaimerDismissed && _jsx(MarketDisclaimer, { onDismiss: () => controller.dismissDisclaimer() }), _jsxs("div", { className: styles.statusRow, children: [_jsx("p", { className: styles.count, "aria-live": "polite", children: t('count', { count: state.items.length }) }), _jsx(SourceStatusBar, { sources: state.sources, onRefresh: () => void controller.refresh(), refreshing: state.loading })] }), _jsx(FilterBar, { filters: state.filters, total: state.items.length, disabled: state.loading, onChange: applyFilterPatch }), _jsxs("div", { className: styles.body, "aria-busy": state.loading, children: [state.error !== null && (_jsxs("div", { className: styles.error, role: "alert", children: [_jsx(AlertIcon, { size: 22, className: styles.errorIcon }), _jsx("p", { className: styles.errorTitle, children: t('error') }), _jsx("p", { className: styles.errorDetail, children: state.error }), _jsx(Button, { variant: "outline", size: "md", icon: _jsx(RefreshIcon, { size: 16 }), onClick: () => void controller.refresh(), children: t('retry') })] })), state.error === null && isInitialLoad && (_jsxs("p", { className: styles.loading, role: "status", "aria-live": "polite", children: [_jsx(StateDot, { state: "ongoing", size: 16 }), t('loading')] })), state.error === null && !state.loading && !hasItems && (_jsxs("div", { className: styles.empty, children: [_jsx(SkillsHubIcon, { size: 26 }), _jsx("p", { className: styles.emptyTitle, children: narrowed ? t('emptySearch') : t('empty') }), _jsx("p", { className: styles.emptyText, children: narrowed ? t('emptySearchHint') : t('emptyHint') })] })), state.error === null && hasItems && (_jsxs(_Fragment, { children: [_jsx("div", { className: styles.grid, children: state.items.map((skill) => (_jsx(SkillCard, { skill: skill, installing: state.installingIds.has(skill.id), onOpen: (id) => void controller.openDetail(id), onInstall: (id) => controller.requestInstall(id) }, skill.id))) }), state.nextCursor !== null && (_jsx("div", { className: styles.more, children: state.loadingMore ? (_jsxs("p", { className: styles.loading, role: "status", "aria-live": "polite", children: [_jsx(StateDot, { state: "ongoing", size: 16 }), t('loadingMore')] })) : (_jsx(Button, { variant: "outline", size: "md", disabled: state.loading, icon: _jsx(DownloadIcon, { size: 16 }), onClick: () => void controller.loadMore(), children: t('loadMore') })) }))] }))] })] }));
}
