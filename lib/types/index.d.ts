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
import type { Context } from '@deepseek-ai/cordis';
import { Config, type SkillsHubConfig } from './config.ts';
export declare const name = "skills-hub";
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
export declare const inject: string[];
export { Config };
/**
 * Activate the plugin.
 *
 * @param ctx - host plugin context.
 * @param config - resolved {@link SkillsHubConfig} (schema defaults already applied).
 */
export declare function apply(ctx: Context, config: SkillsHubConfig): void;
