/**
 * SkillHub provider (https://api.skillhub.cn)
 *
 * Endpoints (verified against the live API):
 *  - GET /api/skills?page=&pageSize=&keyword=      → {code, data:{skills[], total}, message}
 *      NOTE: pagination param MUST be `pageSize` (a `limit` param is silently ignored)
 *      NOTE: search param MUST be `keyword` (a `q` param is silently ignored)
 *  - GET /api/v1/skills/{slug}                     → {skill, owner, latestVersion, securityReports}
 *  - GET /api/v1/skills/{slug}/files               → {count, files:[{path, sha256, size}]}
 *  - GET /api/v1/skills/{slug}/file?path=          → 302 redirect to Tencent COS (follow)
 */

import {
  getProviderBase,
  providerFetch,
  providerFetchJson,
  readResponseTextWithLimit,
  MarketHttpError,
} from './provider-fetch.ts'
import {
  detectMarketLanguage,
  MARKET_ERROR_CODES,
  MARKET_LIMITS,
  MarketUpstreamError,
  skillId,
  type MarketProvider,
  type NormalizedSkill,
  type NormalizedSkillDetail,
  type ProviderFileEntry,
  type ProviderListPage,
  type SecurityReport,
  type SecurityStatus,
} from './types.ts'
// The frontmatter parser is shared with the ClawHub provider: both sources hand
// us a raw SKILL.md and the detail contract promises a frontmatter-free body.
import { parseFrontmatter } from './clawhub-provider.ts'
import { markSourceHealth } from './cache.ts'

type SkillhubListItem = {
  slug: string
  name?: string
  /** Detail endpoint uses displayName/summary/summary_zh instead of name/description/description_zh */
  displayName?: string
  summary?: string
  summary_zh?: string
  description?: string
  description_zh?: string
  category?: string
  subCategories?: Array<{ key?: string; name?: string }>
  downloads?: number
  installs?: number
  stars?: number
  iconUrl?: string
  ownerName?: string
  labels?: Record<string, string>
  source?: string
  upstream_url?: string
  verified?: boolean
  version?: string
  updated_at?: number
  updatedAt?: number
}

type SkillhubEnvelope<T> = { code: number; data: T; message?: string }

type SkillhubSecurityReports = Record<
  string,
  { status?: string; statusText?: string; reportUrl?: string } | undefined
>

type SkillhubDetail = {
  skill?: SkillhubListItem & { stats?: { downloads?: number; installs?: number; stars?: number } }
  owner?: { handle?: string; displayName?: string; image?: string | null }
  latestVersion?: { version?: string; changelog?: string }
  securityReports?: SkillhubSecurityReports
}

/**
 * Vendor statuses that mean "no findings". Anything else (suspicious,
 * malicious, …) flags the skill: an unrecognised vendor status must never be
 * reported as safe.
 */
const BENIGN_STATUSES = new Set(['benign', 'safe', 'clean'])

// ─── Untrusted-payload helpers ───────────────────────────────────────────────

/**
 * Upstream JSON is untrusted input: a field declared `string` in the ported
 * types can arrive as an object, an array or a number. These helpers keep every
 * `NormalizedSkill` field at its declared runtime type.
 */
function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

/** A usable slug is a non-empty string — anything else is not a skill entry. */
function hasUsableSlug(item: unknown): boolean {
  if (typeof item !== 'object' || item === null) return false
  const slug = (item as { slug?: unknown }).slug
  return typeof slug === 'string' && slug.trim() !== ''
}

/** File entries are only useful with a string path; sizes default to 0. */
function usableFileEntries(files: unknown): Array<{ path: string; size: number; sha256?: string; contentType?: string }> {
  if (!Array.isArray(files)) return []
  const out: Array<{ path: string; size: number; sha256?: string; contentType?: string }> = []
  for (const file of files) {
    if (typeof file !== 'object' || file === null) continue
    const record = file as { path?: unknown; size?: unknown; sha256?: unknown; contentType?: unknown }
    if (typeof record.path !== 'string' || record.path === '') continue
    out.push({
      path: record.path,
      size: asNumber(record.size) ?? 0,
      sha256: asString(record.sha256),
      contentType: asString(record.contentType),
    })
  }
  return out
}

function mapSecurity(
  reports: SkillhubSecurityReports | undefined,
  verified: boolean | undefined,
): { status: SecurityStatus; reports: SecurityReport[] } {
  const normalized: SecurityReport[] = []
  for (const [vendor, report] of Object.entries(reports ?? {})) {
    const status = asString(report?.status)
    if (status === undefined) continue
    normalized.push({
      vendor,
      status,
      statusText: asString(report?.statusText) || status,
      reportUrl: asString(report?.reportUrl),
    })
  }
  if (normalized.length === 0) return { status: 'unknown', reports: normalized }
  const anyFlagged = normalized.some((report) => !BENIGN_STATUSES.has(report.status.toLowerCase()))
  if (anyFlagged) return { status: 'flagged', reports: normalized }
  return { status: verified ? 'verified' : 'benign', reports: normalized }
}

