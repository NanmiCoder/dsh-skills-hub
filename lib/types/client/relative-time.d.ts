/**
 * How old a snapshot is, in the panel's own vocabulary.
 *
 * The panel shows cached catalogue data, so "when was this actually fetched" is
 * part of the answer rather than a debug detail: a reader who is about to
 * install third-party code is entitled to know whether the security report in
 * front of them was read a minute ago or yesterday.
 */
import type { Translate } from './locale-context.tsx';
/** Coarse buckets: the first match wins, and precision beyond them is noise. */
export declare function formatAge(t: Translate, from: number, now?: number): string;
/** Absolute timestamp for the hover text, so the bucket never hides the fact. */
export declare function formatStamp(from: number): string;
