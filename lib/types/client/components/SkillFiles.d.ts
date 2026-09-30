/**
 * Files tab body, shared by the two detail pages.
 *
 * The market page lists provider file metadata and the local page lists the
 * bytes on disk, but both are the same control: a picker on the left, one
 * document on the right, and a copy button that confirms itself. The only
 * difference the caller keeps is how a selection is fetched.
 *
 * A markdown document opens *rendered*: SKILL.md is prose meant to be read, and
 * showing its source first answers a question nobody asked. Installing still has
 * to be a trust decision, though, so the raw bytes are one toggle away — with
 * line numbers and the copy button pointed at exactly what is on disk. Other
 * files have no rendered form and stay source-only.
 */
import type { MarketFileContent } from '../../market/types.ts';
/** The subset of a file row this control renders; both pages' metadata fits it. */
export interface SkillFileListItem {
    path: string;
    size: number;
    language: string;
    /** Provider flagged the file as beyond the preview/install limit. */
    tooBig?: boolean;
}
export declare function SkillFiles(props: {
    files: SkillFileListItem[];
    /** Already-fetched document for the selected path, or `null` while none is loaded. */
    selected: MarketFileContent | null;
    loading: boolean;
    /** Reader-facing failure of the last selection, if any. */
    error?: string | null;
    onSelect: (path: string) => void;
}): JSX.Element;
