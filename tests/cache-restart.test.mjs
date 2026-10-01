import assert from 'node:assert/strict'
import { fork } from 'node:child_process'
import { once } from 'node:events'
import { createHash } from 'node:crypto'
import { createServer } from 'node:http'
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { configureMarketCache } from '../lib/market/cache.js'
import { configureProviderFetch } from '../lib/market/provider-fetch.js'
import { getMarketFileContent, getMarketSkillDetail, listMarketSkills } from '../lib/market/market-service.js'

const fixturesDirectory = new URL('./fixtures/market/', import.meta.url)
const fixture = async (name) => JSON.parse(await readFile(new URL(name, fixturesDirectory), 'utf8'))
const fixtures = {
  clawList: await fixture('clawhub-list.json'),
  clawSearch: await fixture('clawhub-search.json'),
  clawDetail: await fixture('clawhub-detail.json'),
  clawVersion: await fixture('clawhub-version-detail.json'),
  skillList: await fixture('skillhub-list.json'),
  skillSearch: await fixture('skillhub-search.json'),
  skillDetail: await fixture('skillhub-detail.json'),
  skillFiles: await fixture('skillhub-files.json'),
}

async function upstream(t) {
  const state = { requests: 0, paths: [], offline: false, detailUnavailable: false, revision: 'original' }
  const server = createServer((req, res) => {
    state.requests += 1
    state.paths.push(new URL(req.url, 'http://fixture.invalid').pathname)
    if (state.offline) { res.writeHead(503); res.end('{}'); return }
    const url = new URL(req.url, 'http://fixture.invalid')
    if (state.detailUnavailable && ['/api/v1/skills/git', '/api/v1/skills/pe-compliance-expert-pro'].includes(url.pathname)) {
      res.writeHead(404); res.end('{}'); return
    }
    const json = (body) => { res.writeHead(200, { 'content-type': 'application/json' }); res.end(JSON.stringify(body)) }
    if (url.pathname === '/api/v1/skills') {
      const page = Number(url.searchParams.get('cursor') ?? 1)
      const body = structuredClone(fixtures.clawList)
      body.nextCursor = page < 3 ? String(page + 1) : null
      body.items[0].slug = 'git'
      body.items.forEach((item) => { if (page > 1) item.slug += `-page-${page}`; item.summary = `${state.revision} page ${page}` })
      return json(body)
    }
    if (url.pathname === '/api/skills') {
      if (url.searchParams.has('keyword')) return json(fixtures.skillSearch)
      const page = Number(url.searchParams.get('page') ?? 1)
      const body = structuredClone(fixtures.skillList)
      body.data.total = 9
      body.data.skills.forEach((item) => { if (page > 1) item.slug += `-page-${page}` })
      return json(body)
    }
    if (url.pathname === '/api/v1/search') return json(fixtures.clawSearch)
    if (url.pathname === '/api/v1/skills/git') {
      const body = structuredClone(fixtures.clawDetail)
      body.skill.description = `# ${state.revision} detail`
      return json(body)
    }
    if (url.pathname === '/api/v1/skills/git/versions/1.0.8') return json(fixtures.clawVersion)
    if (url.pathname === '/api/v1/skills/pe-compliance-expert-pro') return json(fixtures.skillDetail)
    if (url.pathname === '/api/v1/skills/pe-compliance-expert-pro/files') return json(fixtures.skillFiles)
    if (url.pathname.endsWith('/file')) { res.writeHead(200); res.end(`# ${state.revision} file\n`); return }
    res.writeHead(404)
    res.end('{}')
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  t.after(() => new Promise((resolve) => server.close(resolve)))
  return { state, origin: `http://127.0.0.1:${server.address().port}` }
}

async function host(t, home, origin) {
  const child = fork(new URL('./fixtures/cache-host.mjs', import.meta.url), [JSON.stringify({
    clawhubBaseUrl: origin, skillhubBaseUrl: origin, timeoutMs: 1_000, requestRetries: 0, pageSize: 3,
  })], {
    env: { ...process.env, DSH_HOME: home, DSH_AGENTS_HOME: join(home, 'agents') },
    stdio: ['ignore', 'ignore', 'pipe', 'ipc'],
  })
  let errors = ''
  child.stderr.on('data', (chunk) => { errors += chunk })
  // Register cleanup before waiting for startup, including a failed startup.
  const stop = async () => {
    if (child.exitCode !== null || child.signalCode !== null) return
    const exited = once(child, 'exit')
    child.kill('SIGKILL')
    await exited
  }
  t.after(stop)
  const started = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`host startup timed out: ${errors}`)), 10_000)
    child.once('message', (value) => { clearTimeout(timer); resolve(value) })
    child.once('exit', (code) => { clearTimeout(timer); reject(new Error(`host exited ${code}: ${errors}`)) })
  })
  return {
    stop,
    async get(path) {
      const response = await fetch(`${started.origin}/api/skills-hub${path}`)
      const body = await response.json()
      assert.equal(response.status, 200, JSON.stringify(body))
      return body
    },
    async install(id) {
      const response = await fetch(`${started.origin}/api/skills-hub/install`, {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id }),
      })
      return { status: response.status, body: await response.json() }
    },
  }
}

