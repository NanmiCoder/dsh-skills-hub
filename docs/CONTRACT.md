# dsh-skills-hub — frozen interface contract

Every parallel workstream implements exactly the interfaces below. Do **not** rename, re-shape or
"improve" a frozen symbol: another workstream is compiling against it at the same time.
If a frozen interface is genuinely impossible, stop and report instead of diverging.

## 1. What we are building

A DeepSeek Harness (DSH) plugin, installed into a profile, that adds a **Skills Hub / 技能市场**
panel to the DSH Web GUI: browse, search, filter, preview and install third-party skills from
**ClawHub** (`https://clawhub.ai`) and **SkillHub** (`https://api.skillhub.cn`) into the local DSH
skills directory, plus uninstall. Installed skills immediately become available to the `skill` tool.

Reference implementation to port from (read it, do not modify it):
`~/workspace/myself_code/claude-code-haha`
- host market core: `src/server/services/market/{types,providerFetch,clawhubProvider,skillhubProvider,cache,marketService,installService}.ts`
- HTTP surface: `src/server/api/market.ts`
- UI: `desktop/src/components/market/*.tsx`, `desktop/src/stores/marketStore.ts`, `desktop/src/types/market.ts`

The reference desktop app is Tailwind + zustand + lucide-react. **None of those exist here.** We use
CSS Modules, React state and inline SVG icons, and DSH's own `--dsw-*` theme tokens.

## 2. Runtime and repository rules (hard)

- DSH being targeted: **0.1.7-rc.2**, installed at
  `/opt/homebrew/lib/node_modules/@deepseek-ai/dsh/node_modules/@deepseek-ai/*`.
  Evidence for every API you use must come from those installed `lib/types/**/*.d.ts` files, from
  the live Inspect providers, or from a plugin in the same profile
  (`~/.dsh/profiles/desktop/node_modules/dsh-plugin-whale-pet`, and the open-source
  `~/workspace/myself_code/dsh-agent-teams`, whose build config we copied).
  Never invent an API. If you cannot find it, say so in your report.
- Host half: plain Node ESM, Node ≥ 22, `node:*` imports allowed, `fetch` is global.
- Client half: browser only. Import value symbols **only** from the platform module table:
  `react`, `react/jsx-runtime`, `react-dom`, `@deepseek-ai/cordis`,
  `@deepseek-ai/dsh-client-store`, `@deepseek-ai/dsh-client-ui-slots`,
  `@deepseek-ai/dsh-client-ui-primitives`. Anything else `@deepseek-ai/*` that carries runtime
  values fails the build purity gate in `tsdown.config.ts`. Type-only imports (`import type`) are
  erased and always allowed.
- No new runtime dependencies. No Tailwind, no lucide-react, no zustand, no markdown library.
- Styling: one co-located `<Component>.module.css` per component, CSS Modules only, using
  `--dsw-alias-*` tokens. Verified token names (use these, with the `var(--token, fallback)` form):
  `--dsw-alias-bg-base`, `--dsw-alias-bg-layer-1`, `--dsw-alias-bg-layer-2`, `--dsw-alias-bg-overlay`,
  `--dsw-alias-bg-mask-3`, `--dsw-alias-bg-module-platform`, `--dsw-alias-border-l1`,
  `--dsw-alias-border-l2`, `--dsw-alias-border-l3`, `--dsw-alias-label-primary`,
  `--dsw-alias-label-secondary`, `--dsw-alias-label-tertiary`, `--dsw-alias-label-primary-inverted`,
  `--dsw-alias-brand-primary`, `--dsw-alias-state-success-primary`, `--dsw-alias-state-warn-primary`,
  `--dsw-alias-state-error-primary`, `--dsw-alias-state-idle-primary`,
  `--dsw-alias-state-business-primary`, `--dsw-alias-interactive-bg-hover`,
  `--dsw-alias-button-ghost-active-fill`.
  Always give a literal fallback (e.g. `var(--dsw-alias-border-l2, #e5e7eb)`) so the panel renders
  even outside DSH. Light/dark must both work: never hardcode a background without a token.
