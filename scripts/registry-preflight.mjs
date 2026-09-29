import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'
import semver from 'semver'
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)))
const result = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['view', pkg.name, '--json'], { encoding: 'utf8' })
if (result.status !== 0) {
  let error
  try { error = JSON.parse(result.stdout).error } catch {}
  assert.equal(error?.code, 'E404', `registry lookup failed: ${result.stderr}`)
  console.log(`${pkg.name}: first publication; registry name is not currently published`)
} else {
  const metadata = JSON.parse(result.stdout)
  assert.equal(metadata.repository?.url, pkg.repository.url, 'registry package belongs to a different repository')
  assert(!metadata.versions?.includes(pkg.version), 'version already published')
  const latest = metadata['dist-tags']?.latest
  if (pkg.publishConfig.tag === 'latest' && latest) assert(semver.gt(pkg.version, latest), `latest is already ${latest}`)
  console.log(`${pkg.name}: registry version preflight passed`)
}
