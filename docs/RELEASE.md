# Release 0.0.1

Package: `@nanmicoder/dsh-skills-hub`. Repository: `NanmiCoder/dsh-skills-hub`. Tag: `v0.0.1`. npm channel: `latest`. This is an initial plugin release, independent of the host's `0.2.0-rc.2` version.

## Before making the repository public

1. Run `pnpm install --frozen-lockfile` and `pnpm pack:check` on the intended release commit.
2. Perform the exact-host acceptance described in [COMPATIBILITY.md](COMPATIBILITY.md), including a browser mount and real install/uninstall in a temporary skills root. Record the host tag, plugin commit, commands and results; fixture tests alone do not prove host acceptance.
3. Review `git diff`, generated `lib/`, package contents and release notes. Commit source and build artifacts together. Never include credentials, profiles or acceptance-home contents.
4. Confirm npm account permission for the `@nanmicoder` scope. The unscoped name is owned by someone else. Changing GitHub visibility alone does not grant npm permissions.

## GitHub Actions publication

Publication runs online in `.github/workflows/release.yml`, matching the AgentTeams release model. Push `v0.0.1` to trigger it, or dispatch the workflow with an explicit version. Both Node 22.19 and 24 must pass validation. The Node 24 job uploads the built tarball and SHA-256 checksum; the publication job verifies and publishes that exact artifact using npm 11.19.0. It does not rebuild during publication. A GitHub Release is published only after npm succeeds.

Configure npm Trusted Publishing for GitHub owner `NanmiCoder`, repository `dsh-skills-hub`, workflow `release.yml`, environment `npm`, allowing direct publication. OIDC uses `id-token: write`; routine releases need no local npm login and no stored npm token. The existing AgentTeams trust binding is package-specific and does not authorize this new package.

For a brand-new package, npm requires an initial publication before its trusted publisher can be configured. If initial publication uses a short-lived granular token, place it only in this repository's `npm` environment as `NPM_TOKEN`, publish through the same Action, then remove/revoke the bootstrap token after configuring OIDC. Never commit or print credentials. npm may require browser-based security-key verification for these account operations.

Before tagging, commit all source and generated artifacts, confirm the version and release notes, and ensure the working tree is clean. Registry preflight rejects duplicate versions, repository collisions and backwards movement of `latest`. Do not move a published tag. The exact-commit bypass supported by the standalone preflight utility is not used by the online publication workflow.

## After publication / recovery

Install `@nanmicoder/dsh-skills-hub@0.0.1` into an isolated profile and repeat the smoke flow. Compare the downloaded package and expected version before announcing availability. If a release is faulty, publish a new fixed version or deprecate the faulty version with a clear message; do not rewrite published Git tags or assume deleting a GitHub Release retracts npm. Preserve user skills when removing or replacing the plugin.
