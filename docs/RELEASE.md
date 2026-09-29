# Release 0.0.1

Package: `@nanmicoder/dsh-skills-hub`. Repository: `NanmiCoder/dsh-skills-hub`. Tag: `v0.0.1`. npm channel: `latest`. This is an initial plugin release, independent of the host's `0.2.0-rc.2` version.

## Before making the repository public

1. Run `pnpm install --frozen-lockfile` and `pnpm pack:check` on the intended release commit.
2. Perform the exact-host acceptance described in [COMPATIBILITY.md](COMPATIBILITY.md), including a browser mount and real install/uninstall in a temporary skills root. Record the host tag, plugin commit, commands and results; fixture tests alone do not prove host acceptance.
3. Review `git diff`, generated `lib/`, package contents and release notes. Commit source and build artifacts together. Never include credentials, profiles or acceptance-home contents.
4. Confirm npm account permission for the `@nanmicoder` scope. The unscoped name is owned by someone else. Changing GitHub visibility alone does not grant npm permissions.

## Manual publication

After the repository is public and the release commit is approved:

```sh
pnpm install --frozen-lockfile
pnpm pack:check
node scripts/registry-preflight.mjs
npm whoami
npm publish --access public
```

`prepublishOnly` rebuilds and verifies the package. `prepack` also guards direct `npm pack`/`pnpm pack`. `pack:check` uses an internal `--ignore-scripts` pack only after the complete check has succeeded, avoiding recursion.

Create the matching Git tag and GitHub Release (`v0.0.1`, not prerelease), attaching `release-notes/v0.0.1.md`. The release workflow recognizes a version already published from the exact same Git commit and skips duplicate publication. A version associated with a different commit is rejected; npm versions are immutable. Publish only from a clean, committed release checkout.

## GitHub publication workflow

The repository environment is `npm`. For automated publication, configure npm Trusted Publishing for GitHub owner `NanmiCoder`, repository `dsh-skills-hub`, workflow `release.yml`, environment `npm`, allowing direct publication. The workflow grants `id-token: write` and runs Node 24 with an OIDC-capable npm CLI. Alternatively, set the environment’s `NPM_TOKEN` secret to an npm token authorized to publish this package. Configure any desired environment reviewer. The workflow at `.github/workflows/release.yml` runs when a GitHub Release is published, checks its tag and prerelease flag, rebuilds/tests/packs, checks registry identity/version, then publishes.

The token is supplied only to the publish step. No token is committed. If neither trusted publishing nor token authentication is configured the publish fails; the repository being public is not sufficient authentication. CI checks on Node 22.19 and 24 run on every push and pull request.

For future prereleases set `publishConfig.tag` to `next`, use a semver prerelease version and mark the GitHub Release as prerelease. Update `compatibility.json` and release notes with every version. `release-check.mjs` prevents version/cohort drift; the registry preflight rejects an existing version by default, repository-name collisions and moving `latest` backwards. Only the release workflow opts into the exact-commit idempotency check.

## After publication / recovery

Install `@nanmicoder/dsh-skills-hub@0.0.1` into an isolated profile and repeat the smoke flow. Compare the downloaded package and expected version before announcing availability. If a release is faulty, publish a new fixed version or deprecate the faulty version with a clear message; do not rewrite published Git tags or assume deleting a GitHub Release retracts npm. Preserve user skills when removing or replacing the plugin.
