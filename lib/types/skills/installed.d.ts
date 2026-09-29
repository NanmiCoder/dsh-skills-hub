/**
 * Installed-skill index.
 *
 * This module is the filesystem truth behind two things the market layer cannot
 * know by itself:
 *
 *  - `InstalledLookup` — which market ids (`source:slug`) are already present
 *    locally, so the list/detail responses can report `installState` and the
 *    installer can refuse to clobber a directory it does not own.
 *  - `GET /api/skills-hub/installed` — the panel's "installed" filter, including
 *    skills the user dropped into the skills directory by hand.
 *
 * A directory is *managed* when it carries the provenance sidecar
 * ({@link INSTALL_META_FILE}) written by the installer. Nothing else in the tree
 * is ever mutated or removed by this plugin; the sidecar is the only proof of
 * ownership, so a hand-made skill with the same name is reported as a conflict
 * instead of being overwritten.
 */
import type { InstalledLookup } from '../market/market-service.ts';
import { type MarketSource } from '../market/types.ts';
/** Provenance sidecar written next to `SKILL.md` by the installer. */
export declare const INSTALL_META_FILE = ".skills-hub.json";
/**
 * Parsed {@link INSTALL_META_FILE} content.
 *
 * `files` is the ledger of the installed bytes (path + SHA-256) used for
 * integrity reporting; removal decisions are made from the identity fields
 * only, so a sidecar with a damaged ledger still proves ownership.
 */
export interface InstalledMetaFile {
    id: string;
    source: MarketSource;
    slug: string;
    version?: string;
    installedAt: string;
    files: Array<{
        path: string;
        sha256: string;
    }>;
}
export interface InstalledSkillRecord {
    /** `source:slug` when the sidecar provenance file exists, else `local:<dir>` */
    id: string;
    source: MarketSource | 'local';
    slug: string;
    name: string;
    dirName: string;
    /**
     * Absolute path of the skill entry: its directory for a directory bundle,
     * the Markdown file itself for a flat `<name>.md` skill (both layouts are
     * discovered by the DSH filesystem skill provider).
     */
    dirPath: string;
    version?: string;
    summary?: string;
    installedAt?: string;
    /** installed by this plugin (sidecar `.skills-hub.json` present) */
    managed: boolean;
    bytes: number;
    fileCount: number;
}
/**
 * Validate and normalize a sidecar payload.
 *
 * The identity fields are checked against each other (`id` must be
 * `skillId(source, slug)`) because a sidecar that disagrees with itself cannot
 * authorize a delete: the reference implementation's "not managed" branch
 * exists for exactly this class of tampering, and the same check is reused on
 * the uninstall path.
 *
 * @param value - parsed JSON of unknown shape.
 * @returns the normalized sidecar, or `null` when it does not prove ownership.
 */
export declare function parseInstalledMeta(value: unknown): InstalledMetaFile | null;
/**
 * Scan every root for installed skills, most specific root first.
 *
 * A skill id found in an earlier root wins: the installed lookup is about
 * "present anywhere the harness will load it from", and the first root is the
 * one this plugin manages. Dot-prefixed entries are skipped — DSH's own
 * filesystem provider skips `.system` in the user-dsh root, and the installer's
 * staging/trash directories are dot-prefixed so no scanner ever sees a
 * half-published skill.
 *
 * @param roots - absolute skill roots, most specific first (see `resolveSkillsScanRoots`).
 * @returns one record per distinct skill id, in scan order.
 */
export declare function scanInstalledSkills(roots: string[]): Promise<InstalledSkillRecord[]>;
/**
 * Read just the display identity of a skill file.
 *
 * Used by the uninstall path, which must describe a skill after its directory is
 * gone: the frontmatter has to be captured while the file still exists, and it
 * must not fail the removal when it cannot be read.
 *
 * @param skillFile - absolute path of a `SKILL.md`.
 * @returns `name`/`summary` as far as they could be read, or `undefined`.
 */
export declare function readSkillHeadline(skillFile: string): Promise<{
    name?: string;
    summary?: string;
} | undefined>;
/**
 * Project scanned records into the market layer's installed-id seam.
 *
 * The lookup is a pure function of the records so the caller can rebuild it
 * after an install/uninstall without any shared mutable state.
 *
 * @param records - output of {@link scanInstalledSkills}.
 * @returns the lookup W1's `setInstalledLookup()` expects.
 */
export declare function installedLookupFrom(records: InstalledSkillRecord[]): InstalledLookup;
