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
 * is overwritten by the market installer; local entries can be explicitly
 * removed through the installed-management endpoint after user confirmation.
 */
import * as fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import * as path from 'node:path';
import { readBoundedText } from "./read-text.js";
import { MARKET_SOURCES, skillId } from "../market/types.js";
/** Provenance sidecar written next to `SKILL.md` by the installer. */
export const INSTALL_META_FILE = '.skills-hub.json';
/** Longest description kept as a card `summary`; the long form lives in SKILL.md. */
const MAX_SUMMARY_LENGTH = 280;
/** Bound on the size walk so a pathological tree cannot stall a scan. */
const MAX_WALK_ENTRIES = 5_000;
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
export function parseInstalledMeta(value) {
    if (typeof value !== 'object' || value === null || Array.isArray(value))
        return null;
    const candidate = value;
    const source = candidate['source'];
    const slug = candidate['slug'];
    const id = candidate['id'];
    const installedAt = candidate['installedAt'];
    if (typeof source !== 'string' || !MARKET_SOURCES.includes(source))
        return null;
    if (typeof slug !== 'string' || slug === '')
        return null;
    if (typeof id !== 'string' || id !== skillId(source, slug))
        return null;
    if (typeof installedAt !== 'string' || installedAt === '')
        return null;
    const version = typeof candidate['version'] === 'string' && candidate['version'] !== ''
        ? candidate['version']
        : undefined;
    const owner = typeof candidate['owner'] === 'string' && /^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$/.test(candidate['owner'])
        ? candidate['owner']
        : undefined;
    const files = [];
    const rawFiles = candidate['files'];
    if (Array.isArray(rawFiles)) {
        for (const entry of rawFiles) {
            if (typeof entry !== 'object' || entry === null || Array.isArray(entry))
                continue;
            const record = entry;
            const filePath = record['path'];
            const sha256 = record['sha256'];
            if (typeof filePath === 'string' && filePath !== '' && typeof sha256 === 'string' && sha256 !== '') {
                files.push({ path: filePath, sha256 });
            }
        }
    }
    return {
        id,
        source: source,
        slug,
        ...(owner === undefined ? {} : { owner }),
        ...(version === undefined ? {} : { version }),
        installedAt,
        files,
    };
}
/** Collapse a YAML description into one bounded line for card display. */
function summarize(description) {
    const collapsed = description.replace(/\s+/g, ' ').trim();
    return collapsed.length > MAX_SUMMARY_LENGTH ? `${collapsed.slice(0, MAX_SUMMARY_LENGTH - 1)}…` : collapsed;
}
/** Strip one pair of surrounding quotes from a YAML scalar. */
function stripQuotes(value) {
    const trimmed = value.trim();
    if (trimmed.length >= 2) {
        const first = trimmed.charAt(0);
        const last = trimmed.charAt(trimmed.length - 1);
        if ((first === '"' && last === '"') || (first === "'" && last === "'"))
            return trimmed.slice(1, -1);
    }
    return trimmed;
}
/**
 * Read the handful of frontmatter keys the index needs.
 *
 * A deliberately small YAML subset (plain scalars, quoted scalars, `|`/`>`
 * block scalars, and `metadata.version`) — the full document is the skill
 * provider's business, and this module must not pull a YAML parser into the
 * plugin's dependency set. Anything it cannot read is simply absent: a skill
 * with unparsable frontmatter still shows up under its directory name.
 */
