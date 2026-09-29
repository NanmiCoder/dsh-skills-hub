/** Frontmatter is metadata, not part of the skill's rendered instructions. */
export function stripSkillFrontmatter(markdown) {
    return markdown.replace(/^\uFEFF?---[ \t]*\r?\n[\s\S]*?\r?\n(?:---|\.\.\.)[ \t]*(?:\r?\n|$)/, '');
}
