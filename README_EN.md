<p align="right">
  <a href="./README.md">简体中文</a> · <strong>English</strong>
</p>

<p align="center">
  <img src="./assets/readme/hero-en.png" width="100%" alt="Skills Hub for DeepSeek Harness. Your skills. One place.">
</p>

<p align="center">
  <strong>A skill marketplace and local skill manager for DeepSeek Harness</strong><br>
  Browse ClawHub and SkillHub to find the skills you need.
</p>

<p align="center">
  <a href="#quick-start">Quick start</a> · <a href="./docs/COMPATIBILITY.md">Compatibility</a> · <a href="./LICENSE">MIT</a>
</p>

## Discover, install and manage skills in Harness

Search ClawHub and SkillHub, read a skill’s instructions, and install it into Harness. Manage marketplace installations and existing local skills together in **Installed**.

Current version: **0.0.3**. The home page now opens on 398 curated skills in 13 categories, with a redesigned detail page that explains what a skill will do once installed. [Release notes](./release-notes/v0.0.3.md)

<p align="center">
  <img src="./assets/readme/marketplace.png" width="100%" alt="Skills Hub marketplace with categories, search, filters and curated skill cards.">
</p>

| Feature | What it does |
| --- | --- |
| **Curated catalogue** | 398 popular ClawHub and SkillHub skills in 13 categories, shipped with the plugin and shown instantly. |
| **Live search** | Type a keyword to search every skill on both marketplaces; same-name skills are told apart by author. |
| **Preview before installing** | Read instructions and files, check upstream scans, and see the commands, secrets and network hosts a skill uses. |
| **Manage installed skills** | Search local skills, inspect their source and installation path, and confirm removal. |
| **Local cache** | Reuse browsed pages, details and file previews across desktop restarts. |

## Quick start

Supports **DeepSeek Harness 0.2.0-rc.2**. [Compatible versions](./docs/COMPATIBILITY.md)

Open **DeepSeek Harness desktop → Plugins → Add plugin** and paste either of the following:

**GitHub repository URL (recommended)**

```text
https://github.com/NanmiCoder/dsh-skills-hub
```

**Or the npm package name**

```text
@nanmicoder/dsh-skills-hub@0.0.3
```

Click **Install → Enable now**, then open **Skills Hub** from the sidebar.

## Use

1. **Find**: browse the curated catalogue by category, or enter a keyword to search every skill.
2. **Preview**: open a skill to read its instructions and inspect its files.
3. **Install and manage**: confirm installation, then find or remove it in **Installed**.

Skills are published by third-party community authors. Skills Hub is a community plugin, not a DeepSeek product. The curated list is a recommendation, not a security guarantee; check the security report and SKILL.md before installing.

## Installed skills

Use **Installed** to view and remove marketplace installations and existing local user skills. Project-specific skills and skills bundled with Harness are not included.

The removal dialog shows the exact location for you to confirm. To remove Skills Hub itself, open **@nanmicoder/dsh-skills-hub** on the desktop **Plugins** page and click **Uninstall**. Your installed skills will remain.

[Report an issue](https://github.com/NanmiCoder/dsh-skills-hub/issues) · [Advanced configuration](./docs/CONFIGURATION.md) · [Contribute](./CONTRIBUTING.md) · [MIT license](./LICENSE)
