<p align="right">
  <a href="./README.md">简体中文</a> · <strong>English</strong>
</p>

<p align="center">
  <img src="./assets/readme/hero-en.png" width="100%" alt="Skills Hub for DeepSeek Harness. Your skills. One place. A conceptual 3D library of skill documents in a blue dock.">
</p>

<p align="center">
  <strong>A skill marketplace and local skill manager for DeepSeek Harness</strong><br>
  Browse ClawHub and SkillHub, read SKILL.md, then install into Harness.
</p>

<p align="center">
  <a href="#quick-start">Quick start</a> · <a href="./docs/COMPATIBILITY.md">Compatibility</a> · <a href="./docs/RELEASE.md">Release guide</a> · <a href="./LICENSE">MIT</a>
</p>

## Discovery and local management, in one panel

**Skills Hub** brings two marketplaces and your local user skills into the Harness sidebar. Search, inspect the instructions, confirm an installation, and manage it from the **Installed** view.

<p align="center">
  <img src="./assets/readme/marketplace.png" width="100%" alt="Actual Skills Hub panel in DeepSeek Harness: skill cards, search, filters, source health and the installed-skills entry.">
</p>

*Actual Harness 0.2.0-rc.2 interface, shown in Chinese. Catalogue content changes upstream. The 3D hero is a conceptual illustration.*

| What you want to do | How Skills Hub helps |
| --- | --- |
| **Find a skill** | Search and filter ClawHub and SkillHub together. More results load as you scroll. |
| **Inspect before installing** | Read Markdown, tables and code blocks; preview package files and upstream security reports. List and detail skeletons make loading visible. |
| **Manage installed skills** | Search marketplace installations and local user skills, inspect their source, path and instructions, then confirm removal. |

## Quick start

**Plugin `0.0.1` · Harness `0.2.0-rc.2`.** Targets the DeepSeek Harness 0.2.0 desktop release line; other host versions have not been validated. [See acceptance scope →](./docs/COMPATIBILITY.md)

In **DeepSeek Harness desktop → Plugins → Add plugin**, paste either of the following:

**GitHub repository URL (recommended)**

```text
https://github.com/NanmiCoder/dsh-skills-hub
```

**Or the npm package name**

```text
@nanmicoder/dsh-skills-hub
```

Click **Install**, then **Enable now**, and open **Skills Hub** from the sidebar. No terminal is needed. If your selected registry mirror has not synced the new version yet, switch to the official npm registry and retry.

1. **Browse**: search a keyword or filter by source and security status.
2. **Preview**: open a skill and read its overview and files.
3. **Install**: confirm its source; use **Installed** to inspect, search or remove it later.

> Keep the `@nanmicoder/` scope. The unscoped npm package `dsh-skills-hub` belongs to another author.

<details>
<summary><strong>Advanced: CLI and source installation</strong></summary>

For CLI users, custom profiles or local development. To install a specific version:

```sh
dsh plugin --profile desktop add @nanmicoder/dsh-skills-hub@0.0.1
```

Replace `desktop` with your profile name. After a CLI installation, fully quit and reopen the corresponding Harness instance.

To build from source:

Requires Node.js `^22.19.0 || >=24` and pnpm `10.33.0`.

```sh
pnpm install --frozen-lockfile
pnpm pack --pack-destination artifacts
dsh plugin --profile desktop add ./artifacts/nanmicoder-dsh-skills-hub-0.0.1.tgz
```

Restart Harness afterward. Build artifacts are committed with source and rebuilt and checked before packing.

</details>

## Local management with explicit paths

The list covers the configured installation root, `$DSH_HOME/skills` and the shared agents user skills directory. It discovers directory-based skills, flat Markdown files and symlinks. Skills with the same name at different paths remain separate entries.

- **Confirm removals** after checking the exact location.
- **Unlink linked skills** without deleting their original files.
- **Manage user skills**; project-specific and bundled skills are outside this host-level list.

Installation does not execute skill scripts or overwrite existing directories. Skills may instruct an agent to run third-party code later. Security labels are upstream reports, not independent audits; review the contents and publisher before installing.

<details>
<summary><strong>Configuration and plugin removal</strong></summary>

Defaults work out of the box. Advanced settings belong in the plugin row:

```yaml
- id: skills-hub
  name: '@nanmicoder/dsh-skills-hub'
  config:
    allowUninstall: false
    timeoutMs: 30000
```

| Key | Default | Meaning |
| --- | --- | --- |
| `skillsRoot` | `null` | Installation root; defaults to Harness's user skills directory. |
| `clawhubBaseUrl` | `https://clawhub.ai` | ClawHub API origin. |
| `skillhubBaseUrl` | `https://api.skillhub.cn` | SkillHub API origin. |
| `timeoutMs` | `15000` | Per-request upstream timeout in milliseconds. |
| `requestRetries` | `1` | Retries for network and server failures. |
| `allowUninstall` | `true` | Allow skill removal from the panel. |
| `pageSize` | `24` | Marketplace page size. |

To remove the plugin itself, open **@nanmicoder/dsh-skills-hub** on the desktop **Plugins** page and click **Uninstall**.

This does not delete installed skills. See the [implementation contract](./docs/CONTRACT.md) for discovery scope and APIs.

</details>

## Develop and release

```sh
pnpm install --frozen-lockfile
pnpm check       # types, build, regression tests and release metadata
pnpm pack:check  # also inspect package contents and runtime import closure
```

[Contributing](./CONTRIBUTING.md) · [Maintenance rules](./AGENTS.md) · [Compatibility and acceptance](./docs/COMPATIBILITY.md) · [0.0.1 release guide](./docs/RELEASE.md)

MIT. See [LICENSE](./LICENSE).
