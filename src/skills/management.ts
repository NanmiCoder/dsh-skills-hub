/** Local management only addresses entries freshly discovered inside configured user roots. */
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { readBoundedText } from './read-text.ts'
import { randomUUID } from 'node:crypto'
import { MarketInstallError } from '../market/install-service.ts'
import { scanInstalledSkills, type InstalledSkillRecord } from './installed.ts'

async function resolveEntry(roots: string[], key: string): Promise<InstalledSkillRecord> {
  if (!/^[a-f0-9]{64}$/.test(key)) throw new MarketInstallError(400, 'BAD_REQUEST', 'Invalid installed skill key')
  const entry = (await scanInstalledSkills(roots)).find(item => item.key === key)
  if (!entry) throw new MarketInstallError(404, 'MARKET_NOT_INSTALLED', 'Installed skill no longer exists')
  return entry
}

export async function readInstalledSkill(roots: string[], key: string): Promise<{ item: InstalledSkillRecord; markdown: string }> {
  const item = await resolveEntry(roots, key)
  const stats = await fs.stat(item.dirPath)
  const file = stats.isDirectory() ? path.join(item.dirPath, 'SKILL.md') : item.dirPath
  const content = await readBoundedText(file, 2 * 1024 * 1024)
  if (content.truncated) {
    throw new MarketInstallError(413, 'FILE_TOO_LARGE', 'Skill preview exceeds 2 MB')
  }
  return { item, markdown: content.text }
}

/** Rename the selected entry out of discovery before deletion. Symlink targets are never removed. */
export async function removeInstalledSkill(roots: string[], key: string, allowUninstall: boolean): Promise<InstalledSkillRecord> {
  if (!allowUninstall) throw new MarketInstallError(405, 'METHOD_NOT_ALLOWED', 'Uninstalling skills is disabled by the Skills Hub configuration')
  const item = await resolveEntry(roots, key)
  const trash = path.join(path.dirname(item.dirPath), `.skills-hub-trash-${randomUUID()}`)
  await fs.rename(item.dirPath, trash)
  // rm does not follow symlinks, including links swapped in after discovery.
  await fs.rm(trash, { recursive: true, force: true })
  return item
}
