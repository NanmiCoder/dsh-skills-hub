/**
 * What a skill will do, read off its own files — before anyone installs it.
 *
 * Everything here is rule-based and explainable: each finding points at the
 * file, command, variable or host it came from, and nothing is inferred that
 * the SKILL.md and file list do not show. When no rule fires, the panel is not
 * rendered at all; an empty "this skill does nothing risky" claim would be a
 * verdict this module cannot make.
 */
import type { MarketFileMeta } from '../market/types.ts';
export type CapabilityKind = 'shell' | 'hooks' | 'network' | 'secrets' | 'binaries' | 'writes';
export type CapabilityLevel = 'high' | 'medium' | 'low';
export interface Capability {
    kind: CapabilityKind;
    level: CapabilityLevel;
    /** The evidence, verbatim: paths, commands, variable names or hosts. */
    evidence: string[];
}
export declare function detectCapabilities(input: {
    markdown: string;
    frontmatter?: Record<string, unknown>;
    files: readonly Pick<MarketFileMeta, 'path'>[];
}): Capability[];
/**
 * The "when to use" list a SKILL.md description usually carries:
 * `Use when (1) …, (2) …` / `Use when: …; …` / `当……时使用`.
 */
export declare function extractTriggers(description: string | undefined): string[];
/** Rough reading time: ~400 CJK characters or ~220 Latin words per minute. */
export declare function readingMinutes(markdown: string): number;
