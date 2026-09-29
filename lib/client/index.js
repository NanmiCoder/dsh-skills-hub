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
import { MarketPage } from "./page/MarketPage.js";
import { SkillsHubIcon } from "./icons.js";
import { NS, en, zh } from "./locales.js";
import { useMarketController } from "./state.js";
/** Stable plugin name of the browser half. */
export const name = 'skills-hub-client';
/**
 * Services required before the registrations can be made. `slots` is the
 * registry itself; `locale` owns the dictionary this panel translates through.
 * `layout` is deliberately absent — the sidebar selects the panel for us.
 */
export const inject = ['slots', 'locale'];
/** Sidebar entry id and `main` slot key — the same value is what links the two. */
export const PANEL_ID = 'skills-hub';
/** Register the sidebar entry and the panel it opens. */
export function apply(ctx) {
    const slots = ctx.slots;
    // The typed `register` overload requires every shipped locale, and `en` is
    // checked against the Chinese key set at the dictionary itself; the effect
    // keeps the registration on this plugin's fiber.
    ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'skills-hub: dictionaries');
    const t = ctx.locale.bind(NS);
    // The generator form mirrors the plugin manager: the injected effect owns the
    // registration for as long as `main` is declared.
    slots.inject('main', function* () {
        yield slots.register({
            name: 'main',
            key: PANEL_ID,
            locale: NS,
            // The injected face carries the stable module-level hook; the hook
            // creates one controller per mounted panel instance.
            inject: () => ({ useMarketController }),
        }, MarketPage);
    });
    // `order: 20` places the entry after the shipped panels, which use 0.
    slots.inject('sidebar.panellist', () => slots.register({
        name: 'sidebar.panellist',
        id: PANEL_ID,
        order: 20,
        // A thunk, so a locale switch relabels the row without re-registering it.
        label: () => t('panel'),
        locale: NS,
    }, SkillsHubIcon));
}