- CSS modules must not rely on global selectors or `:global`.
- TypeScript: two programs. `tsconfig.json` (host, `src/**` except `src/client`) and
  `tsconfig.client.json` (client, `src/client` + `src/market/types.ts` + `src/css-modules.d.ts`).
  Both are strict with `noUncheckedIndexedAccess`. Relative imports use the `.ts`/`.tsx` extension
  (`rewriteRelativeImportExtensions` is on).

## 3. File ownership map

| Path | Owner |
| --- | --- |
| `package.json`, `tsconfig*.json`, `tsdown.config.ts`, `cordis.patch.yml`, `scripts/*` | captain (frozen, do not edit) |
| `src/market/types.ts` | captain (already ported, frozen; see §4) |
| `src/market/provider-fetch.ts`, `src/market/clawhub-provider.ts`, `src/market/skillhub-provider.ts`, `src/market/cache.ts`, `src/market/market-service.ts` | W1 |
| `src/index.ts`, `src/config.ts`, `src/web-routes.ts`, `src/market/install-service.ts`, `src/skills/root.ts`, `src/skills/installed.ts` | W2 |
| `src/client/index.tsx`, `src/client/api.ts`, `src/client/state.ts`, `src/client/locales.ts`, `src/client/page/MarketPage.tsx`, `src/client/page/MarketPage.module.css` | W3 |
| `src/client/components/*.tsx`, `src/client/components/*.module.css`, `src/client/icons.tsx` | W4 |
| `README.md`, `docs/*`, `tests/*` | W5 |

Never create or edit a file owned by another workstream. Additive helper files are allowed only
inside your own path list.

## 4. Shared types (already in `src/market/types.ts`, ported verbatim from the reference)

`MarketSource = 'clawhub' | 'skillhub'`, `MARKET_SOURCES`, `SecurityStatus`,
`InstallState = 'installed' | 'installable' | 'not-installable'`, `SourceHealthStatus`,
`NotInstallableReason`, `SecurityReport`, `NormalizedSkill`, `MarketFileMeta`,
`NormalizedSkillDetail`, `MarketFileContent`, `SourceStatusInfo`, `MarketListResult`,
`ProviderListPage`, `ProviderFileEntry`, `MarketProvider`, `MARKET_ERROR_CODES`,
`MarketUpstreamError`, `MARKET_LIMITS`, `skillId()`, `parseSkillId()`, `sanitizeDirName()`,
`detectMarketLanguage()`.

Do not change this file. The client imports types from it with `import type` only (never a value
import — that would drag host code into the browser bundle).

## 5. Host contract

### 5.1 W1 — market core (pure, no DSH services, no filesystem)

```ts
// src/market/provider-fetch.ts
export interface ProviderEndpointConfig {
  clawhubBaseUrl: string   // default 'https://clawhub.ai'
  skillhubBaseUrl: string  // default 'https://api.skillhub.cn'
  timeoutMs: number        // default 15_000
  retries: number          // default 1 (retry once on network error / 5xx)
  userAgent: string
}
export function configureProviderFetch(config: Partial<ProviderEndpointConfig>): void
/** Fetch an upstream URL with timeout, retries and JSON/text helpers. */
export async function providerFetch(source: MarketSource, url: string, init?: RequestInit): Promise<Response>
export async function providerFetchJson<T>(source: MarketSource, url: string, init?: RequestInit): Promise<T>
export class MarketHttpError extends Error { readonly source: MarketSource; readonly status: number }

// src/market/clawhub-provider.ts
export const clawhubProvider: MarketProvider
export function resetClawhubOwnerCache(): void   // test hook, mirrors the reference
// src/market/skillhub-provider.ts
export const skillhubProvider: MarketProvider

// src/market/cache.ts  — source health + short-lived response cache
export function getSourceHealth(source: MarketSource): SourceStatusInfo
export function markSourceHealth(source: MarketSource, status: SourceHealthStatus, error?: string): void
export function resetSourceHealth(): void
export function resetMarketCache(): void

// src/market/market-service.ts
export interface ListMarketSkillsParams {
  q?: string
  source: 'all' | MarketSource
  security: 'all' | SecurityStatus
  installed: 'all' | 'installed' | 'installable'
  cursor?: string
  limit: number
}
export async function listMarketSkills(params: ListMarketSkillsParams): Promise<MarketListResult>
export async function getMarketSkillDetail(
  source: MarketSource, slug: string,
): Promise<{ skill: NormalizedSkillDetail; sourceStatus: SourceStatusInfo }>
export async function getMarketFileContent(
  source: MarketSource, slug: string, filePath: string,
): Promise<MarketFileContent>
export function getMarketStatus(): Record<MarketSource, SourceStatusInfo>
export function isValidMarketFilePath(filePath: string): boolean
```

