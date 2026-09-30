/**
 * Inline SVG icon set for the Skills Hub panel.
 *
 * The reference implementation used `lucide-react`; this plugin may not add a
 * dependency for fifteen glyphs, so every icon is drawn here as a stroked
 * `currentColor` SVG. Drawing rules kept uniform on purpose — a mixed set of
 * stroke widths and caps is the fastest way for a ported UI to look alien:
 *  - 16x16 viewBox (20x20 for the sidebar glyph, which the shell renders at 16-20px),
 *  - `fill: none` + `stroke: currentColor` so an icon inherits its parent's
 *    token-driven color and stays correct in both themes,
 *  - 1.5 default stroke width (`1.75` where a heavier weight is needed),
 *  - `aria-hidden` always: every icon here is decorative and either sits next
 *    to a text label or inside a control that carries its own accessible name.
 */
/** Props shared by every icon: pixel box and an optional extra class. */
export interface SkillsHubIconProps {
    /** Rendered width and height in px. Defaults to 16. */
    size?: number;
    /** Extra class for placement; the icon owns only its own geometry. */
    className?: string;
}
/** Props of the sidebar entry glyph, which the shell marks as selected. */
export interface SkillsHubPanelIconProps extends SkillsHubIconProps {
    /**
     * Selected-panel state, injected by `sidebar.panellist` for the active row.
     * Only the glyph's weight and awning fill change — color stays `currentColor`
     * so the sidebar keeps ownership of the row's token colors.
     */
    active?: boolean;
}
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
export declare function SkillsHubIcon({ size, active, className }: SkillsHubPanelIconProps): JSX.Element;
/** Magnifier: search input affordance. */
export declare function SearchIcon({ size, className }: SkillsHubIconProps): JSX.Element;
/** Arrow into a tray: install action and the download count. */
export declare function DownloadIcon({ size, className }: SkillsHubIconProps): JSX.Element;
/** Five-point star: star count. */
export declare function StarIcon({ size, className }: SkillsHubIconProps): JSX.Element;
/** Waste bin: uninstall action. */
export declare function TrashIcon({ size, className }: SkillsHubIconProps): JSX.Element;
/** Shield outline: audit / security status. */
export declare function ShieldIcon({ size, className }: SkillsHubIconProps): JSX.Element;
/** Left arrow: back to the catalogue. */
export declare function ArrowLeftIcon({ size, className }: SkillsHubIconProps): JSX.Element;
/** Circular arrow pair: re-fetch list or source health. */
export declare function RefreshIcon({ size, className }: SkillsHubIconProps): JSX.Element;
/** Two stacked sheets: copy file content. */
export declare function CopyIcon({ size, className }: SkillsHubIconProps): JSX.Element;
/** Tick: copied confirmation and the installed state. */
export declare function CheckIcon({ size, className }: SkillsHubIconProps): JSX.Element;
/** Document with a folded corner: a skill file. */
export declare function FileIcon({ size, className }: SkillsHubIconProps): JSX.Element;
/** Warning triangle: errors and flagged skills. */
export declare function AlertIcon({ size, className }: SkillsHubIconProps): JSX.Element;
/** Chevron: disclosure affordance on a selectable row. */
export declare function ChevronRightIcon({ size, className }: SkillsHubIconProps): JSX.Element;
/** Diagonal cross: dismiss a banner, clear the search field. */
export declare function CloseIcon({ size, className }: SkillsHubIconProps): JSX.Element;
/** Price tag: leading glyph of a card's tag row. */
export declare function TagIcon({ size, className }: SkillsHubIconProps): JSX.Element;
/** Folder: leading glyph of the installed skill's location line. */
export declare function FolderIcon({ size, className }: SkillsHubIconProps): JSX.Element;
/** Arrow leaving a frame: open the same skill in the marketplace. */
export declare function ExternalLinkIcon({ size, className }: SkillsHubIconProps): JSX.Element;
