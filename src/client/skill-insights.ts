/**
 * What a skill will do, read off its own files — before anyone installs it.
 *
 * Everything here is rule-based and explainable: each finding points at the
 * file, command, variable or host it came from, and nothing is inferred that
 * the SKILL.md and file list do not show. When no rule fires, the panel is not
 * rendered at all; an empty "this skill does nothing risky" claim would be a
 * verdict this module cannot make.
 */

import type { MarketFileMeta } from '../market/types.ts'

export type CapabilityKind = 'shell' | 'hooks' | 'network' | 'secrets' | 'binaries' | 'writes'
export type CapabilityLevel = 'high' | 'medium' | 'low'

export interface Capability {
  kind: CapabilityKind
  level: CapabilityLevel
  /** The evidence, verbatim: paths, commands, variable names or hosts. */
  evidence: string[]
}

const SCRIPT_EXTENSIONS = /\.(sh|bash|zsh|py|js|mjs|cjs|ts|rb|ps1|pl|php|go|rs)$/i
const SHELL_FENCE = /```(?:bash|sh|shell|zsh|console|terminal)\s*\n([\s\S]*?)```/gi
const ANY_FENCE = /```[^\n]*\n([\s\S]*?)```/g
const ENV_SECRET = /\b([A-Z][A-Z0-9]*_(?:API_KEY|APIKEY|KEY|TOKEN|SECRET|ACCESS_KEY|SECRET_KEY|PASSWORD))\b/g
const URL_HOST = /https?:\/\/([a-z0-9.-]+\.[a-z]{2,})(?::\d+)?[/\w.?=&%-]*/gi
/** Hosts that are documentation links rather than something the skill calls. */
const DOC_HOSTS = /(^|\.)(github\.com|githubusercontent\.com|clawhub\.ai|skillhub\.cn|npmjs\.com|pypi\.org|wikipedia\.org|example\.com|localhost)$/i
const WRITE_COMMAND = /(^|[\s;&|])(mkdir|touch|tee|cp|mv|rm|printf[^\n]*>|echo[^\n]*>|cat\s*>)\b/m

/** Shell builtins and plumbing that say nothing about what a skill does. */
const SHELL_NOISE = new Set(['cd', 'echo', 'export', 'set', 'then', 'fi', 'do', 'done', 'else', 'if', 'test', 'true', 'false', 'source', 'cat', 'ls'])

const LEVEL_OF: Record<CapabilityKind, CapabilityLevel> = {
  shell: 'high',
  hooks: 'high',
  secrets: 'medium',
  network: 'medium',
  writes: 'medium',
  binaries: 'low',
}

function unique(values: Iterable<string>, limit: number): string[] {
  return [...new Set(values)].slice(0, limit)
}

/** `metadata.<any agent>.requires.{bins,env}` — the common SKILL.md convention. */
function declaredRequirements(frontmatter: Record<string, unknown> | undefined): { bins: string[]; env: string[] } {
  const bins: string[] = []
  const env: string[] = []
  let metadata = frontmatter?.['metadata']
  if (typeof metadata === 'string') {
    try {
      metadata = JSON.parse(metadata)
    } catch {
      metadata = undefined
    }
  }
  const visit = (value: unknown, depth: number): void => {
    if (depth > 4 || typeof value !== 'object' || value === null) return
    const record = value as Record<string, unknown>
    const requires = record['requires']
    if (typeof requires === 'object' && requires !== null) {
      const req = requires as Record<string, unknown>
      for (const bin of Array.isArray(req['bins']) ? req['bins'] : []) if (typeof bin === 'string') bins.push(bin)
      for (const name of Array.isArray(req['env']) ? req['env'] : []) if (typeof name === 'string') env.push(name)
    }
    for (const child of Object.values(record)) visit(child, depth + 1)
  }
  visit(metadata, 0)
  return { bins, env }
}

