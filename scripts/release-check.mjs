import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import semver from 'semver'
const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url)))
const compatibility = JSON.parse(await readFile(new URL('../compatibility.json', import.meta.url)))
assert.equal(pkg.version, compatibility.pluginVersion, 'compatibility version must match package')
assert(semver.valid(pkg.version), 'valid release version required')
assert.equal(pkg.publishConfig.access, 'public')
assert.equal(pkg.publishConfig.registry, 'https://registry.npmjs.org/')
assert.equal(pkg.publishConfig.tag, semver.prerelease(pkg.version) ? compatibility.previewTag : 'latest')
for (const [name, version] of Object.entries(pkg.devDependencies)) {
  if (name.startsWith('@deepseek-ai/dsh-')) assert.equal(version, compatibility.recommendedHost, `${name}: mixed host cohort`)
}
for (const [name, range] of Object.entries(pkg.peerDependencies)) {
  if (name.startsWith('@deepseek-ai/dsh-')) assert.equal(range, compatibility.supportedHosts.join(' || '), `${name}: unsupported peer claim`)
}
await readFile(new URL(`../release-notes/v${pkg.version}.md`, import.meta.url))
if (process.env.RELEASE_TAG) assert.equal(process.env.RELEASE_TAG, `v${pkg.version}`, 'release tag mismatch')
if (process.env.RELEASE_PRERELEASE) assert.equal(process.env.RELEASE_PRERELEASE, String(Boolean(semver.prerelease(pkg.version))), 'GitHub prerelease mismatch')
if (process.env.CURRENT_LATEST) assert(!semver.lt(pkg.version, process.env.CURRENT_LATEST), 'refusing to move latest backwards')
console.log(`release metadata: ${pkg.name}@${pkg.version}, host ${compatibility.recommendedHost}`)
