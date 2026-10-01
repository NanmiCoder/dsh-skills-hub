/**
 * The detail surface shared by the market catalogue and the installed inventory
 * (design: "技能市场重构 – 详情页").
 *
 * Both pages answer the same question — "what is inside this skill?" — and the
 * only real difference is where the facts come from: an upstream provider or the
 * filesystem. The shell therefore owns everything that is *layout*: breadcrumb,
 * identity header, stats strip, underlined tabs, the grey canvas, and the
 * document/side-rail columns. Callers compose the header pieces and the active
 * tab's content, and keep their own tab state (the market page in
 * `MarketState`, the local page in component state).
 */

import { useEffect, useRef, type ReactNode } from 'react'
import type { SecurityStatus } from '../../market/types.ts'
import { AlertIcon, ArrowLeftIcon, ShieldIcon } from '../icons.tsx'
import { useT } from '../locale-context.tsx'
import styles from './SkillDetailShell.module.css'

/** The shell's stylesheet, for callers composing shell-shaped fragments. */
export const detailStyles = styles

export interface DetailTab<K extends string> {
  key: K
  label: string
  /** Small trailing marker: a count, or a warning dot. */
  badge?: ReactNode
}

export function SkillDetailShell<K extends string>(props: {
  /** Identity of the rendered subject; changing it moves focus to the heading. */
  focusKey: string
  onBack: () => void
  /** Breadcrumb root: the list this page was opened from. */
  backLabel: string
  avatar: ReactNode
  name: string
  version?: string
  /** One line of "by author · source · licence · updated" facts. */
  meta?: ReactNode
  summary?: string
  chips?: ReactNode
  actions?: ReactNode
  stats?: Array<{ label: string; value: string }>
  tabs: Array<DetailTab<K>>
  activeTab: K
  onTabChange: (tab: K) => void
  /** Notes above the tab content (snapshot age, location, warnings). */
  notice?: ReactNode
  children: ReactNode
}): JSX.Element {
  const t = useT()
  const headingRef = useRef<HTMLHeadingElement>(null)

  // The list is replaced by this page without a route change, so focus has to
  // be moved by hand or a keyboard user is left at the top of the document.
  useEffect(() => {
    headingRef.current?.focus()
  }, [props.focusKey])

  return (
    <div className={styles.page}>
      <div className={styles.top}>
        <nav className={styles.crumbs} aria-label={t('breadcrumb')}>
          <button type="button" className={styles.crumbBack} onClick={props.onBack}>
            <ArrowLeftIcon size={14} />
            {props.backLabel}
          </button>
          <span aria-hidden="true">/</span>
          <span className={styles.crumbCurrent}>{props.name}</span>
        </nav>

        <header className={styles.hero}>
          {props.avatar}
          <div className={styles.heroText}>
            <div className={styles.titleRow}>
              <h1 ref={headingRef} tabIndex={-1} className={styles.title}>
                {props.name}
              </h1>
              {props.version !== undefined && props.version !== '' && (
                <span className={styles.versionChip}>v{props.version}</span>
              )}
            </div>
            {props.meta !== undefined && <p className={styles.meta}>{props.meta}</p>}
            {props.summary !== undefined && props.summary !== '' && <p className={styles.summary}>{props.summary}</p>}
            {props.chips !== undefined && <div className={styles.chips}>{props.chips}</div>}
          </div>
          {props.actions !== undefined && <div className={styles.actions}>{props.actions}</div>}
        </header>

        {props.stats !== undefined && props.stats.length > 0 && (
          <dl className={styles.stats}>
            {props.stats.map((stat) => (
              <div key={stat.label} className={styles.stat}>
                <dt>{stat.label}</dt>
                <dd>{stat.value}</dd>
              </div>
            ))}
          </dl>
        )}

        <div className={styles.tabs} role="tablist" aria-label={props.name}>
          {props.tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              id={`skills-hub-tab-${tab.key}`}
              aria-selected={props.activeTab === tab.key}
              aria-controls={`skills-hub-panel-${tab.key}`}
              className={styles.tab}
              onClick={() => props.onTabChange(tab.key)}
            >
              {tab.label}
              {tab.badge}
            </button>
          ))}
        </div>
      </div>

      <div
        className={styles.body}
        role="tabpanel"
        id={`skills-hub-panel-${props.activeTab}`}
        aria-labelledby={`skills-hub-tab-${props.activeTab}`}
      >
        {props.notice}
        {props.children}
      </div>
    </div>
  )
}

