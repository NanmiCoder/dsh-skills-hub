# Skills Hub 0.0.1 implementation contract

This document describes the shipped code, not a migration plan. The TypeScript models in `src/market/types.ts`, `src/skills/installed.ts` and `src/client/api.ts` define the detailed wire shapes. Update this document with API changes.

## 1. Package and host

The package is `@nanmicoder/dsh-skills-hub`, version `0.0.1`. Its supported host package cohort is exactly `0.2.0-rc.2`; the desktop release line is 0.2.0. The exact upstream tag and commit are recorded in `compatibility.json` and [COMPATIBILITY.md](COMPATIBILITY.md).

`cordis.patch.yml` inserts one row (`id: skills-hub`) named after the scoped package. `lib/index.js` is the host entry. `lib/client.js` is the browser factory registered with `window.__ModuleLoader__.load` under that same package name. The plugin adds a global sidebar panel and does not replace built-in components or require an agent session.

## 2. Host/browser boundary

The host performs provider requests and filesystem operations. It binds the available `webServer`/`httpServer` lazily, scopes route disposal to Cordis effects, and resolves the connection request gate for each request so late service activation is respected. Headless profiles may load the plugin without mounting a web surface.

The browser only calls same-origin `/api/skills-hub/*` endpoints, with same-origin credentials. Shared market imports in browser code are type-only. Browser runtime externals must belong to the Harness platform module table; host services and Node modules must not enter the browser bundle.

`react-markdown` and `remark-gfm` are development dependencies compiled into the browser artifact. Rendering supports headings, tables, task lists and fenced code without relying on an optional host renderer. Raw HTML is skipped; dangerous URL protocols are filtered by the renderer, and external links use `noopener noreferrer`. `src/client/skill-markdown.ts` splits a document's YAML frontmatter from its body with a small subset parser compiled into the same bundle (scalars, inline/block sequences, `|`/`>` block scalars, one level of nested mapping kept as raw YAML): no YAML dependency enters the browser program, and the metadata block is rendered as structure instead of reaching the renderer, where its closing `---` would turn the whole block into a setext heading.

The bundler explicitly selects the browser platform even though its output is a CommonJS factory. Both build-time import checks and manifest checks guard this boundary. CSS Modules use `--dsw-*` theme tokens and relative source IDs for portable output.

## 3. Filesystem scope and installed identities

The installation root is `skillsRoot` when configured, otherwise `$DSH_HOME/skills` (default Harness home: `~/.dsh`). Discovery scans, in order:

1. The installation root.
2. `$DSH_HOME/skills`.
3. `$DSH_AGENTS_HOME/skills`, defaulting to `~/.agents/skills`.

Duplicate roots collapse. Tilde prefixes are expanded and configured relative paths resolve against the host working directory. Session/project `.dsh/skills` and `.agents/skills` roots are deliberately excluded because this panel has no session working directory. This is a user-root inventory, not an enumeration of every skill a particular session or plugin provider might expose.

Discovery recognizes directory bundles containing `SKILL.md`, flat Markdown skill files and valid symlink entries. It reads names/descriptions from bounded frontmatter and measures files with traversal limits. The Installed view is populated from this filesystem scan independently of market availability; it does not invent market entries for local skills.

An `InstalledSkillRecord` has:

| Field | Meaning |
| --- | --- |
| `key` | Opaque 64-character hexadecimal identity for the exact filesystem entry; use this for local management. |
| `id` | Market `source:slug` when a valid provenance sidecar exists; otherwise a local identity. Not unique across duplicate installations. |
| `source` | `clawhub`, `skillhub` or `local`. |
| `slug`, `name`, `dirName` | Logical skill and display identity. |
| `dirPath` | Absolute path of the bundle directory, flat file or symlink entry, shown before removal. |
| `linked` | Entry is a symlink; removal unlinks it, never its target. |
| `managed` | Valid `.skills-hub.json` marketplace provenance was discovered. |
| `removable` | Whether UI removal is allowed; the list reflects `allowUninstall`. The server independently enforces that switch. |
| `bytes`, `fileCount` | Bounded scan statistics. |
| `version`, `summary`, `installedAt` | Optional metadata. |

Duplicate names/market IDs in separate roots remain separate rows with separate keys. Local endpoints accept keys, never arbitrary client-supplied paths. They freshly scan the allowed roots to resolve the entry. Removal renames the selected entry to a hidden temporary sibling before deletion; removing a link preserves its target. A flat file removal preserves its sibling files.

A local detail read resolves the entry, reads its `SKILL.md`/flat document (2 MiB bound) and inventories the entry's own files: relative POSIX paths with size and detected language, dot-entries (including the provenance sidecar) excluded, at most 500 rows, symlinked files never followed. The document's frontmatter is returned verbatim as YAML text — the structured panel of a market detail is fed by upstream JSON that a hand-written skill does not have. A file read takes the same key plus a relative path: the path is validated (no absolute paths, no `..`, no empty segment), resolved inside the entry's real path, and rejected when a symlink would leave it, so the endpoint is never an arbitrary-file reader. A flat entry exposes only itself, never its siblings in the same root. Truncation at 300 KiB is reported, not thrown.

