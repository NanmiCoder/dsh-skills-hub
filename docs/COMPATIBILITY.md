# Harness compatibility

The build dependency baseline is **`0.2.1-rc.2`** for every `@deepseek-ai/dsh-*` package. Peer dependencies explicitly accept **`0.2.1-rc.1 || 0.2.1-rc.2`**. The source reference is tag `dsh-v0.2.1-rc.2`, commit `687f282e8625c6b8d11ff58211a90524be2e4317` in `deepseek-ai/deepseek-harness`. An untagged future `0.2.1` package is not silently covered.

The referenced packages were confirmed on npm. A clean install resolves one cohort, with `autoInstallPeers: false`; missing host peers used by development packages are explicitly provided at the same version. No local workspace overrides or private filesystem paths are needed.

The plugin uses the host's Cordis service lifecycle, lazy `webServer` binding, connection request gate, user/configured skill roots, web-client slot registration, layout services and the browser module-loader factory protocol. It does not replace official profile components. The patch inserts a single row named `@nanmicoder/dsh-skills-hub`. The browser bundle registers that same package ID and externalizes only platform modules. Markdown processing is bundled, so it does not depend on an optional host Markdown renderer service.

## Acceptance procedure

Use the exact source tag or installed desktop cohort, a temporary `DSH_HOME`, an isolated profile and disposable skills. Do not change the user's real profile for acceptance.

1. Build and pack the plugin. Install the tarball into the isolated profile.
2. Dump the resolved profile and confirm the scoped plugin row.
3. Cold-boot the host; confirm no pending plugin service and the advertised `lib/client.js` bundle returns successfully.
4. Open Skills Hub in the actual host browser. Confirm module registration, DOM mount, and absence of page errors.
5. Verify initial skeleton, detail skeleton, rendered Markdown and automatic next-page loading. Test an empty list and source failure/retry.
6. Install a disposable market skill. Confirm its files and the Installed row; uninstall and confirm removal. Add a temporary local skill under a configured root, refresh and remove it through the local confirmation path.
7. Check light/dark layout and keyboard-accessible controls. Record actual results separately from automated fixture coverage.

`pnpm pack:check` covers static typing, source and manifest contracts, regression tests, clean build, release metadata and tarball import closure. It does not by itself certify a running desktop session or upstream network availability. Future host cohorts must repeat this acceptance before widening peer ranges.

## 0.0.5 / Harness 0.2.1-rc.2 acceptance — 2026-10-18

The reported desktop was already 0.2.1-rc.2. Official npm served plugin 0.0.4 (rc.1-only peers), while the mainland mirror still served latest 0.0.3 and had no 0.0.4 metadata. These are separate causes: switching registry cannot make an incompatible peer range compatible.

Compared upstream tags rc.1 and rc.2 at the source reference above: no source changes in the consumed connection, locale, UI slots/layout/primitives/sidebar, host webserver, skill filesystem or home paths packages. The runtime bundles rebuild unchanged. Development dependencies now use one exact rc.2 cohort; peers retain rc.1 and explicitly add rc.2 rather than an open-ended range.

`pnpm pack:check` passed all 97 tests, types, clean build, release metadata and tarball closure checks. Acceptance used the published npm rc.2 host with all Harness dependencies pinned to rc.2, macOS arm64 / Node 26.7.0, a packed 0.0.5 plugin and disposable home/agents directories. The host CLI accepted the tarball. Ego Lite verified the market mount, weather search, live Weather installation, installed detail with rendered Markdown and two files, and confirmed uninstall returning the inventory to zero; the skill directory was also removed. The same tarball was accepted by the rc.1 host CLI; the unchanged runtime's rc.1 UI coverage is recorded below. Native Electron packaging and Windows/Linux were not tested.

This is release preparation, not publication. The plugin is intended for npm `latest` after merge. A GitHub Release marker does not update npm mirror metadata; README now directs users to the official registry when versions are missing or stale.

## 0.0.4 / Harness 0.2.1-rc.1 acceptance — 2026-10-17

