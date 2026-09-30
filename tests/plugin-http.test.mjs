/**
 * End-to-end host check: boot the built plugin with a fake Cordis context,
 * serve the routes it registers over a real HTTP socket, and drive the whole
 * user path — list, detail, file preview, install into a throwaway skills
 * directory, installed index, uninstall.
 *
 * The upstreams are the real ClawHub/SkillHub services (this machine can reach
 * both). When an upstream is unreachable the route assertions still hold: the
 * plugin must answer with a JSON error envelope, never a crash or a hang.
 *
 * Skips (instead of failing) when `lib/` has not been built yet, because the
 * gate that requires a build is `scripts/verify.mjs`.
 */
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, before, test } from 'node:test'

const ROOT = new URL('..', import.meta.url).pathname
const ENTRY = join(ROOT, 'lib', 'index.js')
let testHome
const savedHome = process.env.DSH_HOME
const savedAgentsHome = process.env.DSH_AGENTS_HOME

before(async () => {
  testHome = await mkdtemp(join(tmpdir(), 'skills-hub-http-home-'))
  process.env.DSH_HOME = testHome
  process.env.DSH_AGENTS_HOME = join(testHome, 'agents')
})
after(async () => {
  if (savedHome === undefined) delete process.env.DSH_HOME
  else process.env.DSH_HOME = savedHome
  if (savedAgentsHome === undefined) delete process.env.DSH_AGENTS_HOME
  else process.env.DSH_AGENTS_HOME = savedAgentsHome
  await rm(testHome, { recursive: true, force: true })
})

let built = true
try {
  await stat(ENTRY)
} catch {
  built = false
}

/** Minimal Cordis context: records effects, answers service lookups. */
function fakeContext(webServer) {
  const disposers = []
  // Mutable on purpose: the real Connection row commonly activates *after* this
  // plugin registered its route, which is the case the gate must survive.
  let connection
  const base = {
    effect(factory) {
      const dispose = factory()
      if (typeof dispose === 'function') disposers.push(dispose)
      return () => {
        const index = disposers.indexOf(dispose)
        if (index >= 0) disposers.splice(index, 1)
        dispose()
      }
    },
    on() { return () => {} },
    off() { return () => {} },
    inject(_names, callback) {
      if (typeof callback === 'function') callback(base)
      return () => {}
    },
    get(name) {
      if (name === 'webServer' || name === 'httpServer') return webServer
      if (name === 'connection') return connection
      return undefined
    },
    logger: { info() {}, warn() {}, error() {}, debug() {} },
    reflect: { provide: () => () => {} },
  }
  return {
    ctx: new Proxy(base, {
      get(target, property) {
        if (property in target) return target[property]
        // Unknown capability: hand back a no-op so the plugin boots in a host
        // that simply does not offer that service.
        return () => undefined
      },
    }),
    setConnection(value) { connection = value },
    disposeAll() {
      for (const dispose of disposers.splice(0)) dispose()
    },
  }
}

