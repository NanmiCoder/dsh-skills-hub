import assert from 'node:assert/strict'
import { test } from 'node:test'
import { checkManifest } from '../scripts/manifest.mjs'

test('manifest stays coherent with the sources', async () => {
  const { checks } = await checkManifest({ requireBuild: false })
  const failed = checks.filter((check) => !check.ok)
  assert.deepEqual(
    failed.map((check) => `${check.name}: ${check.detail}`),
    [],
    'manifest checks must all pass before a build',
  )
})
