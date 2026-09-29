/**
 * Skills-directory resolution.
 *
 * Two different questions are answered here, and they must not be conflated:
 *
 *  - {@link resolveSkillsRoot} — *where do we install?* Exactly one directory:
 *    the configured override, or the user skills directory of the harness home.
 *  - {@link resolveSkillsScanRoots} — *what does "already installed" mean?*
 *    Every directory the local filesystem skill provider scans for user-level
 *    skills, most specific first, so a skill that is already present anywhere in
 *    the DSH user skill roots is reported as installed instead of being
 *    downloaded and clobbered.
 *
 * `$DSH_HOME` is resolved here instead of through `@deepseek-ai/dsh-home-paths`
 * on purpose: that package is a dev-only dependency of this plugin (it is not in
 * `peerDependencies`), so a runtime value import would make the published plugin
 * fail to load in a profile where it is not hoisted. The resolution rules below
 * are the documented ones from
 * `@deepseek-ai/dsh-home-paths/lib/types/index.d.ts` (0.1.7-rc.2):
 * explicit path → `DSH_HOME` (blank treated as unset) → `~/.dsh`, plus the
 * `~`, `~/`, `~\` tilde expansion of `expandHomePath`.
 */
/**
 * Absolute skills directory skills are installed into, created on demand.
 *
 * A relative configured path is resolved against the host process's working
 * directory: a skills root must be absolute before any containment check can
 * mean anything, and refusing relative input outright would break the common
 * `./tmp-skills` test setup.
 *
 * @param configured - `Config.skillsRoot`; `null`/blank selects the DSH user skills directory.
 * @returns the absolute, existing skills directory.
 */
export declare function resolveSkillsRoot(configured: string | null): Promise<string>;
/**
 * Every directory DSH will scan for skills, most specific first (installed lookup).
 *
 * Order is the install root, then the two user roots the local filesystem skill
 * provider mounts by default (`$DSH_HOME/skills` with `user-dsh` rank, then
 * `$DSH_AGENTS_HOME/skills` with `user-agents` rank — see
 * `@deepseek-ai/dsh-skill-filesystem/lib/index.js#roots`). Project roots
 * (`.dsh/skills`, `.agents/skills` under a session's cwd) are deliberately
 * absent: this plugin runs at host scope, has no session, and must not claim
 * that a skill in whichever directory the server happened to start in is
 * "installed" for every session. Duplicates (a configured root that *is* the
 * harness home) collapse to their first, most specific occurrence.
 */
export declare function resolveSkillsScanRoots(configured: string | null): Promise<string[]>;
