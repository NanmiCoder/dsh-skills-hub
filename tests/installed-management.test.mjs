import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtemp, mkdir, writeFile, symlink, readFile, lstat, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { scanInstalledSkills, installedLookupFrom } from '../lib/skills/installed.js'
import { readInstalledFile, readInstalledSkill, removeInstalledSkill } from '../lib/skills/management.js'

async function fixture(run) {
  const base = await mkdtemp(join(tmpdir(), 'skills-management-'))
  try { await run(base) } finally { await rm(base, { recursive: true, force: true }) }
}
async function skill(root, name, text = '---\nname: Demo\ndescription: Example skill\n---\n# Instructions') {
  await mkdir(join(root, name), { recursive: true })
  await writeFile(join(root, name, 'SKILL.md'), text)
}

test('lists and previews local bundles, flat files, links and duplicate identities independently', () => fixture(async base => {
  const roots = [join(base, 'dsh'), join(base, 'agents')]
  await skill(roots[0], 'demo')
  await skill(roots[1], 'demo')
  await writeFile(join(roots[0], 'flat.md'), '# Flat')
  await skill(base, 'target')
  await symlink(join(base, 'target'), join(roots[0], 'linked'))
  const items = await scanInstalledSkills(roots)
  assert.equal(items.length, 4)
  const duplicates = items.filter(item => item.id === 'local:demo')
  assert.equal(duplicates.length, 2)
  assert.notEqual(duplicates[0].key, duplicates[1].key)
  assert.equal(installedLookupFrom(items).info('local:demo').dirName, 'demo')
  assert.equal(items.find(item => item.dirName === 'linked').linked, true)
  const flat = items.find(item => item.dirName === 'flat')
  assert.equal((await readInstalledSkill(roots, flat.key)).markdown, '# Flat')
  await assert.rejects(readInstalledSkill(roots, '../target'), { status: 400 })
  await assert.rejects(readInstalledSkill(roots, 'f'.repeat(64)), { status: 404 })
}))

test('removes only selected local entry, preserves duplicate and symlink target', () => fixture(async base => {
  const roots = [join(base, 'dsh'), join(base, 'agents')]
  await skill(roots[0], 'demo')
  await skill(roots[1], 'demo')
  await skill(base, 'target')
  await symlink(join(base, 'target'), join(roots[0], 'linked'))
  const items = await scanInstalledSkills(roots)
  const selected = items.find(item => item.dirPath === join(roots[0], 'demo'))
  await assert.rejects(removeInstalledSkill(roots, selected.key, false), { status: 405 })
  await removeInstalledSkill(roots, selected.key, true)
  await assert.rejects(lstat(selected.dirPath), { code: 'ENOENT' })
  assert.match(await readFile(join(roots[1], 'demo', 'SKILL.md'), 'utf8'), /Instructions/)
  await removeInstalledSkill(roots, items.find(item => item.linked).key, true)
  assert.match(await readFile(join(base, 'target', 'SKILL.md'), 'utf8'), /Instructions/)
  await assert.rejects(lstat(join(roots[0], 'linked')), { code: 'ENOENT' })
}))

test('flat Markdown uninstall leaves sibling skills intact', () => fixture(async root => {
  await writeFile(join(root, 'one.md'), '# One')
  await writeFile(join(root, 'two.md'), '# Two')
  const item = (await scanInstalledSkills([root])).find(item => item.dirName === 'one')
  await removeInstalledSkill([root], item.key, true)
  assert.equal(await readFile(join(root, 'two.md'), 'utf8'), '# Two')
  await assert.rejects(removeInstalledSkill([root], item.key, true), { status: 404 })
}))

test('local management routes expose policy and honor exact-entry removal without upstream', () => fixture(async base => {
  const { createServer } = await import('node:http')
  const { registerSkillsHubRoutes } = await import('../lib/web-routes.js')
  await skill(base, 'local')
  let handler
  let allow = false
  let rescans = 0
  registerSkillsHubRoutes({ register(route) { handler = route.handler; return () => {} } }, () => undefined, {
    skillsRoot: async () => base,
    allowUninstall: () => allow,
    rescan: async () => { rescans++ },
  })
  const server = createServer((req, res) => void handler(req, res))
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  const url = `http://127.0.0.1:${server.address().port}/api/skills-hub`
  try {
    const response = await fetch(`${url}/installed`)
    const item = (await response.json()).items.find(entry => entry.dirPath === join(base, 'local'))
    assert.equal(item.removable, false)
    const detail = await fetch(`${url}/installed/detail?key=${item.key}`)
    assert.match((await detail.json()).markdown, /Instructions/)
    const file = await fetch(`${url}/installed/file?key=${item.key}&path=SKILL.md`)
    assert.equal(file.status, 200)
    assert.match((await file.json()).file.content, /Instructions/)
    assert.equal((await fetch(`${url}/installed/file?key=${item.key}&path=..%2Fsecret.md`)).status, 400)
    assert.equal((await fetch(`${url}/installed/file?key=${item.key}`)).status, 400)
    const remove = () => fetch(`${url}/installed/uninstall`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ key: item.key }) })
    assert.equal((await remove()).status, 405)
    allow = true
    assert.equal((await remove()).status, 200)
    assert.equal(rescans, 1)
    assert.equal((await fetch(`${url}/installed/detail?key=${item.key}`)).status, 404)
  } finally { await new Promise(resolve => server.close(resolve)) }
}))

