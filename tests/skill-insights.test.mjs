import assert from 'node:assert/strict'
import { test } from 'node:test'
import { detectCapabilities, extractTriggers, readingMinutes } from '../lib/client/skill-insights.js'

test('capabilities cite their evidence: scripts, commands, hooks, writes', () => {
  const markdown = [
    '# Self-Improvement',
    '```bash',
    'mkdir -p .learnings',
    '[ -f .learnings/LEARNINGS.md ] || printf "# Learnings" > .learnings/LEARNINGS.md',
    '```',
    'Optionally copy the hook to ~/.openclaw/hooks and restart the gateway.',
  ].join('\n')
  const found = detectCapabilities({
    markdown,
    files: [
      { path: 'SKILL.md' },
      { path: 'scripts/extract-skill.sh' },
      { path: 'scripts/tests/extract.test.sh' },
      { path: 'hooks/openclaw/handler.js' },
      { path: 'hooks/openclaw/handler.test.js' },
    ],
  })
  const byKind = Object.fromEntries(found.map((capability) => [capability.kind, capability]))
    // One entry script plus the commands it runs; hook handlers are their own finding.
  assert.deepEqual(byKind.shell.evidence, ['scripts/extract-skill.sh', 'mkdir', 'printf'])
  assert.equal(byKind.shell.level, 'high')
  assert.deepEqual(byKind.hooks.evidence, ['hooks/', '~/.openclaw/hooks'])
  assert.deepEqual(byKind.writes.evidence, ['.learnings/'])
})

test('declared requirements, secrets and called hosts are reported; doc links are not', () => {
  const found = detectCapabilities({
    markdown: 'Set `TAVILY_API_KEY`.\n```js\nfetch("https://api.tavily.com/search")\n// see https://github.com/x/y\n```',
    frontmatter: { metadata: '{"clawdbot":{"requires":{"bins":["git"],"env":["GH_TOKEN"]}}}' },
    files: [{ path: 'SKILL.md' }],
  })
  const byKind = Object.fromEntries(found.map((capability) => [capability.kind, capability.evidence]))
  assert.deepEqual(byKind.binaries, ['git'])
  assert.deepEqual(byKind.secrets, ['GH_TOKEN', 'TAVILY_API_KEY'])
  assert.deepEqual(byKind.network, ['api.tavily.com'])
})

test('a plain prose skill yields no capability claims at all', () => {
  assert.deepEqual(detectCapabilities({ markdown: '# Writing guide\nBe concise.', files: [{ path: 'SKILL.md' }] }), [])
})

test('triggers come from "Use when (1)… (2)…" and Chinese 当…时 phrasing', () => {
  assert.deepEqual(
    extractTriggers('Captures learnings. Use when: (1) A command fails unexpectedly, (2) User corrects Claude, (3) An external API fails'),
    ['A command fails unexpectedly', 'User corrects Claude', 'An external API fails'],
  )
  assert.deepEqual(extractTriggers('当用户需要查询医药政策、解读政策影响时使用'), ['用户需要查询医药政策', '解读政策影响'])
  assert.deepEqual(extractTriggers('A plain description.'), [])
})

test('reading time counts CJK characters and Latin words', () => {
  assert.equal(readingMinutes('word '.repeat(440)), 2)
  assert.equal(readingMinutes('字'.repeat(800)), 2)
  assert.equal(readingMinutes(''), 1)
})
