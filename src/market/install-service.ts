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

import { createHash, randomUUID } from 'node:crypto'
import type { Stats } from 'node:fs'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { clawhubProvider } from './clawhub-provider.ts'
import { skillhubProvider } from './skillhub-provider.ts'
import { getMarketSkillDetail } from './market-service.ts'
import {
  INSTALL_META_FILE,
  parseInstalledMeta,
  readSkillHeadline,
  type InstalledMetaFile,
} from '../skills/installed.ts'
import {
  MARKET_ERROR_CODES,
  MARKET_LIMITS,
  sanitizeDirName,
  skillId,
  type MarketProvider,
  type MarketSource,
  type NormalizedSkill,
} from './types.ts'

const providers: Record<MarketSource, MarketProvider> = {
  clawhub: clawhubProvider,
  skillhub: skillhubProvider,
}

/**
 * One in-flight install per *resolved directory*.
 *
 * A second request for the same skill while the first is still downloading is a
 * conflict, not a queue: the caller (the panel) shows one spinner per skill and
 * the reference implementation behaved the same way. The key is the sanitized
 * directory name (`${source}:${dirName}`, which is lowercased) rather than the
 * raw id, because `clawhub:Demo` and `clawhub:demo` publish to the same
 * directory: keying on the raw id let both pass the conflict checks and the
 * loser failed with a raw ENOTEMPTY from the publish rename. `clawhub:demo` and
 * `skillhub:demo` still stay independent.
 */
const inFlight = new Map<string, Promise<unknown>>()

/** File mode of the provenance sidecar; the skills tree is ordinary user data. */
const META_FILE_MODE = 0o644

/** Naming prefix of the hidden staging directory inside the skills root. */
const STAGING_PREFIX = '.skills-hub-install-'
/** Naming prefix of the hidden directory a removal is renamed into first. */
const TRASH_PREFIX = '.skills-hub-trash-'

export interface InstallResult {
  installedPath: string
  skill: NormalizedSkill
}

export interface UninstallResult {
  removedPath: string
  skill: NormalizedSkill
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
export class MarketInstallError extends Error {
  readonly code: string
  readonly status: number

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'MarketInstallError'
    this.code = code
    this.status = status
  }
}

/** Reject an empty/oversized/traversing provider file path (POSIX separators only). */
function isSafeRelativeFilePath(filePath: string): boolean {
  if (filePath === '' || filePath.length > 512) return false
  if (filePath.includes('\0') || filePath.includes('\\')) return false
  if (path.posix.isAbsolute(filePath)) return false
  const normalized = path.posix.normalize(filePath)
  if (normalized.startsWith('..') || normalized.startsWith('/')) return false
  return normalized.split('/').every((segment) => segment !== '' && segment !== '.' && segment !== '..')
}

/** `true` only when `child` is a strict descendant of `parent` (both absolute). */
function isInside(parent: string, child: string): boolean {
  const relative = path.relative(parent, child)
  return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative)
}

/** `child` resolved and proved to live strictly below `parent`. */
function resolveInside(parent: string, ...segments: string[]): string {
  const target = path.resolve(parent, ...segments)
  if (!isInside(parent, target)) {
    throw new MarketInstallError(400, MARKET_ERROR_CODES.notInstallable, `Unsafe path outside the skills root: ${target}`)
  }
  return target
}

/** SHA-256 of one fetched file body, hex encoded (matches the provider field). */
function sha256Hex(content: string): string {
  return createHash('sha256').update(content, 'utf-8').digest('hex')
}

/** `true` when `error` is a Node filesystem error with the given code. */
function hasErrorCode(error: unknown, code: string): boolean {
  return typeof error === 'object' && error !== null && (error as NodeJS.ErrnoException).code === code
}

/** The upstream detail for a skill, or the market's own "not installable" verdict. */
async function loadDetail(source: MarketSource, slug: string): Promise<NormalizedSkill> {
  const { skill } = await getMarketSkillDetail(source, slug)
  return skill
}

/**
 * Refuse to publish over anything we do not own.
 *
 * Called once before downloading (fail fast, no wasted upstream traffic) and
 * again immediately before the publish rename, because a manual install can land
 * in between. A symlink is never a valid target: following one would publish
 * into a directory outside the skills root.
 */