/** Document column plus side rail; the rail moves below on a narrow panel. */
export function DetailColumns(props: { main: ReactNode; side: ReactNode }): JSX.Element {
  return (
    <div className={styles.columns}>
      <div className={styles.main}>{props.main}</div>
      <aside className={styles.side}>{props.side}</aside>
    </div>
  )
}

export function SideCard(props: { title: string; extra?: ReactNode; children: ReactNode }): JSX.Element {
  return (
    <section className={styles.sideCard}>
      <header className={styles.sideHeader}>
        <h2 className={styles.sideTitle}>{props.title}</h2>
        {props.extra}
      </header>
      {props.children}
    </section>
  )
}

export function InfoRow(props: { label: string; value: ReactNode; mono?: boolean }): JSX.Element {
  return (
    <div className={styles.infoRow}>
      <dt>{props.label}</dt>
      <dd className={props.mono === true ? styles.mono : undefined}>{props.value}</dd>
    </div>
  )
}

/** Count in a tab label ("文件 15"). */
export function TabCount(props: { value: number }): JSX.Element {
  return <span className={styles.tabCount}>{props.value}</span>
}

type ChipTone = 'plain' | 'ok' | 'warn' | 'blue'

export function Chip(props: { tone?: ChipTone; title?: string; children: ReactNode }): JSX.Element {
  const tone = props.tone ?? 'plain'
  return (
    <span className={`${styles.chip} ${tone === 'plain' ? '' : styles[`chip_${tone}`] ?? ''}`} title={props.title}>
      {props.children}
    </span>
  )
}

const SECURITY_TONE: Record<SecurityStatus, ChipTone> = {
  verified: 'ok',
  benign: 'ok',
  unknown: 'plain',
  flagged: 'warn',
}

/** Upstream scan verdict, shared by the cards, the detail header and the install dialog. */
export function SecurityChip(props: { status: SecurityStatus; short?: boolean }): JSX.Element {
  const t = useT()
  const tone = SECURITY_TONE[props.status]
  return (
    <Chip tone={tone}>
      {tone === 'warn' ? <AlertIcon size={13} /> : <ShieldIcon size={13} />}
      {t(`${props.short === true ? 'scanShort' : 'scan'}.${props.status}`)}
    </Chip>
  )
}

/**
 * Keeps the detail layout stable while its request is in flight: the same
 * boxes as the real page rather than a spinner, so the page changes shape once.
 */
export function SkillDetailSkeleton({ onBack, backLabel }: { onBack: () => void; backLabel?: string }): JSX.Element {
  const t = useT()
  return (
    <div className={styles.page} aria-busy="true">
      <div className={styles.top}>
        <nav className={styles.crumbs}>
          <button type="button" className={styles.crumbBack} onClick={onBack}>
            <ArrowLeftIcon size={14} />
            {backLabel ?? t('marketTab')}
          </button>
        </nav>
        <div role="status" aria-label={t('loading')}>
          <div className={styles.hero} aria-hidden="true">
            <span className={styles.skeletonAvatar} />
            <div className={styles.heroText}>
              <span className={styles.skeletonTitle} />
              <span className={styles.skeletonLine} />
              <span className={styles.skeletonLine} />
            </div>
          </div>
        </div>
        <div className={styles.tabs} aria-hidden="true" />
      </div>
      <div className={styles.body} aria-hidden="true">
        <div className={styles.columns}>
          <div className={styles.main}>
            <div className={styles.card}>
              {Array.from({ length: 9 }, (_, index) => <span className={styles.skeletonLine} key={index} />)}
            </div>
          </div>
          <div className={styles.side}>
            <div className={styles.sideCard}>
              {Array.from({ length: 5 }, (_, index) => <span className={styles.skeletonLine} key={index} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
