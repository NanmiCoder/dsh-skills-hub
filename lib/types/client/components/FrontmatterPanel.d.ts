/**
 * Structured view of a SKILL.md frontmatter block.
 *
 * SKILL.md metadata is data, not prose: pushing it through the markdown
 * renderer turns a dozen short fields into a wall of setext headings. It is
 * also reference material rather than the document itself, so it renders as a
 * label/value list under its own heading, with the list itself scrolling once a
 * skill declares more than a screenful of keys.
 *
 * `data` is typed `unknown`-valued on purpose — it is upstream YAML, and every
 * cell is derived defensively rather than trusted.
 */
export declare function FrontmatterPanel(props: {
    data: Record<string, unknown>;
}): JSX.Element;
