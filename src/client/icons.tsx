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
  size?: number
  /** Extra class for placement; the icon owns only its own geometry. */
  className?: string
}

/** Props of the sidebar entry glyph, which the shell marks as selected. */
export interface SkillsHubPanelIconProps extends SkillsHubIconProps {
  /**
   * Selected-panel state, injected by `sidebar.panellist` for the active row.
   * Only the glyph's weight and awning fill change — color stays `currentColor`
   * so the sidebar keeps ownership of the row's token colors.
   */
  active?: boolean
}

/** Attributes every icon shares; spread first so a caller's props win. */
const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

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
export function SkillsHubIcon({ size = 16, active = false, className }: SkillsHubPanelIconProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      className={className}
      strokeWidth={active ? 1.8 : 1.6}
      {...stroke}
      aria-hidden="true"
      focusable="false"
    >
      {/* Awning: sloped roof plus a hanging scalloped valance. */}
      <path d="M2.6 8.4 3.9 4.4a.9.9 0 0 1 .86-.62h10.48a.9.9 0 0 1 .86.62l1.3 4" />
      <path
        d="M2.6 8.4a1.85 1.85 0 0 0 3.7 0 1.85 1.85 0 0 0 3.7 0 1.85 1.85 0 0 0 3.7 0 1.85 1.85 0 0 0 3.7 0"
        fill={active ? 'currentColor' : 'none'}
        fillOpacity={active ? 0.16 : 0}
      />
      {/* Storefront body and its doorway. */}
      <path d="M4.6 8.4v7.8h10.8V8.4" />
      <path d="M8.2 16.2v-3.4a.9.9 0 0 1 .9-.9h1.8a.9.9 0 0 1 .9.9v3.4" />
    </svg>
  )
}

/** Magnifier: search input affordance. */
export function SearchIcon({ size = 16, className }: SkillsHubIconProps): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} strokeWidth={1.5} {...stroke} aria-hidden="true" focusable="false">
      <circle cx="7.1" cy="7.1" r="4.6" />
      <path d="m10.6 10.6 3 3" />
    </svg>
  )
}

/** Arrow into a tray: install action and the download count. */
export function DownloadIcon({ size = 16, className }: SkillsHubIconProps): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} strokeWidth={1.5} {...stroke} aria-hidden="true" focusable="false">
      <path d="M8 2.4v6.9" />
      <path d="m5 6.5 3 3 3-3" />
      <path d="M2.9 11.8v.7a1.3 1.3 0 0 0 1.3 1.3h7.6a1.3 1.3 0 0 0 1.3-1.3v-.7" />
    </svg>
  )
}

/** Five-point star: star count. */
export function StarIcon({ size = 16, className }: SkillsHubIconProps): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} strokeWidth={1.5} {...stroke} aria-hidden="true" focusable="false">
      <path d="m8 2.1 1.8 3.6 4 .6-2.9 2.8.7 4L8 11.2l-3.6 1.9.7-4-2.9-2.8 4-.6z" />
    </svg>
  )
}

/** Waste bin: uninstall action. */
export function TrashIcon({ size = 16, className }: SkillsHubIconProps): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} strokeWidth={1.5} {...stroke} aria-hidden="true" focusable="false">
      <path d="M2.7 4.3h10.6" />
      <path d="M5.9 4.3V3.1a.9.9 0 0 1 .9-.9h2.4a.9.9 0 0 1 .9.9v1.2" />
      <path d="m4.3 4.3.6 8.3a1.1 1.1 0 0 0 1.1 1h4a1.1 1.1 0 0 0 1.1-1l.6-8.3" />
      <path d="M6.6 6.8v4.1M9.4 6.8v4.1" />
    </svg>
  )
}

/** Shield outline: audit / security status. */
export function ShieldIcon({ size = 16, className }: SkillsHubIconProps): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} strokeWidth={1.5} {...stroke} aria-hidden="true" focusable="false">
      <path d="M8 2.1 3.2 4v3.9c0 2.9 1.9 5.2 4.8 6.3 2.9-1.1 4.8-3.4 4.8-6.3V4z" />
    </svg>
  )
}

/** Left arrow: back to the catalogue. */
export function ArrowLeftIcon({ size = 16, className }: SkillsHubIconProps): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} strokeWidth={1.6} {...stroke} aria-hidden="true" focusable="false">
      <path d="M12.8 8H3.3" />
      <path d="M6.7 4.6 3.3 8l3.4 3.4" />
    </svg>
  )
}

/** Circular arrow pair: re-fetch list or source health. */
export function RefreshIcon({ size = 16, className }: SkillsHubIconProps): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} strokeWidth={1.5} {...stroke} aria-hidden="true" focusable="false">
      <path d="M3.1 8.6a4.9 4.9 0 0 1 8.2-4.1" />
      <path d="M12.9 7.4a4.9 4.9 0 0 1-8.2 4.1" />
      <path d="M11.3 1.9v2.6H8.7" />
      <path d="M4.7 14.1v-2.6h2.6" />
    </svg>
  )
}

