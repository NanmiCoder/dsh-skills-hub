#!/usr/bin/env node
/**
 * Regenerate the curated catalogue snapshot.
 *
 *   node scripts/catalog-refresh.mjs            # write src/catalog/skills.json
 *   node scripts/catalog-refresh.mjs --check    # report only, write nothing
 *
 * `catalog/curation.json` is the editorial source: which skills are in, under
 * which category, with what Chinese summary. This script only re-reads what
 * upstream owns — name, stats, version, icon, security verdict — so a refresh
 * never changes the selection. An entry upstream no longer serves is reported
 * and kept out of the snapshot rather than shipped as a dead card.
 *
 * Security policy (docs/CATALOG.md): a skill upstream blocks or calls malicious
 * is dropped; a `suspicious` verdict is kept only when the curation entry says
 * `allowSuspicious` (with a reason), and is then shipped as `flagged`.
 */
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { projectRoot } from './manifest.mjs'

const CURATION = join(projectRoot, 'catalog', 'curation.json')
const SNAPSHOT = join(projectRoot, 'src', 'catalog', 'skills.json')
const CLAWHUB = 'https://clawhub.ai'
const SKILLHUB = 'https://api.skillhub.cn'
const CONCURRENCY = 6
const checkOnly = process.argv.includes('--check')

async function getJson(url) {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const response = await fetch(url, { headers: { 'user-agent': 'dsh-skills-hub-catalog' } })
      if (response.status === 429 || response.status >= 500) throw new Error(`HTTP ${response.status}`)
      if (!response.ok) return { _status: response.status }
      return await response.json()
    } catch (error) {
      if (attempt === 3) return { _error: String(error) }
      await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)))
    }
  }
  return {}
}

const num = (value) => (typeof value === 'number' && Number.isFinite(value) ? value : undefined)
const str = (value) => (typeof value === 'string' && value !== '' ? value : undefined)

/** ClawHub: owner-qualified detail + the latest version's scan. */
async function readClawhub(entry) {
  const owner = `?owner=${encodeURIComponent(entry.owner)}`
  const detail = await getJson(`${CLAWHUB}/api/v1/skills/${encodeURIComponent(entry.slug)}${owner}`)
  const skill = detail.skill
  if (!skill) return { missing: `clawhub detail ${detail._status ?? detail._error ?? 'empty'}` }
  if (detail.owner?.handle && detail.owner.handle !== entry.owner) {
    return { missing: `owner is now ${detail.owner.handle}` }
  }
  const version = str(detail.latestVersion?.version) ?? str(skill.tags?.latest)
  const versionDetail = version
    ? await getJson(`${CLAWHUB}/api/v1/skills/${encodeURIComponent(entry.slug)}/versions/${encodeURIComponent(version)}${owner}`)
    : {}
  const scan = versionDetail.version?.security ?? {}
  const moderation = detail.moderation ?? {}
  let verdict = 'unknown'
  const reasons = []
  if (moderation.isMalwareBlocked || moderation.verdict === 'malicious' || scan.status === 'malicious') verdict = 'malicious'
  else if (moderation.isSuspicious || scan.status === 'suspicious') verdict = 'suspicious'
  else if (moderation.verdict === 'clean' || scan.status === 'clean') verdict = 'clean'
  if (scan.scanners?.skillspector?.recommendation) reasons.push(`skillspector: ${scan.scanners.skillspector.recommendation}`)
  if (scan.scanners?.llm?.normalizedStatus && scan.scanners.llm.normalizedStatus !== 'clean') reasons.push(`llm review: ${scan.scanners.llm.normalizedStatus}`)
  if (scan.scanners?.vt?.normalizedStatus && scan.scanners.vt.normalizedStatus !== 'clean') reasons.push(`VirusTotal: ${scan.scanners.vt.normalizedStatus}`)
  return {
    name: str(skill.displayName) ?? entry.slug,
    summaryEn: str(skill.summary),
    stats: { downloads: num(skill.stats?.downloads) ?? 0, installs: num(skill.stats?.installs), stars: num(skill.stats?.stars) },
    version,
    updatedAt: num(skill.updatedAt),
    license: str(detail.latestVersion?.license) ?? str(versionDetail.version?.license),
    verdict,
    reasons,
  }
}