Target: [official release `dsh-v0.2.1-rc.1`](https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v0.2.1-rc.1), commit `1600d8a1e140dcde43a1a0941940a0480712c011`. The supplied source checkout was clean at that tag and was used only as reference. Plugin validation used the working changes on base commit `990840138d22d681f46e54fd2e876f0d6acd8398`; it was not a published release commit.

All Harness development packages and peers now target the exact new cohort. Cordis and Schemastery development versions are 4.0.5 and 3.18.5. The upstream source no longer contains `dsh-invariants`, and npm has no 0.2.1-rc.1 release of that retired package; the unused development dependency was removed. The slot registrations, module factory and user skill roots remain compatible. The HTTP trust predicate now imports the actual host type instead of casting its numeric status to a boolean contract.

The unchanged baseline passed 96 tests on the old cohort. After migration, `pnpm install --frozen-lockfile` and `pnpm pack:check` passed, including 97 tests, typechecking, regenerated `lib/`, metadata and tarball closure checks. The new integration test uses real Cordis, WebServer and HostConnectionService instances (only cookie verification is a fixture), verifies 401/403/200 responses, route disposal and reactivation. The lockfile contains no old Harness cohort or local source override.

Runtime acceptance used the published npm `@deepseek-ai/dsh@0.2.1-rc.1`, with all 293 installed Harness packages pinned to that cohort, on macOS arm64 / Node 26.7.0. The plugin tarball was installed through `dsh plugin --profile web add <tarball>`, then booted through `dsh web --no-open --port 0`, using disposable `DSH_HOME` and `DSH_AGENTS_HOME`. Ego Lite drove the real host browser UI:

- The sidebar entry mounted the curated home with 398 skills and 13 categories.
- Searching for weather returned the curated results; opening Weather showed a loading skeleton, live ClawHub detail, rendered Markdown and its two-file inventory.
- Confirmed installation wrote the two files and the `steipete` owner sidecar to the isolated skills root. The Installed page showed the actual local copy. Confirmed removal from its detail returned the inventory to zero and deleted the directory.
- A disposable Markdown skill under the isolated shared agents root appeared after refresh. Its detail rendered a GFM table; confirmed local removal deleted that directory too.
- Light mode and a 1000px-wide dark host window rendered without horizontal viewport overflow.

Screenshots and runtime logs are local-only under ignored `artifacts/`. This verifies the published host's shared Web surface and plugin protocol. Native Electron packaging, Windows/Linux runtime acceptance, and model-driven skill invocation were not exercised. No package publication, tag push or active user-profile modification was performed. Historical records below describe older plugin revisions, not an additional supported peer range for 0.0.4.

## 0.0.1 acceptance record — 2026-09-30

Validation used the published npm `@deepseek-ai/dsh@0.2.0-rc.2` runtime with every Harness dependency overridden to the same cohort, on macOS arm64 / Node 26.7.0. The plugin was installed from its npm tarball into a disposable Web profile, with isolated `DSH_HOME` and `DSH_AGENTS_HOME`. The complete published host started without startup warnings. The earlier source-checkout trial lacked unrelated built host packages and is not the compatibility evidence.

Ego Lite drove the actual host UI. Slow fixture upstream responses made the loading states observable: eight initial card skeletons, the detail skeleton, and automatic growth from 24 to 48 cards after a wheel scroll. Headings, a GFM table and fenced code rendered as DOM; injected HTML scripts did not execute and no `javascript:` links remained. A fixture skill was installed through the confirmation dialog and appeared in Installed. A local skill preview rendered its body without YAML frontmatter. Both entries were removed through confirmation dialogs and their filesystem entries disappeared. Light and dark themes were inspected; the layout had no horizontal viewport overflow. This verifies the shared Web client and host plugin protocol, not a native desktop installer or OS-specific shell integration.

`pnpm pack:check` passed 44 tests without failures or skips, including live provider list/detail/file/install/uninstall, request-origin fencing, local removal policy, duplicate paths, symlink preservation, bounded file reads, Markdown rendering and controller concurrency. A final clean build and tarball closure check followed the visual/style fixes. npm publication dry-run and registry name/version preflight succeeded. No package was published, Git tag created, repository visibility changed or active user profile modified. Local npm authentication was absent (`npm whoami`: `ENEEDAUTH`); publication requires an authorized login or the documented CI secret.

