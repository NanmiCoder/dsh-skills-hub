/**
 * SkillHub provider (https://api.skillhub.cn)
 *
 * Endpoints (verified against the live API):
 *  - GET /api/skills?page=&pageSize=&keyword=      → {code, data:{skills[], total}, message}
 *      NOTE: pagination param MUST be `pageSize` (a `limit` param is silently ignored)
 *      NOTE: search param MUST be `keyword` (a `q` param is silently ignored)
 *  - GET /api/v1/skills/{slug}                     → {skill, owner, latestVersion, securityReports}
 *  - GET /api/v1/skills/{slug}/files               → {count, files:[{path, sha256, size}]}
 *  - GET /api/v1/skills/{slug}/file?path=          → 302 redirect to Tencent COS (follow)
 */
import { type MarketProvider } from './types.ts';
export declare const skillhubProvider: MarketProvider;
