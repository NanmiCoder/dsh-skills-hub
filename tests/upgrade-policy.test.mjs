import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { policy, validatePolicy, validatePackageCompatibility, generateHostPeers, runtimeTargets, requiredHostPeers } from '../scripts/compatibility.mjs'
import { requiredScenarios, validateRuntimeReport } from '../scripts/harness-validation.mjs'
import { assessUpgradeStatus, registryMetadata } from '../scripts/upgrade-status.mjs'
import { npmInvocation } from '../scripts/npm-command.mjs'
import { verifiedRegistryBytes } from '../scripts/registry-smoke.mjs'
import { createHash } from 'node:crypto'

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const clone = value => structuredClone(value)

test('exact policy owns peers, development pins and both platform targets', () => {
  const versions = validatePackageCompatibility(pkg)
  assert.equal(runtimeTargets().length, versions.length * 2)
  const next = clone(policy)
  next.supportedHosts.push({ version: '0.2.1-rc.99', track: 'preview', tag: 'dsh-v0.2.1-rc.99', commit: 'a'.repeat(40), platforms: ['ubuntu-latest', 'windows-latest'] })
  assert.throws(() => validatePackageCompatibility(pkg, next))
  const generated = generateHostPeers(pkg, next)
  assert(validatePackageCompatibility(generated, next).includes('0.2.1-rc.99'))
  assert.deepEqual(runtimeTargets(next).slice(-2), [{ host: '0.2.1-rc.99', os: 'ubuntu-latest' }, { host: '0.2.1-rc.99', os: 'windows-latest' }])
  assert.equal(generated.devDependencies['@deepseek-ai/dsh-client-connection'], policy.developmentHost)
})

test('policy refuses unknown ranges, duplicate hosts and incomplete platform evidence', () => {
  for (const change of [p => { p.supportedHosts[0].version = '^0.2.1' }, p => { p.supportedHosts.push(clone(p.supportedHosts[0])) }, p => { p.supportedHosts[0].platforms.pop() }, p => { p.supportedHosts[0].commit = 'main' }, p => { p.developmentHost = '0.2.1-rc.99' }]) {
    const input = clone(policy); change(input); assert.throws(() => validatePolicy(input))
  }
})

test('declaration checks reject deleted peers, mixed cohorts and engines.dsh bypass', () => {
  for (const change of [p => { delete p.peerDependencies[requiredHostPeers[0]] }, p => { p.devDependencies[requiredHostPeers[0]] = '0.2.1-rc.99' }, p => { p.engines.dsh = '*' }, p => { p.peerDependencies[requiredHostPeers[0]] = '^0.2.1' }]) {
    const input = clone(pkg); change(input); assert.throws(() => validatePackageCompatibility(input))
  }
  const missing = clone(pkg); delete missing.peerDependencies[requiredHostPeers[0]]
  assert.throws(() => generateHostPeers(missing), /missing required peer/)
})

const target = { host: policy.recommendedHost, os: 'windows-latest' }
const expected = { pluginVersion: pkg.version, artifactSha256: 'a'.repeat(64) }
const passingReport = () => ({ passed: true, version: target.host, pluginVersion: pkg.version, platform: 'win32', artifactSha256: expected.artifactSha256, cohortCount: 1, cohort: [{ name: '@deepseek-ai/dsh', version: target.host }], runs: requiredScenarios.map(scenario => ({ scenario, passed: true, assertions: { verified: true } })) })
test('runtime gate requires installation and restart evidence for the exact OS, host and tarball', () => {
  validateRuntimeReport(passingReport(), target, expected)
  for (const change of [p => { p.runs = p.runs.filter(r => r.scenario !== 'plugin-manager-install') }, p => { p.runs = p.runs.filter(r => r.scenario !== 'restart-cache') }, p => { p.platform = 'linux' }, p => { p.version = '0.2.1-rc.99' }, p => { p.artifactSha256 = 'b'.repeat(64) }, p => { p.pluginVersion = '9.9.9' }, p => { p.cohort[0].version = '0.2.1-rc.99' }, p => { p.runs[0].assertions = {} }, p => { p.runs[0].assertions.verified = false }]) {
    const input = passingReport(); change(input); assert.throws(() => validateRuntimeReport(input, target, expected))
  }
})