Local-only logs and screenshots are kept in the ignored `artifacts/` directory. CI covers Node 22.19 and 24; those CI jobs and a native desktop launch were not run in this local acceptance.

## Installed-skill detail revision — 2026-09-30

The local skill detail moved from the primitive's 380px modal to a full-panel page on the shared detail shell. Re-verified on the same cohort (`@deepseek-ai/dsh@0.2.0-rc.2` from npm, macOS arm64 / Node 26.7.0) with an isolated `DSH_HOME`/`DSH_AGENTS_HOME`, a disposable Web profile and a tarball install of this revision; the user's real profile was not touched.

The run covered: the installed inventory (six rows), a search query surviving the round trip to the detail and back (with focus returned to the row that was opened), the market-installed skill's page (provenance badge, path line, 4-file inventory, rendered GFM table, collapsed YAML metadata, rail facts, "view in marketplace" opening the provider-backed page), a hand-placed skill (market rows absent rather than zero, no marketplace link), a symlink entry (linked badge), the Files tab with per-file preview switching, and removal from the detail page — confirmation showing the exact path, then row and directory both gone. Focus lands on the heading when the page opens; there is no horizontal overflow at 760px; light and dark themes were both inspected; the console stayed clean.

One defect was found and fixed by this run: the uninstall confirmation was rendered only in the list branch, so the detail page's removal button did nothing.

Deviation from the procedure above: Ego Lite's browser skill was not available to this session, so the drive used headless Chromium (Playwright 1.60.0) instead. Screenshots are in `artifacts/local-detail-acceptance/`; the results are recorded as observed, not inferred from fixture tests.

## Markdown file preview revision — 2026-09-30

The Files tab now renders markdown (frontmatter split into the structured metadata panel, body through the bundled GFM renderer) and keeps the exact bytes behind a preview/source switch. Verified with **ego-browser 0.5.1.13** against an isolated profile on the same host cohort, driving the real UI: an installed skill (`skillhub:anti-fraud`, 4 files) and a market skill (`clawhub:skill-vetter`, 2 files, live upstream).

Recorded results — installed skill, Files tab: preview showed 1 table, 4 headings, 6 list items and 1 code block with the metadata panel and no literal `**`; the source view showed 67 line-number spans, the raw `name: anti-fraud` header and the literal `**先定级，再开口**`. Selecting another file returned to the rendered form. Market skill, Files tab: preview showed 12 headings, 15 list items, 5 code blocks and 1 table, again with no literal `**`; source showed 278 line-number spans and the raw `name: skill-vetter` header. Screenshots are in `artifacts/markdown-preview-verify/`.

This run used the Ego Lite browser as the project procedure requires; the earlier Playwright deviation applied only to the revision above.

## Provenance and look-ahead revision — 2026-09-30

Cache answers now carry the moment they were read from upstream instead of being restamped with the current clock, a reader-requested refresh (`refresh=1`) reaches upstream, the panel prints the snapshot age, and the next catalogue page is fetched one screen before it is needed. Verified in an isolated profile on the same cohort, driving the real UI and the plugin's own endpoints.

Recorded results: two identical list reads returned `fromCache: false` then `fromCache: true` **with the same `fetchedAt`**; `refresh=1` returned `fromCache: false` with a newer timestamp while `forcedRefreshes` and `upstreamRequests` advanced by one each; `refresh=maybe` was rejected with 400; the status bar rendered `ClawHub 正常 快照 刚刚`; a fresh page with no scrolling issued **0** cursor requests; scrolling to within 708px of the container's end (sentinel still 639px below the fold) issued cursor requests immediately, which is the look-ahead — measured with a viewport-rooted observer reporting "not intersecting" for the same sentinel, confirming the container root is required. Screenshots are in `artifacts/p0-p1-verify/`.

## Persistent cache regression — 2026-09-30

The previous cache lived only in the host process's `Map`; the provenance revision above did not persist it across exits. The host now stores snapshots under its Harness home and defaults to a one-hour TTL (`cacheTtlMinutes` can change it).

