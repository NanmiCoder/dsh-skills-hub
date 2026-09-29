/**
 * Manifest coherence checks for dsh-skills-hub.
 *
 * A plugin fails at install time, not at test time, when its manifest and its
 * build output disagree: an `exports` entry pointing at a missing file, a patch
 * row whose `name` no longer matches the package, or a client half that never
 * registered under the package name. These checks make that class of mistake
 * fail loudly in CI instead of silently in a user's profile.
 *
 * @param options.requireBuild - also assert built artifacts under `lib/`.
 * @returns every check with its outcome; never throws for a failed check.
 */
import { readFile, readdir, stat } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)))

/** The client module table entries a browser bundle may import values from. */
const PLATFORM_MODULES = new Set([
  'react',
  'react/jsx-runtime',
  'react-dom',
  'react-dom/client',
  '@deepseek-ai/cordis',
  '@deepseek-ai/dsh-client-store',
  '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-client-ui-primitives',
])

async function exists(path) {
  try {
    await stat(path)
    return true
  } catch {
    return false
  }
}

/**
 * Walk the client sources and collect every *value* import of an
 * `@deepseek-ai/*` module, which is exactly what the bundle purity gate
 * rejects at build time. `import type` is erased and therefore allowed.
 */
async function collectClientValueImports(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const found = []
  for (const entry of entries) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      found.push(...(await collectClientValueImports(path)))
      continue
    }
    if (!/\.tsx?$/.test(entry.name)) continue
    const source = await readFile(path, 'utf8')
    const importRe = /^\s*import\s+(?!type\b)([\s\S]*?)\s+from\s+['"]([^'"]+)['"]/gm
    for (const match of source.matchAll(importRe)) {
      const specifier = match[2]
      const clause = match[1] ?? ''
      if (!specifier?.startsWith('@deepseek-ai/')) continue
      // An inline `import { type A, type B }` clause carries no runtime value.
      const named = clause.match(/\{([\s\S]*)\}/)?.[1] ?? ''
      const hasValueBinding = clause.startsWith('*')
        || /^\s*[A-Za-z_$][\w$]*\s*(?:,|$)/.test(clause.replace(/^\{[\s\S]*\}/, ''))
        || named.split(',').some((part) => part.trim() !== '' && !/^type\b/.test(part.trim()))
      if (hasValueBinding) found.push({ file: path.slice(projectRoot.length + 1), specifier })
    }
  }
  return found
}

export async function checkManifest({ requireBuild = false } = {}) {
  const checks = []
  const record = (name, ok, detail = '') => checks.push({ name, ok, detail })

  const pkgPath = join(projectRoot, 'package.json')
  const pkg = JSON.parse(await readFile(pkgPath, 'utf8'))
  record('package.json parses', true, `${pkg.name}@${pkg.version}`)

  record('package name matches the repository', pkg.name === 'dsh-skills-hub', String(pkg.name))
  record('type is module', pkg.type === 'module', String(pkg.type))
  record('no runtime dependencies', pkg.dependencies === undefined, JSON.stringify(pkg.dependencies ?? {}))
  record('engines allow the installed Node', /(\^22\.19|\^22\.|>=22|>=24)/.test(pkg.engines?.node ?? ''), String(pkg.engines?.node))

  // exports ↔ files
  const exportTargets = []
  for (const [key, value] of Object.entries(pkg.exports ?? {})) {
    const target = typeof value === 'string' ? value : value?.default
    if (typeof target === 'string') exportTargets.push([key, target])
  }
  for (const [key, target] of exportTargets) {
    const isTypes = target.endsWith('.d.ts')
    const built = isTypes || target.endsWith('.yml')
    if (!built || !requireBuild) {
      record(`exports["${key}"] declared`, true, target)
      continue
    }
    record(`exports["${key}"] points at a built file`, await exists(join(projectRoot, target)), target)
  }

  record('exports["./client"] present', typeof pkg.exports?.['./client'] === 'object', 'client half')
  record('dsh.client.platform is web', pkg.dsh?.client?.platform === 'web', String(pkg.dsh?.client?.platform))
  record(
    'dsh.client.inject entries are plausible module names',
    Array.isArray(pkg.dsh?.client?.inject)
      && pkg.dsh.client.inject.length > 0
      && pkg.dsh.client.inject.every((name) => typeof name === 'string' && name.startsWith('@deepseek-ai/')),
    JSON.stringify(pkg.dsh?.client?.inject ?? []),
  )

  // The patch layer must add exactly our own row, named after the package.
  const patchPath = join(projectRoot, pkg.dsh?.bundle?.patch ?? 'cordis.patch.yml')
  record('dsh.bundle.patch exists', await exists(patchPath), pkg.dsh?.bundle?.patch ?? '')
  if (await exists(patchPath)) {
    const patch = await readFile(patchPath, 'utf8')
    // Rows are list items, so the key is preceded by `- ` on its own line.
    const names = [...patch.matchAll(/^\s*(?:-\s+)?name:\s*['"]?([^'"\n]+?)['"]?\s*$/gm)].map((m) => m[1])
    const ids = [...patch.matchAll(/^\s*(?:-\s+)?id:\s*['"]?([^'"\n]+?)['"]?\s*$/gm)].map((m) => m[1])
    record('patch inserts our package row', names.includes(pkg.name), names.join(', '))
    record('patch row id is stable', ids.includes('skills-hub'), ids.join(', '))
  }

  // Client purity, checked on the sources so it fails before tsdown does.
  const clientDir = join(projectRoot, 'src', 'client')
  if (await exists(clientDir)) {
    const imports = await collectClientValueImports(clientDir)
    const offenders = imports.filter((entry) => !PLATFORM_MODULES.has(entry.specifier))
    record(
      'client half imports only platform modules',
      offenders.length === 0,
      offenders.map((entry) => `${entry.file} → ${entry.specifier}`).join('; '),
    )
    const styles = await collectModuleCss(join(projectRoot, 'src'))
    record('CSS modules exist for the client half', styles.length > 0, `${styles.length} module(s)`)
    const tokenFree = []
    for (const style of styles) {
      const text = await readFile(style, 'utf8')
      for (const match of text.matchAll(/var\((--[a-z0-9-]+)/g)) {
        const token = match[1]
        if (token && !token.startsWith('--dsw-') && !token.startsWith('--skills-hub-')) {
          tokenFree.push(`${style.slice(projectRoot.length + 1)} → ${token}`)
        }
      }
    }
    record('styles use only --dsw-* theme tokens', tokenFree.length === 0, tokenFree.slice(0, 5).join('; '))
  } else {
    record('client half exists', false, 'src/client is missing')
  }

  if (requireBuild) {
    const clientBundle = join(projectRoot, 'lib', 'client.js')
    if (await exists(clientBundle)) {
      const head = (await readFile(clientBundle, 'utf8')).slice(0, 400)
      record('client bundle registers the package id', head.includes('__ModuleLoader__') && head.includes(pkg.name), 'lib/client.js banner')
    } else {
      record('lib/client.js exists', false, 'run pnpm build')
    }
    record('lib/index.js exists', await exists(join(projectRoot, 'lib', 'index.js')), 'host half')
  }

  return { ok: checks.every((check) => check.ok), checks }
}

async function collectModuleCss(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const found = []
  for (const entry of entries) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) found.push(...(await collectModuleCss(path)))
    else if (entry.name.endsWith('.module.css')) found.push(path)
  }
  return found
}

export { projectRoot, resolve }
