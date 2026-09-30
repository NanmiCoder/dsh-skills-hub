/**
 * The detail surface shared by the market catalogue and the installed inventory.
 *
 * Both pages answer the same question — "what is inside this skill?" — and the
 * only real difference is where the facts come from: an upstream provider or the
 * filesystem. Everything that is *reading* rather than *fetching* therefore
 * lives here: the back affordance, the identity header, the two tabs, the
 * document column, the facts rail and the focus move that keeps a keyboard user
 * from being left at the top of the document when the list is replaced.
 *
 * The two pages are not identical, so the shell takes slots rather than a data
 * model: `badges`, `notice`, `overview`, `files` and `rail` are composed by the
 * caller, while each caller owns its own loading state and its own choice of tab
 * storage (the market page keeps it in `MarketState`, the local page in its own
 * component state).
 */

import { useEffect, useRef, type ReactNode } from 'react'
import { Button, SegmentedTabs, type SegmentedTab } from '@deepseek-ai/dsh-client-ui-primitives'
import { ArrowLeftIcon } from '../icons.tsx'
import { useT } from '../locale-context.tsx'
import styles from './SkillDetailShell.module.css'

/** Tab values every detail page offers, in render order. */
export type SkillDetailTab = 'overview' | 'files'

/** Stable DOM ids for the tab list and its panels; one detail page is mounted at a time. */
const TAB_ID = 'skills-hub-detail-tab'
const PANEL_ID = 'skills-hub-detail-panel'

/**
 * The shell's stylesheet, re-exported for its callers.
 *
 * The pages built on this shell also render shell-shaped fragments (a report
 * row, a path line, a facts list) and reaching them through an import is more
 * honest than re-declaring near-copies of the same rules in a second module.
 */
export const detailStyles = styles

/** One label/value row of the facts rail. */
export function Fact(props: { label: string; children: ReactNode }): JSX.Element {
  return (
    <div className={styles.fact}>
      <dt className={styles.factLabel}>{props.label}</dt>
      <dd className={styles.factValue}>{props.children}</dd>
    </div>
  )
}

export function SkillDetailShell(props: {
  /** Identity of the rendered subject; changing it moves focus back to the heading. */
  focusKey: string
  onBack: () => void
  backLabel: string
  avatar: ReactNode
  /** Small line above the name: source, version, provenance. */
  eyebrow: ReactNode
  name: string
  badges?: ReactNode
  summary?: string
  /** Full-width band under the header (warnings, security reports). */
  notice?: ReactNode
  overviewLabel: string
  filesLabel: string
  activeTab: SkillDetailTab
  onTabChange: (tab: SkillDetailTab) => void
  overview: ReactNode
  files: ReactNode
  rail: ReactNode
}): JSX.Element {
  const { name, activeTab, onTabChange } = props
  const headingRef = useRef<HTMLHeadingElement>(null)

  // The list is replaced by this page without a route change, so focus has to
  // be moved by hand or a keyboard user is left at the top of the document.
  useEffect(() => {
    headingRef.current?.focus()
  }, [props.focusKey])

  const tabs: [SegmentedTab<SkillDetailTab>, ...SegmentedTab<SkillDetailTab>[]] = [
    { value: 'overview', label: props.overviewLabel, id: `${TAB_ID}-overview`, panelId: `${PANEL_ID}-overview` },
    { value: 'files', label: props.filesLabel, id: `${TAB_ID}-files`, panelId: `${PANEL_ID}-files` },
  ]

  return (
    <div className={styles.detail}>
      <div className={styles.back}>
        <Button variant="ghost" size="sm" icon={<ArrowLeftIcon size={16} />} onClick={props.onBack}>
          {props.backLabel}
        </Button>
      </div>

      <header className={styles.header}>
        {props.avatar}
        <div className={styles.headerText}>
          <p className={styles.eyebrow}>{props.eyebrow}</p>
          <h1 ref={headingRef} tabIndex={-1} className={styles.name}>
            {name}
          </h1>
          {props.badges === undefined ? null : <div className={styles.badges}>{props.badges}</div>}
          {props.summary === undefined || props.summary === '' ? null : (
            <p className={styles.summary}>{props.summary}</p>
          )}
        </div>
      </header>

      {props.notice}

      <div className={styles.columns}>
        <main className={styles.main}>
          <SegmentedTabs items={tabs} value={activeTab} onChange={onTabChange} label={name} />

          {activeTab === 'overview' && (
            <section
              className={styles.panel}
              id={`${PANEL_ID}-overview`}
              role="tabpanel"
              aria-labelledby={`${TAB_ID}-overview`}
            >
              {props.overview}
            </section>
          )}

          {activeTab === 'files' && (
            <section
              className={styles.panel}
              id={`${PANEL_ID}-files`}
              role="tabpanel"
              aria-labelledby={`${TAB_ID}-files`}
            >
              {props.files}
            </section>
          )}
        </main>

        <aside className={styles.rail}>
          <div className={styles.railCard}>{props.rail}</div>
        </aside>
      </div>
    </div>
  )
}

/**
 * Keeps the detail layout stable while its request is in flight.
 *
 * It renders the same boxes as the real page rather than a spinner, because the
 * click that opens a detail is the moment the panel changes shape; a centered
 * "loading" line would make that change happen twice.
 */
export function SkillDetailSkeleton({ onBack }: { onBack: () => void }): JSX.Element {
  const t = useT()
  return (
    <div className={styles.detail} aria-busy="true">
      <div className={styles.back}>
        <Button variant="ghost" size="sm" icon={<ArrowLeftIcon size={16} />} onClick={onBack}>
          {t('back')}
        </Button>
      </div>
      <div role="status" aria-label={t('loading')}>
        <div aria-hidden="true">
          <div className={styles.header}>
            <span className={styles.skeletonAvatar} />
            <div className={styles.headerText}>
              <span className={styles.skeletonTitle} />
              <span className={styles.skeletonLine} />
              <span className={styles.skeletonLine} />
            </div>
          </div>
          <div className={styles.columns} style={{ marginTop: 24 }}>
            <div className={styles.main}>
              <div className={styles.panel}>
                {Array.from({ length: 10 }, (_, index) => <span className={styles.skeletonLine} key={index} />)}
              </div>
            </div>
            <div className={styles.rail}>
              <div className={styles.panel}>
                {Array.from({ length: 5 }, (_, index) => <span className={styles.skeletonLine} key={index} />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
