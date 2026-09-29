import assert from 'node:assert/strict'
import ts from 'typescript'
import { execFileSync } from 'node:child_process'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const temp = await mkdtemp(join(tmpdir(), 'skills-hub-pack-'))
try {
  const result = JSON.parse(execFileSync(npm, ['pack', '--ignore-scripts', '--json', '--pack-destination', temp], { encoding: 'utf8' }))[0]
  const files = new Set(result.files.map((file) => file.path))
  for (const file of ['lib/index.js', 'lib/client.js', 'lib/types/index.d.ts', 'lib/types/client/index.d.ts', 'cordis.patch.yml', 'LICENSE', 'README.md', 'README_ZH.md', 'compatibility.json']) assert(files.has(file), `missing package file ${file}`)
  for (const file of files) assert(!/(^|\/)(node_modules|src|tests|\.env|\.npmrc|\.git)(\/|$)/.test(file), `private/source file leaked: ${file}`)
  const pkg = JSON.parse(await readFile('package.json', 'utf8'))
  const targets = (value) => typeof value === 'string' ? [value] : Object.values(value).flatMap(targets)
  for (const target of targets(pkg.exports)) assert(files.has(target.replace(/^\.\//, '')), `missing export ${target}`)
  for (const file of files) {
    if (!file.endsWith('.js')) continue
    const source = await readFile(file, 'utf8')
    assert(!/\/Users\/|\/home\/[^/]+\//.test(source), `local path leaked: ${file}`)
    const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS)
    function visit(node) {
      const specifier = (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) ? node.moduleSpecifier
        : ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || ts.isIdentifier(node.expression) && node.expression.text === 'require') ? node.arguments[0] : undefined
      if (specifier && ts.isStringLiteral(specifier) && specifier.text.startsWith('.')) {
        const target = join(file, '..', specifier.text)
        assert(files.has(target), `missing runtime import ${file} -> ${target}`)
      }
      ts.forEachChild(node, visit)
    }
    visit(tree)
  }
  console.log(`pack verified: ${result.filename} (${result.entryCount} files, ${result.size} bytes)`)
} finally { await rm(temp, { recursive: true, force: true }) }