Market installation uses staging and atomic publication, rejects directory conflicts, validates file paths and hashes when supplied, and writes a `.skills-hub.json` sidecar. The market-ID uninstall endpoint requires valid matching provenance; the explicit local-management endpoint can remove unmanaged entries after the UI confirmation. Both honor `allowUninstall`.

After mutations the plugin refreshes its installed lookup. Harness's filesystem watcher handles skill catalog invalidation; the plugin does not forge filesystem observation events. Reading the catalog is best-effort and does not replace that watcher.

## 4. Marketplace models and limits

Providers normalize ClawHub and SkillHub into `NormalizedSkill`. A market ID is `clawhub:<slug>` or `skillhub:<slug>`. The model includes name/summary/author, statistics, tags, version, security status and installation state. SkillHub mirrors may be deduplicated into their ClawHub originals.

`NormalizedSkillDetail` adds Markdown `description`, optional frontmatter/license, `files` and `totalSize`. File metadata includes relative path, byte size, language, optional hash/content type and `tooBig`. File previews include `content`, `size`, `language` and `truncated`.

Source status is `ok`, `degraded`, `failed` or `cached`, with optional fetch time/cache/error metadata. Provider failures remain visible independently; an unavailable source must not silently look like an empty marketplace.

Upstream list pages (including each cursor), search pages, normalized details with their file inventory, and file previews are cached in memory and persisted under `$DSH_HOME/cache/skills-hub/v1` (default `~/.dsh/cache/skills-hub/v1`). Writes use a temporary file and atomic rename, and complete before the response returns. Restarted hosts read snapshots lazily, checking a versioned SHA-256 digest of the key, timestamps and payload before using them. Keys include the source's configured base URL as well as all payload-affecting request parameters; each operation captures its provider configuration and cache instance so a profile reload cannot mix them. Local install annotations are computed after reading the cache, and HTTP reads wait for the initial local inventory scan.

All snapshots default to a 60-minute TTL, configurable through `cacheTtlMinutes` (1–1440). `storedAt` and `expiresAt` survive restart; a hit does not extend them, and reducing the configured TTL also limits existing snapshots. Browser display copies revalidate through the Host on each detail opening or file selection; each list card retains its own page's provenance for installation confirmation. Expired list/detail snapshots may be served on upstream errors for at most seven days. Actual install-time manifest reads bypass both fresh cache hits and stale fallback. Persisted snapshots are capped at 500 entries / 64 MiB, evict older writes first, and reject entries larger than 5 MiB while invalidating any older snapshot at that key. Writes also reclaim abandoned plugin temporary files older than one hour, leaving recent files alone for concurrent publishers. Unsupported/corrupt records or filesystem failures fall back to ordinary upstream reads and memory storage; the host logs a filesystem/parse failure once per activation.

Current market limits are 5 MiB per file, 20 MiB total and 200 files per install. Market previews truncate after 300 KiB. ClawHub search results are capped at 50 because that search endpoint does not paginate. Local installed Markdown previews are limited to 2 MiB and reject oversized content; a single local file preview truncates after 300 KiB, matching the market preview policy.

## 5. HTTP and browser behavior

### 5.1 Transport and validation

One host prefix route serves the endpoints below. Responses are JSON with `Cache-Control: no-store`. Failures use `{ "error": { "code": "…", "message": "…" } }` and an appropriate non-2xx status. Methods, route depth, IDs, enum filters, body sizes and paths are validated. The connection gate can reject requests with 401/403.

The browser surfaces transport failures as `NETWORK_ERROR`; invalid successful JSON becomes `MARKET_UPSTREAM_BAD_RESPONSE`. Aborted superseded reads are control flow and must not appear as user-visible errors.

### 5.2 Endpoints

All paths below are relative to `/api/skills-hub`.

| Method | Path / input | Success body |
| --- | --- | --- |
| GET | `/status` | `{ sources }` keyed by market source. |
| GET | `/stats` | `{ stats }` cache counters: `hits`, `misses`, `staleServed`, `upstreamRequests`, `forcedRefreshes`. |
| GET | `/skills?q=&source=&security=&installed=&cursor=&limit=&refresh=` | `{ items, nextCursor, sources }`. |
| GET | `/skills/:source/:slug?refresh=` | `{ skill, sourceStatus }`. |
| GET | `/skills/:source/:slug/file?path=…` | `{ file }`. |
| POST | `/install`, JSON `{ id }` | `{ ok: true, installedPath, skill }`. |
| POST | `/uninstall`, JSON `{ id }` | `{ ok: true, removedPath, skill }`; market-managed installation only. |
| GET | `/installed` | `{ items: InstalledSkillRecord[] }`; no provider request. |
| GET | `/installed/detail?key=…` | `{ item, markdown, frontmatter, files }`; reads the selected local copy, its raw YAML header and its own file inventory. |
| GET | `/installed/file?key=…&path=…` | `{ file }` with `content`, `size`, `language`, `truncated`; the path must resolve inside the selected entry. |
| POST | `/installed/uninstall`, JSON `{ key }` | `{ ok: true, removedPath, item }`; exact discovered entry. |

