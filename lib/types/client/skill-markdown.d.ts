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
    frontmatter: Record<string, unknown> | null;
    /** The document with its metadata block removed. */
    body: string;
}
/**
 * Parse a metadata block that has already been extracted — the Host bounds its
 * size before it reaches the browser, so this entry point works on that text.
 *
 * @param yaml - the block's text, without its fences.
 * @returns the parsed keys, or `null` when the block carries nothing to show.
 */
export declare function parseSkillFrontmatter(yaml: string): Record<string, unknown> | null;
/**
 * Separate a document's frontmatter from its body.
 *
 * @param markdown - the whole document.
 * @returns the parsed metadata (or `null`) plus the body to render.
 */
export declare function splitSkillFrontmatter(markdown: string): SkillFrontmatterSplit;
/** Frontmatter is metadata, not part of the skill's rendered instructions. */
export declare function stripSkillFrontmatter(markdown: string): string;
