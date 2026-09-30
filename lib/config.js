/**
 * Skills Hub configuration.
 *
 * The schema below is the plugin's whole configuration surface: DSH validates
 * the profile's plugin row against it and hands `apply()` the resolved value.
 * Every field carries a default, so a row written as `{}` — or an `apply()`
 * called directly from a test — still boots the plugin with the shipped
 * behaviour instead of failing on a missing key.
 *
 * `skillsRoot: null` means "the user skills directory DSH itself scans"
 * (`$DSH_HOME/skills`); a string is an explicit override for tests, for
 * throwaway profiles, or for a deployment that keeps skills outside the
 * harness home. The reference implementation hard-coded its own
 * `~/.claude/skills`, which is exactly the coupling this field removes.
 */
import z from '@deepseek-ai/schemastery';
/**
 * Shipped defaults. Exported so `apply()` can fill in a partially resolved
 * config when the plugin is mounted without going through the schema (unit
 * tests, direct composition), without restating the literals in two places.
 */
export const SKILLS_HUB_DEFAULTS = {
    skillsRoot: null,
    clawhubBaseUrl: 'https://clawhub.ai',
    skillhubBaseUrl: 'https://api.skillhub.cn',
    timeoutMs: 15_000,
    requestRetries: 1,
    allowUninstall: true,
    pageSize: 24,
    cacheTtlMinutes: 60,
};
/**
 * `null` must stay a legal value for `skillsRoot` (it is the "use the DSH
 * default" marker), so the field is modelled as a union rather than as a
 * nullable string: a plain `z.string().default('')` would make "unset" and
 * "empty string" indistinguishable and would leak an empty path into `path.join`.
 *
 * Schemastery quirk worth knowing: its object resolver drops a key whose
 * resolved value is nullable and which was absent from the input, so
 * `Config({}).skillsRoot` is `undefined`, not `null`. Both mean "use the DSH
 * default" and `apply()` normalizes either to `null` before using it, so a
 * caller that bypasses the schema cannot change the behaviour.
 */
export const Config = z.object({
    skillsRoot: z.union([z.string(), z.const(null)]).default(null),
    clawhubBaseUrl: z.string().default(SKILLS_HUB_DEFAULTS.clawhubBaseUrl),
    skillhubBaseUrl: z.string().default(SKILLS_HUB_DEFAULTS.skillhubBaseUrl),
    timeoutMs: z.natural().min(1_000).default(SKILLS_HUB_DEFAULTS.timeoutMs),
    requestRetries: z.natural().default(SKILLS_HUB_DEFAULTS.requestRetries),
    allowUninstall: z.boolean().default(SKILLS_HUB_DEFAULTS.allowUninstall),
    pageSize: z.natural().min(1).max(100).default(SKILLS_HUB_DEFAULTS.pageSize),
    cacheTtlMinutes: z.natural().min(1).max(1440).default(SKILLS_HUB_DEFAULTS.cacheTtlMinutes),
});
