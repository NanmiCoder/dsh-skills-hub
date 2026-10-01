# Curated catalogue

The marketplace home list is a curated catalogue of a few hundred skills, not the upstream registries' full feeds. ClawHub holds ~81k skills and SkillHub ~110k native ones; a reader cannot choose from that, and the long tail is dominated by near-duplicates, copies and abandoned experiments.

## Files

| File | Role |
| --- | --- |
| `catalog/curation.json` | Editorial source: categories, and for each skill its `source`, `slug`, `owner`, `category`, `featured`, Chinese `summary`, `tags`, and `allowSuspicious` when applicable. Edited by hand. |
| `src/catalog/skills.json` | Snapshot generated from the curation plus upstream metadata (name, stats, version, icon, license, security verdict). Shipped in `lib/` and served as the home list. |
| `scripts/catalog-refresh.mjs` | Regenerates the snapshot. `--check` reports without writing. |

Run `node scripts/catalog-refresh.mjs`, review the dropped entries it prints, then rebuild (`pnpm build`) so `lib/catalog/skills.json` follows.

## What is served from where

- **List, categories, catalogue search:** the snapshot. No upstream request; the source bar shows the snapshot's `generatedAt` as the fetch time.
- **Detail, files, install:** the owning registry, through the regular cache. Catalogue entries pin the ClawHub owner, because ClawHub slugs are not unique and the registry's first match for a popular slug is often a later copy by another author.
- **"Search all markets":** an explicit live search across both registries (`scope=market`). Results are labelled as not curated.

SkillHub's mirrors of ClawHub skills are not used for ClawHub entries: the mirror pipeline stopped on 2026-07-23, roughly one in ten mirrored skills lags its ClawHub version, and mirror files differ from the original (`skill-card.md` dropped, `_meta.json` added).

## Selection policy

Candidates were the top 1,500 ClawHub skills by downloads and the top 600 SkillHub native skills, reviewed per category for usefulness, popularity and distinctness (one or two per job, not five wrappers of the same API). Excluded:

- skills only meaningful inside OpenClaw/Clawdbot (gateway hooks, OpenClaw configuration, Clawdbot channels);
- paid versions, crypto trading or anything moving money automatically, fake engagement or mass account automation, adult content;
- SkillHub slugs that resolve to a different owner than the curated one (SkillHub's detail route is slug-only);
- ambiguous ClawHub slugs whose remaining owners are low-download copies (`summarize`, `find-skills`, `agent-browser`, `tavily-search`).

## Security policy

- ClawHub: the moderation verdict and the latest version's scan (VirusTotal, skillspector, LLM review). SkillHub: the vendor security reports.
- `malicious` or blocked: never listed.
- `suspicious`: listed only when the curation entry carries `allowSuspicious` with the reason, and shipped as `flagged` with that reason in `securityNote`. This is reserved for widely recommended skills whose finding is about disclosure or permission scope, not hidden behaviour. Skills that upload local content, update their own code from a remote source, or expose credentials are not exempted.
- A refresh re-checks every entry; a newly suspicious skill without `allowSuspicious` drops out of the snapshot.

A clean verdict is upstream's, not ours. Installing still shows the source and verdict, and installation never executes skill scripts.
