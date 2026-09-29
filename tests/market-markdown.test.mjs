import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'
import { test } from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

// CSS module values are irrelevant to semantic HTML assertions. The release
// build exercises the actual CSS transform separately.
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.endsWith('.module.css')) return { url: 'data:text/javascript,export default {}', shortCircuit: true }
    return nextResolve(specifier, context)
  },
})
const { MarkdownView } = await import('../lib/client/components/MarkdownView.js')
hooks.deregister()

test('skill Markdown renders headings, GFM tables, lists and fenced code', () => {
  const html = renderToStaticMarkup(React.createElement(MarkdownView, {
    content: '# Skill instructions\n\n- **First** step\n\n| Input | Output |\n| --- | --- |\n| a | b |\n\n```sh\necho hello\n```',
  }))
  assert.match(html, /<h1>Skill instructions<\/h1>/)
  assert.match(html, /<li><strong>First<\/strong> step<\/li>/)
  assert.match(html, /<table>/)
  assert.match(html, /<pre><code class="language-sh">echo hello/)
})

test('skill Markdown drops raw HTML and dangerous URLs and isolates external links', () => {
  const html = renderToStaticMarkup(React.createElement(MarkdownView, {
    content: '<script>alert(1)</script>\n\n<img src=x onerror="alert(1)">\n\n[bad](javascript:alert%281%29)\n\n[docs](https://example.com/docs)',
  }))
  assert.doesNotMatch(html, /<script|onerror|javascript:/)
  assert.match(html, /href="https:\/\/example.com\/docs" target="_blank" rel="noopener noreferrer"/)
})
