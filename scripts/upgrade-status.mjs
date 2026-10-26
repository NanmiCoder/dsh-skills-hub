/** Read-only registry status. Discovery never changes or approves host support. */
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { policy, validatePackageCompatibility } from './compatibility.mjs'

export function assessUpgradeStatus(pkg, support, hostMetadata, pluginMetadata) {
  const supported = validatePackageCompatibility(pkg, support)
  const upstream = [...new Set(['latest', 'next'].map(tag => hostMetadata['dist-tags']?.[tag]).filter(Boolean))]
  const publishedVersion = pluginMetadata['dist-tags']?.latest
  const published = pluginMetadata.versions?.[publishedVersion]
  const expectedRange = supported.join(' || ')
  const releaseGap = !published || publishedVersion !== pkg.version
    || Object.entries(pkg.peerDependencies).some(([name]) => name.startsWith('@deepseek-ai/dsh-') && published.peerDependencies?.[name] !== expectedRange)
  return {
    upstreamTags: hostMetadata['dist-tags'], supported,
    unverifiedHosts: upstream.filter(version => !supported.includes(version)),
    sourcePluginVersion: pkg.version, publishedPluginVersion: publishedVersion ?? null,
    releaseGap,
  }
}

export async function registryMetadata(name, fetcher = fetch) {
  const response = await fetcher(`https://registry.npmjs.org/${encodeURIComponent(name)}`, { signal: AbortSignal.timeout(30_000) })
  if (!response.ok) throw Error(`Registry lookup failed for ${name}: HTTP ${response.status}`)
  const data = await response.json()
  if (data.name !== name || typeof data.versions !== 'object' || !data['dist-tags']) throw Error(`Malformed registry metadata: ${name}`)
  return data
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.length !== 2) throw Error('Usage: upgrade-status.mjs')
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
  const [host, plugin] = await Promise.all([registryMetadata('@deepseek-ai/dsh'), registryMetadata(pkg.name)])
  const status = assessUpgradeStatus(pkg, policy, host, plugin)
  console.log(JSON.stringify({ checkedAt: new Date().toISOString(), ...status }, null, 2))
  if (status.unverifiedHosts.length) console.log(`Upstream hosts await verification: ${status.unverifiedHosts.join(', ')}`)
  if (status.releaseGap) console.log('Source support/version differs from npm latest; publication is a separate authorized step.')
}