test('upstream discovery separates unverified hosts from unpublished source support', () => {
  const host = { 'dist-tags': { latest: policy.recommendedHost, next: '0.2.1-rc.99' } }
  const published = { 'dist-tags': { latest: pkg.version }, versions: { [pkg.version]: clone(pkg) } }
  const current = assessUpgradeStatus(pkg, policy, host, published)
  assert.deepEqual(current.unverifiedHosts, ['0.2.1-rc.99']); assert.equal(current.releaseGap, false)
  delete published.versions[pkg.version].peerDependencies[requiredHostPeers[0]]
  assert.equal(assessUpgradeStatus(pkg, policy, host, published).releaseGap, true)
  assert.equal(assessUpgradeStatus(pkg, policy, host, { 'dist-tags': {}, versions: {} }).publishedPluginVersion, null)
})

test('registry failure is an error, never an empty successful upstream check', async () => {
  await assert.rejects(registryMetadata('example', async () => ({ ok: false, status: 503 })), /503/)
  await assert.rejects(registryMetadata('example', async () => ({ ok: true, json: async () => ({}) })), /Malformed/)
})

test('Windows invokes npm through Node and preserves shell-sensitive arguments literally', () => {
  const cli = join('/tool chain', 'node_modules', 'npm', 'bin', 'npm-cli.js')
  const args = ['pack', '--pack-destination', '/tmp/path with spaces & %variables%']
  const result = npmInvocation(args, { platform: 'win32', execPath: '/tool chain/node.exe', env: { Path: '/unused' }, exists: path => path === cli })
  assert.equal(result.file, '/tool chain/node.exe'); assert.deepEqual(result.args, [cli, ...args])
  assert.deepEqual(npmInvocation(args, { platform: 'linux' }), { file: 'npm', args })
  assert.throws(() => npmInvocation([], { platform: 'win32', execPath: '/node.exe', env: {}, exists: () => false }), /npm-cli/)
})

test('registry smoke rejects unrelated bytes, identity and integrity before installing', async () => {
  const bytes = Buffer.from('fixture candidate archive')
  const sha = createHash('sha256').update(bytes).digest('hex')
  const metadata = { ...clone(pkg), dist: { tarball: 'https://registry.npmjs.org/fixture.tgz', integrity: `sha512-${createHash('sha512').update(bytes).digest('base64')}` } }
  const fetcher = async url => String(url).endsWith('.tgz') ? new Response(bytes) : Response.json(metadata)
  assert.deepEqual(await verifiedRegistryBytes(pkg, policy, sha, { fetcher }), bytes)
  await assert.rejects(verifiedRegistryBytes(pkg, policy, 'b'.repeat(64), { fetcher }), /differs/)
  metadata.dist.integrity = 'sha512-unrelated'
  await assert.rejects(verifiedRegistryBytes(pkg, policy, sha, { fetcher }), /integrity mismatch/)
  metadata.name = 'unrelated'
  await assert.rejects(verifiedRegistryBytes(pkg, policy, sha, { fetcher }))
})

test('registry propagation retries are bounded and non-retryable failures stay errors', async () => {
  let attempts = 0
  await assert.rejects(verifiedRegistryBytes(pkg, policy, 'a'.repeat(64), { fetcher: async () => { attempts++; return new Response('{}', { status: 404 }) }, wait: async () => {} }), /did not become available/)
  assert.equal(attempts, 8)
  attempts = 0
  await assert.rejects(verifiedRegistryBytes(pkg, policy, 'a'.repeat(64), { fetcher: async () => { attempts++; return new Response('{}', { status: 403 }) } }), /403/)
  assert.equal(attempts, 1)
})
