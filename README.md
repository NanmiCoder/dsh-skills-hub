# Skills Hub

**A skills marketplace inside DeepSeek Harness.** Browse, search, preview and install third-party
skills from [ClawHub](https://clawhub.ai) and [SkillHub](https://api.skillhub.cn) without leaving the
DSH Web GUI. Installed skills land in your DSH skills directory and are picked up by the `skill`
tool like any hand-written skill.

## Features

- **Two sources, one list.** ClawHub and SkillHub results are merged, deduplicated and tagged with
  their origin; a SkillHub entry that mirrors a ClawHub skill collapses into the ClawHub original.
- **Search and three filters** — free text, source, security status and install state.
- **Preview before installing** — full `SKILL.md` rendered as Markdown, every file in the package
  with size and language, the upstream security report when the source publishes one.
- **Install / uninstall** from the panel, with a confirmation dialog that repeats the third-party
  warning, size limits, atomic publish and no-clobber guarantees.
- **Provenance is explicit.** Every installed skill carries a `.skills-hub.json` sidecar; the panel
  only ever offers to remove skills it installed itself.
- **Source health** is shown up front (`ok` / `degraded` / `failed` / `cached`), so an unreachable
  registry is visible instead of looking like an empty marketplace.

## Install

Skills Hub is a DSH bundle: it installs into one profile and adds one row to that profile's plugin
tree. Replace `<profile>` with the profile you actually run (`dsh plugin --help` documents the
forwarder; `desktop` is the profile the macOS app boots).

```sh
# from this checkout (the package must be built first: pnpm install && pnpm build)
dsh plugin --profile <profile> add file:/absolute/path/to/dsh-skills-hub

# from a published package
dsh plugin --profile <profile> add dsh-skills-hub

# from a tagged Git commit (the repository commits its built lib/)
dsh plugin --profile <profile> add github:<owner>/dsh-skills-hub#v0.1.0
```

Then restart the profile (fully quit and reopen the app — closing the window is not enough) and open
**Skills Hub** in the sidebar.

To remove it: `dsh plugin --profile <profile> remove dsh-skills-hub`.

## Use

1. Open **Skills Hub** in the sidebar. The entry sits with the other global panels and does not
   change the current session.
2. Search or filter. The list loads more as you scroll and merges both sources.
3. Click a card for the detail page: overview, files, security report.
4. **Install** → confirm → the skill appears in the installed list immediately and becomes available
   to the agent through the `skill` tool.

## Configuration

The plugin row accepts the usual loader `config` block. Every value has a default; only set what you
need.

| Key | Default | Meaning |
| --- | --- | --- |
| `skillsRoot` | `null` | Where skills are installed. `null` resolves the profile's DSH skills directory. |
| `clawhubBaseUrl` | `https://clawhub.ai` | ClawHub endpoint (point it at a mirror if the public one is blocked). |
| `skillhubBaseUrl` | `https://api.skillhub.cn` | SkillHub endpoint. |
| `timeoutMs` | `15000` | Per-request upstream timeout. |
| `requestRetries` | `1` | Retries for network errors and 5xx responses. |
| `allowUninstall` | `true` | Set `false` to make the panel read-only for removals. |
| `pageSize` | `24` | Page size for the merged list. |

```yaml
- id: skills-hub
  name: dsh-skills-hub
  config:
    allowUninstall: false
    timeoutMs: 30000
```

## Safety

Installing a skill runs third-party Markdown prose and, potentially, third-party scripts the skill
tells the agent to run. Skills Hub is a delivery mechanism, not an audit: it shows the upstream
security status and links the upstream report, and it refuses to overwrite or delete anything it did
not install, but you are still trusting the publisher. Read the file list and the `SKILL.md` on the
detail page before installing — the panel exists so that you can.

Network behaviour: the host half talks only to the two configured endpoints; the browser half talks
only to the plugin's own routes on the profile's own origin.

## Development

```sh
pnpm install
pnpm typecheck     # host program + client program
pnpm build         # tsc (both programs) + client bundle (tsdown, purity gate + CSS modules)
pnpm verify        # manifest coherence, client purity, then the test suite
```

Layout:

```
src/index.ts             host half: plugin entry, config, wiring
src/web-routes.ts        /api/skills-hub/* (one prefix route, JSON, no-store)
src/market/              provider aggregation: ClawHub, SkillHub, cache, install service
src/skills/              skills directory resolution, installed index, provenance sidecar
src/client/              browser half: sidebar entry + main panel
src/client/components/   presentational components (CSS Modules, --dsw-* tokens)
docs/CONTRACT.md         the frozen interface contract the halves are built against
```

The client half may import runtime values only from the platform module table (`react`,
`@deepseek-ai/cordis`, `@deepseek-ai/dsh-client-ui-slots`, `@deepseek-ai/dsh-client-ui-primitives`,
`@deepseek-ai/dsh-client-store`); everything else is a build error, and `pnpm verify` re-checks it.

Local smoke test against a scratch profile:

```sh
dsh plugin --profile skills-hub-check add file:$PWD
dsh --profile skills-hub-check --dump-config | grep -A3 skills-hub
```

## License

MIT.
