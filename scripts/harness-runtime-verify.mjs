/** Verify a tarball through the published CLI in a disposable Web profile.
 * --runtime-dir reuses an existing exact host read-only; otherwise install one.
 * --serve leaves the isolated browser surface running until SIGINT/SIGTERM.
 */
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { once } from 'node:events'
import { existsSync, readFileSync } from 'node:fs'
import { mkdir, mkdtemp, readFile, writeFile, readdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { exactVersion, isHostPackage } from './compatibility.mjs'
import { npmInvocation } from './npm-command.mjs'
import { fixtureSlug, fixtureDocument, startMarketUpstream } from './fixtures/market-upstream.mjs'

const flags = new Map()
const allowed = ['--host-version', '--artifact', '--report-dir', '--runtime-dir', '--expected-plugin-version', '--serve']
for (let i = 2; i < process.argv.length; i++) {
  const flag = process.argv[i]
  assert(allowed.includes(flag) && !flags.has(flag), `unknown or duplicate flag: ${flag}`)
  if (flag === '--serve') flags.set(flag, true)
  else { assert(process.argv[i + 1] && !process.argv[i + 1].startsWith('--'), `missing value for ${flag}`); flags.set(flag, process.argv[++i]) }
}
const version = flags.get('--host-version')
assert(exactVersion(version), '--host-version must be exact')
assert(flags.has('--artifact') && flags.has('--report-dir'), '--artifact and --report-dir are required')
const artifact = resolve(flags.get('--artifact'))
const report = resolve(flags.get('--report-dir'))
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const expectedVersion = flags.get('--expected-plugin-version') ?? pkg.version
const hash = bytes => createHash('sha256').update(bytes).digest('hex')
const artifactSha256 = hash(await readFile(artifact))
await mkdir(report, { recursive: true })
// A reused report directory must not retain a previous success after failure.
const resultPath = join(report, 'result.json')
assert(!existsSync(resultPath), 'report already exists; choose a fresh --report-dir')
const work = await mkdtemp(join(report, 'run-'))
const home = join(work, 'home'), agents = join(work, 'agents')
await mkdir(home, { recursive: true })
await mkdir(agents, { recursive: true })
const runtime = flags.has('--runtime-dir') ? resolve(flags.get('--runtime-dir')) : join(work, 'runtime')
const cleanEnv = Object.fromEntries(Object.entries(process.env).filter(([key]) => !/^(npm_config_|DSH_)/i.test(key)))
const env = { ...cleanEnv, DSH_HOME: home, DSH_AGENTS_HOME: agents, DSH_TELEMETRY_DISABLED: '1', npm_config_registry: 'https://registry.npmjs.org/', npm_config_userconfig: process.platform === 'win32' ? 'NUL' : '/dev/null' }
const runs = []
const record = (scenario, assertions) => {
  const passed = Object.values(assertions).every(value => value === true)
  runs.push({ scenario, passed, assertions })
  assert(passed, `${scenario} failed: ${JSON.stringify(assertions)}`)
}
const jsonFile = (file, value) => writeFile(file, JSON.stringify(value, null, 2) + '\n')
const children = new Set()
async function stop(child) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return
  const closed = once(child, 'close')
  child.kill('SIGTERM')
  const timer = setTimeout(() => child.kill('SIGKILL'), 5000)
  try { await closed } finally { clearTimeout(timer); children.delete(child) }
}
async function command(file, args, cwd, label, timeout = 180_000) {
  const child = spawn(file, args, { cwd, env, stdio: ['ignore', 'pipe', 'pipe'], shell: false })
  children.add(child)
  let stdout = '', stderr = ''
  child.stdout.on('data', data => stdout += data)
  child.stderr.on('data', data => stderr += data)
  const timer = setTimeout(() => { void stop(child) }, timeout)
  try {
    const [code] = await once(child, 'close')
    await Promise.all([writeFile(join(report, `${label}.stdout.log`), stdout), writeFile(join(report, `${label}.stderr.log`), stderr)])
    assert.equal(code, 0, `${label} exited ${code}; see its logs`)
    return stdout
  } finally { clearTimeout(timer); children.delete(child) }
}
async function installRuntime() {
  await mkdir(runtime, { recursive: true })
  const pending = new Set(['@deepseek-ai/dsh']), packages = new Map()
  while (pending.size) {
    const batch = [...pending].filter(name => !packages.has(name)).slice(0, 16)
    if (!batch.length) break
    batch.forEach(name => pending.delete(name))
    const manifests = await Promise.all(batch.map(async name => {
      const response = await fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}/${version}`, { signal: AbortSignal.timeout(30_000) })
      assert(response.ok, `missing exact host package ${name}@${version}`)
      const manifest = await response.json()
      assert.equal(manifest.name, name); assert.equal(manifest.version, version)
      return manifest
    }))
    for (const manifest of manifests) {
      packages.set(manifest.name, manifest)
      for (const name of Object.keys({ ...manifest.dependencies, ...manifest.optionalDependencies, ...manifest.peerDependencies })) if (isHostPackage(name) && !packages.has(name)) pending.add(name)
    }
  }
  await jsonFile(join(runtime, 'package.json'), { name: 'skills-hub-host-acceptance', version: '0.0.0', private: true, type: 'module', dependencies: { '@deepseek-ai/dsh': version }, overrides: Object.fromEntries([...packages.keys()].map(name => [name, version])) })
  const target = npmInvocation(['install', '--no-audit', '--no-fund'], { env })
  await command(target.file, target.args, runtime, 'runtime-install', 900_000)
}
async function cohortEntries() {
  const lock = JSON.parse(await readFile(join(runtime, 'package-lock.json'), 'utf8'))
  const cohort = []
  for (const [path, entry] of Object.entries(lock.packages)) {
    if (!/node_modules\/@deepseek-ai\/dsh(?:-[^/]+)?$/.test(path)) continue
    const installed = JSON.parse(await readFile(join(runtime, path, 'package.json'), 'utf8'))
    assert.equal(entry.version, version, `mixed host lock: ${path}`)
    assert.equal(installed.version, version, `mixed installed host: ${path}`)
    cohort.push({ name: installed.name, version: installed.version, integrity: entry.integrity })
  }
  assert(cohort.some(entry => entry.name === '@deepseek-ai/dsh'), 'actual Harness missing')
  return cohort
}
let upstream, cohort = [], browserHost
async function boot(label) {
  const child = spawn(process.execPath, [join(runtime, 'node_modules/@deepseek-ai/dsh/lib/bin.js'), 'web', '--no-open', '--port', '0'], { cwd: runtime, env, stdio: ['ignore', 'pipe', 'pipe'] })
  children.add(child)
  let output = '', errors = ''
  child.stdout.on('data', data => output += data)
  child.stderr.on('data', data => errors += data)
  const deadline = Date.now() + 60_000
  let url
  while (Date.now() < deadline) {
    url = output.match(/dsh web: (http:\/\/[^\s]+\?token=[^\s]+)/)?.[1]
    if (url) break
    assert(child.exitCode === null && child.signalCode === null, `host failed: ${errors}`)
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  assert(url, `host did not advertise an authenticated URL: ${errors}`)
  // Launch tokens and cookies remain in memory; persisted logs are redacted.
  await Promise.all([writeFile(join(report, `${label}.stdout.log`), output.replace(/token=[^\s]+/g, 'token=REDACTED')), writeFile(join(report, `${label}.stderr.log`), errors)])
  const authenticated = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(10_000) })
  const cookie = authenticated.headers.get('set-cookie')?.split(';')[0]
  assert(cookie, 'host did not issue browser cookie')
  const origin = new URL(url).origin
  const request = async (path, body, headers = {}) => {
    const response = await fetch(origin + path, { method: body === undefined ? 'GET' : 'POST', headers: { cookie, ...body === undefined ? {} : { 'content-type': 'application/json' }, ...headers }, ...body === undefined ? {} : { body: JSON.stringify(body) }, signal: AbortSignal.timeout(20_000) })
    return response
  }
  const api = async (path, body) => {
    const response = await request('/api/skills-hub' + path, body)
    const value = await response.json()
    assert.equal(response.status, 200, JSON.stringify(value))
    return value
  }
  return { child, url, origin, api, request }
}

try {
  if (!flags.has('--runtime-dir')) await installRuntime()
  cohort = await cohortEntries()
  const cli = join(runtime, 'node_modules/@deepseek-ai/dsh/lib/bin.js')
  await command(process.execPath, [cli, 'plugin', '--profile', 'web', 'add', '--save-exact', artifact], runtime, 'plugin-manager-install')
  const profile = join(home, 'profiles', 'web')
  const installedRoot = join(profile, 'node_modules', ...pkg.name.split('/'))
  const installed = JSON.parse(await readFile(join(installedRoot, 'package.json'), 'utf8'))
  record('plugin-manager-install', { identity: installed.name === pkg.name, version: installed.version === expectedVersion })
  // Copying a different file into the profile after installing would invalidate this probe.
  assert.equal(hash(await readFile(artifact)), artifactSha256, 'candidate changed while installing')
  upstream = await startMarketUpstream()
  await writeFile(join(profile, 'cordis.patch.yml'), `- id: skills-hub\n  name: '${pkg.name}'\n  config:\n    clawhubBaseUrl: ${upstream.origin}\n    skillhubBaseUrl: ${upstream.origin}\n    requestRetries: 0\n    timeoutMs: 1000\n`)
  const dump = await command(process.execPath, [cli, '--profile', 'web', '--dump-config'], runtime, 'profile-dump')
  assert(dump.includes(pkg.name), 'plugin missing from resolved profile')
  browserHost = await boot('cold-boot')
  const categories = await browserHost.api('/categories')
  record('cold-boot', { categories: categories.items.length === 13, profile: dump.includes(pkg.name) })
  const unauthenticated = await fetch(browserHost.origin + '/api/skills-hub/categories')
  const forbidden = await browserHost.request('/api/skills-hub/categories', undefined, { origin: 'https://untrusted.invalid' })
  record('request-fence', { unauthenticated: unauthenticated.status === 401, crossOrigin: forbidden.status === 403 })
  // Read the host's own boot graph, then request its revisioned plugin bundle.
  const html = await (await browserHost.request('/')).text()
  const bootScript = html.match(/globalThis\["__DSH_BOOT__"\]\s*=\s*([^<]+?)\s*<\/script>/)?.[1]?.replace(/;\s*$/, '')
  assert(bootScript, 'host HTML did not advertise its boot graph')
  const graph = JSON.parse(bootScript)
  const entry = graph.entries.find(entry => entry.id === pkg.name)
  assert(entry?.url?.startsWith('plugins/'), 'plugin missing from host boot graph')
  const served = await browserHost.request('/' + entry.url)
  const servedBundle = await served.text()
  const bundleOnDisk = await readFile(join(installedRoot, 'lib/client.js'), 'utf8')
  const pluginFiles = await readdir(join(installedRoot, 'lib'))
  record('client-bundle', { factory: bundleOnDisk.includes('__ModuleLoader__'), identity: servedBundle.includes(pkg.name), file: pluginFiles.includes('client.js'), served: served.status === 200, servedFactory: servedBundle.includes('__ModuleLoader__.load') && /javascript/.test(served.headers.get('content-type') ?? '') })
  const detailPath = `/skills/clawhub/${fixtureSlug}`
  const detail = await browserHost.api(detailPath)
  assert(detail.skill.description.includes('# Harness acceptance'))
  const baselineRequests = upstream.state.requests
  const cached = await browserHost.api(detailPath)
  assert.equal(upstream.state.requests, baselineRequests, 'second detail read did not use cache')
  await browserHost.api('/install', { id: `clawhub:${fixtureSlug}`, owner: 'fixture' })
  const installedSkills = await browserHost.api('/installed')
  const installedText = await readFile(join(home, 'skills', fixtureSlug, 'SKILL.md'), 'utf8')
  await browserHost.api('/uninstall', { id: `clawhub:${fixtureSlug}` })
  const afterRemoval = await browserHost.api('/installed')
  record('install-uninstall', { inventory: installedSkills.items.some(item => item.slug === fixtureSlug), bytes: installedText === fixtureDocument, removed: !existsSync(join(home, 'skills', fixtureSlug)) && !afterRemoval.items.some(item => item.slug === fixtureSlug) })
  await stop(browserHost.child)
  const requestsBeforeRestart = upstream.state.requests
  upstream.state.offline = true
  browserHost = await boot('restart')
  const restored = await browserHost.api(detailPath)
  record('restart-cache', { body: restored.skill.description === cached.skill.description, upstreamNotRead: upstream.state.requests === requestsBeforeRestart, timestamp: typeof restored.sourceStatus.fetchedAt === 'number' && restored.sourceStatus.fetchedAt === cached.sourceStatus.fetchedAt && restored.sourceStatus.fromCache === true })
  if (flags.has('--serve')) {
    upstream.state.offline = false
    await writeFile(join(report, 'browser.json'), JSON.stringify({ url: browserHost.url }), { mode: 0o600 })
    console.log(`Browser acceptance origin: ${browserHost.origin}; launch URL saved in the private local browser.json`)
    console.log(`Isolated home: ${home}`)
    await new Promise(resolve => { process.once('SIGINT', resolve); process.once('SIGTERM', resolve) })
  }
} catch (error) {
  runs.push({ scenario: 'runner', passed: false, assertions: { completed: false }, error: error.message })
  process.exitCode = 1
  console.error(error.stack)
} finally {
  await Promise.all([...children].map(stop))
  if (upstream) await upstream.close()
  await jsonFile(resultPath, { passed: process.exitCode !== 1, version, pluginVersion: expectedVersion, artifactSha256, node: process.version, platform: process.platform, arch: process.arch, cohortCount: cohort.length, cohort, runs, unverified: ['browser DOM mount (separate Ego Lite acceptance)', 'native Electron', 'live provider availability'] })
  console.log(`Host ${version}: ${process.exitCode === 1 ? 'FAIL' : 'PASS'}; report ${resultPath}`)
}