/** SkillHub: the slug must still resolve to the curated owner's skill. */
async function readSkillhub(entry) {
  const detail = await getJson(`${SKILLHUB}/api/v1/skills/${encodeURIComponent(entry.slug)}`)
  const skill = detail.skill
  if (!skill) return { missing: `skillhub detail ${detail._status ?? detail._error ?? 'empty'}` }
  const owner = str(detail.owner?.handle) ?? str(skill.ownerName)
  if (owner && owner !== entry.owner) return { missing: `slug now resolves to ${owner}` }
  // `queued`/`pending` scans have no verdict yet: they leave the skill unknown.
  const reports = Object.values(detail.securityReports ?? {})
    .map((report) => String(report?.status ?? '').toLowerCase())
    .filter((status) => status !== '' && status !== 'queued' && status !== 'pending')
  let verdict = 'unknown'
  if (reports.some((status) => status === 'malicious')) verdict = 'malicious'
  else if (reports.some((status) => !['benign', 'safe', 'clean'].includes(status))) verdict = 'suspicious'
  else if (reports.length > 0) verdict = skill.verified ? 'verified' : 'clean'
  return {
    name: str(skill.displayName) ?? str(skill.name) ?? entry.slug,
    summaryEn: str(skill.summary),
    stats: {
      downloads: num(skill.stats?.downloads) ?? 0,
      installs: num(skill.stats?.installs),
      stars: num(skill.stats?.stars),
    },
    version: str(detail.latestVersion?.version),
    updatedAt: num(skill.updatedAt),
    iconUrl: str(skill.iconUrl),
    requiresApiKey: skill.labels?.requires_api_key === 'true' ? true : undefined,
    verdict,
    reasons: reports.length ? [`reports: ${reports.join(', ')}`] : [],
  }
}

async function pool(items, worker) {
  const results = new Array(items.length)
  let next = 0
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    while (next < items.length) {
      const index = next++
      results[index] = await worker(items[index], index)
    }
  }))
  return results
}

const curation = JSON.parse(await readFile(CURATION, 'utf8'))
const categoryKeys = new Set(curation.categories.map((category) => category.key))
const problems = []
const seen = new Set()

const rows = await pool(curation.skills, async (entry) => {
  const id = `${entry.source}:${entry.slug}`
  if (seen.has(id)) return { id, drop: 'duplicate entry' }
  seen.add(id)
  if (!categoryKeys.has(entry.category)) return { id, drop: `unknown category ${entry.category}` }
  const live = entry.source === 'clawhub' ? await readClawhub(entry) : await readSkillhub(entry)
  if (live.missing) return { id, drop: live.missing }
  if (live.verdict === 'malicious') return { id, drop: 'upstream verdict: malicious' }
  if (live.verdict === 'suspicious' && !entry.allowSuspicious) return { id, drop: `suspicious (${live.reasons.join('; ')})` }
  const security = live.verdict === 'suspicious' ? 'flagged'
    : live.verdict === 'verified' ? 'verified'
    : live.verdict === 'clean' ? 'benign'
    : 'unknown'
  const skill = {
    source: entry.source,
    slug: entry.slug,
    owner: entry.owner,
    name: live.name,
    summary: entry.summary,
    summaryEn: live.summaryEn,
    category: entry.category,
    tags: entry.tags ?? [],
    featured: entry.featured === true ? true : undefined,
    stats: live.stats,
    version: live.version,
    updatedAt: live.updatedAt,
    iconUrl: live.iconUrl ?? entry.iconUrl,
    security,
    securityNote: security === 'flagged' ? [entry.allowSuspicious, ...live.reasons].filter(Boolean).join('; ') : undefined,
    requiresApiKey: live.requiresApiKey,
    license: live.license,
  }
  return { id, skill: JSON.parse(JSON.stringify(skill)) }
})

const skills = []
for (const row of rows) {
  if (row.skill) skills.push(row.skill)
  else problems.push(`${row.id}: ${row.drop}`)
}

// Home-list order. Download counts are not comparable across registries
// (SkillHub's run far higher with near-zero installs), so popularity is the
// percentile within each source. Editor's picks lead, dealt round-robin across
// categories so the first screen shows the breadth of the catalogue.
const percentile = new Map()
for (const source of ['clawhub', 'skillhub']) {
  const ranked = skills.filter((skill) => skill.source === source).sort((a, b) => b.stats.downloads - a.stats.downloads)
  ranked.forEach((skill, index) => percentile.set(skill, 1 - index / Math.max(1, ranked.length)))
}
const byPopularity = (a, b) => percentile.get(b) - percentile.get(a)
const picks = new Map(curation.categories.map((category) => [category.key, []]))
for (const skill of skills.filter((entry) => entry.featured).sort(byPopularity)) picks.get(skill.category).push(skill)
const lead = []
for (let round = 0; lead.length < skills.filter((entry) => entry.featured).length; round++) {
  for (const queue of picks.values()) if (queue[round]) lead.push(queue[round])
}
const rest = skills.filter((entry) => !entry.featured).sort(byPopularity)
skills.splice(0, skills.length, ...lead, ...rest)

const snapshot = { version: 1, generatedAt: Date.now(), categories: curation.categories, skills }
process.stdout.write(`catalogue: ${skills.length}/${curation.skills.length} entries kept\n`)
for (const problem of problems) process.stdout.write(`  dropped ${problem}\n`)
if (!checkOnly) {
  await writeFile(SNAPSHOT, `${JSON.stringify(snapshot, null, 1)}\n`)
  process.stdout.write(`wrote ${SNAPSHOT.slice(projectRoot.length + 1)}\n`)
}