`refresh` is `1`/`true` or `0`/`false` (absent means false); any other value is a `BAD_REQUEST`, because a refresh the Host cannot honour would let the panel present a cached answer as a fresh one. A refresh skips fresh cache entries for that request and rewrites them with what upstream returned.

List `source` is `all`, `clawhub` or `skillhub`. `security` is `all`, `verified`, `benign`, `unknown` or `flagged`. `installed` is `all`, `installed` or `installable`; this filters the remote catalog and is distinct from the independent Installed view. `limit` is 1–100, defaulting to configured `pageSize`. Cursors are opaque and `null` means exhausted.

### 5.3 Interaction contract

The marketplace shows skeleton cards on initial loading and a detail skeleton immediately after opening a card. An intersection observer inside the actual list scroll area loads the next page as the sentinel approaches view. It preserves loaded cards, deduplicates results and avoids concurrent duplicate loads. Pagination failures expose retry without discarding existing results.

Search/filter changes cancel superseded requests, reset pagination and reject stale responses. Installed management has its own loading, empty, error, search and refresh states. Its local detail reads the exact selected entry, and removal requires a confirmation showing its path; symlink removals explain that the target is preserved. Successful mutations update the displayed list and installed state. Buttons expose disabled/pending state during mutations.

Both detail pages are full-panel views built on one shell (`SkillDetailShell`): the list is replaced, focus moves to the heading, and a back control returns to it. The market page keeps its tab and selected file in `MarketState`; the local page keeps them in its own state and never unmounts the inventory list, so the query and rows survive the round trip. The local page shows only what the filesystem proves — path, provenance, size, installed time, layout, the rendered SKILL.md and its own files — and omits market-only rows (author, downloads, security reports) rather than showing zeros. A skill with valid market provenance also offers "view in marketplace", which switches to the market section and opens its provider-backed page: upstream facts stay upstream, and the local page stays readable offline.

Provenance is part of every answer. `sourceStatus.fetchedAt` is the moment the payload was *read from upstream* — a cache hit keeps the original timestamp instead of restamping it with the current clock — and `fromCache` says whether the answer came from a stored copy. The panel prints that age next to each source and, when a detail is a snapshot, offers the one action that reaches upstream (`refresh=1`). Installing never relies on a snapshot: the manifest is re-read with `refresh` semantics before the files are fetched and hash-verified, so a cached security verdict or file list can never authorize an install.

The catalogue fetches the next page about one screen before the reader reaches the end of the list, and only after the reader has scrolled at least once: opening the panel and leaving must not cost a page nobody looked at. The request count is unchanged — the same page is fetched either way — it simply happens while the reader is still scrolling, so arriving at the sentinel finds data instead of starting a request. The look-ahead observer must be rooted at the list's own scroll container: the catalogue scrolls inside the host dock, and a viewport-rooted observer is clipped by that dock, which makes `rootMargin` a no-op there.

Inside the Files tab, a markdown document opens rendered — frontmatter as structured metadata, body through the same GFM renderer — because SKILL.md is prose meant to be read. Installing remains a trust decision, so a preview/source switch keeps the exact bytes (line numbers, and a copy button pointed at what is on disk) one click away; selecting another file returns to the rendered form. Every other language is source-only, since a toggle there would promise a rendering that does not exist.

## 6. Configuration

`src/config.ts` is the configuration source of truth. Defaults:

| Key | Default |
| --- | --- |
| `skillsRoot` | `null` |
| `clawhubBaseUrl` | `https://clawhub.ai` |
| `skillhubBaseUrl` | `https://api.skillhub.cn` |
| `timeoutMs` | `15000` |
| `requestRetries` | `1` |
| `allowUninstall` | `true` |
| `pageSize` | `24` |

Timeout is at least 1000 ms, retries are nonnegative, and page size is 1–100. The uninstall switch covers market and local removal. Installation does not execute skill scripts; reviewing and later following third-party instructions remains a separate trust decision.

## 7. Build, verification and release

Use the `packageManager` version in `package.json` and the single pnpm lockfile. All development `@deepseek-ai/dsh-*` packages use the exact supported cohort.

- `pnpm typecheck`: host and client TypeScript programs.
- `pnpm build`: clean `lib/`, compile both programs and bundle the client.
- `pnpm verify`: manifest checks and regression tests, including filesystem and HTTP behavior.
- `pnpm verify:release`: package, release note and compatibility metadata coherence.
- `pnpm check`: typecheck, build, verify and release metadata.
- `pnpm pack:check`: complete check plus npm tarball export/runtime-import closure and leak checks.

`prepack` and `prepublishOnly` run the complete check. Git retains generated `lib/`; npm includes the browser bundle and declarations while excluding intermediate `lib/client/` JavaScript. The registry preflight refuses collisions, existing versions and backwards stable releases. CI and publication workflow details live in [RELEASE.md](RELEASE.md).

Automated tests are distinct from exact-host/browser acceptance. The supported cohort, evidence and remaining scope belong in [COMPATIBILITY.md](COMPATIBILITY.md); widening peer ranges requires renewed host verification.
