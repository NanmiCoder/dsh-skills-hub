import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createMarketController } from '../lib/client/state.js'

const sources = { clawhub: { status: 'ok' }, skillhub: { status: 'ok' } }
const skill = (slug, installState = 'installable') => ({
  id: `clawhub:${slug}`, source: 'clawhub', slug, name: slug, summary: '',
  author: { handle: 'author' }, stats: { downloads: 0 }, securityStatus: 'unknown',
  installState, description: `# ${slug}`, files: [],
})
const page = (items, nextCursor = null) => ({ items, nextCursor, sources })
const response = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { 'Content-Type': 'application/json' },
})
function transport(t) {
  const requests = []
  t.mock.method(globalThis, 'fetch', (url, options) => new Promise((resolve, reject) => {
    requests.push({ url, options, resolve: (data, status) => resolve(response(data, status)), reject })
  }))
  return requests
}

test('a late detail response cannot replace the newer skill or reopen a closed view', async (t) => {
  const requests = transport(t)
  const controller = createMarketController()
  const first = controller.openDetail('clawhub:old')
  assert.equal(controller.state.detailLoading, true)
  const second = controller.openDetail('clawhub:new')
  assert.equal(requests[0].options.signal.aborted, true)
  requests[1].resolve({ skill: skill('new'), sourceStatus: sources.clawhub })
  await second
  requests[0].resolve({ skill: skill('old'), sourceStatus: sources.clawhub })
  await first
  assert.equal(controller.state.detail.id, 'clawhub:new')
  const third = controller.openDetail('clawhub:closed')
  controller.closeDetail()
  requests[2].resolve({ skill: skill('closed'), sourceStatus: sources.clawhub })
  await third
  assert.deepEqual(controller.state.view, { kind: 'home' })
  assert.equal(controller.state.detail, null)
  assert.equal(controller.state.detailError, null)
})

test('repeated loadMore calls fetch one cursor and append without duplicating existing cards', async (t) => {
  const requests = transport(t)
  const controller = createMarketController()
  const initial = controller.refresh()
  requests[0].resolve(page([skill('one')], 'page-two'))
  await initial
  const append = controller.loadMore()
  await controller.loadMore()
  await controller.loadMore()
  assert.equal(requests.length, 2)
  assert.equal(new URL(requests[1].url, 'http://localhost').searchParams.get('cursor'), 'page-two')
  requests[1].resolve(page([skill('one'), skill('two')]))
  await append
  assert.deepEqual(controller.state.items.map((item) => item.id), ['clawhub:one', 'clawhub:two'])
  assert.equal(controller.state.nextCursor, null)
  assert.equal(controller.state.loadingMore, false)
  await controller.loadMore()
  assert.equal(requests.length, 2)
})

test('failed append retains cards and cursor and retry resumes that cursor', async (t) => {
  const requests = transport(t)
  const controller = createMarketController()
  const initial = controller.refresh()
  requests[0].resolve(page([skill('one')], 'retry-cursor'))
  await initial
  const append = controller.loadMore()
  requests[1].resolve({ error: { code: 'UNAVAILABLE', message: 'Temporary outage' } }, 503)
  await append
  assert.equal(controller.state.items[0].id, 'clawhub:one')
  assert.equal(controller.state.nextCursor, 'retry-cursor')
  assert.equal(controller.state.error, 'Temporary outage')
  assert.equal(controller.state.loadingMore, false)
  const retry = controller.loadMore()
  assert.equal(controller.state.error, null)
  assert.equal(requests[2].url, requests[1].url)
  requests[2].resolve(page([skill('two')]))
  await retry
  assert.deepEqual(controller.state.items.map((item) => item.id), ['clawhub:one', 'clawhub:two'])
})