function parseUpstream(item: SkillhubListItem): NormalizedSkill['upstream'] {
  const upstreamUrl = asString(item.upstream_url)
  if (item.source !== 'clawhub' || !upstreamUrl) return undefined
  // upstream_url looks like https://clawhub.ai/{owner}/{slug} — the trailing segment is the slug.
  try {
    const segments = new URL(upstreamUrl).pathname.split('/').filter(Boolean)
    const slug = segments[segments.length - 1]
    if (slug) return { source: 'clawhub', slug }
  } catch {
    // Malformed upstream URL — treat as a native entry.
  }
  return undefined
}

function normalizeListItem(item: SkillhubListItem): NormalizedSkill {
  const tags: string[] = []
  for (const sub of item.subCategories ?? []) {
    const name = asString(sub?.name)
    if (name) tags.push(name)
  }
  const verified = item.verified === undefined ? undefined : Boolean(item.verified)
  return {
    id: skillId('skillhub', item.slug),
    source: 'skillhub',
    slug: item.slug,
    name: asString(item.name) || asString(item.displayName) || item.slug,
    // Prefer the Chinese copy: this market's primary audience reads zh-CN.
    summary:
      asString(item.description_zh)
      || asString(item.description)
      || asString(item.summary_zh)
      || asString(item.summary)
      || '',
    author: { handle: asString(item.ownerName) || '' },
    stats: {
      downloads: asNumber(item.downloads) ?? 0,
      installs: asNumber(item.installs),
      stars: asNumber(item.stars),
    },
    tags,
    category: asString(item.category),
    version: asString(item.version),
    updatedAt: asNumber(item.updated_at) ?? asNumber(item.updatedAt),
    iconUrl: asString(item.iconUrl) || undefined,
    // List responses carry no security reports — `verified` is the only signal;
    // the detail endpoint refines this to benign/flagged via securityReports.
    securityStatus: verified ? 'verified' : 'unknown',
    requiresApiKey: item.labels?.requires_api_key === 'true',
    verified,
    upstream: parseUpstream(item),
    installState: 'installable',
  }
}

/**
 * Fetch one page of the `{code, data, message}` envelope.
 *
 * SkillHub paginates by page number, so the "cursor" is just the next page
 * number as a string; `total` (not the page length) decides exhaustion.
 */
async function fetchPage(params: { keyword?: string; page: number; pageSize: number }): Promise<ProviderListPage> {
  const base = getProviderBase('skillhub')
  const url = new URL('/api/skills', base)
  url.searchParams.set('page', String(params.page))
  url.searchParams.set('pageSize', String(params.pageSize))
  if (params.keyword) url.searchParams.set('keyword', params.keyword)

  const envelope = await providerFetchJson<SkillhubEnvelope<{ skills?: SkillhubListItem[]; total?: number }>>(
    'skillhub',
    url.toString(),
  )
  if (envelope.code !== 0 || !Array.isArray(envelope.data?.skills)) {
    throw new MarketUpstreamError(
      'skillhub',
      MARKET_ERROR_CODES.upstreamBadResponse,
      `skillhub responded code=${envelope.code}: ${envelope.message || 'bad payload'}`,
    )
  }
  const rawItems = envelope.data.skills
  const usable = rawItems.filter(hasUsableSlug)
  if (usable.length === 0 && rawItems.length > 0) {
    // Every entry was malformed: report the payload instead of silently serving
    // an empty page while `/status` still claims the source is healthy.
    const error = new MarketUpstreamError(
      'skillhub',
      MARKET_ERROR_CODES.upstreamBadResponse,
      'skillhub list contained no usable items',
    )
    markSourceHealth('skillhub', 'degraded', error.message)
    throw error
  }
  if (usable.length !== rawItems.length) {
    markSourceHealth('skillhub', 'degraded', 'skillhub list contained malformed items')
  }
  const items = usable.map(normalizeListItem)
  const total = envelope.data.total ?? 0
  const hasMore = params.page * params.pageSize < total
  return {
    items,
    nextCursor: hasMore ? String(params.page + 1) : undefined,
    total,
  }
}

function cursorToPage(cursor: string | undefined): number {
  return cursor ? Math.max(1, Number.parseInt(cursor, 10) || 1) : 1
}