function parseFrontmatter(markdown) {
    const text = markdown.startsWith('\uFEFF') ? markdown.slice(1) : markdown;
    const lines = text.split(/\r?\n/);
    if (lines[0]?.trim() !== '---')
        return {};
    let end = -1;
    for (let index = 1; index < lines.length; index++) {
        if (lines[index]?.trim() === '---') {
            end = index;
            break;
        }
    }
    if (end === -1)
        return {};
    const result = {};
    let topKey;
    let block;
    const assign = (key, value) => {
        const normalized = stripQuotes(value);
        if (normalized === '')
            return;
        if (key === 'name' && result.name === undefined)
            result.name = normalized;
        else if (key === 'description' && result.description === undefined)
            result.description = normalized;
        else if (key === 'version' && result.version === undefined)
            result.version = normalized;
    };
    const flushBlock = () => {
        if (block === undefined)
            return;
        assign(block.key, block.lines.join(block.literal ? '\n' : ' '));
        block = undefined;
    };
    for (let index = 1; index < end; index++) {
        const raw = lines[index] ?? '';
        const trimmed = raw.trim();
        const indent = raw.length - raw.trimStart().length;
        if (block !== undefined) {
            // A block scalar ends at the first non-empty line that dedents to column 0.
            if (trimmed === '' || indent > 0) {
                block.lines.push(trimmed);
                continue;
            }
            flushBlock();
        }
        if (trimmed === '' || trimmed.startsWith('#'))
            continue;
        if (indent > 0) {
            // Nested mapping: only `metadata.version` is part of the index.
            if (topKey === 'metadata' && result.version === undefined) {
                const separator = trimmed.indexOf(':');
                if (separator > 0 && trimmed.slice(0, separator).trim() === 'version') {
                    assign('version', trimmed.slice(separator + 1));
                }
            }
            continue;
        }
        const separator = trimmed.indexOf(':');
        if (separator <= 0)
            continue;
        const key = trimmed.slice(0, separator).trim();
        const value = trimmed.slice(separator + 1).trim();
        topKey = key;
        if (value === '')
            continue;
        if (/^[|>][+-]?$/.test(value)) {
            block = { key, literal: value.startsWith('|'), lines: [] };
            continue;
        }
        assign(key, value);
    }
    flushBlock();
    return result;
}
/** Read a text file, returning `undefined` for anything unreadable. */
async function readTextIfExists(filePath) {
    try {
        return (await readBoundedText(filePath, 64 * 1024)).text;
    }
    catch {
        return undefined;
    }
}
/** Read and parse a JSON file, returning `undefined` for absent or invalid content. */
async function readJsonIfExists(filePath) {
    try {
        const result = await readBoundedText(filePath, 2 * 1024 * 1024);
        if (result.truncated)
            return undefined;
        return JSON.parse(result.text);
    }
    catch {
        return undefined;
    }
}
/**
 * Measure a skill directory without leaving it.
 *
 * Symlinks and special files are skipped rather than followed: an installed
 * skill must never be able to pull the size walk (or anything else) outside its
 * own directory. The sidecar itself is not part of the installed payload, so it
 * is excluded from both counters.
 */
async function measureDirectory(dirPath) {
    let bytes = 0;
    let fileCount = 0;
    let visited = 0;
    const pending = [dirPath];
    while (pending.length > 0 && visited < MAX_WALK_ENTRIES) {
        const current = pending.pop();
        if (current === undefined)
            break;
        let entries;
        try {
            // A directory replaced by a symlink after enumeration is not followed.
            if (current !== dirPath && !(await fs.lstat(current)).isDirectory())
                continue;
            entries = await fs.opendir(current);
        }
        catch {
            continue;
        }
        for await (const entry of entries) {
            if (visited++ >= MAX_WALK_ENTRIES)
                break;
            const entryPath = path.join(current, entry.name);
            if (entry.isDirectory()) {
                pending.push(entryPath);
                continue;
            }
            if (!entry.isFile())
                continue;
            if (current === dirPath && entry.name === INSTALL_META_FILE)
                continue;
            try {
                const stats = await fs.lstat(entryPath);
                if (stats.isFile()) {
                    bytes += stats.size;
                    fileCount++;
                }
            }
            catch {
                // Raced with a concurrent removal — count what is still there.
            }
        }
    }
    return { bytes, fileCount };
}
/** Build the record for one directory-bundle skill, or `undefined` when it is not one. */
async function readDirectorySkill(rootPath, dirName) {
    const dirPath = path.join(rootPath, dirName);
    const markdown = await readTextIfExists(path.join(dirPath, 'SKILL.md'));
    if (markdown === undefined)
        return undefined;
    const meta = parseInstalledMeta(await readJsonIfExists(path.join(dirPath, INSTALL_META_FILE)));
    const frontmatter = parseFrontmatter(markdown);
    const measured = await measureDirectory(dirPath);
    const shared = {
        key: installedEntryKey(dirPath),
        linked: false,
        removable: true,
        name: frontmatter.name ?? dirName,
        dirName,
        dirPath,
        ...(frontmatter.description === undefined ? {} : { summary: summarize(frontmatter.description) }),
        managed: meta !== null,
        bytes: measured.bytes,
        fileCount: measured.fileCount,
    };
    if (meta === null) {
        return {
            id: `local:${dirName}`,
            source: 'local',
            slug: dirName,
            ...(frontmatter.version === undefined ? {} : { version: frontmatter.version }),
            ...shared,
        };
    }
    const version = meta.version ?? frontmatter.version;
    return {
        id: meta.id,
        source: meta.source,
        slug: meta.slug,
        ...(meta.owner === undefined ? {} : { owner: meta.owner }),
        ...(version === undefined ? {} : { version }),
        installedAt: meta.installedAt,
        ...shared,
    };
}
/** Build the record for one flat `<name>.md` skill. */
async function readFlatSkill(rootPath, fileName) {
    const filePath = path.join(rootPath, fileName);
    const markdown = await readTextIfExists(filePath);
    if (markdown === undefined)
        return undefined;
    const frontmatter = parseFrontmatter(markdown);
    const dirName = fileName.slice(0, -'.md'.length);
    let bytes = 0;
    try {
        bytes = (await fs.stat(filePath)).size;
    }
    catch {
        // Raced with a concurrent removal.
    }
    return {
        key: installedEntryKey(filePath),
        linked: false,
        removable: true,
        id: `local:${dirName}`,
        source: 'local',
        slug: dirName,
        name: frontmatter.name ?? dirName,
        dirName,
        dirPath: filePath,
        ...(frontmatter.description === undefined ? {} : { summary: summarize(frontmatter.description) }),
        ...(frontmatter.version === undefined ? {} : { version: frontmatter.version }),
        // A flat skill has no market provenance sidecar.
        managed: false,
        bytes,
        fileCount: markdown === '' ? 0 : 1,
    };
}
/**
 * Scan every root for installed skills, most specific root first.
 *
 * Each filesystem entry remains individually addressable for management; the
 * market lookup separately gives earlier roots precedence. Dot-prefixed entries are skipped — DSH's own
 * filesystem provider skips `.system` in the user-dsh root, and the installer's
 * staging/trash directories are dot-prefixed so no scanner ever sees a
 * half-published skill.
 *
 * @param roots - absolute skill roots, most specific first (see `resolveSkillsScanRoots`).
 * @returns one record per filesystem entry, in scan order.
 */