async function expire(home) {
  const directory = join(home, 'cache', 'skills-hub', 'v1')
  for (const name of await readdir(directory)) {
    const filename = join(directory, name)
    const entry = JSON.parse(await readFile(filename, 'utf8'))
    entry.storedAt = Date.now() - 61 * 60_000
    entry.expiresAt = entry.storedAt + 60 * 60_000
    entry.sha256 = createHash('sha256').update(JSON.stringify([2, entry.key, entry.storedAt, entry.expiresAt, entry.value])).digest('hex')
    await writeFile(filename, JSON.stringify(entry))
  }
}

test('three catalogue pages, searches, details and previews survive an actual host process restart', async (t) => {
  const home = await mkdtemp(join(tmpdir(), 'skills-hub-restart-'))
  t.after(() => rm(home, { recursive: true, force: true }))
  const source = await upstream(t)
  const first = await host(t, home, source.origin)
  const paths = []
  const pages = []
  let cursor
  for (let page = 0; page < 3; page++) {
    const path = `/skills?scope=market&limit=3${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`
    const result = await first.get(path)
    paths.push(path)
    pages.push(result)
    assert.equal(result.sources.clawhub.fromCache, false)
    assert.equal(result.sources.skillhub.fromCache, false)
    cursor = result.nextCursor
  }
  assert.equal(cursor, null)
  const searchPath = '/skills?scope=market&q=git&limit=3'
  const search = await first.get(searchPath)
  const details = ['/skills/clawhub/git', '/skills/skillhub/pe-compliance-expert-pro']
  const originals = await Promise.all(details.map((path) => first.get(path)))
  const filePaths = details.map((path) => `${path}/file?path=SKILL.md`)
  const files = await Promise.all(filePaths.map((path) => first.get(path)))
  let warmedRequests = source.state.requests
  await first.stop()

  // Disk snapshots must not persist install annotations. A new local install
  // while the host is stopped has to be reflected in restored market data.
  const installed = join(home, 'skills', 'git')
  await mkdir(installed, { recursive: true })
  await writeFile(join(installed, 'SKILL.md'), '# Installed Git\n')
  await writeFile(join(installed, '.skills-hub.json'), JSON.stringify({ id: 'clawhub:git', source: 'clawhub', slug: 'git', version: '1.0.8', installedAt: new Date().toISOString() }))

  await Promise.all(Array.from({ length: 100 }, (_, index) => writeFile(join(home, 'skills', `local-${index}.md`), '# Local')))
  const second = await host(t, home, source.origin)
  for (let page = 0; page < 3; page++) {
    const restored = await second.get(paths[page])
    assert.deepEqual(restored.items.map((item) => item.id), pages[page].items.map((item) => item.id))
    if (page === 0) assert.equal(restored.items.find((item) => item.id === 'clawhub:git').installState, 'installed', 'the first cached response must wait for startup install annotations')
    for (const provider of ['clawhub', 'skillhub']) {
      assert.equal(restored.sources[provider].fromCache, true)
      assert.equal(restored.sources[provider].fetchedAt, pages[page].sources[provider].fetchedAt)
    }
  }
  const restoredSearch = await second.get(searchPath)
  assert.equal(restoredSearch.sources.clawhub.fetchedAt, search.sources.clawhub.fetchedAt)
  assert.equal(restoredSearch.sources.skillhub.fromCache, true)
  for (let index = 0; index < details.length; index++) {
    const restored = await second.get(details[index])
    assert.equal(restored.sourceStatus.fromCache, true)
    assert.equal(restored.sourceStatus.fetchedAt, originals[index].sourceStatus.fetchedAt)
    assert.deepEqual(await second.get(filePaths[index]), files[index])
  }
  assert.equal((await second.get(details[0])).skill.installState, 'installed')
  assert.equal(source.state.requests, warmedRequests, 'restart and all repeated reads must issue zero upstream requests')

  source.state.detailUnavailable = true
  const rejectedInstall = await second.install('skillhub:pe-compliance-expert-pro')
  assert.equal(rejectedInstall.status, 502, JSON.stringify(rejectedInstall.body))
  assert.deepEqual(source.state.paths.slice(warmedRequests), ['/api/v1/skills/pe-compliance-expert-pro'], 'HTTP installs must reject a withdrawn manifest before downloading files, despite a fresh disk snapshot')
  source.state.detailUnavailable = false
  warmedRequests = source.state.requests

  source.state.revision = 'refreshed'
  const refreshed = await second.get(`${paths[0]}&refresh=1`)
  assert.equal(refreshed.sources.clawhub.fromCache, false)
  assert.equal(source.state.requests, warmedRequests + 2)
  await second.get(`${details[0]}?refresh=1`)
  assert.equal(source.state.requests, warmedRequests + 4, 'detail refresh must re-read the manifest')
  await second.stop()
  const third = await host(t, home, source.origin)
  const refreshedAfterRestart = await third.get(paths[0])
  assert.equal(refreshedAfterRestart.sources.clawhub.fetchedAt, refreshed.sources.clawhub.fetchedAt)
  assert.ok(refreshedAfterRestart.items.some((item) => item.summary === 'refreshed page 1'))
  assert.equal(source.state.requests, warmedRequests + 4)
  await third.stop()

  await expire(home)
  const expiredHost = await host(t, home, source.origin)
  const fresh = await expiredHost.get(paths[0])
  assert.equal(fresh.sources.clawhub.fromCache, false)
  assert.equal(fresh.sources.skillhub.fromCache, false)
  assert.equal(source.state.requests, warmedRequests + 6, 'expired pages must be fetched again')
  await expiredHost.stop()

  await expire(home)
  source.state.offline = true
  const offlineHost = await host(t, home, source.origin)
  const stale = await offlineHost.get(paths[0])
  assert.equal(stale.sources.clawhub.status, 'cached')
  assert.equal(stale.sources.skillhub.status, 'cached')
  assert.ok(stale.items.length > 0, 'an outage must preserve the last browsed page')
  const staleDetail = await offlineHost.get(details[0])
  assert.equal(staleDetail.sourceStatus.status, 'cached')
  await offlineHost.stop()

  const otherSource = await upstream(t)
  otherSource.state.revision = 'different source'
  const otherHost = await host(t, home, otherSource.origin)
  const changed = await otherHost.get(paths[0])
  assert.equal(changed.sources.clawhub.fromCache, false)
  assert.ok(changed.items.some((item) => item.summary === 'different source page 1'))
  assert.equal((await otherHost.get(details[0])).sourceStatus.fromCache, false)
  assert.equal((await otherHost.get(filePaths[0])).file.content, '# different source file\n')
})