test('detail carries the raw frontmatter and the entry inventory, dot-entries excluded', () => fixture(async base => {
  const roots = [join(base, 'dsh')]
  await skill(roots[0], 'demo', '---\nname: Demo\ndescription: Example\nmetadata:\n  version: 1.2.3\n---\n# Instructions')
  await writeFile(join(roots[0], 'demo', 'README.md'), '# Readme')
  await writeFile(join(roots[0], 'demo', '.DS_Store'), 'junk')
  await writeFile(join(roots[0], 'demo', '.skills-hub.json'), '{"id":"local:demo"}')
  await mkdir(join(roots[0], 'demo', 'references'), { recursive: true })
  await writeFile(join(roots[0], 'demo', 'references', 'flow.md'), 'body')

  const item = (await scanInstalledSkills(roots)).find(entry => entry.dirName === 'demo')
  const detail = await readInstalledSkill(roots, item.key)
  assert.equal(detail.frontmatter, 'name: Demo\ndescription: Example\nmetadata:\n  version: 1.2.3')
  assert.deepEqual(
    detail.files.map(file => file.path),
    ['README.md', 'references/flow.md', 'SKILL.md'],
  )
  assert.equal(detail.files.find(file => file.path === 'references/flow.md').language, 'markdown')
  assert.ok(detail.files.find(file => file.path === 'SKILL.md').size > 0)
  assert.match(detail.markdown, /# Instructions/)

  // A flat skill is its own single document, frontmatter and all.
  await writeFile(join(roots[0], 'flat.md'), '# Flat')
  const flat = (await scanInstalledSkills(roots)).find(entry => entry.dirName === 'flat')
  const flatDetail = await readInstalledSkill(roots, flat.key)
  assert.deepEqual(flatDetail.files.map(file => file.path), ['flat.md'])
  assert.equal(flatDetail.frontmatter, null)
}))

test('frontmatter extraction keeps YAML verbatim and ignores absent or unterminated headers', async () => {
  const { extractFrontmatter } = await import('../lib/skills/management.js')
  assert.equal(extractFrontmatter('---\nname: Demo\n---\n# Body'), 'name: Demo')
  assert.equal(extractFrontmatter('\uFEFF---\r\nname: Demo\r\n...\r\n# Body'), 'name: Demo')
  assert.equal(extractFrontmatter('---\n---\n# Body'), null)
  assert.equal(extractFrontmatter('---\n# No closing marker'), null)
  assert.equal(extractFrontmatter('# Body\n---\ntext'), null)
})

test('file previews stay inside the selected entry, and report truncation instead of failing', () => fixture(async base => {
  const roots = [join(base, 'dsh')]
  await skill(roots[0], 'demo')
  await writeFile(join(roots[0], 'demo', 'big.md'), 'x'.repeat(400 * 1024))
  await writeFile(join(base, 'secret.md'), 'outside')
  await symlink(join(base, 'secret.md'), join(roots[0], 'demo', 'escape.md'))
  await symlink(base, join(roots[0], 'demo', 'out'))
  await writeFile(join(roots[0], 'flat.md'), '# Flat')
  await symlink(join(roots[0], 'demo'), join(roots[0], 'linked'))

  const items = await scanInstalledSkills(roots)
  const bundle = items.find(entry => entry.dirName === 'demo')
  const flat = items.find(entry => entry.dirName === 'flat')

  const nested = await readInstalledFile(roots, bundle.key, 'SKILL.md')
  assert.match(nested.content, /Instructions/)
  assert.equal(nested.truncated, false)
  assert.equal(nested.language, 'markdown')

  const big = await readInstalledFile(roots, bundle.key, 'big.md')
  assert.equal(big.truncated, true)
  assert.equal(big.content.length, 300 * 1024)
  assert.equal(big.size, 400 * 1024)

  assert.equal((await readInstalledFile(roots, items.find(entry => entry.linked).key, 'SKILL.md')).truncated, false)
  await assert.rejects(readInstalledFile(roots, bundle.key, ''), { status: 400 })
  await assert.rejects(readInstalledFile(roots, bundle.key, '../secret.md'), { status: 400 })
  await assert.rejects(readInstalledFile(roots, bundle.key, '/etc/passwd'), { status: 400 })
  await assert.rejects(readInstalledFile(roots, bundle.key, 'escape.md'), { status: 400 })
  await assert.rejects(readInstalledFile(roots, bundle.key, 'out/secret.md'), { status: 400 })
  await assert.rejects(readInstalledFile(roots, bundle.key, 'missing.md'), { status: 404 })

  // A flat skill exposes exactly itself, never its siblings in the same root.
  assert.equal((await readInstalledFile(roots, flat.key, 'flat.md')).content, '# Flat')
  await assert.rejects(readInstalledFile(roots, flat.key, 'demo/SKILL.md'), { status: 400 })
}))

test('oversized documents stay listed but bounded preview rejects; nested links never count target files', () => fixture(async base => {
  await skill(base, 'large', '---\nname: Large\n---\n' + 'x'.repeat(3 * 1024 * 1024))
  await skill(base, 'normal')
  await symlink(join(base, 'normal'), join(base, 'normal', 'loop'))
  const items = await scanInstalledSkills([base])
  const large = items.find(item => item.name === 'Large')
  assert.ok(large)
  assert.equal(items.find(item => item.dirName === 'normal').fileCount, 1)
  await assert.rejects(readInstalledSkill([base], large.key), { status: 413 })
}))

test('frontmatter is hidden without consuming ordinary Markdown or unterminated metadata', async () => {
  const { stripSkillFrontmatter } = await import('../lib/client/skill-markdown.js')
  assert.equal(stripSkillFrontmatter('---\nname: Demo\n---\n# Body'), '# Body')
  assert.equal(stripSkillFrontmatter('\uFEFF---\r\nname: Demo\r\n...\r\n# Body'), '# Body')
  assert.equal(stripSkillFrontmatter('---\n# No closing marker'), '---\n# No closing marker')
  assert.equal(stripSkillFrontmatter('# Body\n---\ntext'), '# Body\n---\ntext')
})