Porting notes:
- Keep the reference's dedupe/merge behaviour (SkillHub mirrors a ClawHub skill → ClawHub entry
  wins and is enriched; `mirrors`/`upstream` fields carry the link), the security-status mapping,
  the pagination strategies (ClawHub cursor, SkillHub page/pageSize), `MARKET_LIMITS` caps and
  source-health bookkeeping.
- `installState` is **not** decided by W1: `listMarketSkills`/`getMarketSkillDetail` take an injected
  installed-id set. Frozen seam:

```ts
// src/market/market-service.ts (continued)
export interface InstalledLookup {
  /** ids (`source:slug`) of skills already present in the local skills directory */
  has(id: string): boolean
  info(id: string): { dirName: string; version?: string; installedAt?: string } | undefined
}
export function setInstalledLookup(lookup: InstalledLookup): void
```
  W2 installs its implementation at plugin start (`setInstalledLookup(...)`); W1's default is an
  empty lookup, so the module stays unit-testable with no filesystem.
- `configureProviderFetch` is called from W2's plugin `apply()` with the resolved Config.

### 5.2 W2 — plugin entry, HTTP surface, installation

```ts
// src/config.ts
export interface SkillsHubConfig {
  skillsRoot: string | null      // null = resolve the profile/user skills directory
  clawhubBaseUrl: string
  skillhubBaseUrl: string
  timeoutMs: number
  requestRetries: number
  allowUninstall: boolean
  pageSize: number
}
export const Config: /* schemastery z.object */ unknown   // real type from @deepseek-ai/schemastery
```

```ts
// src/skills/root.ts
/** Absolute skills directory skills are installed into (created on demand). */
export async function resolveSkillsRoot(configured: string | null): Promise<string>
/** Every directory DSH will scan for skills, most specific first (installed lookup). */
export async function resolveSkillsScanRoots(configured: string | null): Promise<string[]>
```

```ts
// src/skills/installed.ts
export interface InstalledSkillRecord {
  id: string                    // 'source:slug' when the sidecar provenance file exists, else 'local:<dir>'
  source: MarketSource | 'local'
  slug: string
  name: string
  dirName: string
  dirPath: string
  version?: string
  summary?: string
  installedAt?: string
  managed: boolean              // installed by this plugin (sidecar `.skills-hub.json` present)
  bytes: number
  fileCount: number
}
export const INSTALL_META_FILE = '.skills-hub.json'
export async function scanInstalledSkills(roots: string[]): Promise<InstalledSkillRecord[]>
export function installedLookupFrom(records: InstalledSkillRecord[]): InstalledLookup
```

```ts
// src/market/install-service.ts
export interface InstallResult { installedPath: string; skill: NormalizedSkill }
export interface UninstallResult { removedPath: string; skill: NormalizedSkill }
export async function installMarketSkill(
  source: MarketSource, slug: string, options: { skillsRoot: string; allowUninstall: boolean },
): Promise<InstallResult>
export async function uninstallMarketSkill(
  source: MarketSource, slug: string, options: { skillsRoot: string; allowUninstall: boolean },
): Promise<UninstallResult>
```
  Ported from the reference: whole-file fetch, SHA-256 verification when the provider reports one,
  `sanitizeDirName` whitelist, size/count limits from `MARKET_LIMITS`, no-clobber (refuse to
  overwrite a directory that is not ours), in-flight lock per `source:slug`
  (`MARKET_ERROR_CODES.installInProgress`), and a provenance sidecar named `INSTALL_META_FILE`
  containing `{ id, source, slug, version?, installedAt, files: [{ path, sha256 }] }`.
  Uninstall only removes directories whose sidecar matches the requested id and only when
  `allowUninstall`; an unmanaged directory is `MARKET_ERROR_CODES.notManaged`, a missing one is
  `MARKET_ERROR_CODES.notInstalled`. Writes are atomic (temp dir + rename inside the same parent).

