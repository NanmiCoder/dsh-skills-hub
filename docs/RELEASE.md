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

Create the matching Git tag and GitHub Release (`v0.0.1`, not prerelease), attaching `release-notes/v0.0.1.md`. Do not also trigger the automated publication path after a manual publish: npm versions are immutable and the workflow correctly refuses duplicates.

## GitHub publication workflow

As an alternative to the manual route, create repository environment `npm` and its `NPM_TOKEN` secret using an npm token authorized to publish this package. Configure any desired environment reviewer. The workflow at `.github/workflows/release.yml` runs when a GitHub Release is published, checks its tag and prerelease flag, rebuilds/tests/packs, checks registry identity/version, then publishes.

The token is supplied only to the publish step. No token is committed. If authentication is not configured the publish fails; the repository being public is not sufficient authentication. CI checks on Node 22.19 and 24 run on every push and pull request.

For future prereleases set `publishConfig.tag` to `next`, use a semver prerelease version and mark the GitHub Release as prerelease. Update `compatibility.json` and release notes with every version. `release-check.mjs` prevents version/cohort drift; the registry preflight rejects an existing version, repository-name collisions and moving `latest` backwards.

## After publication / recovery

Install `@nanmicoder/dsh-skills-hub@0.0.1` into an isolated profile and repeat the smoke flow. Compare the downloaded package and expected version before announcing availability. If a release is faulty, publish a new fixed version or deprecate the faulty version with a clear message; do not rewrite published Git tags or assume deleting a GitHub Release retracts npm. Preserve user skills when removing or replacing the plugin.
