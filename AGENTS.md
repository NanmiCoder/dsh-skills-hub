# Skills Hub development

Read `CONTRIBUTING.md`, `docs/COMPATIBILITY.md` and `docs/RELEASE.md` for implementation and release work. The current package name is `@nanmicoder/dsh-skills-hub`; the unscoped npm name belongs to another project. The plugin's first release is 0.0.1; Harness versions are tracked separately.

Use the pinned pnpm version and lockfile, keep Harness development dependencies on one exact cohort, and run `pnpm pack:check` before delivery. Regenerate and retain `lib/` for Git installs. Avoid absolute local paths in committed metadata or runtime bundles. Never claim an untested host version is supported.

For interactive browser automation, use the `ego-browser` skill from Ego Lite. Do not use another browser-control skill unless explicitly requested or Ego Lite is unavailable.

Publication is separate from preparing a release: do not publish, push tags, change repository visibility or edit a user's active profile unless the user authorized those actions. Existing authorization takes precedence over generic workflow prompts. Use isolated profiles and disposable skills for tests.
