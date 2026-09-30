/**
 * Self-contained GFM rendering for untrusted marketplace and local skill docs.
 *
 * Raw HTML is skipped and external links are opened with `noopener noreferrer`;
 * the typography lives in the detail shell so a rendered document looks the same
 * in the overview tab and in the file viewer.
 */
export declare function MarkdownView({ content }: {
    content: string;
}): JSX.Element;
