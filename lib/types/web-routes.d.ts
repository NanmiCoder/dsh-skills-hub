/**
 * Skills Hub HTTP surface.
 *
 * One `prefix` route (`/api/skills-hub`) owns the endpoints the panel
 * needs; every response is JSON with `Cache-Control: no-store`, because the
 * panel polls and every payload is either live upstream data or live disk state.
 *
 * Two properties matter more than the routing itself:
 *
 *  - **Nothing escapes as a non-JSON error.** The handler catches its own
 *    rejections, the web server's own catch-all would answer a thrown handler
 *    with a bare `400` and no body, and the browser client parses the
 *    `{ error: { code, message } }` envelope.
 *  - **The browser-trust gate runs first.** Raw `webServer` routes do not inherit
 *    the Connection service's Host/Origin fence, so a route registered here would
 *    otherwise be reachable by a cross-site request or a DNS-rebound page.
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
/** Path prefix of the whole Skills Hub API. */
export declare const ROUTE_PREFIX = "/api/skills-hub";
/** Structural Web server contract (mirrors `WebServer.register`). */
export interface WebServerLike {
    register(route: {
        kind: 'exact' | 'prefix';
        path: string;
        handler: (req: IncomingMessage, res: ServerResponse) => void | Promise<void>;
    }): () => void;
}
export interface SkillsHubRoutesDeps {
    skillsRoot: () => Promise<string>;
    allowUninstall: () => boolean;
    rescan: () => Promise<void>;
    /** Initial local inventory scan, required before annotating persisted data. */
    ready?: () => Promise<void>;
}
/**
 * Browser-trust gate, structurally equal to the frozen contract's predicate.
 *
 * The real `HostConnectionService.requestRejection` returns `401 | 403 |
 * undefined` rather than a boolean (see
 * `@deepseek-ai/dsh-client-connection/lib/types/rpc.d.ts`), so this plugin
 * accepts both shapes: see {@link evaluateGate} for why the numeric form is
 * worth preserving.
 */
export interface SkillsHubRequestGate {
    requestRejection(req: IncomingMessage, res: ServerResponse): boolean;
}
/**
 * Resolves the gate for one request.
 *
 * A getter, not the service itself: Loader rows activate concurrently, so the
 * Connection service frequently appears *after* this plugin registered its
 * route. Snapshotting it at registration time silently produced an unfenced
 * marketplace (verified against a real host: official `/api/*` routes answered
 * `403` to an untrusted `Origin` while `/api/skills-hub/*` answered `200`).
 */
export type SkillsHubGateSource = () => SkillsHubRequestGate | undefined;
/**
 * Set the default `/skills` page size from `Config.pageSize`.
 *
 * The frozen `SkillsHubRoutesDeps` has no config seat, and widening it would
 * change a frozen interface; this setter is the additive seam instead.
 */
export declare function setSkillsHubPageSize(pageSize: number): void;
/**
 * Register the Skills Hub prefix route.
 *
 * @param webServer - the `webServer`/`httpServer` service (`ctx.get` guarded by the caller).
 * @param gate - resolves the browser-trust gate (`ctx.get('connection')`) *per
 *   request*; `undefined` means the composition has no Connection fence to
 *   consult. It is a function rather than a snapshot because the Connection row
 *   may activate after this route is registered.
 * @param deps - resolved skills root, the uninstall switch, and the index refresh.
 * @returns the route disposer (yield it from `ctx.effect`).
 */
export declare function registerSkillsHubRoutes(webServer: WebServerLike, gate: SkillsHubGateSource, deps: SkillsHubRoutesDeps): () => void;
