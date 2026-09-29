# Contributing

Use Node.js `^22.19.0 || >=24` and the pnpm version pinned in `package.json`. Keep one lockfile. Run `pnpm install --frozen-lockfile`, then `pnpm pack:check` before submitting a change.

Separate host code (`src/`) from browser code (`src/client/`). Client value imports from Harness must be platform module-table entries; type-only imports are fine. Use CSS Modules and `--dsw-*` theme variables. Keep loading, empty, failure, retry and disabled states accessible, and respect reduced motion.

Skill installs must not overwrite existing directories. Local removal must revalidate its root and target and require an explicit confirmation; never trust a path supplied by the browser. Cover filesystem traversal, symlinks, conflicts and provider failures with meaningful tests. Follow the contracts in `docs/CONTRACT.md` and update them when APIs change.

The supported Harness cohort lives in `compatibility.json`. Keep all development packages on that exact cohort and document source/tag evidence before broadening support. Do not copy historical support ranges from another plugin.

Commit regenerated `lib/` with source changes because Git installations consume it. Release metadata, compatibility, English/Chinese installation commands and release notes must agree. Follow `docs/RELEASE.md`; a passing test suite is not evidence that publication or real desktop acceptance happened.

## CLI and local source installation

For CLI users and local development, install a specific published version:

```sh
dsh plugin --profile desktop add @nanmicoder/dsh-skills-hub@0.0.1
```

Replace `desktop` with the target profile. To test a local source build:

```sh
pnpm install --frozen-lockfile
pnpm pack --pack-destination artifacts
dsh plugin --profile desktop add ./artifacts/nanmicoder-dsh-skills-hub-0.0.1.tgz
```

Fully quit and reopen the target Harness instance after a CLI install. Advanced configuration is documented in [CONFIGURATION.md](./docs/CONFIGURATION.md).
