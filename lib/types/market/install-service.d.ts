/**
 * Skills Market — install / uninstall service.
 *
 * Install: fetch the whole file list, enforce `MARKET_LIMITS`, verify every
 * provider-reported SHA-256, sanitize the slug into a directory name, stage the
 * complete skill in a hidden sibling directory and publish it with a single
 * `rename` — the skills root never contains a partially written skill, and a
 * failure leaves nothing behind but the (removed) staging directory.
 *
 * Uninstall: only ever removes a directory that carries our provenance sidecar
 * with an id matching the requested skill, and only inside the configured
 * skills root. Every path is resolved and containment-checked before a delete,
 * because "the plugin deleted something outside its own tree" is the one bug a
 * skills market must not have.
 *
 * Ported from the reference `installService.ts` (Claude Code desktop), with the
 * filesystem layout, the sidecar name and the concurrency key all frozen by the
 * interface contract.
 */
import { type MarketSource, type NormalizedSkill } from './types.ts';
export interface InstallResult {
    installedPath: string;
    skill: NormalizedSkill;
}
export interface UninstallResult {
    removedPath: string;
    skill: NormalizedSkill;
}
/**
 * One rejected install/uninstall carrying both the market error code and the
 * HTTP status the route layer must answer with.
 *
 * The reference used its server-wide `ApiError`; this plugin owns no server
 * middleware, so the code/status pair travels with the error instead of being
 * re-derived from a message string at the edge. Upstream failures are *not*
 * wrapped: W1's `MarketUpstreamError` already carries the code the route maps
 * (`upstreamBadResponse` → 404, everything else → 502).
 */
export declare class MarketInstallError extends Error {
    readonly code: string;
    readonly status: number;
    constructor(status: number, code: string, message: string);
}
/**
 * Install one market skill into `options.skillsRoot`.
 *
 * @param source - market the skill comes from.
 * @param slug - provider slug; also the directory name after sanitization.
 * @param options - resolved skills root and the (unused here) uninstall switch,
 *   kept in the signature so both verbs take one shape.
 * @returns the absolute installed path and the skill re-annotated as `installed`.
 * @throws {MarketInstallError} for anything this plugin refuses itself.
 * @throws {import('./types.ts').MarketUpstreamError} for upstream failures,
 *   unwrapped so the route can classify them (404 vs 502).
 */
export declare function installMarketSkill(source: MarketSource, slug: string, options: {
    skillsRoot: string;
    allowUninstall: boolean;
    owner?: string;
}): Promise<InstallResult>;
/**
 * Remove one skill this plugin installed.
 *
 * @param source - market the skill was installed from.
 * @param slug - provider slug; the directory name after sanitization.
 * @param options - resolved skills root and the `allowUninstall` switch.
 * @returns the removed path and a best-effort refreshed skill record.
 * @throws {MarketInstallError} when the switch is off, the skill is missing, or
 *   the directory is not provably ours.
 */
export declare function uninstallMarketSkill(source: MarketSource, slug: string, options: {
    skillsRoot: string;
    allowUninstall: boolean;
}): Promise<UninstallResult>;
/** Drop every install lock. Test hook, mirroring the reference implementation. */
export declare function resetInstallLocksForTests(): void;
