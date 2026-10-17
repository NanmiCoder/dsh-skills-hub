import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import WebServer from '@deepseek-ai/dsh-host-webserver'
import { HostConnectionService } from '@deepseek-ai/dsh-client-connection'
import * as plugin from '../lib/index.js'

test('real host services fence requests and dispose/reload Skills Hub routes', async () => {
  const home = await mkdtemp(join(tmpdir(), 'skills-hub-host-'))
  const saved = { DSH_HOME: process.env.DSH_HOME, DSH_AGENTS_HOME: process.env.DSH_AGENTS_HOME }
  process.env.DSH_HOME = home
  process.env.DSH_AGENTS_HOME = join(home, 'agents')
  const ctx = new Context()
  try {
    await ctx.plugin(WebServer, { host: '127.0.0.1', port: 0 })
    // Exercise the real Connection trust fence; only cookie verification is a fixture.
    await ctx.plugin(owner => {
      new HostConnectionService(owner, [], {
        isAuthenticated: request => request.headers.cookie === 'fixture=owner',
        authenticateApi: () => undefined,
      })
    })
    let fiber = ctx.plugin(plugin, {})
    await fiber
    const url = `http://127.0.0.1:${ctx.webServer.port}/api/skills-hub/categories`
    assert.equal((await fetch(url)).status, 401)
    assert.equal((await fetch(url, { headers: { cookie: 'fixture=owner', origin: 'https://untrusted.example' } })).status, 403)
    const admitted = await fetch(url, { headers: { cookie: 'fixture=owner' } })
    assert.equal(admitted.status, 200)
    assert.equal((await admitted.json()).items.length, 13)
    await fiber.dispose()
    assert.equal((await fetch(url, { headers: { cookie: 'fixture=owner' } })).status, 404)
    fiber = ctx.plugin(plugin, {})
    await fiber
    assert.equal((await fetch(url, { headers: { cookie: 'fixture=owner' } })).status, 200)
  } finally {
    await ctx.fiber.dispose()
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
    await rm(home, { recursive: true, force: true })
  }
})
