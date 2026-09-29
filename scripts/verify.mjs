#!/usr/bin/env node
/**
 * Project gate: manifest coherence first (cheap, catches install-time breakage),
 * then the test suite. Run after `pnpm build` so the built-artifact checks apply.
 */
import { spawn } from 'node:child_process'
import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { checkManifest, projectRoot } from './manifest.mjs'

const requireBuild = !process.argv.includes('--no-build')

function line(ok, name, detail) {
  const mark = ok ? '\u001b[32m✓\u001b[0m' : '\u001b[31m✗\u001b[0m'
  process.stdout.write(`${mark} ${name}${detail ? ` \u001b[2m(${detail})\u001b[0m` : ''}\n`)
}

const manifest = await checkManifest({ requireBuild })
process.stdout.write('\nmanifest\n')
for (const check of manifest.checks) line(check.ok, check.name, check.detail)

let testsOk = true
const testsDir = join(projectRoot, 'tests')
let testFiles = []
try {
  testFiles = (await readdir(testsDir)).filter((name) => name.endsWith('.test.mjs'))
} catch {
  testFiles = []
}

if (testFiles.length > 0) {
  process.stdout.write('\ntests\n')
  testsOk = await new Promise((resolvePromise) => {
    const child = spawn(process.execPath, ['--test', ...testFiles.map((name) => join(testsDir, name))], {
      cwd: projectRoot,
      stdio: 'inherit',
    })
    child.on('close', (code) => resolvePromise(code === 0))
  })
}

const ok = manifest.ok && testsOk
process.stdout.write(`\n${ok ? '\u001b[32mverify: ok\u001b[0m' : '\u001b[31mverify: failed\u001b[0m'}\n`)
process.exit(ok ? 0 : 1)
