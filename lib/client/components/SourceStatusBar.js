import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button, StateDot, Tooltip } from '@deepseek-ai/dsh-client-ui-primitives';
import { useT } from "../locale-context.js";
import { RefreshIcon } from "../icons.js";
import styles from './SourceStatusBar.module.css';
/**
 * Display order, declared locally rather than imported: `MARKET_SOURCES` is a
 * runtime value in `src/market/types.ts`, and a value import from that module
 * would pull host-facing code into the browser bundle (contract §4).
 */
const SOURCES = ['clawhub', 'skillhub'];
/** Upstream health mapped onto the primitive's five-way state vocabulary. */
const DOT_STATES = {
    ok: 'done',
    degraded: 'warning',
    failed: 'error',
    cached: 'idle',
};
/**
 * Per-source health strip.
 *
 * The upstream error string rides the pill's `title` instead of being printed:
 * a 720px panel has no room for a stack trace next to two source names, and an
 * operator who needs it can hover.
 */
export function SourceStatusBar(props) {
    const { sources, onRefresh, refreshing } = props;
    const t = useT();
    return (_jsxs("div", { className: styles.bar, children: [_jsx("ul", { className: styles.list, children: SOURCES.map((source) => {
                    const info = sources[source];
                    return (_jsxs("li", { className: styles.item, title: info.error, children: [_jsx(StateDot, { state: DOT_STATES[info.status], className: styles.dot }), _jsx("span", { className: styles.name, children: t(`source.${source}`) }), _jsx("span", { className: styles.status, children: t(`sourceStatus.${info.status}`) })] }, source));
                }) }), _jsx(Tooltip, { label: t('retry'), children: _jsx(Button, { variant: "ghost", size: "sm", className: styles.refresh, disabled: refreshing, "aria-label": t('retry'), onClick: onRefresh, icon: _jsx(RefreshIcon, { size: 16, className: refreshing ? styles.spinning : undefined }) }) })] }));
}
