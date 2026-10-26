/** Deterministic provider transport; the host, installer and filesystem are real. */
import { createServer } from 'node:http'
import { createHash } from 'node:crypto'

export const fixtureDocument = '---\nname: Harness acceptance\ndescription: Disposable compatibility verification skill\n---\n# Harness acceptance\n\n| Check | Result |\n| --- | --- |\n| Markdown | rendered |\n'
export const fixtureSlug = 'harness-acceptance'
export async function startMarketUpstream() {
  const state = { requests: 0, offline: false }
  const skill = { slug: fixtureSlug, displayName: 'Harness acceptance', summary: 'Disposable verification skill', description: fixtureDocument, stats: { downloads: 1 }, tags: { latest: '1.0.0' } }
  const server = createServer((req, res) => {
    state.requests++
    if (state.offline) { res.writeHead(503); res.end('{}'); return }
    const url = new URL(req.url, 'http://fixture.invalid')
    const json = body => { res.writeHead(200, { 'content-type': 'application/json' }); res.end(JSON.stringify(body)) }
    if (url.pathname === '/api/v1/skills') return json({ items: [skill], nextCursor: null })
    if (url.pathname === '/api/v1/search') return json({ results: [{ slug: fixtureSlug, displayName: skill.displayName, summary: skill.summary }] })
    if (url.pathname === `/api/v1/skills/${fixtureSlug}`) return json({ skill, latestVersion: { version: '1.0.0', license: 'MIT' }, owner: { handle: 'fixture' } })
    if (url.pathname === `/api/v1/skills/${fixtureSlug}/versions/1.0.0`) return json({ version: { version: '1.0.0', license: 'MIT', files: [{ path: 'SKILL.md', size: Buffer.byteLength(fixtureDocument), sha256: createHash('sha256').update(fixtureDocument).digest('hex'), contentType: 'text/markdown' }], security: { status: 'clean' } } })
    if (url.pathname === `/api/v1/skills/${fixtureSlug}/file` && url.searchParams.get('path') === 'SKILL.md') { res.writeHead(200, { 'content-type': 'text/plain' }); res.end(fixtureDocument); return }
    if (url.pathname === '/api/skills') return json({ code: 0, data: { skills: [], total: 0 } })
    res.writeHead(404); res.end('{}')
  })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  return { state, origin: `http://127.0.0.1:${server.address().port}`, close: () => new Promise(resolve => server.close(resolve)) }
}
