/**
 * Local skill management: one discovered entry at a time.
 *
 * Every function here starts from a key, never from a client-supplied path: the
 * roots are re-scanned on each call, and only an entry that scan just produced
 * can be read or removed. A path that arrives from the browser is therefore
 * always interpreted *inside* an entry this process has already vouched for.
 *
 * The detail read is what the panel's local skill page renders: the SKILL.md
 * document, its raw frontmatter block and a bounded inventory of the skill's own
 * files. Nothing here consults a market provider — an installed skill stays
 * readable with the network down.
 */
import { type InstalledSkillRecord } from './installed.ts';
/** One file of an installed skill, relative to the entry. */
export interface InstalledFileEntry {
    path: string;
    size: number;
    language: string;
}
/** `GET /installed/detail` body. */
export interface InstalledSkillDetail {
    item: InstalledSkillRecord;
    /** Full SKILL.md text, frontmatter included: the browser strips it. */
    markdown: string;
    /** Verbatim YAML header without its fences, or `null` when the file has none. */
    frontmatter: string | null;
    files: InstalledFileEntry[];
}
/** `GET /installed/file` body; the shape mirrors the market file preview. */
export interface InstalledFileContent {
    path: string;
    content: string;
    language: string;
    size: number;
    truncated: boolean;
}
/**
 * Raw frontmatter block, kept as YAML text.
 *
 * Parsing it into structure would mean shipping a YAML reader for a panel that
 * only needs to *show* the header, and the market detail's structured panel is
 * fed by upstream JSON this plugin does not have for a hand-written skill. The
 * verbatim block is also what the file actually contains, so nothing is lost.
 */
export declare function extractFrontmatter(markdown: string): string | null;
/**
 * Inventory one entry's own files.
 *
 * The walk never leaves the entry: directories are descended, symlinked entries
 * are listed as nothing at all, and the provenance sidecar (a dot-file, like
 * every other dot-entry) is skipped because it is plugin bookkeeping rather than
 * installed payload. A flat skill is a single file and reports itself.
 */
export declare function listEntryFiles(item: InstalledSkillRecord): Promise<InstalledFileEntry[]>;
/** Read the SKILL.md document plus the entry inventory the local detail page renders. */
export declare function readInstalledSkill(roots: string[], key: string): Promise<InstalledSkillDetail>;
/**
 * Read one file of one entry.
 *
 * A flat skill exposes exactly itself — never its siblings in the same root —
 * and a directory bundle exposes only what resolves back inside its own real
 * path, so a symlink planted in the tree cannot turn this endpoint into an
 * arbitrary-file reader.
 */
export declare function readInstalledFile(roots: string[], key: string, requested: string): Promise<InstalledFileContent>;
/** Rename the selected entry out of discovery before deletion. Symlink targets are never removed. */
export declare function removeInstalledSkill(roots: string[], key: string, allowUninstall: boolean): Promise<InstalledSkillRecord>;