export async function scanInstalledSkills(roots) {
    const records = [];
    for (const root of roots) {
        const resolvedRoot = path.resolve(root);
        let entries;
        try {
            entries = await fs.readdir(resolvedRoot, { withFileTypes: true });
        }
        catch {
            // A root that does not exist yet simply contributes nothing.
            continue;
        }
        entries.sort((left, right) => left.name.localeCompare(right.name));
        for (const entry of entries) {
            if (entry.name.startsWith('.'))
                continue;
            const entryPath = path.join(resolvedRoot, entry.name);
            const kind = entry.isSymbolicLink() ? await fs.stat(entryPath).catch(() => undefined) : entry;
            const record = kind?.isDirectory()
                ? await readDirectorySkill(resolvedRoot, entry.name)
                : kind?.isFile() && entry.name.endsWith('.md')
                    ? await readFlatSkill(resolvedRoot, entry.name)
                    : undefined;
            if (record === undefined)
                continue;
            record.linked = entry.isSymbolicLink();
            records.push(record);
        }
    }
    return records;
}
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
export async function readSkillHeadline(skillFile) {
    const markdown = await readTextIfExists(skillFile);
    if (markdown === undefined)
        return undefined;
    const frontmatter = parseFrontmatter(markdown);
    return {
        ...(frontmatter.name === undefined ? {} : { name: frontmatter.name }),
        ...(frontmatter.description === undefined ? {} : { summary: summarize(frontmatter.description) }),
    };
}
/**
 * Project scanned records into the market layer's installed-id seam.
 *
 * The lookup is a pure function of the records so the caller can rebuild it
 * after an install/uninstall without any shared mutable state.
 *
 * @param records - output of {@link scanInstalledSkills}.
 * @returns the lookup W1's `setInstalledLookup()` expects.
 */
export function installedLookupFrom(records) {
    const byId = new Map();
    for (const record of records)
        if (!byId.has(record.id))
            byId.set(record.id, record);
    return {
        has(id) {
            return byId.has(id);
        },
        info(id) {
            const record = byId.get(id);
            if (record === undefined)
                return undefined;
            return {
                dirName: record.dirName,
                ...(record.version === undefined ? {} : { version: record.version }),
                ...(record.installedAt === undefined ? {} : { installedAt: record.installedAt }),
            };
        },
    };
}
/** Path-derived identifiers never expose a caller-controlled filesystem path. */
export function installedEntryKey(entryPath) {
    return createHash('sha256').update(path.resolve(entryPath)).digest('hex');
}
