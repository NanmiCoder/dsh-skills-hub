/**
 * Frontmatter handling for skill documents.
 *
 * A `SKILL.md` opens with a YAML block, and feeding that block to a markdown
 * renderer is not merely ugly — it is wrong: a lone `---` is a setext underline,
 * so the closing fence promotes the whole metadata block into one giant heading.
 * The block is split off here instead, so the UI can render it as structured
 * metadata (`FrontmatterPanel`) while the rest of the document goes to the
 * renderer. The approach mirrors the desktop project's `skillFrontmatter.ts`.
 *
 * The parser is a deliberately small YAML subset — scalars, inline and block
 * sequences, `|`/`>` block scalars, and one level of nested mapping that is kept
 * as the raw YAML it is — because skill frontmatter is flat by convention and a
 * full YAML engine is a dependency this browser bundle does not need. It never
 * throws: a document without a fence, or with an unterminated one, comes back as
 * body only.
 */

/** One document separated into its metadata and everything else. */
export interface SkillFrontmatterSplit {
  /** Parsed metadata, or `null` when the document carries none worth showing. */
  frontmatter: Record<string, unknown> | null
  /** The document with its metadata block removed. */
  body: string
}

/** A fence closing the block; it must sit at column zero. */
const CLOSING_FENCE = /^(?:---|\.\.\.)[ \t]*$/
/** Top-level `key:` or `key: value`. Indented lines belong to the value above. */
const KEY_LINE = /^([A-Za-z0-9_$][\w.$-]*)[ \t]*:(?:[ \t]+(.*))?$/
/** `|`, `>`, optionally with chomping and indentation indicators. */
const BLOCK_SCALAR = /^([|>])([-+]?)(\d*)$/

function isBlank(line: string): boolean {
  return line.trim() === ''
}

/** Visual indentation width; a tab counts as two columns, as YAML's own rules do. */
function indentWidth(line: string): number {
  let width = 0
  for (const char of line) {
    if (char === ' ') width += 1
    else if (char === '\t') width += 2
    else break
  }
  return width
}