test('in-flight disk reads retain their provider configuration and cache instance during reload', async (t) => {
  const home = await mkdtemp(join(tmpdir(), 'skills-hub-config-switch-'))
  t.after(() => rm(home, { recursive: true, force: true }))
  const a = await upstream(t)
  const b = await upstream(t)
  a.state.revision = 'A'
  b.state.revision = 'B'
  const configure = (source, directory) => {
    configureProviderFetch({ clawhubBaseUrl: source.origin, skillhubBaseUrl: source.origin, retries: 0 })
    configureMarketCache({ directory: join(home, directory) })
  }
  const read = () => Promise.all([
    listMarketSkills({ scope: 'market', source: 'clawhub', limit: 3, security: 'all', installed: 'all' }),
    getMarketSkillDetail('clawhub', 'git'),
    getMarketFileContent('clawhub', 'git', 'SKILL.md'),
  ])
  configure(a, 'a')
  const pending = read()
  configure(b, 'b')
  const [pageA, detailA, fileA] = await pending
  assert.equal(pageA.items[0].summary, 'A page 1')
  assert.equal(detailA.skill.description, '# A detail')
  assert.equal(fileA.content, '# A file\n')
  assert.equal(b.state.requests, 0, 'reload must not redirect any chained read to the new provider')
  const requestsA = a.state.requests
  const [pageB, detailB, fileB] = await read()
  assert.equal(pageB.items[0].summary, 'B page 1')
  assert.equal(detailB.skill.description, '# B detail')
  assert.equal(fileB.content, '# B file\n')
  configure(a, 'a')
  const [restoredPage, restoredDetail, restoredFile] = await read()
  assert.equal(restoredPage.sources.clawhub.fromCache, true)
  assert.equal(restoredPage.items[0].summary, 'A page 1')
  assert.equal(restoredDetail.sourceStatus.fromCache, true)
  assert.equal(restoredDetail.skill.description, '# A detail')
  assert.equal(restoredFile.content, '# A file\n')
  assert.equal(a.state.requests, requestsA, 'A must restore only its own snapshots after reload')
})
