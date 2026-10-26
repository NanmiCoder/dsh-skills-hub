/** One policy owns declarations, development pins and real-host verification. */
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import semver from 'semver'

export const policy = JSON.parse(readFileSync(new URL('../compatibility.json', import.meta.url), 'utf8'))
export const requiredHostPeers = [
  '@deepseek-ai/dsh-client-connection', '@deepseek-ai/dsh-client-locale',
  '@deepseek-ai/dsh-client-ui-layout', '@deepseek-ai/dsh-client-ui-primitives',
  '@deepseek-ai/dsh-client-ui-slots', '@deepseek-ai/dsh-host-webserver',
]
export const isHostPackage = name => name === '@deepseek-ai/dsh' || name.startsWith('@deepseek-ai/dsh-')
export const exactVersion = version => typeof version === 'string' && semver.valid(version) === version

export function validatePolicy(input = policy) {
  assert.equal(input.schemaVersion, 2, 'unknown compatibility schema')
  assert(exactVersion(input.pluginVersion), 'invalid plugin version')
  assert(Array.isArray(input.supportedHosts) && input.supportedHosts.length > 0, 'host targets required')
  const versions = new Set()
  for (const host of input.supportedHosts) {
    assert(exactVersion(host.version) && !versions.has(host.version), 'host targets must be unique exact versions')
    versions.add(host.version)
    assert(['recommended', 'supported', 'preview'].includes(host.track), 'host track required')
    assert.equal(host.tag, `dsh-v${host.version}`, 'host source tag mismatch')
    assert.match(host.commit, /^[a-f0-9]{40}$/, 'exact host source commit required')
    assert.deepEqual([...host.platforms].sort(), ['ubuntu-latest', 'windows-latest'], 'each host requires Linux and Windows verification')
  }
  assert(versions.has(input.developmentHost), 'development host must be a supported target')
  const recommended = input.supportedHosts.filter(host => host.track === 'recommended')
  assert.equal(recommended.length, 1, 'exactly one recommended host required')
  assert.equal(recommended[0].version, input.recommendedHost, 'recommended host mismatch')
  return [...versions]
}

export function validatePackageCompatibility(pkg, input = policy) {
  const versions = validatePolicy(input)
  const range = versions.join(' || ')
  assert.equal(pkg.version, input.pluginVersion, 'compatibility version must match package')
  for (const name of requiredHostPeers) {
    assert.equal(pkg.peerDependencies?.[name], range, `missing or unsupported host peer: ${name}`)
    assert.equal(pkg.devDependencies?.[name], input.developmentHost, `missing or mixed development cohort: ${name}`)
  }
  assert.equal(pkg.devDependencies?.['@deepseek-ai/dsh-client-store'], input.developmentHost, 'client platform baseline missing')
  for (const [name, value] of Object.entries(pkg.peerDependencies ?? {})) {
    if (isHostPackage(name)) assert.equal(value, range, `${name}: unsupported peer claim`)
  }
  for (const [name, value] of Object.entries(pkg.devDependencies ?? {})) {
    if (isHostPackage(name)) assert.equal(value, input.developmentHost, `${name}: mixed host cohort`)
  }
  // The installer prioritizes this field over peers; it cannot widen the policy.
  if (Object.hasOwn(pkg.engines ?? {}, 'dsh')) assert.equal(pkg.engines.dsh, range, 'engines.dsh must match the exact host policy')
  return versions
}

export function generateHostPeers(pkg, input = policy) {
  const range = validatePolicy(input).join(' || ')
  const generated = structuredClone(pkg)
  for (const name of requiredHostPeers) assert.equal(typeof generated.peerDependencies?.[name], 'string', `missing required peer: ${name}`)
  for (const name of Object.keys(generated.peerDependencies)) if (isHostPackage(name)) generated.peerDependencies[name] = range
  validatePackageCompatibility(generated, input)
  return generated
}

export const runtimeTargets = (input = policy) => {
  validatePolicy(input)
  return input.supportedHosts.flatMap(host => host.platforms.map(os => ({ host: host.version, os })))
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const path = new URL('../package.json', import.meta.url)
  const pkg = JSON.parse(readFileSync(path, 'utf8'))
  if (process.argv.length === 3 && process.argv[2] === '--write-peers') {
    writeFileSync(path, JSON.stringify(generateHostPeers(pkg), null, 2) + '\n')
    console.log('Generated exact host peer ranges; support policy unchanged.')
  } else if (process.argv.length === 3 && process.argv[2] === '--github-output') {
    validatePackageCompatibility(pkg)
    console.log(`targets=${JSON.stringify(runtimeTargets())}`)
  } else if (process.argv.length === 2) console.log(`Compatibility targets: ${validatePackageCompatibility(pkg).join(', ')}`)
  else throw Error('Usage: compatibility.mjs [--write-peers | --github-output]')
}