test('host routes serve the marketplace end to end', { skip: built ? false : 'run `pnpm build` first' }, async (t) => {
  const skillsRoot = await mkdtemp(join(tmpdir(), 'skills-hub-test-'))
  const routes = []
  const webServer = {
    register(route) {
      routes.push(route)
      return () => {
        const index = routes.indexOf(route)
        if (index >= 0) routes.splice(index, 1)
      }
    },
  }
  const { ctx, disposeAll } = fakeContext(webServer)

  const mod = await import(ENTRY)
  assert.equal(typeof mod.apply, 'function', 'host half must export apply')
  assert.equal(mod.name, 'skills-hub', 'host half must export its plugin name')

  await mod.apply(ctx, {
    skillsRoot,
    clawhubBaseUrl: 'https://clawhub.ai',
    skillhubBaseUrl: 'https://api.skillhub.cn',
    timeoutMs: 20_000,
    requestRetries: 1,
    allowUninstall: true,
    pageSize: 12,
  })

  assert.ok(routes.length > 0, 'apply() must register at least one route')

  const server = createServer((req, res) => {
    const path = (req.url ?? '/').split('?')[0] ?? '/'
    const route = routes.find((candidate) => (
      candidate.kind === 'prefix' ? path.startsWith(candidate.path) : path === candidate.path
    ))
    if (!route) {
      res.statusCode = 404
      res.end('{}')
      return
    }
    Promise.resolve(route.handler(req, res)).catch(() => {
      if (!res.headersSent) res.statusCode = 500
      res.end('{"error":{"code":"TEST_FAILURE","message":"handler rejected"}}')
    })
  })
  await new Promise((resolvePromise) => server.listen(0, '127.0.0.1', resolvePromise))
  const address = server.address()
  const origin = `http://127.0.0.1:${typeof address === 'object' && address ? address.port : 0}`

  after(async () => {
    disposeAll()
    await new Promise((resolvePromise) => server.close(resolvePromise))
    await rm(skillsRoot, { recursive: true, force: true })
  })

  const get = async (path) => {
    const response = await fetch(origin + path, { headers: { accept: 'application/json' } })
    const body = await response.json().catch(() => null)
    return { status: response.status, body, cache: response.headers.get('cache-control') }
  }
  const post = async (path, payload) => {
    const response = await fetch(origin + path, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return { status: response.status, body: await response.json().catch(() => null) }
  }

  await t.test('rejects unknown routes and unsafe input', async () => {
    const missing = await get('/api/skills-hub/nope')
    assert.equal(missing.status, 404)

    const badSource = await get('/api/skills-hub/skills/evil/git')
    assert.equal(badSource.status, 400)

    const traversal = await get('/api/skills-hub/skills/clawhub/git/file?path=../../etc/passwd')
    assert.equal(traversal.status, 400)

    const badId = await post('/api/skills-hub/install', { id: 'nope' })
    assert.equal(badId.status, 400)
  })

  await t.test('reports source health', async () => {
    const { status, body, cache } = await get('/api/skills-hub/status')
    assert.equal(status, 200)
    assert.equal(cache, 'no-store')
    assert.ok(body?.sources?.clawhub, 'status must carry per-source health')
    assert.ok(body?.sources?.skillhub, 'status must carry per-source health')
  })

  await t.test('reports cache counters and validates the refresh flag', async () => {
    const { status, body, cache } = await get('/api/skills-hub/stats')
    assert.equal(status, 200)
    assert.equal(cache, 'no-store')
    for (const key of ['hits', 'misses', 'staleServed', 'upstreamRequests', 'forcedRefreshes']) {
      assert.equal(typeof body?.stats?.[key], 'number', `stats must carry ${key}`)
    }
    // A refresh flag the server cannot honour is a client bug, not something to
    // ignore silently: the reader would be told "refreshed" with nothing read.
    const invalid = await get('/api/skills-hub/skills?limit=1&refresh=maybe')
    assert.equal(invalid.status, 400)
    const accepted = await get('/api/skills-hub/skills?limit=1&refresh=1')
    assert.equal(accepted.status, 200)
  })

  await t.test('a cache hit keeps the original fetch time', async () => {
    const first = await get('/api/skills-hub/skills?limit=4&source=clawhub&security=all&installed=all')
    if (first.status !== 200 || first.body?.items?.length === 0) return // upstream unavailable
    const second = await get('/api/skills-hub/skills?limit=4&source=clawhub&security=all&installed=all')
    assert.equal(second.status, 200)
    assert.equal(second.body.sources.clawhub.fromCache, true)
    // The snapshot's timestamp is the fetch that produced it — not the moment
    // the cached answer was assembled.
    assert.ok(
      second.body.sources.clawhub.fetchedAt <= first.body.sources.clawhub.fetchedAt + 1000,
      'a cache hit must not re-stamp the payload as freshly fetched',
    )
  })

  let firstId = null
  await t.test('lists skills from the live sources', async () => {
    const { status, body } = await get('/api/skills-hub/skills?limit=6&source=all&security=all&installed=all')
    assert.equal(status, 200)
    assert.ok(Array.isArray(body?.items), 'list must return items')
    assert.ok(body.items.length > 0, 'at least one source must answer with skills')
    for (const item of body.items) {
      assert.match(item.id, /^(clawhub|skillhub):.+/)
      assert.ok(item.installState, 'every item carries its install state')
    }
    firstId = body.items.find((item) => item.source === 'clawhub')?.id ?? body.items[0].id
  })

  await t.test('serves detail and a file preview', async () => {
    if (!firstId) return t.skip('no item from the live list')
    const [source, slug] = firstId.split(':')
    const detail = await get(`/api/skills-hub/skills/${source}/${slug}`)
    assert.equal(detail.status, 200)
    assert.equal(detail.body?.skill?.id, firstId)
    assert.ok(Array.isArray(detail.body?.skill?.files))

    const file = await get(`/api/skills-hub/skills/${source}/${slug}/file?path=SKILL.md`)
    assert.equal(file.status, 200)
    assert.equal(typeof file.body?.file?.content, 'string')
    assert.ok(file.body.file.content.length > 0)
  })

  await t.test('installs, indexes and uninstalls a real skill', async () => {
    if (!firstId) return t.skip('no item from the live list')
    const install = await post('/api/skills-hub/install', { id: firstId })
    assert.equal(install.status, 200, JSON.stringify(install.body))
    assert.equal(install.body?.ok, true)

    const installedPath = install.body.installedPath
    const skillFile = await readFile(join(installedPath, 'SKILL.md'), 'utf8')
    assert.ok(skillFile.length > 0, 'installed skill must carry SKILL.md')
    const meta = JSON.parse(await readFile(join(installedPath, '.skills-hub.json'), 'utf8'))
    assert.equal(meta.id, firstId)

    const installed = await get('/api/skills-hub/installed')
    assert.equal(installed.status, 200)
    assert.ok(installed.body.items.some((item) => item.id === firstId && item.managed === true))

    const list = await get('/api/skills-hub/skills?limit=6&source=all&security=all&installed=all')
    const listed = list.body.items.find((item) => item.id === firstId)
    if (listed) assert.equal(listed.installState, 'installed', 'the list must reflect the new install state')

    const uninstall = await post('/api/skills-hub/uninstall', { id: firstId })
    assert.equal(uninstall.status, 200, JSON.stringify(uninstall.body))
    await assert.rejects(stat(installedPath), 'the skill directory must be gone after uninstall')

    const again = await post('/api/skills-hub/uninstall', { id: firstId })
    assert.equal(again.status, 404, 'a second uninstall must report a missing skill')
  })
})

test('the browser gate fences the marketplace even when it activates late', { skip: built ? false : 'run `pnpm build` first' }, async () => {
  // Regression: the gate used to be captured once in apply(). Loader rows
  // activate concurrently, so in a real host the Connection service appeared
  // afterwards and the snapshot stayed `undefined` — official /api/* routes
  // answered 403 to an untrusted Origin while /api/skills-hub/* answered 200.
  const skillsRoot = await mkdtemp(join(tmpdir(), 'skills-hub-gate-'))
  const routes = []
  const webServer = {
    register(route) {
      routes.push(route)
      return () => {}
    },
  }
  const { ctx, setConnection, disposeAll } = fakeContext(webServer)
  const mod = await import(ENTRY)
  await mod.apply(ctx, {
    skillsRoot,
    clawhubBaseUrl: 'https://clawhub.ai',
    skillhubBaseUrl: 'https://api.skillhub.cn',
    timeoutMs: 5_000,
    requestRetries: 0,
    allowUninstall: true,
    pageSize: 6,
  })

  const server = createServer((req, res) => {
    const path = (req.url ?? '/').split('?')[0] ?? '/'
    const route = routes.find((candidate) => path.startsWith(candidate.path))
    Promise.resolve(route.handler(req, res)).catch(() => {
      if (!res.headersSent) res.statusCode = 500
      res.end('{}')
    })
  })
  await new Promise((resolvePromise) => server.listen(0, '127.0.0.1', resolvePromise))
  const address = server.address()
  const origin = `http://127.0.0.1:${typeof address === 'object' && address ? address.port : 0}`

  after(async () => {
    disposeAll()
    await new Promise((resolvePromise) => server.close(resolvePromise))
    await rm(skillsRoot, { recursive: true, force: true })
  })

  const call = async (path) => {
    const response = await fetch(origin + path, { headers: { origin: 'http://evil.test' } })
    return { status: response.status, body: await response.json().catch(() => null) }
  }

  // 1. No Connection service in this composition: the route answers, as documented.
  const unguarded = await call('/api/skills-hub/status')
  assert.equal(unguarded.status, 200, 'without a gate the route answers')

  // 2. The Connection service arrives late and must fence every later request.
  setConnection({ requestRejection: () => 403 })
  const forbidden = await call('/api/skills-hub/status')
  assert.equal(forbidden.status, 403, 'a late gate must still fence the route')
  assert.equal(forbidden.body?.error?.code, 'FORBIDDEN')

  setConnection({ requestRejection: () => 401 })
  const unauthorized = await call('/api/skills-hub/installed')
  assert.equal(unauthorized.status, 401)
  assert.equal(unauthorized.body?.error?.code, 'UNAUTHORIZED')

  // 3. A request the gate admits still works.
  setConnection({ requestRejection: () => undefined })
  const admitted = await call('/api/skills-hub/installed')
  assert.equal(admitted.status, 200)
  assert.ok(Array.isArray(admitted.body?.items))
})
