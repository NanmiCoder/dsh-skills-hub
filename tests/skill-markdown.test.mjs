/**
 * Frontmatter splitting, on the built client artifact.
 *
 * The cases below are the shapes real SKILL.md files use — the point of the
 * module is that a document's closing `---` must never reach the markdown
 * renderer, where it would promote the whole metadata block into one heading.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseSkillFrontmatter, splitSkillFrontmatter, stripSkillFrontmatter } from '../lib/client/skill-markdown.js'

test('scalars keep their YAML meaning, and quoted values stay text', () => {
  const { frontmatter, body } = splitSkillFrontmatter(
    [
      '---',
      'name: anti-fraud',
      'version: "1.7.0"',
      'count: 3',
      'ratio: 0.5',
      'padded: 007',
      'enabled: true',
      'disabled: false',
      'missing: null',
      'tilde: ~',
      'commented: value # trailing note',
      'quoted-hash: "value # not a comment"',
      "single: 'it''s fine'",
      '---',
      '# Body',
    ].join('\n'),
  )

  assert.deepEqual(frontmatter, {
    name: 'anti-fraud',
    version: '1.7.0',
    count: 3,
    ratio: 0.5,
    padded: '007',
    enabled: true,
    disabled: false,
    missing: null,
    tilde: null,
    commented: 'value',
    'quoted-hash': 'value # not a comment',
    single: "it's fine",
  })
  assert.equal(body, '# Body')
})

test('sequences parse inline and as blocks; nested mappings stay verbatim YAML', () => {
  const { frontmatter } = splitSkillFrontmatter(
    [
      '---',
      'tags: [anti-fraud, "话术, 识别", 3]',
      'when_to_use:',
      '  - 收到可疑短信',
      '  - 家人求助',
      'metadata:',
      '  version: 1.0.11',
      '  author: community',
      'empty:',
      '---',
      '# Body',
    ].join('\n'),
  )

  assert.deepEqual(frontmatter.tags, ['anti-fraud', '话术, 识别', 3])
  assert.deepEqual(frontmatter.when_to_use, ['收到可疑短信', '家人求助'])
  assert.equal(frontmatter.metadata, 'version: 1.0.11\nauthor: community')
  assert.equal(frontmatter.empty, null)
})

test('block scalars fold with `>` and keep lines with `|`', () => {
  const { frontmatter } = splitSkillFrontmatter(
    [
      '---',
      'literal: |',
      '  first line',
      '  second line',
      'folded: >',
      '  folded into',
      '  one paragraph',
      '---',
      '# Body',
    ].join('\n'),
  )

  assert.equal(frontmatter.literal, 'first line\nsecond line')
  assert.equal(frontmatter.folded, 'folded into one paragraph')
})

test('a body never starts inside the metadata block', () => {
  const { body } = splitSkillFrontmatter('---\nname: Demo\ndescription: Example\n---\n\n# 防骗大师\n\ntext')
  assert.equal(body, '# 防骗大师\n\ntext')
  // The hazard this module exists for: `---` in the renderer is a setext rule.
  assert.equal(body.includes('name: Demo'), false)
})

test('missing, unterminated and empty fences degrade instead of throwing', () => {
  const withoutFence = splitSkillFrontmatter('# Body\n---\ntext')
  assert.equal(withoutFence.frontmatter, null)
  assert.equal(withoutFence.body, '# Body\n---\ntext')

  const unterminated = splitSkillFrontmatter('---\nname: Demo\n# still going')
  assert.equal(unterminated.frontmatter, null)
  assert.equal(unterminated.body, '---\nname: Demo\n# still going')

  const empty = splitSkillFrontmatter('---\n---\n# Body')
  assert.equal(empty.frontmatter, null)
  assert.equal(empty.body, '# Body')

  assert.deepEqual(splitSkillFrontmatter(''), { frontmatter: null, body: '' })
  assert.deepEqual(parseSkillFrontmatter('   '), null)
  assert.deepEqual(parseSkillFrontmatter('# only a comment'), null)
})

test('BOM and CRLF documents split like their LF twins', () => {
  const { frontmatter, body } = splitSkillFrontmatter('\uFEFF---\r\nname: Demo\r\nmetadata:\r\n  version: 1.0.0\r\n...\r\n# Body')
  assert.equal(frontmatter.name, 'Demo')
  assert.equal(stripSkillFrontmatter('\uFEFF---\r\nname: Demo\r\n...\r\n# Body'), '# Body')
  assert.equal(body, '# Body')
})

test('a metadata block is returned as structure, not as text', () => {
  const parsed = parseSkillFrontmatter('name: Demo\ntags: [a, b]')
  assert.deepEqual(parsed, { name: 'Demo', tags: ['a', 'b'] })
  assert.equal(parseSkillFrontmatter(''), null)
})
