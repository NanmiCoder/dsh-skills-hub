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
  await controller.openDetail('clawhub:one')
  assert.equal(requests.length, 1, 'ordinary navigation uses cached details')
  controller.closeDetail()
  const refreshed = controller.refresh()
  requests[1].resolve(page([skill('one')]))
  await refreshed
  const reopened = controller.openDetail('clawhub:one')
  assert.equal(requests.length, 3, 'local-management refresh forces a fresh detail request')
  assert.equal(controller.state.detail, null)
  requests[2].resolve({ skill: skill('one'), sourceStatus: sources.clawhub })
  await reopened
  assert.equal(controller.state.detail.installState, 'installable')
})