async function assertInstallTargetFree(target: string, dirName: string, id: string): Promise<void> {
  let stats: Stats
  try {
    stats = await fs.lstat(target)
  } catch (error) {
    if (hasErrorCode(error, 'ENOENT')) return
    throw new MarketInstallError(
      500,
      MARKET_ERROR_CODES.diskError,
      `Cannot inspect the skill directory "${dirName}"`,
    )
  }
  if (!stats.isDirectory() || stats.isSymbolicLink()) {
    throw new MarketInstallError(
      409,
      MARKET_ERROR_CODES.notInstallable,
      `A file or link already occupies the skill directory: ${dirName}`,
    )
  }
  const meta = parseInstalledMeta(await readJsonIfExists(path.join(target, INSTALL_META_FILE)))
  if (meta !== null && meta.id === id) {
    throw new MarketInstallError(409, MARKET_ERROR_CODES.alreadyInstalled, `Skill already installed: ${id}`)
  }
  throw new MarketInstallError(
    409,
    MARKET_ERROR_CODES.notInstallable,
    `Skill directory "${dirName}" was not installed by Skills Hub (name-conflict); remove it manually to continue`,
  )
}

/** Read and parse a JSON file; `undefined` for absent or unparsable content. */
async function readJsonIfExists(filePath: string): Promise<unknown> {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf-8')) as unknown
  } catch {
    return undefined
  }
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
export async function installMarketSkill(
  source: MarketSource,
  slug: string,
  options: { skillsRoot: string; allowUninstall: boolean },
): Promise<InstallResult> {
  const dirName = sanitizeDirName(slug)
  if (dirName === null) {
    throw new MarketInstallError(
      400,
      MARKET_ERROR_CODES.notInstallable,
      `Skill slug cannot be used as a directory name: ${slug}`,
    )
  }
  const id = skillId(source, slug)
  // The lock is keyed by the resolved directory name, not the raw id: the
  // directory name is lowercased, so `clawhub:Demo` and `clawhub:demo` are the
  // same publish target and must serialise.
  const lockKey = skillId(source, dirName)
  if (inFlight.has(lockKey)) {
    throw new MarketInstallError(409, MARKET_ERROR_CODES.installInProgress, `Install already in progress: ${id}`)
  }
  const task = performInstall(source, slug, dirName, id, options.skillsRoot)
  // Store a settled-safe copy: the lock exists to reject *concurrent* work, and
  // an unhandled rejection here would crash the host on every failed install.
  inFlight.set(lockKey, task.catch(() => undefined))
  try {
    return await task
  } finally {
    inFlight.delete(lockKey)
  }
}

