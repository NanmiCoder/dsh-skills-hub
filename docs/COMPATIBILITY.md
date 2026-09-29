# Harness compatibility

The build and peer dependency baseline is **`0.2.0-rc.2`** for every `@deepseek-ai/dsh-*` package. The source reference is tag `dsh-v0.2.0-rc.2`, commit `639ed015397290b3745d163aafe02ffee4aa3f84` in `deepseek-ai/deepseek-harness`. These are the precise package coordinates behind the requested desktop 0.2.0 release line; an untagged future `0.2.0` package is not silently covered.

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

## 0.0.1 acceptance record — 2026-09-30

Validation used the published npm `@deepseek-ai/dsh@0.2.0-rc.2` runtime with every Harness dependency overridden to the same cohort, on macOS arm64 / Node 26.7.0. The plugin was installed from its npm tarball into a disposable Web profile, with isolated `DSH_HOME` and `DSH_AGENTS_HOME`. The complete published host started without startup warnings. The earlier source-checkout trial lacked unrelated built host packages and is not the compatibility evidence.

Ego Lite drove the actual host UI. Slow fixture upstream responses made the loading states observable: eight initial card skeletons, the detail skeleton, and automatic growth from 24 to 48 cards after a wheel scroll. Headings, a GFM table and fenced code rendered as DOM; injected HTML scripts did not execute and no `javascript:` links remained. A fixture skill was installed through the confirmation dialog and appeared in Installed. A local skill preview rendered its body without YAML frontmatter. Both entries were removed through confirmation dialogs and their filesystem entries disappeared. Light and dark themes were inspected; the layout had no horizontal viewport overflow. This verifies the shared Web client and host plugin protocol, not a native desktop installer or OS-specific shell integration.

`pnpm pack:check` passed 44 tests without failures or skips, including live provider list/detail/file/install/uninstall, request-origin fencing, local removal policy, duplicate paths, symlink preservation, bounded file reads, Markdown rendering and controller concurrency. A final clean build and tarball closure check followed the visual/style fixes. npm publication dry-run and registry name/version preflight succeeded. No package was published, Git tag created, repository visibility changed or active user profile modified. Local npm authentication was absent (`npm whoami`: `ENEEDAUTH`); publication requires an authorized login or the documented CI secret.

Local-only logs and screenshots are kept in the ignored `artifacts/` directory. CI covers Node 22.19 and 24; those CI jobs and a native desktop launch were not run in this local acceptance.
