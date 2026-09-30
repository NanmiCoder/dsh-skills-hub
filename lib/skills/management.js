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
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { randomUUID } from 'node:crypto';
import { MarketInstallError } from "../market/install-service.js";
import { detectMarketLanguage } from "../market/types.js";
import { scanInstalledSkills } from "./installed.js";
import { readBoundedText } from "./read-text.js";
/** Largest SKILL.md the local detail endpoint returns, matching the market preview policy. */
const MAX_DOCUMENT_BYTES = 2 * 1024 * 1024;
/** Largest single document the browser may pull into the file viewer. */
const MAX_PREVIEW_BYTES = 300 * 1024;
/** Frontmatter kept for the metadata panel; a pathological header cannot fill it. */
const MAX_FRONTMATTER_BYTES = 16 * 1024;
/** Entries listed for one skill before the walk stops. */
const MAX_LISTED_FILES = 500;
async function resolveEntry(roots, key) {
    if (!/^[a-f0-9]{64}$/.test(key))
        throw new MarketInstallError(400, 'BAD_REQUEST', 'Invalid installed skill key');
    const entry = (await scanInstalledSkills(roots)).find(item => item.key === key);
    if (!entry)
        throw new MarketInstallError(404, 'MARKET_NOT_INSTALLED', 'Installed skill no longer exists');
    return entry;
}
/**
 * Raw frontmatter block, kept as YAML text.
 *
 * Parsing it into structure would mean shipping a YAML reader for a panel that
 * only needs to *show* the header, and the market detail's structured panel is
 * fed by upstream JSON this plugin does not have for a hand-written skill. The
 * verbatim block is also what the file actually contains, so nothing is lost.
 */
export function extractFrontmatter(markdown) {
    const text = markdown.startsWith('\uFEFF') ? markdown.slice(1) : markdown;
    const lines = text.split(/\r?\n/);
    if (lines[0]?.trim() !== '---')
        return null;
    for (let index = 1; index < lines.length; index++) {
        const marker = (lines[index] ?? '').trim();
        if (marker !== '---' && marker !== '...')
            continue;
        const block = lines.slice(1, index).join('\n').trim();
        return block === '' ? null : block.slice(0, MAX_FRONTMATTER_BYTES);
    }
    // Unterminated header: the document is ordinary Markdown, as the browser's
    // strip helper already assumes.
    return null;
}
/**
 * Inventory one entry's own files.
 *
 * The walk never leaves the entry: directories are descended, symlinked entries
 * are listed as nothing at all, and the provenance sidecar (a dot-file, like
 * every other dot-entry) is skipped because it is plugin bookkeeping rather than
 * installed payload. A flat skill is a single file and reports itself.
 */
export async function listEntryFiles(item) {
    const stats = await fs.stat(item.dirPath);
    if (!stats.isDirectory()) {
        return [{ path: path.basename(item.dirPath), size: stats.size, language: detectMarketLanguage(item.dirPath) }];
    }
    const files = [];
    const pending = [''];
    while (pending.length > 0 && files.length < MAX_LISTED_FILES) {
        const relativeDir = pending.pop();
        if (relativeDir === undefined)
            break;
        const absoluteDir = relativeDir === '' ? item.dirPath : path.join(item.dirPath, relativeDir);
        let entries;
        try {
            entries = await fs.readdir(absoluteDir, { withFileTypes: true });
        }
        catch {
            // Raced with a concurrent removal — list what is still there.
            continue;
        }
        entries.sort((left, right) => left.name.localeCompare(right.name));
        for (const entry of entries) {
            if (files.length >= MAX_LISTED_FILES)
                break;
            if (entry.name.startsWith('.'))
                continue;
            const relative = relativeDir === '' ? entry.name : `${relativeDir}/${entry.name}`;
            if (entry.isDirectory()) {
                pending.push(relative);
                continue;
            }
            // `isFile()` excludes symlinks: a linked file is not part of the payload.
            if (!entry.isFile())
                continue;
            try {
                const fileStats = await fs.lstat(path.join(absoluteDir, entry.name));
                if (!fileStats.isFile())
                    continue;
                files.push({ path: relative, size: fileStats.size, language: detectMarketLanguage(entry.name) });
            }
            catch {
                // Raced with a concurrent removal.
            }
        }
    }
    files.sort((left, right) => left.path.localeCompare(right.path));
    return files;
}
/**
 * Validate one browser-supplied relative path.
 *
 * Absolute paths, `..` segments, empty segments and NUL are rejected outright;
 * the caller then proves containment against the entry's real path, so a
 * traversal cannot be smuggled in through either spelling or a symlink.
 */
