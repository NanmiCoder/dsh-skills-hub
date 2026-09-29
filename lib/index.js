/**
 * Skills Hub — DeepSeek Harness host plugin.
 *
 * Adds the market half of the Skills Hub panel to a DSH profile:
 *
 *  - `/api/skills-hub/*` (browse, search, detail, file preview, installed,
 *    install, uninstall) served from the composition's Web server;
 *  - installation into the DSH user skills directory, so an installed skill is
 *    immediately discoverable by the `skill` tool;
 *  - the installed-skill index the market layer asks for via
 *    `setInstalledLookup()`.
 *
 * Installation is deliberately not a realm feature: it is plain filesystem work
 * plus HTTP, no agent session is involved, and the tools registry is untouched.
 *
 * @module dsh-skills-hub
 */
import { Config, SKILLS_HUB_DEFAULTS } from "./config.js";
import { configureProviderFetch } from "./market/provider-fetch.js";
import { setInstalledLookup, resetInstalledLookup } from "./market/market-service.js";
import { installedLookupFrom, scanInstalledSkills } from "./skills/installed.js";
import { resolveSkillsRoot, resolveSkillsScanRoots } from "./skills/root.js";
import { registerSkillsHubRoutes, setSkillsHubPageSize, } from "./web-routes.js";
export const name = 'skills-hub';
/**
 * Required services.
 *
 * Empty on purpose, and the honest answer for this plugin: nothing must exist for
 * it to *load*. The Web server is looked up lazily (`ctx.get`, both known keys)
 * and bound whenever it appears, so a headless profile keeps the plugin inert
 * instead of pending forever on a service key that composition never provides;
 * the skill registry is optional (it only informs a post-install catalog read);
 * and the market core is pure code with no service dependency at all. Injecting
 * `'webServer'` here would make the plugin unusable in the very profiles where
 * the harness would still boot it, and would break on a composition that spells
 * the service `httpServer`.
 */
export const inject = [];
export { Config };
/** Web-server service keys, newest first (mirrors `WEB_SERVER_KEYS` in dsh-agent-teams). */
const WEB_SERVER_KEYS = ['webServer', 'httpServer'];
/** Fill in defaults when `apply()` is called without going through the schema. */
function resolveConfig(config) {
    const skillsRoot = typeof config?.skillsRoot === 'string' && config.skillsRoot.trim() !== ''
        ? config.skillsRoot
        : null;
    return {
        skillsRoot,
        clawhubBaseUrl: config?.clawhubBaseUrl ?? SKILLS_HUB_DEFAULTS.clawhubBaseUrl,
        skillhubBaseUrl: config?.skillhubBaseUrl ?? SKILLS_HUB_DEFAULTS.skillhubBaseUrl,
        timeoutMs: config?.timeoutMs ?? SKILLS_HUB_DEFAULTS.timeoutMs,
        requestRetries: config?.requestRetries ?? SKILLS_HUB_DEFAULTS.requestRetries,
        allowUninstall: config?.allowUninstall ?? SKILLS_HUB_DEFAULTS.allowUninstall,
        pageSize: config?.pageSize ?? SKILLS_HUB_DEFAULTS.pageSize,
    };
}
/**
 * Re-read the skill catalog after a successful filesystem change.
 *
 * There is no public, registry-wide rescan entry point to call: `SkillRegistry`
 * exposes list/snapshot/get/register/registerProvider, the invalidation hooks
 * are either provider-scoped (`SkillProviderControl.invalidate`) or the
 * actor-gated `fs/observed` event — which this plugin must not forge, because
 * the event carries an authoritative tool observation for the whole host. What
 * actually republishes our change is DSH's own watcher: the filesystem skill
 * provider watches every configured root (`watch` defaults to true) and
 * invalidates its catalog on the `addDir`/`unlinkDir` that the atomic publish
 * produces.
 *
 * So this call is a read, not a mutation: it settles the catalog for a consumer
 * asking right after the HTTP response instead of leaving that consumer to race
 * the watcher's stability threshold. A composition without the service (headless
 * profile) simply skips it.
 */