/** One pair of surrounding quotes, with the escapes YAML defines for it. */
function stripQuotes(raw: string): { value: string; quoted: boolean } {
  if (raw.length >= 2) {
    const first = raw[0]
    const last = raw[raw.length - 1]
    if (first === '"' && last === '"') {
      return { value: raw.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\'), quoted: true }
    }
    if (first === "'" && last === "'") {
      return { value: raw.slice(1, -1).replace(/''/g, "'"), quoted: true }
    }
  }
  return { value: raw, quoted: false }
}

/** Drop a trailing ` # comment`, but only when it sits outside quotes. */
function stripComment(raw: string): string {
  let quote: string | null = null
  for (let index = 0; index < raw.length; index++) {
    const char = raw[index]
    if (quote !== null) {
      if (char === quote) quote = null
      continue
    }
    if (char === '"' || char === "'") {
      quote = char
      continue
    }
    if (char === '#' && (index === 0 || raw[index - 1] === ' ' || raw[index - 1] === '\t')) {
      return raw.slice(0, index)
    }
  }
  return raw
}

/** Scalars keep their YAML meaning where it is unambiguous, and stay text otherwise. */
function coerceScalar(raw: string): unknown {
  const trimmed = raw.trim()
  if (trimmed === '') return ''
  const { value, quoted } = stripQuotes(trimmed)
  // A quoted value is text: `version: "1.7.0"` must not become 1.7.
  if (quoted) return value

  const lower = value.toLowerCase()
  if (lower === 'true') return true
  if (lower === 'false') return false
  if (lower === 'null' || lower === '~') return null
  // Plain integers and decimals only; a leading zero stays text so identifiers
  // and zero-padded versions survive the round trip.
  if (/^-?(?:0|[1-9]\d*)(?:\.\d+)?$/.test(value)) return Number(value)
  return value
}

/** Split `[a, "b, c", d]` on top-level commas only. */
function splitInlineSequence(inner: string): string[] {
  const parts: string[] = []
  let current = ''
  let quote: string | null = null
  let depth = 0
  for (const char of inner) {
    if (quote !== null) {
      current += char
      if (char === quote) quote = null
      continue
    }
    if (char === '"' || char === "'") {
      quote = char
      current += char
      continue
    }
    if (char === '[' || char === '{') depth += 1
    if (char === ']' || char === '}') depth -= 1
    if (char === ',' && depth === 0) {
      parts.push(current)
      current = ''
      continue
    }
    current += char
  }
  parts.push(current)
  return parts.map((part) => part.trim()).filter((part) => part !== '')
}

/**
 * Remove a block's common indentation and its blank edges.
 *
 * @param lines - the block's lines, verbatim.
 * @param folded - `>` joins the lines into one paragraph; `|` keeps them.
 */
function dedent(lines: string[], folded: boolean): string {
  const margin = lines.reduce(
    (min, line) => (isBlank(line) ? min : Math.min(min, indentWidth(line))),
    Number.MAX_SAFE_INTEGER,
  )
  const dedented = lines.map((line) =>
    isBlank(line) ? '' : line.slice(margin === Number.MAX_SAFE_INTEGER ? 0 : margin),
  )
  while (dedented.length > 0 && isBlank(dedented[0] ?? '')) dedented.shift()
  while (dedented.length > 0 && isBlank(dedented[dedented.length - 1] ?? '')) dedented.pop()
  return folded ? dedented.join(' ').replace(/\s+/g, ' ').trim() : dedented.join('\n')
}

/** Parse the top-level keys of one YAML block. Shapes this subset does not model stay verbatim. */
function parseBlock(yaml: string): Record<string, unknown> {
  const lines = yaml.split('\n')
  const result: Record<string, unknown> = {}
  let index = 0

  while (index < lines.length) {
    const line = lines[index] ?? ''
    index += 1
    // Indented lines belong to the key above; a stray one is simply not a key.
    if (isBlank(line) || line.trimStart().startsWith('#') || indentWidth(line) > 0) continue
    const match = KEY_LINE.exec(line)
    if (match === null) continue
    const key = match[1] ?? ''
    const inline = match[2] ?? ''

    const blockScalar = BLOCK_SCALAR.exec(inline.trim())
    if (blockScalar !== null) {
      const collected: string[] = []
      while (index < lines.length) {
        const next = lines[index] ?? ''
        if (!isBlank(next) && indentWidth(next) === 0) break
        collected.push(next)
        index += 1
      }
      result[key] = dedent(collected, blockScalar[1] === '>')
      continue
    }

    const value = stripComment(inline).trim()
    if (value !== '') {
      result[key] =
        value.startsWith('[') && value.endsWith(']')
          ? splitInlineSequence(value.slice(1, -1)).map(coerceScalar)
          : coerceScalar(value)
      continue
    }

    // An empty inline value means the payload is indented: a sequence, a nested
    // mapping, or nothing at all.
    const children: string[] = []
    while (index < lines.length) {
      const next = lines[index] ?? ''
      if (!isBlank(next) && indentWidth(next) === 0) break
      children.push(next)
      index += 1
    }
    const meaningful = children.filter((entry) => !isBlank(entry) && !entry.trimStart().startsWith('#'))
    if (meaningful.length === 0) {
      result[key] = null
      continue
    }
    if (meaningful.every((entry) => entry.trimStart().startsWith('- '))) {
      result[key] = meaningful.map((entry) => coerceScalar(stripComment(entry.trimStart().slice(2))))
      continue
    }
    // A nested mapping stays the YAML it is: the panel shows it verbatim rather
    // than pretending to understand a shape this subset does not model.
    result[key] = dedent(children, false)
  }

  return result
}

/**
 * Parse a metadata block that has already been extracted — the Host bounds its
 * size before it reaches the browser, so this entry point works on that text.
 *
 * @param yaml - the block's text, without its fences.
 * @returns the parsed keys, or `null` when the block carries nothing to show.
 */
export function parseSkillFrontmatter(yaml: string): Record<string, unknown> | null {
  if (yaml.trim() === '') return null
  try {
    const parsed = parseBlock(yaml.replace(/\r\n/g, '\n'))
    return Object.keys(parsed).length === 0 ? null : parsed
  } catch {
    // A malformed block must not take the document down with it.
    return null
  }
}

/**
 * Separate a document's frontmatter from its body.
 *
 * @param markdown - the whole document.
 * @returns the parsed metadata (or `null`) plus the body to render.
 */
export function splitSkillFrontmatter(markdown: string): SkillFrontmatterSplit {
  const source = markdown.startsWith('\uFEFF') ? markdown.slice(1) : markdown
  const lines = source.replace(/\r\n/g, '\n').split('\n')
  if (!/^---[ \t]*$/.test(lines[0] ?? '')) return { frontmatter: null, body: markdown }

  for (let index = 1; index < lines.length; index++) {
    if (!CLOSING_FENCE.test(lines[index] ?? '')) continue
    const body = lines.slice(index + 1).join('\n').replace(/^\n+/, '')
    return { frontmatter: parseSkillFrontmatter(lines.slice(1, index).join('\n')), body }
  }
  // Unterminated fence: the document is ordinary Markdown, not metadata.
  return { frontmatter: null, body: markdown }
}

/** Frontmatter is metadata, not part of the skill's rendered instructions. */
export function stripSkillFrontmatter(markdown: string): string {
  return splitSkillFrontmatter(markdown).body
}