export const skillhubProvider: MarketProvider = {
  source: 'skillhub',

  async list({ cursor, limit }): Promise<ProviderListPage> {
    return fetchPage({ page: cursorToPage(cursor), pageSize: limit })
  },

  async search({ q, cursor, limit }): Promise<ProviderListPage> {
    return fetchPage({ keyword: q, page: cursorToPage(cursor), pageSize: limit })
  },

  async detail(slug): Promise<NormalizedSkillDetail> {
    const base = getProviderBase('skillhub')
    const data = await providerFetchJson<SkillhubDetail>(
      'skillhub',
      new URL(`/api/v1/skills/${encodeURIComponent(slug)}`, base).toString(),
    )
    if (typeof data.skill?.slug !== 'string' || data.skill.slug.trim() === '') {
      throw new MarketUpstreamError('skillhub', MARKET_ERROR_CODES.upstreamBadResponse, 'skillhub detail missing skill')
    }

    const item = normalizeListItem(data.skill)
    if (data.skill.stats) {
      item.stats = {
        downloads: asNumber(data.skill.stats.downloads) ?? item.stats.downloads,
        installs: asNumber(data.skill.stats.installs) ?? item.stats.installs,
        stars: asNumber(data.skill.stats.stars) ?? item.stats.stars,
      }
    }
    const security = mapSecurity(
      data.securityReports,
      data.skill.verified === undefined ? undefined : Boolean(data.skill.verified),
    )
    const version = asString(data.latestVersion?.version) || item.version

    let files: ProviderFileEntry[] = []
    try {
      files = await skillhubProvider.listFiles(slug)
    } catch {
      // File list is best-effort at detail time; install re-fetches it.
    }

    // SkillHub detail has no full SKILL.md body — fetch it for the overview tab.
    let description = ''
    let descriptionFrontmatter: Record<string, unknown> | undefined
    const skillMd = files.find((file) => file.path === 'SKILL.md')
    if (skillMd) {
      try {
        const fetched = await skillhubProvider.fetchFile(slug, 'SKILL.md')
        description = fetched.content
      } catch {
        description = item.summary
      }
    } else {
      description = item.summary
    }
    // This endpoint serves SKILL.md verbatim, frontmatter included. Strip it and
    // expose the parsed map like the ClawHub provider does: the overview tab
    // would otherwise render the raw `---` block as body text, and the metadata
    // panel would never appear for SkillHub skills.
    if (description.startsWith('---')) {
      const parsed = parseFrontmatter(description)
      description = parsed.content
      descriptionFrontmatter = parsed.frontmatter
    }

    return {
      ...item,
      version,
      author: {
        handle: asString(data.owner?.handle) || item.author.handle,
        displayName: asString(data.owner?.displayName),
        avatarUrl: asString(data.owner?.image) || undefined,
      },
      securityStatus: security.status,
      securityReports: security.reports.length ? security.reports : undefined,
      description,
      ...(descriptionFrontmatter ? { descriptionFrontmatter } : {}),
      files: files.map((file) => ({
        path: file.path,
        size: file.size,
        sha256: file.sha256,
        contentType: file.contentType,
        language: detectMarketLanguage(file.path),
        tooBig: false,
      })),
      totalSize: files.reduce((sum, file) => sum + file.size, 0),
    }
  },

  async listFiles(slug): Promise<ProviderFileEntry[]> {
    const base = getProviderBase('skillhub')
    const data = await providerFetchJson<
      { count?: number; files?: Array<{ path: string; sha256?: string; size: number }> }
    >('skillhub', new URL(`/api/v1/skills/${encodeURIComponent(slug)}/files`, base).toString())
    if (!Array.isArray(data.files)) {
      throw new MarketUpstreamError('skillhub', MARKET_ERROR_CODES.upstreamBadResponse, 'skillhub files missing list')
    }
    return usableFileEntries(data.files)
  },

  async fetchFile(slug, filePath): Promise<{ content: string; size: number }> {
    const base = getProviderBase('skillhub')
    const url = new URL(`/api/v1/skills/${encodeURIComponent(slug)}/file`, base)
    url.searchParams.set('path', filePath)
    // 302 → Tencent COS; providerFetch follows redirects.
    const res = await providerFetch('skillhub', url.toString())
    if (!res.ok) {
      throw new MarketHttpError(
        'skillhub',
        res.status,
        res.status === 404 ? MARKET_ERROR_CODES.upstreamBadResponse : MARKET_ERROR_CODES.upstreamError,
        `skillhub file fetch failed (${res.status})`,
      )
    }
    return await readResponseTextWithLimit('skillhub', res, MARKET_LIMITS.maxFileSize, `file ${filePath}`)
  },
}
