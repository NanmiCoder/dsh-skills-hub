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
import * as fs from 'node:fs/promises';
import { homedir } from 'node:os';
import * as path from 'node:path';
/** Environment variable that overrides the default harness home (dsh-home-paths). */
const DSH_HOME_ENV = 'DSH_HOME';
/** Directory name of the default harness home under the OS home (dsh-home-paths). */
const DSH_HOME_DIR_NAME = '.dsh';
/** Environment variable that overrides the shared agents home (dsh-skill-filesystem). */
const DSH_AGENTS_HOME_ENV = 'DSH_AGENTS_HOME';
/** Directory name of the default shared agents home under the OS home. */
const AGENTS_HOME_DIR_NAME = '.agents';
/**
 * Expand the tilde prefixes the harness accepts (`~`, `~/`, `~\`) against the OS
 * home; every other value is returned unchanged.
 */
function expandHomePath(value) {
    if (value === '~')
        return homedir();
    if (value.startsWith('~/') || value.startsWith('~\\'))
        return path.join(homedir(), value.slice(2));
    return value;
}
/**
 * Resolve the single-root harness home.
 *
 * Precedence, highest first: an explicit path, `$DSH_HOME`, then `~/.dsh`. A
 * blank `$DSH_HOME` is treated as unset so a stray empty variable can never
 * resolve the harness home to the current working directory.
 */
function resolveDshHome(configured) {
    if (typeof configured === 'string' && configured.trim() !== '') {
        return path.resolve(expandHomePath(configured.trim()));
    }
    const fromEnv = process.env[DSH_HOME_ENV];
    if (typeof fromEnv === 'string' && fromEnv.trim() !== '') {
        return path.resolve(expandHomePath(fromEnv.trim()));
    }
    return path.join(homedir(), DSH_HOME_DIR_NAME);
}
/** The harness home's shared user skills directory (`$DSH_HOME/skills`). */
function dshUserSkillsDir() {
    return path.join(resolveDshHome(), 'skills');
}
/** The cross-agent user skills directory (`$DSH_AGENTS_HOME/skills`, else `~/.agents/skills`). */
function agentsUserSkillsDir() {
    const fromEnv = process.env[DSH_AGENTS_HOME_ENV];
    const home = typeof fromEnv === 'string' && fromEnv.trim() !== ''
        ? path.resolve(expandHomePath(fromEnv.trim()))
        : path.join(homedir(), AGENTS_HOME_DIR_NAME);
    return path.join(home, 'skills');
}
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
export async function resolveSkillsRoot(configured) {
    const root = typeof configured === 'string' && configured.trim() !== ''
        ? path.resolve(expandHomePath(configured.trim()))
        : dshUserSkillsDir();
    await fs.mkdir(root, { recursive: true });
    return root;
}
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
export async function resolveSkillsScanRoots(configured) {
    const roots = [await resolveSkillsRoot(configured)];
    for (const candidate of [dshUserSkillsDir(), agentsUserSkillsDir()]) {
        if (!roots.includes(candidate))
            roots.push(candidate);
    }
    return roots;
}
