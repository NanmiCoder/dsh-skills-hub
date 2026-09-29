/**
 * Deterministic provider-layer suite for the Skills Hub market core.
 *
 * Hermetic by construction: a local `node:http` stub is the only server — no test
 * touches clawhub.ai / api.skillhub.cn — and it answers with the recorded upstream
 * payloads in `tests/fixtures/market/`. `configureProviderFetch` aims both
 * providers at that stub, so timeouts, retries and error classification are
 * exercised without a network or a clock.
 *
 * Runs against the compiled host half (`lib/market/*.js`) because that is what the
 * plugin loads. When `lib/` has not been built the whole suite skips with a hint
 * instead of failing.
 *
 *   npx tsc -p tsconfig.json && node --test tests/providers.test.mjs
 */
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { test } from 'node:test'
import { pathToFileURL } from 'node:url'

const ROOT = new URL('..', import.meta.url).pathname
const LIB = join(ROOT, 'lib', 'market')
const FIXTURES = join(ROOT, 'tests', 'fixtures', 'market')
const SKIP_REASON = 'lib/ has not been built — run `npx tsc -p tsconfig.json` first'

let built = true
try {
  await stat(join(LIB, 'market-service.js'))
} catch {
  built = false
}

test('market provider layer (hermetic, fixture-backed)', { skip: built ? false : SKIP_REASON }, async (t) => {
  // ─── Subject under test ────────────────────────────────────────────────────
  const load = (name) => import(pathToFileURL(join(LIB, name)).href)
  const { configureProviderFetch, getProviderBase, MarketHttpError } = await load('provider-fetch.js')
  const { clawhubProvider, resetClawhubOwnerCache } = await load('clawhub-provider.js')
  const { skillhubProvider } = await load('skillhub-provider.js')
  const { resetMarketCache, getSourceHealth } = await load('cache.js')
  const {
    listMarketSkills,
    getMarketSkillDetail,
    getMarketFileContent,
    getMarketStatus,
    isValidMarketFilePath,
    setInstalledLookup,
    resetInstalledLookup,
  } = await load('market-service.js')
  const { MARKET_ERROR_CODES, MARKET_LIMITS, MARKET_SOURCES, MarketUpstreamError } = await load('types.js')

  // ─── Fixtures ──────────────────────────────────────────────────────────────
  const readFixture = async (name) => JSON.parse(await readFile(join(FIXTURES, name), 'utf8'))
  const fixtures = {
    clawhubList: await readFixture('clawhub-list.json'),
    clawhubSearch: await readFixture('clawhub-search.json'),
    clawhubDetail: await readFixture('clawhub-detail.json'),
    clawhubVersionDetail: await readFixture('clawhub-version-detail.json'),
    skillhubList: await readFixture('skillhub-list.json'),
    skillhubSearch: await readFixture('skillhub-search.json'),
    skillhubDetail: await readFixture('skillhub-detail.json'),
    skillhubFiles: await readFixture('skillhub-files.json'),
  }

  // Bodies the stub serves for raw file fetches (they are not fixtures: the real
  // endpoints return whole files, which the recordings do not include).
  const CLAWHUB_SKILL_MD = '# Hello Git\n'
  const SKILLHUB_SKILL_MD = '---\nname: 私募合规\n---\n## 使用说明\n正文\n'
  const REDIRECTED_SKILL_MD = '# Redirected from object storage\n'

  // ─── Stub upstream ─────────────────────────────────────────────────────────
  // Per-subtest switches; `resetUpstream()` restores the fixture-backed defaults.
  const upstreamDefaults = {
    clawhubListStatus: 200,
    /** Raw (non-JSON) body — the invalid-JSON case. */
    clawhubListRawBody: null,
    /** Valid JSON with the wrong shape. */
    clawhubListPayload: null,
    clawhubSearchPayload: null,
    clawhubDetailMode: 'ok', // 'ok' | '404' | '409' (ambiguous slug)
    clawhubVersionStatus: 200,
    clawhubFileBody: null,
    clawhubFileOversize: false,
    skillhubListPayload: null,
    skillhubDetailStatus: 200,
    skillhubFileRedirect: false,
    /** Accept the request and never answer — the timeout case. */
    hang: false,
  }
  const upstream = { ...upstreamDefaults }
  const requests = []

  const replyJson = (res, status, payload) => {
    const body = JSON.stringify(payload)
    res.writeHead(status, { 'content-type': 'application/json', 'content-length': Buffer.byteLength(body) })
    res.end(body)
  }
  const replyText = (res, status, body, headers = {}) => {
    res.writeHead(status, { 'content-type': 'text/plain; charset=utf-8', ...headers })
    res.end(body)
  }

  const server = createServer((req, res) => {
    // Client aborts (timeout / oversize-file cases) must not crash the stub.
    res.on('error', () => {})
    const url = new URL(req.url ?? '/', 'http://stub.invalid')
    const path = url.pathname
    const query = url.searchParams
    requests.push({ method: req.method, path, query: Object.fromEntries(query) })

    if (upstream.hang) return

    // ── ClawHub ──
    if (path === '/api/v1/skills') {
      if (upstream.clawhubListRawBody !== null) {
        res.writeHead(200, { 'content-type': 'text/html' })
        return res.end(upstream.clawhubListRawBody)
      }
      if (upstream.clawhubListStatus !== 200) return replyJson(res, upstream.clawhubListStatus, { error: 'upstream exploded' })
      return replyJson(res, 200, upstream.clawhubListPayload ?? fixtures.clawhubList)
    }
    if (path === '/api/v1/search') return replyJson(res, 200, upstream.clawhubSearchPayload ?? fixtures.clawhubSearch)
    if (path === '/api/v1/skills/git') {
      if (upstream.clawhubDetailMode === '409' && query.get('owner') !== 'pskoett') {
        return replyJson(res, 409, { code: 'AMBIGUOUS_SKILL_SLUG', slug: 'git', matches: [{ ownerHandle: 'pskoett' }] })
      }
      if (upstream.clawhubDetailMode === '404') return replyJson(res, 404, { error: 'skill not found' })
      return replyJson(res, 200, fixtures.clawhubDetail)
    }
    if (path === '/api/v1/skills/git/versions/1.0.8') {
      if (upstream.clawhubVersionStatus !== 200) return replyJson(res, upstream.clawhubVersionStatus, { error: 'no such version' })
      return replyJson(res, 200, fixtures.clawhubVersionDetail)
    }
    if (path === '/api/v1/skills/git/file') {
      if (upstream.clawhubFileOversize) {
        // Chunked on purpose: no content-length, so the provider has to count the
        // bytes while streaming instead of trusting the header.
        res.writeHead(200, { 'content-type': 'text/plain' })
        const chunk = Buffer.alloc(1024 * 1024, 0x78)
        for (let index = 0; index < 6; index++) res.write(chunk)
        return res.end()
      }
      return replyText(res, 200, upstream.clawhubFileBody ?? CLAWHUB_SKILL_MD)
    }
    if (path === '/api/v1/skills/huge-skill') {
      return replyJson(res, 200, {
        skill: { slug: 'huge-skill', displayName: 'Huge Skill', description: '# Huge' },
        latestVersion: { version: '1.0.0' },
      })
    }
    if (path === '/api/v1/skills/huge-skill/versions/1.0.0') {
      return replyJson(res, 200, {
        version: { version: '1.0.0', files: [{ path: 'SKILL.md', size: 5408 }, { path: 'blob.bin', size: 6 * 1024 * 1024 }] },
      })
    }

    // ── SkillHub ──
    if (path === '/api/skills') {
      if (upstream.skillhubListPayload) return replyJson(res, 200, upstream.skillhubListPayload)
      return replyJson(res, 200, query.has('keyword') ? fixtures.skillhubSearch : fixtures.skillhubList)
    }
    if (path === '/api/v1/skills/pe-compliance-expert-pro') {
      if (upstream.skillhubDetailStatus !== 200) return replyJson(res, upstream.skillhubDetailStatus, { error: 'not found' })
      return replyJson(res, 200, fixtures.skillhubDetail)
    }
    if (path === '/api/v1/skills/pe-compliance-expert-pro/files') return replyJson(res, 200, fixtures.skillhubFiles)
    if (path === '/api/v1/skills/pe-compliance-expert-pro/file') {
      // The real endpoint 302s to Tencent COS; the provider must follow it.
      if (upstream.skillhubFileRedirect) {
        res.writeHead(302, { location: '/cos/SKILL.md' })
        return res.end()
      }
      return replyText(res, 200, SKILLHUB_SKILL_MD)
    }
    if (path === '/cos/SKILL.md') return replyText(res, 200, REDIRECTED_SKILL_MD)

    return replyJson(res, 404, { error: `no stub route for ${path}` })
  })

  await new Promise((resolvePromise) => server.listen(0, '127.0.0.1', resolvePromise))
  const origin = `http://127.0.0.1:${server.address().port}`
  const BASE_CONFIG = { clawhubBaseUrl: origin, skillhubBaseUrl: origin, timeoutMs: 3000, retries: 1 }

  // Hermeticity guard: a provider that tries to leave loopback is a test bug, not
  // a flaky failure. (Redirects are followed inside undici and stay on the stub.)
  const realFetch = globalThis.fetch
  const LOOPBACK = /^http:\/\/(?:127\.0\.0\.1|localhost|\[::1\]):\d+\//
  globalThis.fetch = (input, init) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    if (!LOOPBACK.test(url)) throw new Error(`test attempted a non-loopback request: ${url}`)
    return realFetch(input, init)
  }

  t.after(async () => {
    globalThis.fetch = realFetch
    server.closeAllConnections()
    await new Promise((resolvePromise) => server.close(resolvePromise))
  })

  /**
   * Run one subtest from a clean slate: empty payload cache, fresh source health,
   * no resolved clawhub owner, the module's default (empty) installed lookup,
   * fixture-backed stub and an empty request log — so health and retry-count
   * assertions below are exact.
   */
  const subtest = async (name, fn) => {
    configureProviderFetch(BASE_CONFIG)
    Object.assign(upstream, upstreamDefaults)
    requests.length = 0
    resetMarketCache()
    resetClawhubOwnerCache()
    resetInstalledLookup()
    await t.test(name, fn)
  }

  /** Request log entry for one stub path, in arrival order. */
  const requestsFor = (path) => requests.filter((entry) => entry.path === path)

  // ─── list() ────────────────────────────────────────────────────────────────

  await subtest('clawhub list(): normalized shape and cursor pagination', async () => {
    const page = await clawhubProvider.list({ limit: 3 })

    // The upstream call: `limit` + the downloads sort; nothing else.
    assert.deepEqual(requests, [{ method: 'GET', path: '/api/v1/skills', query: { limit: '3', sort: 'downloads' } }])

    const raw = fixtures.clawhubList.items
    assert.equal(page.items.length, raw.length)

    const first = page.items[0]
    assert.equal(first.id, `clawhub:${raw[0].slug}`) // id format is exactly `source:slug`
    assert.equal(first.source, 'clawhub')
    assert.equal(first.slug, raw[0].slug)
    assert.equal(first.name, raw[0].displayName) // displayName wins over the slug
    assert.equal(first.summary, raw[0].summary)
    assert.deepEqual(first.author, { handle: '' }) // list payloads carry no owner
    assert.deepEqual(first.stats, {
      downloads: raw[0].stats.downloads,
      installs: raw[0].stats.installs,
      stars: raw[0].stats.stars,
    }) // only the three market stats survive normalization
    assert.deepEqual(first.tags, raw[0].topics) // topics → tags
    assert.equal(first.version, raw[0].latestVersion.version)
    assert.equal(first.updatedAt, raw[0].updatedAt)
    assert.equal(first.securityStatus, 'unknown') // audits live on the version endpoint
    assert.equal(first.installState, 'installable')

    // ClawHub's cursor is opaque — the provider hands the token straight back.
    assert.equal(page.nextCursor, fixtures.clawhubList.nextCursor)

    // …and forwards a caller-supplied cursor unchanged.
    requests.length = 0
    await clawhubProvider.list({ limit: 3, cursor: 'opaque-token' })
    assert.equal(requests[0].query.cursor, 'opaque-token')
    assert.equal(requests[0].query.limit, '3')
  })

  await subtest('skillhub list(): normalized shape and page/pageSize pagination', async () => {
    const page = await skillhubProvider.list({ limit: 24 })

    // The upstream reads `page`/`pageSize`; `limit` and `q` are silently ignored.
    assert.deepEqual(requests, [{ method: 'GET', path: '/api/skills', query: { page: '1', pageSize: '24' } }])

    const raw = fixtures.skillhubList.data.skills
    assert.equal(page.items.length, raw.length)
    assert.equal(page.total, fixtures.skillhubList.data.total)

    const native = page.items[0]
    assert.equal(native.id, `skillhub:${raw[0].slug}`)
    assert.equal(native.source, 'skillhub')
    assert.equal(native.name, raw[0].name)
    assert.equal(native.summary, raw[0].description_zh) // zh copy preferred over description/summary
    assert.deepEqual(native.author, { handle: raw[0].ownerName })
    assert.equal(native.version, raw[0].version)
    assert.equal(native.updatedAt, raw[0].updated_at)
    assert.equal(native.category, raw[0].category)
    assert.equal(native.iconUrl, undefined) // null iconUrl → undefined
    assert.equal(native.securityStatus, 'unknown') // `verified: false`
    assert.equal(native.requiresApiKey, false)
    assert.deepEqual(native.tags, []) // no subCategories

    const mirror = page.items.find((item) => item.slug === 'pdf-to-word-docx')
    assert.deepEqual(mirror.tags, ['文档处理', 'PDF 处理']) // subCategories[].name → tags
    assert.deepEqual(mirror.upstream, { source: 'clawhub', slug: 'pdf-to-word-docx' }) // from upstream_url
    assert.equal(mirror.iconUrl, raw[2].iconUrl)
    assert.equal(mirror.stats.downloads, raw[2].downloads)

    // total (75 070) far exceeds one page → the cursor is the next page number.
    assert.equal(page.nextCursor, '2')

    requests.length = 0
    await skillhubProvider.list({ limit: 24, cursor: '3' })
    assert.deepEqual(requests[0].query, { page: '3', pageSize: '24' })

    // Exhaustion comes from `total`, not from the page length.
    upstream.skillhubListPayload = { code: 0, data: { skills: [{ slug: 'only', name: 'Only' }], total: 3 }, message: 'ok' }
    const last = await skillhubProvider.list({ limit: 24 })
    assert.equal(last.nextCursor, undefined)
    assert.equal(last.total, 3)
  })

  // ─── search() ──────────────────────────────────────────────────────────────

  await subtest('search(): the query reaches both upstreams and results normalize', async () => {
    const clawhubPage = await clawhubProvider.search({ q: 'git', limit: 24 })
    assert.deepEqual(requests, [{ method: 'GET', path: '/api/v1/search', query: { q: 'git' } }])
    assert.equal(clawhubPage.nextCursor, undefined) // the search endpoint has no pagination

    const rawResult = fixtures.clawhubSearch.results[0]
    const first = clawhubPage.items[0]
    assert.equal(first.id, `clawhub:${rawResult.slug}`)
    assert.equal(first.name, rawResult.displayName)
    assert.deepEqual(first.author, {
      handle: rawResult.owner.handle,
      displayName: rawResult.owner.displayName,
      avatarUrl: rawResult.owner.image,
    })
    assert.equal(first.stats.downloads, rawResult.downloads)
    assert.equal(first.version, undefined) // search results carry no version
    assert.deepEqual(first.tags, [])

    requests.length = 0
    const skillhubPage = await skillhubProvider.search({ q: '小红书', limit: 24 })
    // `keyword`/`pageSize` are the parameter names SkillHub actually reads.
    assert.deepEqual(requests, [
      { method: 'GET', path: '/api/skills', query: { page: '1', pageSize: '24', keyword: '小红书' } },
    ])
    assert.equal(skillhubPage.items.length, fixtures.skillhubSearch.data.skills.length)
    // `labels.requires_api_key` becomes a boolean flag.
    assert.equal(skillhubPage.items[0].requiresApiKey, false)
    assert.equal(skillhubPage.items[1].requiresApiKey, true)
    // The mirrored entry is still recognizable as a ClawHub skill.
    assert.deepEqual(skillhubPage.items[0].upstream, { source: 'clawhub', slug: 'video-transcript-pro' })
  })

  await subtest('search(): the merged ClawHub result cap is enforced', async () => {
    // The search endpoint has no pagination, so the service asks ClawHub for
    // MARKET_LIMITS.searchResultCap regardless of the caller's `limit`. External
    // registries ClawHub aggregates cannot serve detail/file requests — they must
    // not consume native slots either.
    upstream.clawhubSearchPayload = {
      results: [
        ...Array.from({ length: 60 }, (_, index) => ({
          slug: `cap-${index}`,
          displayName: `Cap ${index}`,
          summary: 'capped result',
          downloads: 1000 - index,
          ownerHandle: 'cap-owner',
          updatedAt: 1_783_000_000_000,
        })),
        { slug: 'external-registry', source: 'skills-sh', install: { kind: 'skills-sh' }, displayName: 'External' },
        { slug: 'external-install-kind', install: { kind: 'skills-sh' }, displayName: 'External 2' },
      ],
    }

    const capped = await listMarketSkills({ q: 'cap-test', source: 'all', security: 'all', installed: 'all', limit: 5 })
    const clawhubItems = capped.items.filter((item) => item.source === 'clawhub')
    assert.equal(clawhubItems.length, MARKET_LIMITS.searchResultCap) // 50, not `limit`
    assert.ok(capped.items.some((item) => item.source === 'skillhub'))
    assert.equal(capped.items.some((item) => item.slug.startsWith('external')), false)

    // Both upstreams really received the query (the two calls race, so look them
    // up by path instead of asserting an order).
    const clawhubRequest = requestsFor('/api/v1/search')[0]
    const skillhubRequest = requestsFor('/api/skills')[0]
    assert.equal(clawhubRequest?.query.q, 'cap-test')
    assert.equal(skillhubRequest?.query.keyword, 'cap-test')

    // ClawHub-only search: capped, and nothing further to load.
    const clawhubOnly = await listMarketSkills({ q: 'cap-test', source: 'clawhub', security: 'all', installed: 'all', limit: 5 })
    assert.equal(clawhubOnly.items.length, MARKET_LIMITS.searchResultCap)
    assert.equal(clawhubOnly.nextCursor, null)
  })

  // ─── cross-source merge ────────────────────────────────────────────────────

  await subtest('listMarketSkills({source:"all"}) merges a SkillHub mirror into the ClawHub original', async () => {
    // SkillHub mirrors ClawHub skills it did not author. `skill-vetter` is on the
    // recorded ClawHub page, so synthesize its SkillHub mirror with fields only
    // SkillHub has, which makes the merge observable.
    upstream.skillhubListPayload = structuredClone(fixtures.skillhubList)
    upstream.skillhubListPayload.data.skills.push({
      slug: 'skill-vetter',
      name: 'Skill Vetter (SkillHub mirror)',
      source: 'clawhub',
      upstream_url: 'https://clawhub.ai/someone/skill-vetter',
      verified: true,
      version: '9.9.9',
      downloads: 1,
      installs: 5,
      stars: 2,
      iconUrl: 'https://example.test/icon.png',
      category: 'security',
      subCategories: [{ key: 'security', name: '安全' }],
      labels: { requires_api_key: 'true' },
      updated_at: 1_783_500_000_000,
    })

    const merged = await listMarketSkills({ source: 'all', security: 'all', installed: 'all', limit: 20 })

    // The mirror is gone and the ClawHub original carries the link.
    assert.equal(merged.items.some((item) => item.id === 'skillhub:skill-vetter'), false)
    const original = merged.items.find((item) => item.id === 'clawhub:skill-vetter')
    assert.deepEqual(original.mirrors, ['skillhub:skill-vetter'])
    assert.equal(original.name, 'Skill Vetter') // ClawHub keeps its own identity…
    assert.equal(original.version, '1.0.0')
    assert.equal(original.iconUrl, 'https://example.test/icon.png') // …and gains SkillHub-only fields
    assert.equal(original.securityStatus, 'verified') // unknown → verified
    assert.deepEqual(original.tags, ['GitHub', 'Permission']) // existing tags are not overwritten

    // Native SkillHub entries survive untouched, and the page is sorted by downloads.
    assert.ok(merged.items.some((item) => item.id === 'skillhub:pdf-to-word-docx'))
    assert.deepEqual(
      merged.items.map((item) => item.id),
      [
        'clawhub:self-improving-agent',
        'clawhub:skill-vetter',
        'clawhub:self-improving',
        'skillhub:pdf-to-word-docx',
        'skillhub:chengeng-pension-basic-estimate',
        'skillhub:zcfgznjd',
      ],
    )

    // The merged cursor carries one opaque token per source.
    assert.deepEqual(JSON.parse(Buffer.from(merged.nextCursor, 'base64url').toString('utf8')), {
      clawhub: fixtures.clawhubList.nextCursor,
      skillhub: '2',
    })

    // The security filter sees the merged status, not the pre-merge one.
    const verified = await listMarketSkills({ source: 'all', security: 'verified', installed: 'all', limit: 20 })
    assert.deepEqual(verified.items.map((item) => item.id), ['clawhub:skill-vetter'])

    // Dedupe copies its input: repeating the request (now from the cache) must not
    // append the same mirror to the original a second time.
    const again = await listMarketSkills({ source: 'all', security: 'all', installed: 'all', limit: 20 })
    assert.deepEqual(again.items.find((item) => item.id === 'clawhub:skill-vetter').mirrors, ['skillhub:skill-vetter'])
    assert.equal(again.items.length, merged.items.length)
  })

  // ─── install state ─────────────────────────────────────────────────────────

  await subtest('installState/installedInfo come from the injected lookup; the default installs nothing', async () => {
    // No host lookup (the module default): everything is installable and no item
    // claims install metadata.
    const initial = await listMarketSkills({ source: 'clawhub', security: 'all', installed: 'all', limit: 10 })
    assert.ok(initial.items.length > 0)
    assert.deepEqual([...new Set(initial.items.map((item) => item.installState))], ['installable'])
    assert.deepEqual(initial.items.map((item) => item.installedInfo), initial.items.map(() => undefined))

    // Inject the index W2 builds at plugin start…
    setInstalledLookup({
      has: (id) => id === 'clawhub:skill-vetter',
      info: (id) => (id === 'clawhub:skill-vetter'
        ? { dirName: 'skill-vetter', version: '1.0.0', installedAt: '2026-01-02T03:04:05.000Z' }
        : undefined),
    })

    // …and the already-cached page is re-annotated: install state is never cached.
    const annotated = await listMarketSkills({ source: 'clawhub', security: 'all', installed: 'all', limit: 10 })
    const installed = annotated.items.find((item) => item.id === 'clawhub:skill-vetter')
    assert.equal(installed.installState, 'installed')
    assert.deepEqual(installed.installedInfo, {
      dirName: 'skill-vetter',
      version: '1.0.0',
      installedAt: '2026-01-02T03:04:05.000Z',
    })
    assert.equal(annotated.items.filter((item) => item.installState === 'installed').length, 1)

    const onlyInstalled = await listMarketSkills({ source: 'clawhub', security: 'all', installed: 'installed', limit: 10 })
    assert.deepEqual(onlyInstalled.items.map((item) => item.id), ['clawhub:skill-vetter'])
    const onlyInstallable = await listMarketSkills({ source: 'clawhub', security: 'all', installed: 'installable', limit: 10 })
    assert.equal(onlyInstallable.items.some((item) => item.id === 'clawhub:skill-vetter'), false)

    // `info()` may legitimately miss an entry; the sanitized slug is the fallback.
    setInstalledLookup({ has: (id) => id === 'clawhub:self-improving-agent', info: () => undefined })
    const fallback = await listMarketSkills({ source: 'clawhub', security: 'all', installed: 'all', limit: 3 })
    const fallbackItem = fallback.items.find((item) => item.id === 'clawhub:self-improving-agent')
    assert.equal(fallbackItem.installState, 'installed')
    assert.deepEqual(fallbackItem.installedInfo, {
      dirName: 'self-improving-agent',
      version: undefined,
      installedAt: undefined,
    })
  })

  // ─── pagination across a merged page ───────────────────────────────────────

  await subtest('later pages: a source missing from the cursor is exhausted', async () => {
    const cursor = Buffer.from(JSON.stringify({ skillhub: '2' }), 'utf8').toString('base64url')
    const page = await listMarketSkills({ source: 'all', security: 'all', installed: 'all', limit: 5, cursor })

    // A cursor without a clawhub token means clawhub has nothing left.
    assert.equal(page.items.every((item) => item.source === 'skillhub'), true)
    assert.deepEqual(page.sources.clawhub, { status: 'ok', fromCache: true })
    assert.equal(page.sources.skillhub.fromCache, false)
    assert.deepEqual(requests.map((entry) => entry.path), ['/api/skills'])
    assert.equal(requests[0].query.page, '2')

    // clawhub stays out of the next cursor; skillhub advances to page 3.
    assert.deepEqual(JSON.parse(Buffer.from(page.nextCursor, 'base64url').toString('utf8')), { skillhub: '3' })
  })

  // ─── detail() ──────────────────────────────────────────────────────────────

  await subtest('clawhub detail(): files, total size, license and frontmatter', async () => {
    const { skill, sourceStatus } = await getMarketSkillDetail('clawhub', 'git')

    // Detail + version endpoint (the file list and the license live there).
    assert.deepEqual(requests.map((entry) => entry.path), [
      '/api/v1/skills/git',
      '/api/v1/skills/git/versions/1.0.8',
    ])
    assert.equal(sourceStatus.status, 'ok')
    assert.equal(sourceStatus.fromCache, false)
    assert.equal(typeof sourceStatus.fetchedAt, 'number')

    const rawDetail = fixtures.clawhubDetail
    const rawVersion = fixtures.clawhubVersionDetail.version
    assert.equal(skill.id, 'clawhub:git')
    assert.equal(skill.version, rawVersion.version)
    assert.equal(skill.license, rawVersion.license)
    assert.deepEqual(skill.author, {
      handle: rawDetail.owner.handle,
      displayName: rawDetail.owner.displayName,
      avatarUrl: rawDetail.owner.image,
    })

    assert.deepEqual(skill.files.map((file) => file.path), rawVersion.files.map((file) => file.path))
    assert.equal(skill.files.length, rawVersion.files.length)
    assert.equal(skill.files[0].path, 'SKILL.md')
    assert.equal(skill.files[0].language, 'markdown') // extension → language
    assert.equal(skill.files[0].sha256, rawVersion.files[0].sha256)
    assert.equal(skill.files[0].contentType, 'text/markdown')
    assert.equal(skill.files.every((file) => file.tooBig === false), true)
    assert.equal(skill.totalSize, rawVersion.files.reduce((sum, file) => sum + file.size, 0))

    // ClawHub's `skill.description` IS the whole SKILL.md: frontmatter is split off
    // into `descriptionFrontmatter` and the body keeps the markdown.
    assert.equal(skill.description.startsWith('---'), false)
    assert.match(skill.description, /^## When to Use/)
    assert.equal(skill.descriptionFrontmatter.name, 'Git')
    assert.equal(skill.descriptionFrontmatter.slug, 'git')
    assert.equal(skill.descriptionFrontmatter.version, '1.0.8') // a dotted version, not a number
    assert.deepEqual(skill.descriptionFrontmatter.metadata.clawdbot.requires.bins, ['git']) // JSON-style flow map

    // Scan status comes from the version payload: "clean" → benign.
    assert.equal(skill.securityStatus, 'benign')
    assert.deepEqual(skill.securityReports, [
      {
        vendor: 'clawhub-scan',
        status: 'clean',
        statusText: 'Clean (with warnings)', // hasWarnings true in the fixture
        reportUrl: rawVersion.security.virustotalUrl,
      },
    ])
    assert.equal(skill.installState, 'installable')

    // The second call is served from the detail cache without touching the stub.
    requests.length = 0
    const cached = await getMarketSkillDetail('clawhub', 'git')
    assert.deepEqual(requests, [])
    assert.equal(cached.sourceStatus.fromCache, true)
    assert.equal(cached.skill.id, 'clawhub:git')
  })

  await subtest('clawhub detail(): a failing version endpoint is best-effort', async () => {
    upstream.clawhubVersionStatus = 404
    const { skill } = await getMarketSkillDetail('clawhub', 'git')

    // The skill payload still renders…
    assert.equal(skill.id, 'clawhub:git')
    assert.match(skill.description, /^## When to Use/)
    assert.equal(skill.version, fixtures.clawhubDetail.latestVersion.version)
    assert.equal(skill.license, fixtures.clawhubDetail.latestVersion.license) // falls back to the skill payload
    // …but without a file list nothing can be installed, and the reason is recorded.
    assert.deepEqual(skill.files, [])
    assert.equal(skill.totalSize, 0)
    assert.equal(skill.installState, 'not-installable')
    assert.equal(skill.notInstallableReason, 'empty-file-list')
  })

  await subtest('skillhub detail(): files, total size, security reports and SKILL.md body', async () => {
    const { skill } = await getMarketSkillDetail('skillhub', 'pe-compliance-expert-pro')

    // Detail → file list → SKILL.md body (SkillHub's detail carries no description).
    assert.deepEqual(requests.map((entry) => entry.path), [
      '/api/v1/skills/pe-compliance-expert-pro',
      '/api/v1/skills/pe-compliance-expert-pro/files',
      '/api/v1/skills/pe-compliance-expert-pro/file',
    ])

    const rawDetail = fixtures.skillhubDetail
    const rawFiles = fixtures.skillhubFiles.files
    assert.equal(skill.id, 'skillhub:pe-compliance-expert-pro')
    assert.equal(skill.name, rawDetail.skill.displayName)
    assert.equal(skill.version, rawDetail.latestVersion.version)
    assert.equal(skill.category, rawDetail.skill.category)
    assert.deepEqual(skill.tags, rawDetail.skill.subCategories.map((sub) => sub.name))
    assert.deepEqual(skill.author, {
      handle: rawDetail.owner.handle,
      displayName: rawDetail.owner.displayName,
      avatarUrl: undefined, // the fixture owner has no image
    })
    // Detail `stats` supersede the flat counters of the list payload.
    assert.deepEqual(skill.stats, {
      downloads: rawDetail.skill.stats.downloads,
      installs: rawDetail.skill.stats.installs,
      stars: rawDetail.skill.stats.stars,
    })

    assert.deepEqual(skill.files.map((file) => file.path), rawFiles.map((file) => file.path))
    assert.equal(skill.totalSize, rawFiles.reduce((sum, file) => sum + file.size, 0))
    assert.equal(skill.files.find((file) => file.path === 'pe_compliance.py').language, 'python')
    assert.equal(skill.files.find((file) => file.path === 'SKILL.md').tooBig, false)

    // Two benign vendor reports → benign, with the report links preserved.
    assert.equal(skill.securityStatus, 'benign')
    assert.deepEqual(
      skill.securityReports,
      Object.entries(rawDetail.securityReports).map(([vendor, report]) => ({
        vendor,
        status: report.status,
        statusText: report.statusText,
        reportUrl: report.reportUrl,
      })),
    )

    // The overview body is the fetched SKILL.md. (Unlike ClawHub, neither the
    // reference nor the port strips/parses frontmatter on this path.)
    assert.ok(skill.description.includes('## 使用说明'), 'the body must be the fetched SKILL.md')
  })

  // ─── file content ──────────────────────────────────────────────────────────

  await subtest('getMarketFileContent(): raw text, language and redirects', async () => {
    const clawhubFile = await getMarketFileContent('clawhub', 'git', 'SKILL.md')
    assert.deepEqual(requests, [{ method: 'GET', path: '/api/v1/skills/git/file', query: { path: 'SKILL.md' } }])
    assert.deepEqual(clawhubFile, {
      path: 'SKILL.md',
      content: CLAWHUB_SKILL_MD,
      language: 'markdown',
      size: Buffer.byteLength(CLAWHUB_SKILL_MD),
      truncated: false,
    })

    // SkillHub's file endpoint 302s to object storage; the fetch has to follow it.
    requests.length = 0
    upstream.skillhubFileRedirect = true
    const redirected = await getMarketFileContent('skillhub', 'pe-compliance-expert-pro', 'SKILL.md')
    assert.deepEqual(requests.map((entry) => entry.path), [
      '/api/v1/skills/pe-compliance-expert-pro/file',
      '/cos/SKILL.md',
    ])
    assert.equal(redirected.content, REDIRECTED_SKILL_MD)
    assert.equal(redirected.language, 'markdown')

    // Non-markdown extensions map to their language for the viewer.
    upstream.skillhubFileRedirect = false
    const python = await getMarketFileContent('skillhub', 'pe-compliance-expert-pro', 'pe_compliance.py')
    assert.equal(python.language, 'python')
  })

  await subtest('file limits: preview truncation, oversize rejection and installability', async () => {
    // A body over the preview limit is cut for the viewer, but the reported size
    // stays the real one.
    upstream.clawhubFileBody = 'x'.repeat(400 * 1024)
    const preview = await getMarketFileContent('clawhub', 'git', 'SKILL.md')
    assert.equal(preview.truncated, true)
    assert.equal(Buffer.byteLength(preview.content), MARKET_LIMITS.previewTruncateBytes)
    assert.equal(preview.size, 400 * 1024)
    assert.equal(preview.path, 'SKILL.md')
    assert.equal(preview.language, 'markdown')

    // A body over the per-file install limit is refused outright. The stub answers
    // with chunked encoding, so this exercises the streaming guard rather than the
    // (spoofable) content-length shortcut.
    upstream.clawhubFileBody = null
    upstream.clawhubFileOversize = true
    await assert.rejects(getMarketFileContent('clawhub', 'git', 'blob.bin'), (error) => {
      assert.ok(error instanceof MarketUpstreamError)
      assert.equal(error.code, MARKET_ERROR_CODES.upstreamBadResponse)
      assert.match(error.message, new RegExp(`exceeds the actual size limit \\(${MARKET_LIMITS.maxFileSize} bytes\\)`))
      return true
    })

    // The same limit makes a skill with an oversized file not installable — while
    // still listing every file so the user can see why.
    upstream.clawhubFileOversize = false
    const huge = await getMarketSkillDetail('clawhub', 'huge-skill')
    assert.equal(huge.skill.installState, 'not-installable')
    assert.equal(huge.skill.notInstallableReason, 'file-too-large')
    assert.deepEqual(huge.skill.files.map((file) => [file.path, file.tooBig]), [
      ['SKILL.md', false],
      ['blob.bin', true],
    ])
  })

  // ─── path validation ───────────────────────────────────────────────────────

  await subtest('isValidMarketFilePath() accepts relative paths and rejects escapes', async () => {
    for (const accepted of ['SKILL.md', 'docs/guide.md', 'a/b/c.txt', 'nested/dir.with.dots/file.md', 'a b/c.md']) {
      assert.equal(isValidMarketFilePath(accepted), true, `${accepted} must be accepted`)
    }
    for (const rejected of [
      '', // empty
      '/etc/passwd', // absolute posix
      '\\windows\\system32', // absolute windows
      '../secret', // traversal
      'a/../b', // traversal in the middle
      '..\\secret', // windows traversal
      'docs/\0hidden', // NUL byte
      'a'.repeat(513), // over the length bound
    ]) {
      assert.equal(isValidMarketFilePath(rejected), false, `${JSON.stringify(rejected.slice(0, 24))} must be rejected`)
    }
  })

  // ─── failure classification ────────────────────────────────────────────────

  await subtest('failure: 404 is classified per provider and not retried', async () => {
    // ClawHub's detail/file paths map a missing skill to a bad-response error…
    upstream.clawhubDetailMode = '404'
    await assert.rejects(getMarketSkillDetail('clawhub', 'git'), (error) => {
      assert.ok(error instanceof MarketHttpError)
      assert.equal(error.status, 404)
      assert.equal(error.code, MARKET_ERROR_CODES.upstreamBadResponse)
      assert.match(error.message, /clawhub responded 404/)
      return true
    })
    assert.equal(requests.length, 1) // 404 is not a retryable status
    // The source answered, so it is not reported as down.
    assert.equal(getSourceHealth('clawhub').status, 'ok')

    // SkillHub's detail goes through providerFetchJson, which reports the same 404
    // as a plain upstream error.
    upstream.skillhubDetailStatus = 404
    await assert.rejects(getMarketSkillDetail('skillhub', 'pe-compliance-expert-pro'), (error) => {
      assert.equal(error.status, 404)
      assert.equal(error.code, MARKET_ERROR_CODES.upstreamError)
      assert.match(error.message, /skillhub responded 404/)
      return true
    })
    assert.equal(requests.filter((entry) => entry.path === '/api/v1/skills/pe-compliance-expert-pro').length, 1)
  })

  await subtest('failure: 5xx is retried `retries` times, then marks the source failed', async () => {
    upstream.clawhubListStatus = 500
    await assert.rejects(clawhubProvider.list({ limit: 3 }), (error) => {
      assert.ok(error instanceof MarketHttpError)
      assert.equal(error.status, 500)
      assert.equal(error.code, MARKET_ERROR_CODES.upstreamError)
      assert.match(error.message, /clawhub responded 500/)
      return true
    })
    // retries: 1 → one extra attempt.
    assert.equal(requests.length, 2)

    // Repeated failure with no recorded success → `failed`, with the reason.
    const health = getSourceHealth('clawhub')
    assert.equal(health.status, 'failed')
    assert.equal(health.error, 'clawhub responded 500')
    assert.equal(getMarketStatus().clawhub.status, 'failed')

    // A success clears it again.
    upstream.clawhubListStatus = 200
    requests.length = 0
    await clawhubProvider.list({ limit: 3 })
    assert.equal(getSourceHealth('clawhub').status, 'ok')
    assert.equal(typeof getMarketStatus().clawhub.fetchedAt, 'number')

    // `retries: 0` means a single attempt.
    configureProviderFetch({ retries: 0 })
    upstream.clawhubListStatus = 500
    requests.length = 0
    await assert.rejects(clawhubProvider.list({ limit: 3 }))
    assert.equal(requests.length, 1)
  })

  await subtest('failure: invalid JSON is a bad response and is not retried', async () => {
    upstream.clawhubListRawBody = '<html>oops</html>'
    await assert.rejects(clawhubProvider.list({ limit: 3 }), (error) => {
      assert.ok(error instanceof MarketUpstreamError)
      assert.equal(error.code, MARKET_ERROR_CODES.upstreamBadResponse)
      assert.match(error.message, /clawhub returned invalid JSON/)
      return true
    })
    assert.equal(requests.length, 1) // parsing failures are not transport failures

    // The HTTP layer answered 200 a moment ago, so the documented health rule
    // (recent success + fresh failure = degraded) applies instead of `failed`.
    const health = getSourceHealth('clawhub')
    assert.equal(health.status, 'degraded')
    assert.equal(health.error, 'clawhub returned invalid JSON')
    assert.equal(typeof health.fetchedAt, 'number')
  })

  await subtest('failure: a payload that parses but has the wrong shape is a bad response', async () => {
    // Valid JSON, missing `items` — the provider rejects it after the fetch layer
    // recorded the HTTP 200 as a success, so source health stays `ok`.
    upstream.clawhubListPayload = { items: 'not an array' }
    await assert.rejects(clawhubProvider.list({ limit: 3 }), (error) => {
      assert.equal(error.code, MARKET_ERROR_CODES.upstreamBadResponse)
      assert.equal(error.message, 'clawhub list missing items')
      return true
    })
    assert.equal(getSourceHealth('clawhub').status, 'ok')

    // SkillHub signals application errors with a non-zero envelope code.
    upstream.skillhubListPayload = { code: 500, data: null, message: 'boom' }
    await assert.rejects(skillhubProvider.list({ limit: 3 }), (error) => {
      assert.equal(error.code, MARKET_ERROR_CODES.upstreamBadResponse)
      assert.equal(error.message, 'skillhub responded code=500: boom')
      return true
    })
  })

  await subtest('failure: a hanging upstream times out per attempt and is retried', async () => {
    // A short timeout keeps the suite fast; the abort itself is deterministic.
    configureProviderFetch({ timeoutMs: 250 })
    upstream.hang = true
    const started = Date.now()

    await assert.rejects(clawhubProvider.list({ limit: 3 }), (error) => {
      assert.ok(error instanceof MarketUpstreamError)
      assert.equal(error.code, MARKET_ERROR_CODES.upstreamTimeout)
      assert.match(error.message, /clawhub request timed out/)
      return true
    })

    const elapsed = Date.now() - started
    assert.equal(requests.length, 2) // retries: 1 → each attempt had its own timeout
    assert.ok(elapsed >= 500, `two 250 ms timeouts must have elapsed (saw ${elapsed} ms)`)

    const health = getSourceHealth('clawhub')
    assert.equal(health.status, 'failed')
    assert.equal(health.error, 'clawhub request timed out')
  })

  await subtest('failure: a network error is classified as an upstream error', async () => {
    // Point the provider at a port nothing listens on: the fetch itself fails.
    const dead = createServer(() => {})
    await new Promise((resolvePromise) => dead.listen(0, '127.0.0.1', resolvePromise))
    const deadOrigin = `http://127.0.0.1:${dead.address().port}`
    await new Promise((resolvePromise) => dead.close(resolvePromise))

    configureProviderFetch({ clawhubBaseUrl: deadOrigin })
    await assert.rejects(clawhubProvider.list({ limit: 3 }), (error) => {
      assert.equal(error.code, MARKET_ERROR_CODES.upstreamError)
      assert.match(error.message, /clawhub request failed/)
      return true
    })
    assert.equal(getSourceHealth('clawhub').status, 'failed')
  })

  // ─── ambiguous slugs ───────────────────────────────────────────────────────

  await subtest('clawhub: a 409 ambiguous slug is resolved via ?owner= and remembered', async () => {
    upstream.clawhubDetailMode = '409'
    const detail = await clawhubProvider.detail('git')
    assert.equal(detail.slug, 'git')

    // First request is ambiguous; the retry carries the owner hint from `matches`,
    // and the version request inherits it.
    assert.deepEqual(requests.map((entry) => [entry.path, entry.query.owner]), [
      ['/api/v1/skills/git', undefined],
      ['/api/v1/skills/git', 'pskoett'],
      ['/api/v1/skills/git/versions/1.0.8', 'pskoett'],
    ])

    // The resolution is cached for later calls on the same slug…
    requests.length = 0
    const file = await clawhubProvider.fetchFile('git', 'SKILL.md')
    assert.equal(file.content, CLAWHUB_SKILL_MD)
    assert.deepEqual(requests, [
      { method: 'GET', path: '/api/v1/skills/git/file', query: { path: 'SKILL.md', owner: 'pskoett' } },
    ])

    // …and the test hook forgets it (`resetClawhubOwnerCache`).
    resetClawhubOwnerCache()
    requests.length = 0
    await clawhubProvider.fetchFile('git', 'SKILL.md')
    assert.equal(requests[0].query.owner, undefined)
  })

  // ─── status and configuration ──────────────────────────────────────────────

  await subtest('getMarketStatus() reports one entry per source', async () => {
    const status = getMarketStatus()
    assert.deepEqual(Object.keys(status), MARKET_SOURCES)
    for (const source of MARKET_SOURCES) {
      assert.equal(status[source].status, 'ok') // fresh module state
      assert.equal(status[source].error, undefined)
    }

    // A success stamps `fetchedAt`; failures keep their reason.
    await clawhubProvider.list({ limit: 1 })
    assert.equal(typeof getMarketStatus().clawhub.fetchedAt, 'number')
    assert.equal(getMarketStatus().skillhub.fetchedAt, undefined)
  })

  await subtest('configureProviderFetch(): base URLs are normalized, other fields kept', async () => {
    // A trailing slash must not produce `//api/...`.
    configureProviderFetch({ clawhubBaseUrl: `${origin}/`, skillhubBaseUrl: `${origin}/` })
    assert.equal(getProviderBase('clawhub'), origin)
    assert.equal(getProviderBase('skillhub'), origin)
    const page = await clawhubProvider.list({ limit: 1 })
    assert.equal(page.items.length > 0, true)
    assert.equal(requests.every((entry) => entry.path.startsWith('/api/')), true)

    // A partial override never blanks the other fields.
    configureProviderFetch({ timeoutMs: 1234 })
    assert.equal(getProviderBase('clawhub'), origin)
    assert.equal(getProviderBase('skillhub'), origin)
  })
})
