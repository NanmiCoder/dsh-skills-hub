/**
 * Skills Hub, browser half.
 *
 * Two registrations, exactly the shape `@deepseek-ai/dsh-client-ui-plugin-manager`
 * uses for its own panel (read from
 * `.../dsh-client-ui-plugin-manager/lib/client.js`, same DSH version):
 *
 *   ctx.slots.inject('main', function* () { yield ctx.slots.register({ name: 'main', key: PANEL_ID, … }, MarketPage) })
 *   ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({ name: 'sidebar.panellist', id: PANEL_ID, order, label, … }, SkillsHubIcon))
 *
 * `slots.inject` waits for the declaring entry (the frame declares `main`, the
 * sidebar declares `sidebar.panellist`) and keeps the registration on this
 * plugin's fiber, so unloading the plugin removes both contributions.
 *
 * Selecting the panel is **not** done here: the sidebar renders each
 * `sidebar.panellist` entry inside its own `<button>` whose click calls
 * `selectPanel(id)` → `ctx.layout.selectPanel(id)`
 * (`.../dsh-client-ui-sidebar/lib/client.js`, `PanelRow` ≈ line 173 and the
 * injected `selectPanel` ≈ line 483). Because our entry `id` equals the `main`
 * registration key, that call opens this panel; adding our own button or a
 * second `selectPanel` call would nest interactive elements and fight the shell.
 */

import type { Context as ClientContext } from '@deepseek-ai/cordis'
// Type-only: merges `SlotMap['main']` (the central-panel keyed slot) into the slot
// contract, together with the `ctx.layout` service face. Erased at build time.
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
// Type-only: merges the `ctx.locale` service face (register/bind).
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type { SlotCore, SlotMap } from '@deepseek-ai/dsh-client-ui-slots'
import { MarketPage } from './page/MarketPage.tsx'
import { SkillsHubIcon } from './icons.tsx'
import { NS, en, zh } from './locales.ts'
import { useMarketController, type MarketPageInjected } from './state.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface SlotMap {
    /**
     * Global panel icon rows of the sidebar.
     *
     * Declared here because `@deepseek-ai/dsh-client-ui-sidebar` (the package that
     * owns this slot) is not a dependency of this plugin: the registration below
     * needs the slot key to exist in the contract table, and `slots.inject` waits
     * for the sidebar to declare it at runtime. The owner share is the sidebar's
     * own (`SidebarPanelIconOwnerProps`: requested edge and selection state).
     */
    'sidebar.panellist': {
      kind: 'list'
      scope: 'root'
      owner: { size: number; active: boolean }
    }
  }
}

/**
 * The slice of the renderer-owned `SlotRegistry` this plugin touches.
 *
 * `@deepseek-ai/dsh-client-ui-renderer` (which declares `ctx.slots`) is not a
 * dependency of this package, so the face is declared structurally from the real
 * service contract (`SlotRegistry.inject` / `SlotRegistry.register`) rather than
 * imported. Both members are the runtime service's own, unchanged.
 */
interface SlotsFace {
  inject(key: keyof SlotMap & string, callback: () => (() => void) | Iterable<() => void>): () => void
  register: SlotCore['register']
}

/** Stable plugin name of the browser half. */
export const name = 'skills-hub-client'

/**
 * Services required before the registrations can be made. `slots` is the
 * registry itself; `locale` owns the dictionary this panel translates through.
 * `layout` is deliberately absent — the sidebar selects the panel for us.
 */
export const inject: string[] = ['slots', 'locale']

/** Sidebar entry id and `main` slot key — the same value is what links the two. */
export const PANEL_ID = 'skills-hub'

/** Register the sidebar entry and the panel it opens. */
export function apply(ctx: ClientContext): void {
  const slots = (ctx as ClientContext & { readonly slots: SlotsFace }).slots

  // The typed `register` overload requires every shipped locale, and `en` is
  // checked against the Chinese key set at the dictionary itself; the effect
  // keeps the registration on this plugin's fiber.
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'skills-hub: dictionaries')
  const t = ctx.locale.bind(NS)

  // The generator form mirrors the plugin manager: the injected effect owns the
  // registration for as long as `main` is declared.
  slots.inject('main', function* () {
    yield slots.register(
      {
        name: 'main',
        key: PANEL_ID,
        locale: NS,
        // The injected face carries the stable module-level hook; the hook
        // creates one controller per mounted panel instance.
        inject: (): MarketPageInjected => ({ useMarketController }),
      },
      MarketPage,
    )
  })

  // `order: 20` places the entry after the shipped panels, which use 0.
  slots.inject('sidebar.panellist', () =>
    slots.register(
      {
        name: 'sidebar.panellist',
        id: PANEL_ID,
        order: 20,
        // A thunk, so a locale switch relabels the row without re-registering it.
        label: () => t('panel'),
        locale: NS,
      },
      SkillsHubIcon,
    ),
  )
}
