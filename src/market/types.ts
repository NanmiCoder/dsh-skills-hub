/**
 * Skills Market — shared types for the market aggregation layer.
 *
 * Upstream sources:
 *  - ClawHub  (https://clawhub.ai)      — cursor pagination, no security audits
 *  - SkillHub (https://api.skillhub.cn) — page/pageSize pagination, security reports
 */

export type MarketSource = 'clawhub' | 'skillhub'

export const MARKET_SOURCES: MarketSource[] = ['clawhub', 'skillhub']

export type SecurityStatus = 'verified' | 'benign' | 'unknown' | 'flagged'

export type InstallState = 'installed' | 'installable' | 'not-installable'

export type SourceHealthStatus = 'ok' | 'degraded' | 'failed' | 'cached'

export type NotInstallableReason =
  | 'empty-file-list'
  | 'file-too-large'
  | 'too-many-files'
  | 'invalid-name'
  | 'name-conflict'
  | 'source-unavailable'

export type SecurityReport = {
  vendor: string
  status: string
  statusText: string
  reportUrl?: string
  /** The scanner's own explanation of its verdict, when it gives one */
  summary?: string
}

export type NormalizedSkill = {
  /** `${source}:${slug}` — globally unique */
  id: string
  source: MarketSource
  slug: string
  name: string
  summary: string
  author: { handle: string; displayName?: string; avatarUrl?: string }
  stats: { downloads: number; installs?: number; stars?: number }
  tags: string[]
  /** Curated-catalogue category key, e.g. `dev` (absent for live upstream results) */
  category?: string
  /** Editor's pick in the curated catalogue */
  featured?: boolean
  version?: string
  updatedAt?: number
  iconUrl?: string
  securityStatus: SecurityStatus
  securityReports?: SecurityReport[]
  requiresApiKey?: boolean
  verified?: boolean
  /** Set on SkillHub entries that mirror a ClawHub skill */
  upstream?: { source: MarketSource; slug: string; owner?: string }
  /** After dedupe: ids of merged duplicate entries from other sources */
  mirrors?: string[]
  installState: InstallState
  notInstallableReason?: NotInstallableReason
  installedInfo?: { version?: string; installedAt?: string; dirName: string }
}

export type MarketFileMeta = {
  path: string
  size: number
  sha256?: string
  contentType?: string
  language: string
  /** File exceeds the preview/install size limit */
  tooBig: boolean
}

export type NormalizedSkillDetail = NormalizedSkill & {
  /** Full SKILL.md body (markdown, frontmatter stripped) */
  description: string
  /** Raw frontmatter parsed from SKILL.md description, when present */
  descriptionFrontmatter?: Record<string, unknown>
  license?: string
  files: MarketFileMeta[]
  totalSize: number
  /** Release note of the latest version, when upstream has a meaningful one */
  changelog?: { version?: string; text: string; publishedAt?: number }
  /** The skill's page on its registry (http(s) only) */
  pageUrl?: string
}

export type MarketFileContent = {
  path: string
  content: string
  language: string
  size: number
  truncated: boolean
}

export type SourceStatusInfo = {
  status: SourceHealthStatus
  fetchedAt?: number
  fromCache?: boolean
  error?: string
}

/** One curated-catalogue category. */
export type MarketCategory = {
  key: string
  name: string
  nameEn?: string
  sortOrder: number
  /** Skills the catalogue holds in this category */
  count?: number
}

export type MarketCategoriesResult = {
  items: MarketCategory[]
  status: SourceStatusInfo
}

export type MarketListResult = {
  items: NormalizedSkill[]
  nextCursor: string | null
  /** Matching skills in total, when known (the curated catalogue always knows) */
  total?: number
  sources: Record<MarketSource, SourceStatusInfo>
}

// ─── Provider layer ──────────────────────────────────────────────────────────

export type ProviderListPage = {
  items: NormalizedSkill[]
  /** Provider-native cursor for the next page; undefined = exhausted */
  nextCursor?: string
  total?: number
}