```ts
// src/web-routes.ts
export const ROUTE_PREFIX = '/api/skills-hub'
export interface WebServerLike {
  register(route: {
    kind: 'exact' | 'prefix'
    path: string
    handler: (req: IncomingMessage, res: ServerResponse) => void | Promise<void>
  }): () => void
}
export interface SkillsHubRoutesDeps {
  skillsRoot: () => Promise<string>
  allowUninstall: () => boolean
  rescan: () => Promise<void>
}
/** One prefix route; returns its disposer. */
export function registerSkillsHubRoutes(
  webServer: WebServerLike,
  gate: SkillsHubGateSource,
  deps: SkillsHubRoutesDeps,
): () => void
```
where `SkillsHubGateSource = () => { requestRejection(req, res): boolean } | undefined` — a **getter**,
resolved per request. A snapshot taken in `apply()` is wrong: Loader rows activate concurrently, so
the Connection service usually appears after the route is registered, and a captured `undefined`
left the whole marketplace unfenced (found on a real host: official `/api/*` answered `403` to an
untrusted `Origin` while `/api/skills-hub/*` answered `200`). `tests/plugin-http.test.mjs` pins this.

HTTP surface (JSON, `Cache-Control: no-store` on every response):

| Method | Path | Success body |
| --- | --- | --- |
| GET | `/api/skills-hub/status` | `{ sources: Record<MarketSource, SourceStatusInfo> }` |
| GET | `/api/skills-hub/skills?q=&source=&security=&installed=&cursor=&limit=` | `MarketListResult` |
| GET | `/api/skills-hub/skills/{source}/{slug}` | `{ skill: NormalizedSkillDetail; sourceStatus: SourceStatusInfo }` |
| GET | `/api/skills-hub/skills/{source}/{slug}/file?path=SKILL.md` | `{ file: MarketFileContent }` |
| GET | `/api/skills-hub/installed` | `{ items: InstalledSkillRecord[] }` |
| POST | `/api/skills-hub/install` `{ "id": "source:slug" }` | `{ ok: true, installedPath, skill: NormalizedSkill }` |
| POST | `/api/skills-hub/uninstall` `{ "id": "source:slug" }` | `{ ok: true, removedPath, skill: NormalizedSkill }` |

