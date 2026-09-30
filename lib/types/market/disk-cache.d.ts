export interface CacheEntry {
    value: unknown;
    expiresAt: number;
    storedAt: number;
}
export declare const MAX_CACHE_ENTRIES = 500;
export declare const MAX_STALE_AGE_MS: number;
export declare class DiskMarketCache {
    private directory;
    private writes;
    constructor(directory: string);
    private filename;
    read(key: string): Promise<CacheEntry | undefined>;
    write(key: string, entry: CacheEntry): Promise<void>;
    private prune;
}
