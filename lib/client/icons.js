import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** Attributes every icon shares; spread first so a caller's props win. */
const stroke = {
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
};
/**
 * Sidebar entry glyph: a shop awning over a storefront.
 *
 * Drawn on a 20px grid rather than 16 so the awning scallops stay legible at
 * the 20px the shell may use for a wide sidebar; at 16px it scales down
 * cleanly because every edge is axis-aligned or a single arc.
 *
 * Renders a bare `<svg>` and never a button: `sidebar.panellist` entries are
 * rendered inside the sidebar's own `<button>` (see `PanelRow` in
 * `dsh-client-ui-sidebar/lib/client.js`), so an interactive wrapper here would
 * nest a control inside a control.
 */
export function SkillsHubIcon({ size = 16, active = false, className }) {
    return (_jsxs("svg", { width: size, height: size, viewBox: "0 0 20 20", className: className, strokeWidth: active ? 1.8 : 1.6, ...stroke, "aria-hidden": "true", focusable: "false", children: [_jsx("path", { d: "M2.6 8.4 3.9 4.4a.9.9 0 0 1 .86-.62h10.48a.9.9 0 0 1 .86.62l1.3 4" }), _jsx("path", { d: "M2.6 8.4a1.85 1.85 0 0 0 3.7 0 1.85 1.85 0 0 0 3.7 0 1.85 1.85 0 0 0 3.7 0 1.85 1.85 0 0 0 3.7 0", fill: active ? 'currentColor' : 'none', fillOpacity: active ? 0.16 : 0 }), _jsx("path", { d: "M4.6 8.4v7.8h10.8V8.4" }), _jsx("path", { d: "M8.2 16.2v-3.4a.9.9 0 0 1 .9-.9h1.8a.9.9 0 0 1 .9.9v3.4" })] }));
}
/** Magnifier: search input affordance. */
export function SearchIcon({ size = 16, className }) {
    return (_jsxs("svg", { width: size, height: size, viewBox: "0 0 16 16", className: className, strokeWidth: 1.5, ...stroke, "aria-hidden": "true", focusable: "false", children: [_jsx("circle", { cx: "7.1", cy: "7.1", r: "4.6" }), _jsx("path", { d: "m10.6 10.6 3 3" })] }));
}
/** Arrow into a tray: install action and the download count. */
export function DownloadIcon({ size = 16, className }) {
    return (_jsxs("svg", { width: size, height: size, viewBox: "0 0 16 16", className: className, strokeWidth: 1.5, ...stroke, "aria-hidden": "true", focusable: "false", children: [_jsx("path", { d: "M8 2.4v6.9" }), _jsx("path", { d: "m5 6.5 3 3 3-3" }), _jsx("path", { d: "M2.9 11.8v.7a1.3 1.3 0 0 0 1.3 1.3h7.6a1.3 1.3 0 0 0 1.3-1.3v-.7" })] }));
}
/** Five-point star: star count. */
export function StarIcon({ size = 16, className }) {
    return (_jsx("svg", { width: size, height: size, viewBox: "0 0 16 16", className: className, strokeWidth: 1.5, ...stroke, "aria-hidden": "true", focusable: "false", children: _jsx("path", { d: "m8 2.1 1.8 3.6 4 .6-2.9 2.8.7 4L8 11.2l-3.6 1.9.7-4-2.9-2.8 4-.6z" }) }));
}
/** Waste bin: uninstall action. */
export function TrashIcon({ size = 16, className }) {
    return (_jsxs("svg", { width: size, height: size, viewBox: "0 0 16 16", className: className, strokeWidth: 1.5, ...stroke, "aria-hidden": "true", focusable: "false", children: [_jsx("path", { d: "M2.7 4.3h10.6" }), _jsx("path", { d: "M5.9 4.3V3.1a.9.9 0 0 1 .9-.9h2.4a.9.9 0 0 1 .9.9v1.2" }), _jsx("path", { d: "m4.3 4.3.6 8.3a1.1 1.1 0 0 0 1.1 1h4a1.1 1.1 0 0 0 1.1-1l.6-8.3" }), _jsx("path", { d: "M6.6 6.8v4.1M9.4 6.8v4.1" })] }));
}
/** Shield outline: audit / security status. */
export function ShieldIcon({ size = 16, className }) {
    return (_jsx("svg", { width: size, height: size, viewBox: "0 0 16 16", className: className, strokeWidth: 1.5, ...stroke, "aria-hidden": "true", focusable: "false", children: _jsx("path", { d: "M8 2.1 3.2 4v3.9c0 2.9 1.9 5.2 4.8 6.3 2.9-1.1 4.8-3.4 4.8-6.3V4z" }) }));
}
/** Left arrow: back to the catalogue. */
export function ArrowLeftIcon({ size = 16, className }) {
    return (_jsxs("svg", { width: size, height: size, viewBox: "0 0 16 16", className: className, strokeWidth: 1.6, ...stroke, "aria-hidden": "true", focusable: "false", children: [_jsx("path", { d: "M12.8 8H3.3" }), _jsx("path", { d: "M6.7 4.6 3.3 8l3.4 3.4" })] }));
}
/** Circular arrow pair: re-fetch list or source health. */
export function RefreshIcon({ size = 16, className }) {
    return (_jsxs("svg", { width: size, height: size, viewBox: "0 0 16 16", className: className, strokeWidth: 1.5, ...stroke, "aria-hidden": "true", focusable: "false", children: [_jsx("path", { d: "M3.1 8.6a4.9 4.9 0 0 1 8.2-4.1" }), _jsx("path", { d: "M12.9 7.4a4.9 4.9 0 0 1-8.2 4.1" }), _jsx("path", { d: "M11.3 1.9v2.6H8.7" }), _jsx("path", { d: "M4.7 14.1v-2.6h2.6" })] }));
}
/** Two stacked sheets: copy file content. */
export function CopyIcon({ size = 16, className }) {
    return (_jsxs("svg", { width: size, height: size, viewBox: "0 0 16 16", className: className, strokeWidth: 1.5, ...stroke, "aria-hidden": "true", focusable: "false", children: [_jsx("rect", { x: "5.7", y: "5.7", width: "7.7", height: "7.7", rx: "1.6" }), _jsx("path", { d: "M10.3 5.7V3.9a1.3 1.3 0 0 0-1.3-1.3H3.9a1.3 1.3 0 0 0-1.3 1.3v5.1a1.3 1.3 0 0 0 1.3 1.3h1.8" })] }));
}
/** Tick: copied confirmation and the installed state. */
export function CheckIcon({ size = 16, className }) {
    return (_jsx("svg", { width: size, height: size, viewBox: "0 0 16 16", className: className, strokeWidth: 1.75, ...stroke, "aria-hidden": "true", focusable: "false", children: _jsx("path", { d: "m3.1 8.5 3.3 3.3 6.5-7.6" }) }));
}
/** Document with a folded corner: a skill file. */
export function FileIcon({ size = 16, className }) {
    return (_jsxs("svg", { width: size, height: size, viewBox: "0 0 16 16", className: className, strokeWidth: 1.5, ...stroke, "aria-hidden": "true", focusable: "false", children: [_jsx("path", { d: "M9.2 1.9H4.6a1.4 1.4 0 0 0-1.4 1.4v9.4a1.4 1.4 0 0 0 1.4 1.4h6.8a1.4 1.4 0 0 0 1.4-1.4V5.5z" }), _jsx("path", { d: "M9.2 1.9v3.6h3.6" })] }));
}
/** Warning triangle: errors and flagged skills. */
export function AlertIcon({ size = 16, className }) {
    return (_jsxs("svg", { width: size, height: size, viewBox: "0 0 16 16", className: className, strokeWidth: 1.5, ...stroke, "aria-hidden": "true", focusable: "false", children: [_jsx("path", { d: "M6.9 2.3 1.5 11.9a1.2 1.2 0 0 0 1.1 1.8h10.8a1.2 1.2 0 0 0 1.1-1.8L9.1 2.3a1.3 1.3 0 0 0-2.2 0Z" }), _jsx("path", { d: "M8 6.1v3.2" }), _jsx("circle", { cx: "8", cy: "11.5", r: ".7", fill: "currentColor", stroke: "none" })] }));
}
/** Chevron: disclosure affordance on a selectable row. */
export function ChevronRightIcon({ size = 16, className }) {
    return (_jsx("svg", { width: size, height: size, viewBox: "0 0 16 16", className: className, strokeWidth: 1.6, ...stroke, "aria-hidden": "true", focusable: "false", children: _jsx("path", { d: "m6.1 3.5 4.4 4.5-4.4 4.5" }) }));
}
/** Diagonal cross: dismiss a banner, clear the search field. */
export function CloseIcon({ size = 16, className }) {
    return (_jsx("svg", { width: size, height: size, viewBox: "0 0 16 16", className: className, strokeWidth: 1.6, ...stroke, "aria-hidden": "true", focusable: "false", children: _jsx("path", { d: "m3.6 3.6 8.8 8.8M12.4 3.6l-8.8 8.8" }) }));
}
/** Price tag: leading glyph of a card's tag row. */
export function TagIcon({ size = 16, className }) {
    return (_jsxs("svg", { width: size, height: size, viewBox: "0 0 16 16", className: className, strokeWidth: 1.5, ...stroke, "aria-hidden": "true", focusable: "false", children: [_jsx("path", { d: "M2.6 7.4V3.9a1.3 1.3 0 0 1 1.3-1.3h3.5a1.3 1.3 0 0 1 .92.38l5 5a1.3 1.3 0 0 1 0 1.84l-3.5 3.5a1.3 1.3 0 0 1-1.84 0l-5-5a1.3 1.3 0 0 1-.38-.92Z" }), _jsx("circle", { cx: "5.7", cy: "5.7", r: ".85" })] }));
}