export function detectCapabilities(input: {
  markdown: string
  frontmatter?: Record<string, unknown>
  files: readonly Pick<MarketFileMeta, 'path'>[]
}): Capability[] {
  const { markdown, files } = input
  const found = new Map<CapabilityKind, string[]>()
  const add = (kind: CapabilityKind, evidence: string[]): void => {
    if (evidence.length > 0) found.set(kind, unique([...(found.get(kind) ?? []), ...evidence], 3))
  }

  // Tests and hook handlers are not what a reader runs; the scripts they would
  // run come first, shortest path first (top-level entry points before helpers).
  const scripts = files
    .map((file) => file.path)
    .filter((path) => SCRIPT_EXTENSIONS.test(path) && !/(^|[/.])(test|spec)s?([/.]|$)/i.test(path))
    .filter((path) => !/(^|\/)hooks?\//i.test(path))
    .sort((a, b) => a.split('/').length - b.split('/').length || a.length - b.length)
  const shellBlocks = [...markdown.matchAll(SHELL_FENCE)].map((match) => match[1] ?? '')
  const firstCommands = shellBlocks
    .flatMap((block) => block.split('\n'))
    .map((line) => line.replace(/^\s*\$\s*/, '').trim())
    .filter((line) => line !== '' && !line.startsWith('#'))
    .flatMap((line) => line.split(/\s*(?:\|\||&&|;|\|)\s*/))
    .map((segment) => segment.replace(/^\[.*?\]\s*/, '').split(/\s+/)[0] ?? '')
    .filter((command) => /^[a-z][\w.-]*$/i.test(command) && !SHELL_NOISE.has(command))
  add('shell', [...scripts.slice(0, 1), ...unique(firstCommands, 2)])

  // A hook directory is one finding, not one per file inside it.
  const hookDirs = files
    .map((file) => /^(.*?(?:^|\/)hooks?\/)/i.exec(file.path)?.[1])
    .filter((dir): dir is string => dir !== undefined)
  add('hooks', unique(hookDirs, 1))
  // A whole home- or project-relative path (`~/.openclaw/hooks`), never a fragment of one.
  const hookTarget = /(?:^|[\s`'"(])((?:~|\.)\/[\w./-]*?hooks)\b/i.exec(markdown)?.[1]
  if (hookTarget !== undefined && /hook/i.test(markdown)) add('hooks', [hookTarget])

  const declared = declaredRequirements(input.frontmatter)
  add('binaries', declared.bins)
  add('secrets', [...declared.env, ...[...markdown.matchAll(ENV_SECRET)].map((match) => match[1] ?? '')])

  const code = [...markdown.matchAll(ANY_FENCE)].map((match) => match[1] ?? '').join('\n')
  const hosts = [...code.matchAll(URL_HOST)]
    .map((match) => (match[1] ?? '').toLowerCase())
    .filter((host) => host !== '' && !DOC_HOSTS.test(host))
  add('network', hosts)

  if (shellBlocks.some((block) => WRITE_COMMAND.test(block))) {
    // Report where writes land (the directory), not every file written there.
    const places = shellBlocks
      .flatMap((block) => [...block.matchAll(/(?:mkdir\s+(?:-p\s+)?|>\s*)([.\w~/-]+)/g)].map((match) => match[1] ?? ''))
      .filter((path) => path !== '' && path !== '/dev/null')
      .map((path) => (path.includes('/') ? `${path.split('/').slice(0, -1).join('/')}/` : path.startsWith('.') ? `${path}/` : path))
    add('writes', places.length > 0 ? unique(places, 2) : ['files'])
  }

  const order: CapabilityKind[] = ['shell', 'hooks', 'secrets', 'network', 'writes', 'binaries']
  return order.filter((kind) => found.has(kind)).map((kind) => ({ kind, level: LEVEL_OF[kind], evidence: found.get(kind) ?? [] }))
}

/**
 * The "when to use" list a SKILL.md description usually carries:
 * `Use when (1) …, (2) …` / `Use when: …; …` / `当……时使用`.
 */
export function extractTriggers(description: string | undefined): string[] {
  if (!description) return []
  const text = description.replace(/\s+/g, ' ').trim()
  const english = /\b(?:use|activate|trigger(?:ed)?)\s+(?:it\s+|this\s+)?when\b:?\s*(.+)$/i.exec(text)
  let body = english?.[1]
  if (body === undefined) {
    const chinese = /(?:适用于|使用场景[:：]|触发场景[:：]|当)(.+?)(?:时(?:使用|触发|调用)|$)/.exec(text)
    body = chinese?.[1]
  }
  if (body === undefined) return []
  const numbered = body.split(/\s*\(\d+\)\s*|\s*（\d+）\s*|\s*\d+[.、)]\s+/).map((item) => item.trim()).filter(Boolean)
  const items = numbered.length > 1 ? numbered : body.split(/[;；。]|,\s*or\s+|、/)
  return items
    .map((item) => item.replace(/^(?:or|and|或|以及)\s+/i, '').replace(/[,，;；.。]+$/, '').trim())
    .filter((item) => item.length >= 3)
    .map((item) => (item.length > 64 ? `${item.slice(0, 63)}…` : item))
    .slice(0, 5)
}

/** Rough reading time: ~400 CJK characters or ~220 Latin words per minute. */
export function readingMinutes(markdown: string): number {
  const cjk = (markdown.match(/[㐀-鿿]/g) ?? []).length
  const words = (markdown.replace(/[㐀-鿿]/g, ' ').match(/[A-Za-z0-9_]+/g) ?? []).length
  return Math.max(1, Math.round(cjk / 400 + words / 220))
}