async function performInstall(
  source: MarketSource,
  slug: string,
  dirName: string,
  id: string,
  skillsRootInput: string,
): Promise<InstallResult> {
  const skillsRoot = path.resolve(skillsRootInput)
  const detail = await loadDetail(source, slug)
  if (detail.installState === 'installed') {
    throw new MarketInstallError(409, MARKET_ERROR_CODES.alreadyInstalled, `Skill already installed: ${id}`)
  }
  if (detail.installState === 'not-installable') {
    throw new MarketInstallError(
      400,
      MARKET_ERROR_CODES.notInstallable,
      `Skill is not installable (${detail.notInstallableReason ?? 'unknown'}): ${slug}`,
    )
  }

  // The cached detail may be older than the provider's version index, so the
  // file list is fetched fresh at install time (mirrors the reference).
  const files = await providers[source].listFiles(slug, detail.version)
  if (files.length === 0 || !files.some((file) => file.path === 'SKILL.md')) {
    throw new MarketInstallError(
      400,
      MARKET_ERROR_CODES.notInstallable,
      `Skill has no installable SKILL.md: ${slug}`,
    )
  }
  if (files.length > MARKET_LIMITS.maxFileCount) {
    throw new MarketInstallError(
      400,
      MARKET_ERROR_CODES.notInstallable,
      `Skill has too many files (${files.length} > ${MARKET_LIMITS.maxFileCount}): ${slug}`,
    )
  }
  const advertisedTotal = files.reduce((total, file) => total + (file.size || 0), 0)
  if (files.some((file) => file.size > MARKET_LIMITS.maxFileSize) || advertisedTotal > MARKET_LIMITS.maxTotalSize) {
    throw new MarketInstallError(400, MARKET_ERROR_CODES.notInstallable, `Skill files exceed the size limit: ${slug}`)
  }
  for (const file of files) {
    if (!isSafeRelativeFilePath(file.path)) {
      throw new MarketInstallError(
        400,
        MARKET_ERROR_CODES.notInstallable,
        `Unsafe file path in skill: ${file.path}`,
      )
    }
  }

  const target = resolveInside(skillsRoot, dirName)
  await assertInstallTargetFree(target, dirName, id)

  await fs.mkdir(skillsRoot, { recursive: true })
  // Staging in the target's own parent makes the publishing rename
  // same-filesystem by construction: there is no cross-device copy path to get
  // wrong, and a crash leaves only a hidden directory that no scanner reads.
  let stagingDir: string
  try {
    stagingDir = await fs.mkdtemp(path.join(skillsRoot, STAGING_PREFIX))
  } catch {
    throw new MarketInstallError(500, MARKET_ERROR_CODES.diskError, 'Cannot create a staging directory for the install')
  }

  try {
    const ledger: Array<{ path: string; sha256: string }> = []
    let actualTotal = 0
    for (const file of files) {
      const fetched = await providers[source].fetchFile(slug, file.path)
      const bytes = Buffer.byteLength(fetched.content, 'utf-8')
      if (bytes > MARKET_LIMITS.maxFileSize) {
        throw new MarketInstallError(
          400,
          MARKET_ERROR_CODES.notInstallable,
          `Skill file exceeds the actual size limit: ${file.path}`,
        )
      }
      actualTotal += bytes
      if (actualTotal > MARKET_LIMITS.maxTotalSize) {
        throw new MarketInstallError(
          400,
          MARKET_ERROR_CODES.notInstallable,
          `Skill files exceed the actual total size limit: ${slug}`,
        )
      }
      const digest = sha256Hex(fetched.content)
      if (file.sha256 !== undefined && digest !== file.sha256.toLowerCase()) {
        throw new MarketInstallError(
          502,
          MARKET_ERROR_CODES.checksumMismatch,
          `Checksum mismatch for ${file.path} — aborting install`,
        )
      }
      const segments = path.posix.normalize(file.path).split('/')
      const destination = resolveInside(stagingDir, ...segments)
      try {
        await fs.mkdir(path.dirname(destination), { recursive: true })
        await fs.writeFile(destination, fetched.content, 'utf-8')
      } catch {
        // Raw Node errors carry absolute staging paths ("EEXIST: … mkdir
        // '/var/folders/…'"), which must never reach the HTTP envelope.
        throw new MarketInstallError(
          500,
          MARKET_ERROR_CODES.diskError,
          'Failed to write a skill file into the staging directory',
        )
      }
      ledger.push({ path: segments.join('/'), sha256: digest })
    }

    const installedAt = new Date().toISOString()
    const meta: InstalledMetaFile = {
      id,
      source,
      slug,
      ...(detail.version === undefined ? {} : { version: detail.version }),
      installedAt,
      files: ledger,
    }
    try {
      // Written with a plain write on purpose: this file lives in the private
      // staging directory and only becomes visible when the whole directory is
      // renamed into place below, so per-file atomicity would add nothing — and
      // the harness' atomic-write package is an *optional* peer, which must not
      // sit on this plugin's module-load path.
      await fs.writeFile(
        path.join(stagingDir, INSTALL_META_FILE),
        `${JSON.stringify(meta, null, 2)}\n`,
        { mode: META_FILE_MODE },
      )
    } catch {
      // Same rule as the file writes above: a raw EISDIR message carries the
      // absolute staging path, which must not reach the HTTP envelope.
      throw new MarketInstallError(
        500,
        MARKET_ERROR_CODES.diskError,
        `Failed to write ${INSTALL_META_FILE} into the staging directory`,
      )
    }

    await assertInstallTargetFree(target, dirName, id)
    try {
      await fs.rename(stagingDir, target)
    } catch (error) {
      // A directory/file that appeared between the pre-assert and the rename is a
      // name conflict (the exact race `assertInstallTargetFree` cannot close), not
      // a disk failure — and the raw ENOTEMPTY/EEXIST message would leak two
      // absolute paths into the error envelope.
      if (hasErrorCode(error, 'ENOTEMPTY') || hasErrorCode(error, 'EEXIST') || hasErrorCode(error, 'ENOTDIR')) {
        throw new MarketInstallError(
          409,
          MARKET_ERROR_CODES.notInstallable,
          `Skill directory "${dirName}" is occupied by something else (name-conflict); remove it manually to continue`,
        )
      }
      throw new MarketInstallError(500, MARKET_ERROR_CODES.diskError, 'Failed to publish the skill to disk')
    }
    return {
      installedPath: target,
      // The pre-install detail is already the freshest upstream read we are
      // going to make; re-fetching after a successful publish could only add a
      // failure mode where files exist on disk but the caller sees an error.
      skill: {
        ...detail,
        installState: 'installed',
        notInstallableReason: undefined,
        installedInfo: {
          dirName,
          ...(detail.version === undefined ? {} : { version: detail.version }),
          installedAt,
        },
      },
    }
  } finally {
    // A no-op once the rename succeeded (the path no longer exists).
    await fs.rm(stagingDir, { recursive: true, force: true }).catch(() => undefined)
  }
}

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
export async function uninstallMarketSkill(
  source: MarketSource,
  slug: string,
  options: { skillsRoot: string; allowUninstall: boolean },
): Promise<UninstallResult> {
  if (!options.allowUninstall) {
    throw new MarketInstallError(
      405,
      'METHOD_NOT_ALLOWED',
      'Uninstalling skills is disabled by the Skills Hub configuration',
    )
  }
  const dirName = sanitizeDirName(slug)
  const id = skillId(source, slug)
  if (dirName === null) {
    throw new MarketInstallError(404, MARKET_ERROR_CODES.notInstalled, `Skill is not installed: ${slug}`)
  }
  const skillsRoot = path.resolve(options.skillsRoot)
  const target = resolveInside(skillsRoot, dirName)

  let stats: Stats
  try {
    stats = await fs.lstat(target)
  } catch {
    throw new MarketInstallError(404, MARKET_ERROR_CODES.notInstalled, `Skill is not installed: ${slug}`)
  }
  if (!stats.isDirectory() || stats.isSymbolicLink()) {
    throw new MarketInstallError(
      409,
      MARKET_ERROR_CODES.notManaged,
      `Skill directory is not a managed directory: ${dirName}`,
    )
  }
  const meta = parseInstalledMeta(await readJsonIfExists(path.join(target, INSTALL_META_FILE)))
  if (meta === null || meta.id !== id) {
    // Never delete a directory the market did not create.
    throw new MarketInstallError(
      409,
      MARKET_ERROR_CODES.notManaged,
      `Skill directory was not installed by Skills Hub: ${dirName}`,
    )
  }

  // Label the response from the directory itself: after the removal the
  // upstream may be unreachable, and the panel still has to name what it removed.
  const headline = await readSkillHeadline(path.join(target, 'SKILL.md'))

  // Rename out of the skills root's namespace first, then delete: the rename is
  // the atomic step that unpublishes the skill, so an interruption can only
  // leave an inert, dot-prefixed directory behind — never a half-deleted skill.
  const trash = resolveInside(skillsRoot, `${TRASH_PREFIX}${dirName}-${randomUUID()}`)
  try {
    await fs.rename(target, trash)
  } catch {
    throw new MarketInstallError(500, MARKET_ERROR_CODES.diskError, 'Failed to remove the skill directory')
  }
  await fs.rm(trash, { recursive: true, force: true }).catch(() => undefined)

  return { removedPath: target, skill: await refreshRemovedSkill(source, slug, id, dirName, meta, headline) }
}

/**
 * Describe a just-removed skill for the response.
 *
 * Best effort: the upstream read is what makes the panel's patch exact, but the
 * removal already happened, so an unreachable provider degrades to a record
 * built from the sidecar and the skill's own frontmatter instead of turning a
 * successful uninstall into an error.
 */
async function refreshRemovedSkill(
  source: MarketSource,
  slug: string,
  id: string,
  dirName: string,
  meta: InstalledMetaFile,
  headline: { name?: string; summary?: string } | undefined,
): Promise<NormalizedSkill> {
  try {
    const { skill } = await getMarketSkillDetail(source, slug)
    return { ...skill, installState: 'installable', notInstallableReason: undefined, installedInfo: undefined }
  } catch {
    return {
      id,
      source,
      slug,
      name: headline?.name ?? dirName,
      summary: headline?.summary ?? '',
      author: { handle: '' },
      stats: { downloads: 0 },
      tags: [],
      ...(meta.version === undefined ? {} : { version: meta.version }),
      securityStatus: 'unknown',
      installState: 'installable',
    }
  }
}

/** Drop every install lock. Test hook, mirroring the reference implementation. */
export function resetInstallLocksForTests(): void {
  inFlight.clear()
}
