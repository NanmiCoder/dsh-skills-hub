/** Verify the immutable registry artifact, then install it in a fresh real host. */
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { resolve, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { policy, validatePackageCompatibility } from './compatibility.mjs'

export async function verifiedRegistryBytes(pkg, support, expectedSha256, { fetcher = fetch, wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds)) } = {}) {
  assert.match(expectedSha256, /^[a-f0-9]{64}$/)
  let metadata
  for (let attempt = 0; attempt < 8; attempt++) {
    const response = await fetcher(`https://registry.npmjs.org/${encodeURIComponent(pkg.name)}/${pkg.version}`, { signal: AbortSignal.timeout(15_000) })
    if (response.ok) { metadata = await response.json(); break }
    assert([404, 429, 500, 502, 503, 504].includes(response.status), `registry lookup failed: ${response.status}`)
    if (attempt < 7) await wait(Math.min(1000 * 2 ** attempt, 8000))
  }
  assert(metadata, 'published version did not become available on the official registry')
  assert.equal(metadata.name, pkg.name)
  validatePackageCompatibility(metadata, support)
  assert.equal(metadata.repository?.url, pkg.repository.url, 'wrong published repository')
  const url = new URL(metadata.dist.tarball)
  assert.equal(url.origin, 'https://registry.npmjs.org', 'unexpected artifact origin')
  const response = await fetcher(url, { signal: AbortSignal.timeout(60_000) })
  assert(response.ok, `artifact download failed: ${response.status}`)
  const bytes = Buffer.from(await response.arrayBuffer())
  assert.equal(createHash('sha256').update(bytes).digest('hex'), expectedSha256, 'registry artifact differs from the verified candidate')
  const integrity = `sha512-${createHash('sha512').update(bytes).digest('base64')}`
  assert.equal(metadata.dist.integrity, integrity, 'registry integrity mismatch')
  return bytes
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [reportDirectory, expectedSha256] = process.argv.slice(2)
  assert(reportDirectory && process.argv.length === 4, 'Usage: registry-smoke.mjs <fresh-report-dir> <expected-sha256>')
  const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
  const bytes = await verifiedRegistryBytes(pkg, policy, expectedSha256)
  const report = resolve(reportDirectory)
  await mkdir(report, { recursive: true })
  const artifact = join(report, 'published.tgz')
  await writeFile(artifact, bytes)
  const child = spawn(process.execPath, [fileURLToPath(new URL('./harness-runtime-verify.mjs', import.meta.url)), '--host-version', policy.recommendedHost, '--expected-plugin-version', pkg.version, '--artifact', artifact, '--report-dir', join(report, 'host')], { stdio: 'inherit' })
  const [code] = await once(child, 'close')
  assert.equal(code, 0, 'published package failed actual host smoke')
}