/** Two stacked sheets: copy file content. */
export function CopyIcon({ size = 16, className }: SkillsHubIconProps): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} strokeWidth={1.5} {...stroke} aria-hidden="true" focusable="false">
      <rect x="5.7" y="5.7" width="7.7" height="7.7" rx="1.6" />
      <path d="M10.3 5.7V3.9a1.3 1.3 0 0 0-1.3-1.3H3.9a1.3 1.3 0 0 0-1.3 1.3v5.1a1.3 1.3 0 0 0 1.3 1.3h1.8" />
    </svg>
  )
}

/** Tick: copied confirmation and the installed state. */
export function CheckIcon({ size = 16, className }: SkillsHubIconProps): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} strokeWidth={1.75} {...stroke} aria-hidden="true" focusable="false">
      <path d="m3.1 8.5 3.3 3.3 6.5-7.6" />
    </svg>
  )
}

/** Document with a folded corner: a skill file. */
export function FileIcon({ size = 16, className }: SkillsHubIconProps): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} strokeWidth={1.5} {...stroke} aria-hidden="true" focusable="false">
      <path d="M9.2 1.9H4.6a1.4 1.4 0 0 0-1.4 1.4v9.4a1.4 1.4 0 0 0 1.4 1.4h6.8a1.4 1.4 0 0 0 1.4-1.4V5.5z" />
      <path d="M9.2 1.9v3.6h3.6" />
    </svg>
  )
}

/** Warning triangle: errors and flagged skills. */
export function AlertIcon({ size = 16, className }: SkillsHubIconProps): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} strokeWidth={1.5} {...stroke} aria-hidden="true" focusable="false">
      <path d="M6.9 2.3 1.5 11.9a1.2 1.2 0 0 0 1.1 1.8h10.8a1.2 1.2 0 0 0 1.1-1.8L9.1 2.3a1.3 1.3 0 0 0-2.2 0Z" />
      <path d="M8 6.1v3.2" />
      <circle cx="8" cy="11.5" r=".7" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** Chevron: disclosure affordance on a selectable row. */
export function ChevronRightIcon({ size = 16, className }: SkillsHubIconProps): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} strokeWidth={1.6} {...stroke} aria-hidden="true" focusable="false">
      <path d="m6.1 3.5 4.4 4.5-4.4 4.5" />
    </svg>
  )
}

/** Diagonal cross: dismiss a banner, clear the search field. */
export function CloseIcon({ size = 16, className }: SkillsHubIconProps): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} strokeWidth={1.6} {...stroke} aria-hidden="true" focusable="false">
      <path d="m3.6 3.6 8.8 8.8M12.4 3.6l-8.8 8.8" />
    </svg>
  )
}

/** Price tag: leading glyph of a card's tag row. */
export function TagIcon({ size = 16, className }: SkillsHubIconProps): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} strokeWidth={1.5} {...stroke} aria-hidden="true" focusable="false">
      <path d="M2.6 7.4V3.9a1.3 1.3 0 0 1 1.3-1.3h3.5a1.3 1.3 0 0 1 .92.38l5 5a1.3 1.3 0 0 1 0 1.84l-3.5 3.5a1.3 1.3 0 0 1-1.84 0l-5-5a1.3 1.3 0 0 1-.38-.92Z" />
      <circle cx="5.7" cy="5.7" r=".85" />
    </svg>
  )
}

/** Folder: leading glyph of the installed skill's location line. */
export function FolderIcon({ size = 16, className }: SkillsHubIconProps): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} strokeWidth={1.5} {...stroke} aria-hidden="true" focusable="false">
      <path d="M1.9 4.6a1.3 1.3 0 0 1 1.3-1.3h2.5l1.4 1.6h5.7a1.3 1.3 0 0 1 1.3 1.3v5.6a1.3 1.3 0 0 1-1.3 1.3H3.2a1.3 1.3 0 0 1-1.3-1.3z" />
    </svg>
  )
}

/** Arrow leaving a frame: open the same skill in the marketplace. */
export function ExternalLinkIcon({ size = 16, className }: SkillsHubIconProps): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} strokeWidth={1.5} {...stroke} aria-hidden="true" focusable="false">
      <path d="M9.4 2.6h4v4" />
      <path d="M13.4 2.6 7.9 8.1" />
      <path d="M12.2 9.6v3.1a1.3 1.3 0 0 1-1.3 1.3H3.6a1.3 1.3 0 0 1-1.3-1.3V5.4a1.3 1.3 0 0 1 1.3-1.3h3.1" />
    </svg>
  )
}
