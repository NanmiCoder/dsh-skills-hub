import { spawnSync } from 'node:child_process'
import { appendFileSync, readFileSync } from 'node:fs'
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
  if (metadata.versions?.includes(pkg.version)) {
    assert(process.argv.includes('--allow-existing-commit'), 'version already published')
    const version = spawnSync('npm', ['view', `${pkg.name}@${pkg.version}`, '--json'], { encoding: 'utf8' })
    assert.equal(version.status, 0, 'cannot verify published version')
    const published = JSON.parse(version.stdout)
    const head = spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' })
    assert.equal(head.status, 0, 'cannot resolve release commit')
    assert.equal(published.gitHead, head.stdout.trim(), 'published version does not match the release commit')
    assert.equal(published.repository?.url, pkg.repository.url, 'published version repository mismatch')
    if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, 'already_published=true\n')
    console.log(`${pkg.name}@${pkg.version}: already published from this exact commit; skipping duplicate publication`)
    process.exit(0)
  }
  const latest = metadata['dist-tags']?.latest
  if (pkg.publishConfig.tag === 'latest' && latest) assert(semver.gt(pkg.version, latest), `latest is already ${latest}`)
  console.log(`${pkg.name}: registry version preflight passed`)
}