Automated regression uses the compiled plugin in separate Node HTTP host processes with a minimal Cordis context, isolated `DSH_HOME`/`DSH_AGENTS_HOME` and fixture upstreams. After reading three cursor pages, a search, both providers' details and both file previews, the test kills the host with `SIGKILL` and boots a new process against the same temporary home. Every repeated read is served without additional upstream requests; original `fetchedAt` values survive, and a skill installed while the host was stopped is annotated from the new filesystem scan. Further restarts verify refreshed snapshots, expiry, stale list/detail fallback during upstream failure, and isolation when provider URLs change. Unit coverage includes corrupt records, failed disk writes, concurrent atomic publication, count limits and a shorter configured TTL. Install-time manifest reads reject upstream failure even when a snapshot exists.

Adversarial review also covered the actual HTTP install entry point (a withdrawn manifest is rejected despite a fresh disk snapshot), first-response installation annotations without an `/installed` warmup, browser revalidation and per-page provenance, configuration changes during asynchronous cache reads and multi-step installation, snapshot integrity, oversized replacement invalidation, and abandoned temporary writes. Regression tests cover each behavior.

The automated evidence above is process-restart coverage rather than a full native acceptance run. Separately, the user authorized installation into the active desktop: a locally packed build was installed using the desktop's bundled package manager while it was stopped, then DeepSeek Harness **0.2.0-rc.2** was relaunched. The actual market loaded 24 entries from each source and wrote two list snapshots with a 60-minute lifetime. This smoke check does not claim a native restart-after-warm acceptance of every cached path. The supported Harness cohort remains unchanged.

### Curated catalogue, owner pinning and detail redesign

The home list now comes from the shipped curated catalogue, ClawHub reads are pinned to the card's author, and the market detail page follows the redesign (header with stats, overview/files/security/changelog tabs, rule-based "what this skill does" and "when it triggers", redesigned install confirmation). Verified with **ego-browser** against the published `@deepseek-ai/dsh@0.2.0-rc.2` runtime (all 278 Harness packages on the same cohort) in a disposable Web profile with temporary `DSH_HOME`/`DSH_AGENTS_HOME`, macOS arm64 / Node 26.7.0, from a tarball of this revision; the user's real profile and desktop app were not touched.

Recorded results: the home list rendered the 13 catalogue categories with counts and editor's picks dealt across categories, with no upstream list request. A flagged ClawHub skill (`self-improving-agent`) showed the suspicious scan chip, per-scanner reports including the LLM review text, the bundled `CHANGELOG.md` entry point, and an install dialog whose confirm button stayed disabled until the acknowledgement was checked. A SkillHub skill (`libai`) showed a passed scan, its catalogue category and sub-category tags. At a 720px panel the side rail moved below the document with no horizontal overflow; dark mode followed the host tokens. Installing `clawhub:weather` through the dialog wrote `"owner": "steipete"` to the sidecar and switched the page to installed; uninstalling removed the directory. `pnpm pack:check` passed 96 tests. Screenshots are kept locally in `artifacts/catalog-redesign-verify/`.

The catalogue home and the installed inventory were then brought onto the same visual system (white top band over a grey canvas of 14px-radius cards, shared chips, mono counts, black primary actions), and both detail pages now share one `SkillDetailShell`. Re-verified the same way: the home shows the catalogue total and list date instead of live source health, which appears only for an explicit all-markets search (28 live results for `pdf`, with per-source status); installing from a card switched it to installed; the installed list and its detail rendered in the shared layout; a 720px panel had no horizontal overflow and dark mode followed the host tokens. `pnpm pack:check` passed 96 tests.

## 0.0.3 release preparation — 2026-10-02

The 0.0.3 release commit changes only version metadata, documentation and the README screenshot on top of the revisions recorded above. The README marketplace screenshot was retaken with ego-browser from the packed 0.0.3 tarball in an isolated Web profile (same `@deepseek-ai/dsh@0.2.0-rc.2` cohort, temporary `DSH_HOME`/`DSH_AGENTS_HOME`). It shows the curated home and the community-plugin disclaimer. `pnpm pack:check` was rerun on the release commit. No package was published and no tag was pushed.