Errors: HTTP 400 for bad input, 404 for unknown route / bad upstream payload, 405 wrong method,
502 upstream failure, 409 install-in-progress, 500 otherwise, always
`{ "error": { "code": "<MARKET_ERROR_CODES value or BAD_REQUEST|NOT_FOUND|METHOD_NOT_ALLOWED>", "message": "..." } }`.
Validate `source` against `MARKET_SOURCES`, reject `/`, `\`, `..` in slugs, reject unsafe file paths
with `isValidMarketFilePath`, and bound the request body (mirror `readJsonRequest` in
`dsh-agent-teams/src/web-routes.ts`). Every handler must catch its own rejections.
The `gate` is `ctx.get('connection')`; when present, call `requestRejection(req, res)` first and
stop if it returns true. Register with `ctx.effect(() => registerSkillsHubRoutes(...))`.

```ts
// src/index.ts
export const name: string                 // 'skills-hub'
export const inject: string[]             // only what is genuinely required, e.g. ['webServer']
export { Config }
export function apply(ctx: Context, config: SkillsHubConfig): void
```
  `apply()` resolves the config, calls `configureProviderFetch`, builds the installed-skill index
  (`resolveSkillsScanRoots` + `scanInstalledSkills` + `setInstalledLookup`), registers the routes,
  re-scans after install/uninstall, and keeps every resource behind `ctx.effect`/disposers.
  Use `ctx.get('webServer') ?? ctx.get('httpServer')` guarded (mirror
  `WEB_SERVER_KEYS` in `dsh-agent-teams/src/index.ts`) so an unknown service key cannot crash boot.

### 5.3 W3 — client shell

```ts
// src/client/index.tsx
export const name = 'skills-hub-client'
export const inject: string[]                       // 'slots' required, plus 'layout'/'locale' if used
export const PANEL_ID = 'skills-hub'                // sidebar entry id AND main-slot key
export function apply(ctx: ClientContext): void
```
  Registers, exactly as `@deepseek-ai/dsh-client-ui-plugin-manager` does:
  `ctx.slots.inject('main', function* () { yield ctx.slots.register({ name: 'main', key: PANEL_ID, locale: NS, inject: () => controller.inject(...) }, MarketPage) })`
  and `ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({ name: 'sidebar.panellist', id: PANEL_ID, order: 20, label: () => t('panel'), locale: NS }, SkillsHubIcon))`.
  Read the real signature from
  `@deepseek-ai/dsh-client-ui-slots/lib/types/**` and copy the working shape from
  `/opt/homebrew/lib/node_modules/@deepseek-ai/dsh/node_modules/@deepseek-ai/dsh-client-ui-plugin-manager/lib/client.js`
  (it is readable). The `store` seat is optional — only pass it if the type requires it; a plain
  React controller per panel instance is fine and preferred.
  Clicking the sidebar icon must select the panel: the entry `id` equals the `main` key and DSH's
  layout store maps it — verify in `.../dsh-client-ui-sidebar/lib/client.js` before adding any
  extra `ctx.layout.selectPanel(PANEL_ID)` call.

```ts
// src/client/api.ts
export interface MarketQuery {
  q?: string
  source: 'all' | MarketSource
  security: 'all' | SecurityStatus
  installed: 'all' | 'installed' | 'installable'
  cursor?: string
  limit?: number
}
export async function fetchMarketList(query: MarketQuery, signal?: AbortSignal): Promise<MarketListResult>
export async function fetchSkillDetail(id: string, signal?: AbortSignal): Promise<{ skill: NormalizedSkillDetail; sourceStatus: SourceStatusInfo }>
export async function fetchSkillFile(id: string, path: string, signal?: AbortSignal): Promise<MarketFileContent>
export async function fetchSourceStatus(signal?: AbortSignal): Promise<Record<MarketSource, SourceStatusInfo>>
export async function fetchInstalled(signal?: AbortSignal): Promise<InstalledSkillRecord[]>
export async function installSkill(id: string): Promise<{ installedPath: string; skill: NormalizedSkill }>
export async function uninstallSkill(id: string): Promise<{ removedPath: string; skill: NormalizedSkill }>
export class SkillsHubApiError extends Error { readonly code: string; readonly status: number }
```
  `fetch` with `{ credentials: 'same-origin' }`; parse the `{ error: { code, message } }` envelope.

```ts
// src/client/state.ts
export interface MarketFilters {
  q: string
  source: 'all' | MarketSource
  security: 'all' | SecurityStatus
  installed: 'all' | 'installed' | 'installable'
}
export interface MarketState {
  filters: MarketFilters
  items: NormalizedSkill[]
  nextCursor: string | null
  sources: Record<MarketSource, SourceStatusInfo>
  loading: boolean
  loadingMore: boolean
  error: string | null
  view: { kind: 'home' } | { kind: 'detail'; id: string }
  detail: NormalizedSkillDetail | null
  detailLoading: boolean
  detailError: string | null
  activeTab: 'overview' | 'files'
  file: MarketFileContent | null
  fileLoading: boolean
  installingIds: ReadonlySet<string>
  confirmInstallId: string | null
  disclaimerDismissed: boolean
  notice: string | null
}
export interface MarketController {
  state: MarketState
  readonly injected: MarketPageInjected
  refresh(): Promise<void>
  loadMore(): Promise<void>
  setQuery(q: string): void
  setSource(source: MarketFilters['source']): void
  setSecurity(security: MarketFilters['security']): void
  setInstalledFilter(installed: MarketFilters['installed']): void
  openDetail(id: string): Promise<void>
  closeDetail(): void
  setTab(tab: 'overview' | 'files'): void
  selectFile(path: string): Promise<void>
  requestInstall(id: string): void
  cancelInstall(): void
  confirmInstall(): Promise<void>
  uninstall(id: string): Promise<void>
  dismissDisclaimer(): void
  dismissNotice(): void
}
export interface MarketPageInjected {
  useMarketController: () => MarketController
}
export function createMarketController(): MarketController   // framework-free, testable
export function useMarketController(): MarketController      // React binding (useSyncExternalStore or useReducer+useState)
```
  Behaviour to port from `desktop/src/stores/marketStore.ts`: debounced query reload, stale-response
  rejection (a newer request wins), merge by `id`, installed-state patching after install/uninstall,
  detail cache, in-flight guards, `filters.installed === 'installed'` switching the list to the local
  installed index (`fetchInstalled`) instead of the remote list.
  `disclaimerDismissed` persists in `localStorage` under `dsh-skills-hub.disclaimer`.

```ts
// src/client/locales.ts
export const NS = 'skillsHub'
export const zh: Record<string, string>   // full zh-CN dictionary
export const en: Record<string, string>   // full en-US dictionary
declare module '@deepseek-ai/dsh-client-ui-slots' { interface LocaleNamespaceMap { skillsHub: string } }
```
  Copy the registration mechanics from `dsh-agent-teams/src/client/locales.ts` (same DSH version).
  Every user-visible string in the panel goes through the dictionary — no literals in components.
  Required keys (extend as needed, keep both languages complete):
  `panel`, `title`, `subtitle`, `searchPlaceholder`, `source.all|clawhub|skillhub`,
  `security.all|verified|benign|unknown|flagged`, `installed.all|installed|installable`,
  `count`, `loading`, `loadMore`, `empty`, `error`, `retry`, `install`, `installing`, `installed`,
  `notInstallable`, `uninstall`, `uninstallConfirm`, `cancel`, `confirm`, `back`, `overview`,
  `files`, `security`, `viewReport`, `author`, `downloads`, `installs`, `stars`, `updated`,
  `license`, `version`, `disclaimer`, `sourceStatus.ok|degraded|failed|cached`, `installDone`,
  `uninstallDone`, `noFiles`, `fileTooLarge`, `copy`, `copied`, `unoaudited`.

### 5.4 W4 — presentational components (exact props)

All components are `.tsx` + co-located `.module.css`, pure/presentational, no fetching. Icons come
from `src/client/icons.tsx`.

```ts
// src/client/icons.tsx — named exports, each `(props: { size?: number; className?: string }) => JSX.Element`
SkillsHubIcon, SearchIcon, DownloadIcon, StarIcon, TrashIcon, ShieldIcon, ArrowLeftIcon,
RefreshIcon, CopyIcon, CheckIcon, FileIcon, AlertIcon, ChevronRightIcon, CloseIcon, TagIcon

// src/client/components/SkillAvatar.tsx
export function SkillAvatar(props: { name: string; source: MarketSource; iconUrl?: string; size: number }): JSX.Element
// deterministic per-name gradient + first letter; render <img> only when iconUrl is an https URL

// src/client/components/SecurityBadge.tsx
export function SecurityBadge(props: { status: SecurityStatus; reports?: SecurityReport[]; compact?: boolean }): JSX.Element
// src/client/components/InstallStateBadge.tsx
export function InstallStateBadge(props: { state: InstallState }): JSX.Element
// src/client/components/SourceStatusBar.tsx
export function SourceStatusBar(props: { sources: Record<MarketSource, SourceStatusInfo>; onRefresh: () => void; refreshing: boolean }): JSX.Element
// src/client/components/MarketDisclaimer.tsx
export function MarketDisclaimer(props: { onDismiss: () => void }): JSX.Element
// src/client/components/FilterBar.tsx
export function FilterBar(props: {
  filters: MarketFilters
  total: number
  disabled: boolean
  onChange: (patch: Partial<MarketFilters>) => void
}): JSX.Element
// select controls may be native <select> styled with tokens; DSH's Menu is acceptable too
// src/client/components/SkillCard.tsx
export function SkillCard(props: {
  skill: NormalizedSkill
  installing: boolean
  onOpen: (id: string) => void
  onInstall?: (id: string) => void
}): JSX.Element
// src/client/components/FrontmatterPanel.tsx
export function FrontmatterPanel(props: { data: Record<string, unknown> }): JSX.Element
// src/client/components/InstallConfirmDialog.tsx  (DSH Modal primitive)
export function InstallConfirmDialog(props: {
  skill: { id: string; name: string; source: MarketSource; version?: string; securityStatus: SecurityStatus; authorName: string }
  busy: boolean
  onCancel: () => void
  onConfirm: () => void
}): JSX.Element
// src/client/components/MarketHome.tsx
export function MarketHome(props: {
  state: MarketState
  controller: MarketController
}): JSX.Element
// src/client/components/SkillDetailView.tsx
export function SkillDetailView(props: {
  detail: NormalizedSkillDetail
  state: MarketState
  controller: MarketController
}): JSX.Element
```

`MarketHome` renders: disclaimer (unless dismissed) → header row (count + source status) → `FilterBar`
→ responsive card grid (`auto-fill, minmax(300px, 1fr)`) → "load more" sentinel / spinner / empty /
error states. `SkillDetailView` renders: back button + avatar + name + version + source label +
badges → summary → security report row (`clawhub-scan`, status text, report link) → tabs
`overview | files` → overview: `MarkdownText` (from `@deepseek-ai/dsh-client-ui-primitives`) on the
SKILL.md body + `FrontmatterPanel` when frontmatter exists → files: file list (name, size, language)
and the selected file rendered with `CodeBlock` plus a copy button → right rail: uninstall button,
author, downloads, installs, stars, updated, license, version.

`MarkdownText` props: `{ source: string; variant?: 'body' | 'compact'; labels?: ... }` — confirm the
exact prop names in
`@deepseek-ai/dsh-client-ui-primitives/lib/types/markdown/MarkdownText.d.ts` before use; if the
component needs providers we do not have, render the body with a small local markdown-lite renderer
inside `SkillDetailView` instead, and say so in your report.

## 6. Captain decisions binding all workstreams

1. **Sidebar selection is the shell's job.** `.../dsh-client-ui-sidebar/lib/client.js` renders every
   `sidebar.panellist` entry inside its own `<button onClick={() => selectPanel(id)}>`, passing
   `{ size, active }` to the entry component. So the client half must NOT wrap the icon in a button
   and must NOT call `ctx.layout.selectPanel()` itself, and `SkillsHubIcon` must accept
   `{ size?: number; active?: boolean; className?: string }` and render a plain `<svg>`.
2. **Locale text reaches components through one context.** `src/client/locale-context.tsx` (owned by
   W3) exports `Translate`, `LocaleProvider` and `useT`. The `main` registration declares
   `locale: NS`, so the framework injects `t` into `MarketPage` (`PropsLocale<N>` in
   `@deepseek-ai/dsh-client-ui-slots`); `MarketPage` wraps its surface in `LocaleProvider`, and every
   W4 component calls `useT()`. No component takes a `t` prop.
3. **`tests/plugin-http.test.mjs` is the captain's end-to-end host gate** (fake Cordis context → real
   HTTP socket → live upstreams → install/uninstall in a temp skills root). W2 must keep
   `apply(ctx, config)` working with a context that only provides `webServer`/`httpServer`, `effect`,
   `on`, `inject`, `get`, `logger` and `reflect.provide`.

## 7. Verification each workstream must run

```
cd ~/workspace/myself_code/dsh-skills-hub
pnpm typecheck            # both programs must be clean
pnpm build                # tsc + tsdown; the client purity gate must pass
```

A workstream is not done while `pnpm typecheck` fails **because of its own files**. If the only
remaining errors are in another workstream's frozen seam, report them verbatim instead of patching
that file.

## 7. Reporting

Report: files written, interfaces implemented, evidence paths read, commands run with exit codes,
and anything you could not verify. Keep it short — the captain reads every report.
