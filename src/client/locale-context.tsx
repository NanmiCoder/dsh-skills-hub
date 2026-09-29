/**
 * Panel-local locale context.
 *
 * The framework hands the translate seat (`t: TranslateNS<NS>`) to the *slot
 * component* only — `PropsLocale<N>` in
 * `@deepseek-ai/dsh-client-ui-slots/lib/types/index.d.ts` adds it exactly when a
 * registration declares `locale: NS`, and nothing propagates it further down the
 * tree. The presentational components are deliberately prop-shaped (contract
 * §5.4 gives them no `t`), so `MarketPage` — the one component the slot
 * machinery calls — publishes its seat here and every descendant reads it.
 *
 * A context (rather than prop drilling or a module singleton) is what keeps the
 * components pure and testable: a test can render any of them under its own
 * provider without touching the DSH runtime.
 */

import { createContext, useContext, type ReactNode } from 'react'

/** Translate one dictionary key with optional `{name}` template params. */
export type Translate = (key: string, params?: Record<string, unknown>) => string

const LocaleContext = createContext<Translate | null>(null)

/** Publish the slot-injected translate seat to the panel's descendants. */
export function LocaleProvider(props: { t: Translate; children: ReactNode }): JSX.Element {
  return <LocaleContext.Provider value={props.t}>{props.children}</LocaleContext.Provider>
}

/**
 * Read the panel's translate seat.
 *
 * Throws instead of falling back to the raw key: a component rendered outside
 * the panel would otherwise silently print dictionary keys, which is far harder
 * to notice than a loud assembly error.
 */
export function useT(): Translate {
  const t = useContext(LocaleContext)
  if (t === null) {
    throw new Error('skills-hub: useT() was called outside <LocaleProvider>; the panel root must provide the locale seat')
  }
  return t
}