export type ProviderFileEntry = {
  path: string
  size: number
  sha256?: string
  contentType?: string
}

export interface MarketProvider {
  readonly source: MarketSource
  list(params: { cursor?: string; limit: number }): Promise<ProviderListPage>
  search(params: { q: string; cursor?: string; limit: number }): Promise<ProviderListPage>
  detail(slug: string): Promise<NormalizedSkillDetail>
  listFiles(slug: string, version?: string): Promise<ProviderFileEntry[]>
  fetchFile(slug: string, filePath: string): Promise<{ content: string; size: number }>
}

// ─── Error codes ─────────────────────────────────────────────────────────────

export const MARKET_ERROR_CODES = {
  upstreamError: 'MARKET_UPSTREAM_ERROR',
  upstreamTimeout: 'MARKET_UPSTREAM_TIMEOUT',
  upstreamBadResponse: 'MARKET_UPSTREAM_BAD_RESPONSE',
  installInProgress: 'MARKET_INSTALL_IN_PROGRESS',
  alreadyInstalled: 'MARKET_ALREADY_INSTALLED',
  notInstallable: 'MARKET_NOT_INSTALLABLE',
  checksumMismatch: 'MARKET_CHECKSUM_MISMATCH',
  diskError: 'MARKET_DISK_ERROR',
  notInstalled: 'MARKET_NOT_INSTALLED',
  notManaged: 'MARKET_NOT_MANAGED',
} as const

export class MarketUpstreamError extends Error {
  constructor(
    public source: MarketSource,
    public code: string,
    message: string,
  ) {
    super(message)
    this.name = 'MarketUpstreamError'
  }
}

// ─── Limits ──────────────────────────────────────────────────────────────────

export const MARKET_LIMITS = {
  /** Max bytes for a single skill file (install + preview) */
  maxFileSize: 5 * 1024 * 1024,
  /** Max total bytes for an installable skill */
  maxTotalSize: 20 * 1024 * 1024,
  /** Max file count for an installable skill */
  maxFileCount: 200,
  /** File preview content is truncated beyond this many bytes */
  previewTruncateBytes: 300 * 1024,
  /** ClawHub search has no pagination — cap merged search results */
  searchResultCap: 50,
} as const

export function skillId(source: MarketSource, slug: string): string {
  return `${source}:${slug}`
}

export function parseSkillId(id: string): { source: MarketSource; slug: string } | null {
  const idx = id.indexOf(':')
  if (idx <= 0) return null
  const source = id.slice(0, idx)
  const slug = id.slice(idx + 1)
  if (!MARKET_SOURCES.includes(source as MarketSource) || !slug) return null
  return { source: source as MarketSource, slug }
}

/** Directory-name whitelist: lowercase alnum, dash, underscore, dot (no leading dot). */
export function sanitizeDirName(slug: string): string | null {
  // Upstream payloads are untrusted: a non-string slug is simply not a usable
  // directory name, and must degrade to "not installable" instead of throwing
  // from `slug.toLowerCase()` deep inside a list request.
  if (typeof slug !== 'string') return null
  const name = slug.toLowerCase()
  if (!/^[a-z0-9][a-z0-9._-]*$/.test(name)) return null
  if (name.includes('..')) return null
  return name
}

const LANG_MAP: Record<string, string> = {
  md: 'markdown', markdown: 'markdown', mdx: 'markdown',
  ts: 'typescript', tsx: 'typescript',
  js: 'javascript', jsx: 'javascript', mjs: 'javascript', cjs: 'javascript',
  json: 'json', yaml: 'yaml', yml: 'yaml', sh: 'bash', bash: 'bash', zsh: 'bash',
  py: 'python', toml: 'toml', css: 'css', html: 'html',
  txt: 'text', xml: 'xml', sql: 'sql', rs: 'rust', go: 'go', rb: 'ruby',
}

export function detectMarketLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  return LANG_MAP[ext] || 'text'
}