async function refreshSkillCatalog(ctx) {
    const skills = ctx.get('skills');
    if (skills?.snapshot === undefined)
        return;
    try {
        await skills.snapshot({});
    }
    catch (error) {
        ctx.logger.warn(`skills-hub: skill catalog refresh failed: ${String(error)}`);
    }
}
/**
 * Activate the plugin.
 *
 * @param ctx - host plugin context.
 * @param config - resolved {@link SkillsHubConfig} (schema defaults already applied).
 */
export function apply(ctx, config) {
    const resolved = resolveConfig(config);
    // Provider endpoints, timeout and retry budget are process-wide in the market
    // core (the reference behaves the same way); the user agent keeps W1's default
    // because the frozen Config surface has no field for it.
    configureProviderFetch({
        clawhubBaseUrl: resolved.clawhubBaseUrl,
        skillhubBaseUrl: resolved.skillhubBaseUrl,
        timeoutMs: resolved.timeoutMs,
        retries: resolved.requestRetries,
    });
    setSkillsHubPageSize(resolved.pageSize);
    let disposed = false;
    /** Rebuild the installed index and hand it to the market layer. */
    const refreshInstalledIndex = async () => {
        const roots = await resolveSkillsScanRoots(resolved.skillsRoot);
        const records = await scanInstalledSkills(roots);
        // A refresh that lost the race with unload must not publish over a newer
        // plugin instance that may already own the seam.
        if (disposed)
            return;
        setInstalledLookup(installedLookupFrom(records));
    };
    /**
     * The single refresh entry point: routes call it after install/uninstall, and
     * it also runs once at activation. It never throws — the caller has already
     * succeeded at the operation it is refreshing for.
     */
    const rescan = async () => {
        try {
            await refreshInstalledIndex();
        }
        catch (error) {
            ctx.logger.warn(`skills-hub: installed-skill index refresh failed: ${String(error)}`);
            return;
        }
        await refreshSkillCatalog(ctx);
    };
    ctx.effect(() => () => {
        disposed = true;
        // The market layer is module state that outlives this plugin instance: drop
        // our installed-skill index so a reloaded instance cannot serve stale
        // install state (and `disposed` above stops an in-flight scan from
        // republishing it).
        resetInstalledLookup();
    }, 'skills-hub: activation state');
    // First scan: `apply()` is synchronous, so this cannot be awaited here. Until
    // it settles the market layer keeps its empty default lookup (skills show as
    // installable, and the installer's own conflict check still refuses to clobber
    // an existing directory), and /installed reads the disk directly.
    void rescan();
    // The Web server may bind before or after this plugin (the Loader activates
    // rows concurrently), and older compositions name the service `httpServer`.
    // Bind lazily on the first service event that makes a server reachable.
    let webRegistered = false;
    const registerWebSurface = () => {
        if (webRegistered)
            return;
        const webServer = (ctx.get(WEB_SERVER_KEYS[0]) ?? ctx.get(WEB_SERVER_KEYS[1]));
        if (webServer === undefined)
            return;
        // `requestRejection` belongs to the browser-trust fence of the Connection
        // service. Resolved per request, never captured here: the Connection row can
        // activate after this route is registered, and a snapshot would leave the
        // marketplace readable — and installable — from any web page.
        const gate = () => ctx.get('connection');
        const deps = {
            skillsRoot: () => resolveSkillsRoot(resolved.skillsRoot),
            allowUninstall: () => resolved.allowUninstall,
            rescan,
        };
        // `ctx.effect` runs the factory immediately; `dsh-host-webserver` throws on a
        // duplicate route path, so the flag may only be set once registration has
        // actually succeeded. Setting it first turned a failed registration into a
        // permanent activation failure with no retry on the next service event.
        ctx.effect(() => registerSkillsHubRoutes(webServer, gate, deps), 'skills-hub: HTTP API');
        webRegistered = true;
    };
    registerWebSurface();
    ctx.on('internal/service', (serviceName) => {
        if (serviceName === WEB_SERVER_KEYS[0] || serviceName === WEB_SERVER_KEYS[1])
            registerWebSurface();
    });
    ctx.logger.info(`skills-hub: ready (root=${resolved.skillsRoot ?? '$DSH_HOME/skills'}, uninstall=${resolved.allowUninstall ? 'on' : 'off'})`);
}