function requireRelativePath(value) {
    const normalized = value.replace(/\\/g, '/').replace(/^\.\//, '');
    if (normalized === '' || normalized.includes('\0') || path.isAbsolute(normalized)) {
        throw new MarketInstallError(400, 'BAD_REQUEST', 'Invalid skill file path');
    }
    const segments = normalized.split('/');
    if (segments.some(segment => segment === '' || segment === '.' || segment === '..')) {
        throw new MarketInstallError(400, 'BAD_REQUEST', 'Invalid skill file path');
    }
    return segments.join('/');
}
/** Whether `candidate` is `root` itself or sits underneath it. */
function contains(root, candidate) {
    return candidate === root || candidate.startsWith(root.endsWith(path.sep) ? root : `${root}${path.sep}`);
}
/** Read the SKILL.md document plus the entry inventory the local detail page renders. */
export async function readInstalledSkill(roots, key) {
    const item = await resolveEntry(roots, key);
    const stats = await fs.stat(item.dirPath);
    const file = stats.isDirectory() ? path.join(item.dirPath, 'SKILL.md') : item.dirPath;
    const content = await readBoundedText(file, MAX_DOCUMENT_BYTES);
    if (content.truncated) {
        throw new MarketInstallError(413, 'FILE_TOO_LARGE', 'Skill preview exceeds 2 MB');
    }
    return {
        item,
        markdown: content.text,
        frontmatter: extractFrontmatter(content.text),
        files: await listEntryFiles(item),
    };
}
/**
 * Read one file of one entry.
 *
 * A flat skill exposes exactly itself — never its siblings in the same root —
 * and a directory bundle exposes only what resolves back inside its own real
 * path, so a symlink planted in the tree cannot turn this endpoint into an
 * arbitrary-file reader.
 */
export async function readInstalledFile(roots, key, requested) {
    const item = await resolveEntry(roots, key);
    const relative = requireRelativePath(requested);
    const stats = await fs.stat(item.dirPath);
    let documentPath;
    if (stats.isDirectory()) {
        const base = await fs.realpath(item.dirPath);
        const candidate = path.resolve(base, relative);
        if (!contains(base, candidate))
            throw new MarketInstallError(400, 'BAD_REQUEST', 'Invalid skill file path');
        let resolved;
        try {
            resolved = await fs.realpath(candidate);
        }
        catch {
            throw new MarketInstallError(404, 'MARKET_NOT_INSTALLED', 'Skill file no longer exists');
        }
        if (!contains(base, resolved)) {
            throw new MarketInstallError(400, 'BAD_REQUEST', 'Skill file escapes its directory');
        }
        documentPath = resolved;
    }
    else {
        if (relative !== path.basename(item.dirPath)) {
            throw new MarketInstallError(400, 'BAD_REQUEST', 'Invalid skill file path');
        }
        documentPath = await fs.realpath(item.dirPath);
    }
    const documentStats = await fs.stat(documentPath);
    if (!documentStats.isFile())
        throw new MarketInstallError(400, 'BAD_REQUEST', 'Skill file is not a document');
    const content = await readBoundedText(documentPath, MAX_PREVIEW_BYTES);
    return {
        path: relative,
        content: content.text,
        language: detectMarketLanguage(relative),
        size: documentStats.size,
        // Truncation is not an error: the browser labels the partial document.
        truncated: content.truncated,
    };
}
/** Rename the selected entry out of discovery before deletion. Symlink targets are never removed. */
export async function removeInstalledSkill(roots, key, allowUninstall) {
    if (!allowUninstall)
        throw new MarketInstallError(405, 'METHOD_NOT_ALLOWED', 'Uninstalling skills is disabled by the Skills Hub configuration');
    const item = await resolveEntry(roots, key);
    const trash = path.join(path.dirname(item.dirPath), `.skills-hub-trash-${randomUUID()}`);
    await fs.rename(item.dirPath, trash);
    // rm does not follow symlinks, including links swapped in after discovery.
    await fs.rm(trash, { recursive: true, force: true });
    return item;
}
