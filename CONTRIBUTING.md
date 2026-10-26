# Contributing

Use Node.js `^22.19.0 || >=24` and the pnpm version pinned in `package.json`. Keep one lockfile. Run `pnpm install --frozen-lockfile`, then `pnpm pack:check` before submitting a change.

Separate host code (`src/`) from browser code (`src/client/`). Client value imports from Harness must be platform module-table entries; type-only imports are fine. Use CSS Modules and `--dsw-*` theme variables. Keep loading, empty, failure, retry and disabled states accessible, and respect reduced motion.

Skill installs must not overwrite existing directories. Local removal must revalidate its root and target and require an explicit confirmation; never trust a path supplied by the browser. Cover filesystem traversal, symlinks, conflicts and provider failures with meaningful tests. Follow the contracts in `docs/CONTRACT.md` and update them when APIs change.

The supported Harness cohort lives in `compatibility.json`. Keep all development packages on that exact cohort and document source/tag evidence before broadening support. Do not copy historical support ranges from another plugin.

Commit regenerated `lib/` with source changes because Git installations consume it. Release metadata, compatibility, English/Chinese installation commands and release notes must agree. Follow `docs/RELEASE.md`; a passing test suite is not evidence that publication or real desktop acceptance happened.

## CLI and local source installation

For CLI users and local development, install a specific published version. Without one, pnpm 11's default 24-hour `minimumReleaseAge` installs the previous release for a day after each publication:

```sh
dsh plugin --profile desktop add @nanmicoder/dsh-skills-hub@0.0.6
```

The `desktop` command requires the CLI bundled with the desktop installation. With the npm-installed CLI, replace `desktop` with a supported profile such as `web`. To test a local source build:

```sh
pnpm install --frozen-lockfile
pnpm pack --pack-destination artifacts
dsh plugin --profile desktop add ./artifacts/nanmicoder-dsh-skills-hub-0.0.6.tgz
```

Fully quit and reopen the target Harness instance after a CLI install. Advanced configuration is documented in [CONFIGURATION.md](./docs/CONFIGURATION.md).

## Curated catalogue

The marketplace home list comes from `catalog/curation.json` (editorial: which skills, category, Chinese summary, picks) and its generated snapshot `src/catalog/skills.json`. To add or remove a skill, edit the curation, run `node scripts/catalog-refresh.mjs`, review the entries it reports as dropped, then `pnpm build`. Selection and security rules are in `docs/CATALOG.md`.

## Compatibility and delivery checks

`compatibility.json` owns exact supported hosts, source tags/commits, the independent development baseline and Linux/Windows verification targets. After auditing and testing a host candidate, edit that policy and run `pnpm compatibility:sync`; do not widen peers or add an `engines.dsh` escape hatch. `pnpm check:upstream` reads official npm metadata and reports unverified upstream tags separately from unpublished source changes. It never approves a host or publishes.

`pnpm verify:host --host-version <exact> --artifact <tgz> --report-dir <fresh-directory>` creates an isolated host/profile and uses deterministic local provider responses. Optional `--runtime-dir <existing-npm-runtime>` reuses an exact host read-only; optional `--serve` keeps its browser surface open for Ego Lite acceptance. The script records actual installation, startup, authentication, bundle serving, install/removal and restart-cache evidence. Browser DOM acceptance remains a separate Ego Lite step. Do not commit the ignored acceptance artifacts or launch URLs.

CI runs the reusable `verify.yml`; publication consumes that workflow's single validated candidate. Windows execution is required in CI, while a local macOS pass alone must not be described as Windows runtime evidence.
