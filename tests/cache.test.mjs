import assert from 'node:assert/strict'
import { createHash, randomUUID } from 'node:crypto'
import { mkdtemp, readdir, readFile, rm, stat, utimes, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { MarketCache } from '../lib/market/cache.js'
import { MAX_CACHE_ENTRIES, MAX_STALE_AGE_MS } from '../lib/market/disk-cache.js'
import { Config } from '../lib/config.js'

async function directory(t) {
  const root = await mkdtemp(join(tmpdir(), 'skills-hub-cache-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  return root
}

function filename(root, key) {
  return join(root, `${createHash('sha256').update(key).digest('hex')}.json`)
}

function snapshot(key, value, storedAt, expiresAt) {
  return JSON.stringify({ version: 2, key, value, storedAt, expiresAt,
    sha256: createHash('sha256').update(JSON.stringify([2, key, storedAt, expiresAt, value])).digest('hex') })
}

test('persistent snapshots keep their original age across cache instances', async (t) => {
  const root = await directory(t)
  const first = new MarketCache({ directory: root })
  const storedAt = await first.set('list:page-2', { items: ['second page'] })
  const second = new MarketCache({ directory: root })
  assert.deepEqual(await second.getRecord('list:page-2'), { value: { items: ['second page'] }, storedAt })
  const onDisk = JSON.parse(await readFile(filename(root, 'list:page-2'), 'utf8'))
  assert.equal(onDisk.expiresAt, storedAt + 60 * 60_000)
  assert.equal(onDisk.storedAt, storedAt, 'reads must not slide the expiry window')
})

test('expired snapshots are stale only, and a shorter configured TTL applies on restart', async (t) => {
  const root = await directory(t)
  const now = Date.now()
  const key = 'detail:expired'
  await writeFile(filename(root, key), snapshot(key, { name: 'old' }, now - 120_000, now + 60_000))
  const shortened = new MarketCache({ directory: root, ttlMs: 60_000 })
  assert.equal(await shortened.getRecord(key), undefined)
  assert.deepEqual(await shortened.getStale(key), { value: { name: 'old' }, storedAt: now - 120_000 })
  await writeFile(filename(root, key), snapshot(key, {}, now - MAX_STALE_AGE_MS - 1, now - 1))
  const ancient = new MarketCache({ directory: root })
  assert.equal(await ancient.getStale(key), undefined)
})

test('corrupt, mismatched and unsupported disk entries are ignored', async (t) => {
  const root = await directory(t)
  const now = Date.now()
  for (const body of ['{', 'null', JSON.stringify({ version: 3 }), snapshot('another', {}, now, now + 1_000), snapshot('bad', {}, 'today', now + 1_000), JSON.stringify({ version: 1, key: 'bad', value: {}, storedAt: now, expiresAt: now + 1_000 })]) {
    await writeFile(filename(root, 'bad'), body)
    const cache = new MarketCache({ directory: root })
    assert.equal(await cache.getRecord('bad'), undefined)
  }
  const cache = new MarketCache({ directory: root })
  await cache.set('bad', { recovered: true })
  assert.equal((await new MarketCache({ directory: root }).getRecord('bad')).value.recovered, true)
})

test('an unwritable cache falls back to memory and reports the problem once', async (t) => {
  const root = await directory(t)
  const blocked = join(root, 'file-instead-of-directory')
  await writeFile(blocked, '')
  const errors = []
  const cache = new MarketCache({ directory: blocked, onError: (error) => errors.push(error) })
  assert.equal(await cache.getRecord('missing'), undefined)
  await cache.set('one', { useful: true })
  await cache.set('two', { useful: true })
  assert.equal((await cache.getRecord('one')).value.useful, true)
  assert.equal(errors.length, 1)
})

test('concurrent writes survive restart without temporary files or partial JSON', async (t) => {
  const root = await directory(t)
  const cache = new MarketCache({ directory: root })
  await Promise.all(Array.from({ length: 20 }, (_, index) => cache.set(`page:${index}`, { index })))
  const restored = new MarketCache({ directory: root })
  for (let index = 0; index < 20; index++) assert.equal((await restored.getRecord(`page:${index}`)).value.index, index)
  assert.equal((await readdir(root)).some((name) => name.endsWith('.tmp')), false)
})

test('disk storage evicts old entries at its hard count bound', async (t) => {
  const root = await directory(t)
  const now = Date.now()
  await Promise.all(Array.from({ length: MAX_CACHE_ENTRIES + 2 }, (_, index) => {
    const key = `old:${index}`
    return writeFile(filename(root, key), snapshot(key, index, now, now + 60_000))
  }))
  await new MarketCache({ directory: root }).set('newest', { kept: true })
  assert.equal((await readdir(root)).filter((name) => name.endsWith('.json')).length, MAX_CACHE_ENTRIES)
  assert.equal((await new MarketCache({ directory: root }).getRecord('newest')).value.kept, true)
})

test('valid JSON with altered payload or timestamps is a cache miss', async (t) => {
  const root = await directory(t)
  await new MarketCache({ directory: root }).set('list', { items: [] })
  const original = JSON.parse(await readFile(filename(root, 'list'), 'utf8'))
  for (const altered of [{ ...original, value: { items: null } }, { ...original, value: null }, { ...original, storedAt: original.storedAt - 1_000 }]) {
    await writeFile(filename(root, 'list'), JSON.stringify(altered))
    const cache = new MarketCache({ directory: root })
    assert.equal(await cache.getRecord('list'), undefined)
    assert.equal(await cache.getStale('list'), undefined)
  }
})

test('an oversized refresh invalidates the previous disk snapshot', async (t) => {
  const root = await directory(t)
  const cache = new MarketCache({ directory: root })
  await cache.set('detail', { revision: 1 })
  await cache.set('detail', { revision: 2, description: 'x'.repeat(6 * 1024 * 1024) })
  assert.equal((await cache.getRecord('detail')).value.revision, 2)
  assert.equal(await new MarketCache({ directory: root }).getRecord('detail'), undefined)
})

test('pruning removes abandoned temporary writes without deleting recent or unrelated files', async (t) => {
  const root = await directory(t)
  const abandoned = join(root, `${randomUUID()}.tmp`)
  const active = join(root, `${randomUUID()}.tmp`)
  const unrelated = join(root, 'unrelated.tmp')
  await Promise.all([writeFile(abandoned, 'abandoned'), writeFile(active, 'active'), writeFile(unrelated, 'unrelated')])
  const old = new Date(Date.now() - 2 * 60 * 60_000)
  await Promise.all([utimes(abandoned, old, old), utimes(unrelated, old, old)])
  await new MarketCache({ directory: root }).set('new', {})
  await assert.rejects(stat(abandoned), { code: 'ENOENT' })
  assert.equal(await readFile(active, 'utf8'), 'active')
  assert.equal(await readFile(unrelated, 'utf8'), 'unrelated')
})

test('snapshot TTL configuration defaults to one hour and rejects invalid durations', () => {
  assert.equal(Config({}).cacheTtlMinutes, 60)
  assert.equal(Config({ cacheTtlMinutes: 120 }).cacheTtlMinutes, 120)
  for (const value of [0, -1, 1.5, 1441]) assert.throws(() => Config({ cacheTtlMinutes: value }))
})
