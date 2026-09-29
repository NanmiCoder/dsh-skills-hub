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
import type { Context as ClientContext } from '@deepseek-ai/cordis';
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
            kind: 'list';
            scope: 'root';
            owner: {
                size: number;
                active: boolean;
            };
        };
    }
}
/** Stable plugin name of the browser half. */
export declare const name = "skills-hub-client";
/**
 * Services required before the registrations can be made. `slots` is the
 * registry itself; `locale` owns the dictionary this panel translates through.
 * `layout` is deliberately absent — the sidebar selects the panel for us.
 */
export declare const inject: string[];
/** Sidebar entry id and `main` slot key — the same value is what links the two. */
export declare const PANEL_ID = "skills-hub";
/** Register the sidebar entry and the panel it opens. */
export declare function apply(ctx: ClientContext): void;
