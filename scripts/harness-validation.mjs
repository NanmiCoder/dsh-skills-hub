/** Fail closed on incomplete or unrelated real-host acceptance reports. */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { runtimeTargets, policy, validatePackageCompatibility } from './compatibility.mjs'

export const requiredScenarios = ['plugin-manager-install', 'cold-boot', 'request-fence', 'client-bundle', 'install-uninstall', 'restart-cache']

export function validateRuntimeReport(report, target, expected) {
  assert.equal(report.passed, true, 'host verification did not pass')
  assert.equal(report.version, target.host, 'wrong host report')
  assert.equal(report.platform, target.os === 'windows-latest' ? 'win32' : 'linux', 'wrong platform report')
  assert.equal(report.pluginVersion, expected.pluginVersion, 'wrong plugin report')
  assert.match(expected.artifactSha256, /^[a-f0-9]{64}$/, 'expected candidate SHA-256 required')
  assert.equal(report.artifactSha256, expected.artifactSha256, 'wrong candidate artifact')
  assert(report.cohortCount > 0 && report.cohort.every(entry => entry.version === target.host), 'mixed or missing host cohort')
  assert.equal(report.cohortCount, report.cohort.length, 'incomplete cohort')
  assert(report.cohort.some(entry => entry.name === '@deepseek-ai/dsh'), 'actual host missing')
  assert(Array.isArray(report.runs) && report.runs.every(run => run.passed === true), 'failed scenario')
  for (const scenario of requiredScenarios) {
    const run = report.runs.find(run => run.scenario === scenario)
    assert(run?.passed === true && Object.keys(run.assertions ?? {}).length > 0
      && Object.values(run.assertions).every(value => value === true), `missing or incomplete scenario: ${scenario}`)
  }
}

export function validateRuntimeReports(directory, expected, input = policy) {
  const targets = runtimeTargets(input)
  for (const target of targets) {
    const report = JSON.parse(readFileSync(join(directory, `harness-${target.os}-${target.host}`, 'result.json'), 'utf8'))
    validateRuntimeReport(report, target, expected)
  }
  return targets.length
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
  validatePackageCompatibility(pkg)
  const [directory, artifactSha256] = process.argv.slice(2)
  if (!directory || !artifactSha256 || process.argv.length !== 4) throw Error('Usage: harness-validation.mjs <reports-directory> <candidate-sha256>')
  const count = validateRuntimeReports(directory, { pluginVersion: pkg.version, artifactSha256 })
  console.log(`Verified the same candidate against ${count} host/platform targets.`)
}