test('refresh after external removal invalidates cached installation detail', async (t) => {
  const requests = transport(t)
  const controller = createMarketController()
  const open = controller.openDetail('clawhub:one')
  requests[0].resolve({ skill: skill('one', 'installed'), sourceStatus: sources.clawhub })
  await open
  controller.closeDetail()
  const cachedOpen = controller.openDetail('clawhub:one')
  assert.equal(controller.state.detail.installState, 'installed', 'ordinary navigation displays the previous snapshot immediately')
  assert.equal(controller.state.detailStatus.fromCache, true)
  assert.equal(requests.length, 2, 'ordinary navigation rechecks the Host cache and its TTL')
  requests[1].resolve({ skill: skill('one', 'installed'), sourceStatus: { ...sources.clawhub, fromCache: true } })
  await cachedOpen
  controller.closeDetail()
  const refreshed = controller.refresh()
  requests[2].resolve(page([skill('one')]))
  await refreshed
  const reopened = controller.openDetail('clawhub:one')
  assert.equal(requests.length, 4, 'local-management refresh forces a fresh detail request')
  assert.equal(controller.state.detail, null)
  requests[3].resolve({ skill: skill('one'), sourceStatus: sources.clawhub })
  await reopened
  assert.equal(controller.state.detail.installState, 'installable')
})

test('reopening details and revisiting files always let the Host enforce snapshot expiry', async (t) => {
  const requests = transport(t)
  const controller = createMarketController()
  const initial = controller.openDetail('clawhub:one')
  requests[0].resolve({ skill: skill('one'), sourceStatus: { status: 'ok', fetchedAt: 1, fromCache: false } })
  await initial
  const file = controller.selectFile('SKILL.md')
  requests[1].resolve({ file: { path: 'SKILL.md', content: 'old', language: 'markdown', size: 3, truncated: false } })
  await file
  controller.closeDetail()

  const reopen = controller.openDetail('clawhub:one')
  assert.equal(controller.state.detailStatus.fromCache, true, 'the immediate display copy must be identified as a snapshot')
  assert.equal(controller.state.detailStatus.fetchedAt, 1)
  requests[2].resolve({ skill: { ...skill('one'), version: 'new' }, sourceStatus: { status: 'ok', fetchedAt: 2, fromCache: false } })
  await reopen
  assert.equal(controller.state.detail.version, 'new')
  const revisited = controller.selectFile('SKILL.md')
  requests[3].resolve({ file: { path: 'SKILL.md', content: 'new', language: 'markdown', size: 3, truncated: false } })
  await revisited
  assert.equal(controller.state.file.content, 'new')

  controller.closeDetail()
  const failed = controller.openDetail('clawhub:one')
  requests[4].resolve({ error: { code: 'UNAVAILABLE', message: 'Snapshot no longer usable' } }, 503)
  await failed
  assert.equal(controller.state.detail, null, 'a failed Host revalidation must not silently keep a browser snapshot')
  assert.equal(controller.state.detailError, 'Snapshot no longer usable')
})

test('opening another detail discards an in-flight file from the previous skill', async (t) => {
  const requests = transport(t)
  const controller = createMarketController()
  const first = controller.openDetail('clawhub:one')
  requests[0].resolve({ skill: skill('one'), sourceStatus: sources.clawhub })
  await first
  const file = controller.selectFile('SKILL.md')
  const second = controller.openDetail('clawhub:two')
  assert.equal(requests[1].options.signal.aborted, true)
  requests[2].resolve({ skill: skill('two'), sourceStatus: sources.clawhub })
  await second
  requests[1].resolve({ file: { path: 'SKILL.md', content: 'wrong skill' } })
  await file
  assert.equal(controller.state.detail.id, 'clawhub:two')
  assert.equal(controller.state.file, null)
})

test('appended pages preserve each existing card’s snapshot provenance', async (t) => {
  const requests = transport(t)
  const controller = createMarketController()
  const initial = controller.refresh()
  const cachedStatus = { status: 'ok', fromCache: true, fetchedAt: 1 }
  requests[0].resolve({ ...page([skill('old')], 'page-two'), sources: { ...sources, clawhub: cachedStatus } })
  await initial
  const append = controller.loadMore()
  const freshStatus = { status: 'ok', fromCache: false, fetchedAt: 2 }
  requests[1].resolve({ ...page([skill('old'), skill('new')]), sources: { ...sources, clawhub: freshStatus } })
  await append
  assert.deepEqual(controller.state.itemStatuses['clawhub:old'], cachedStatus)
  assert.deepEqual(controller.state.itemStatuses['clawhub:new'], freshStatus)
  assert.deepEqual(controller.state.sources.clawhub, freshStatus)
})
