/** A fresh plugin host process for restart tests; only isolated homes are used. */
import { createServer } from 'node:http'
import { apply } from '../../lib/index.js'

const routes = []
const webServer = { register(route) { routes.push(route); return () => {} } }
const ctx = {
  get(name) { return name === 'webServer' ? webServer : undefined },
  effect(factory) { factory(); return () => {} },
  on() { return () => {} },
  logger: { info() {}, warn(message) { process.stderr.write(`${message}\n`) } },
}
apply(ctx, JSON.parse(process.argv[2]))
const server = createServer((req, res) => {
  const route = routes.find((candidate) => req.url.startsWith(candidate.path))
  if (!route) { res.writeHead(404); res.end('{}'); return }
  Promise.resolve(route.handler(req, res)).catch((error) => {
    res.writeHead(500)
    res.end(JSON.stringify({ error: String(error) }))
  })
})
server.listen(0, '127.0.0.1', () => process.send({ origin: `http://127.0.0.1:${server.address().port}` }))
