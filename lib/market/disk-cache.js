/** Atomic, bounded storage for upstream snapshots; never stores install state. */
import { createHash, randomUUID } from 'node:crypto';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
export const MAX_CACHE_ENTRIES = 500;
export const MAX_STALE_AGE_MS = 7 * 24 * 60 * 60_000;
const MAX_ENTRY_BYTES = 5 * 1024 * 1024;
const MAX_DISK_BYTES = 64 * 1024 * 1024;
const CACHE_FILE = /^[a-f0-9]{64}\.json$/;
const TEMP_FILE = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}\.tmp$/;
const MAX_TEMP_AGE_MS = 60 * 60_000;
function snapshotHash(key, entry) {
    return createHash('sha256').update(JSON.stringify([2, key, entry.storedAt, entry.expiresAt, entry.value])).digest('hex');
}
export class DiskMarketCache {
    directory;
    writes = Promise.resolve();
    constructor(directory) {
        this.directory = directory;
    }
    filename(key) {
        return path.join(this.directory, `${createHash('sha256').update(key).digest('hex')}.json`);
    }
    async read(key) {
        let handle;
        try {
            handle = await fs.open(this.filename(key), 'r');
            if ((await handle.stat()).size > MAX_ENTRY_BYTES)
                return undefined;
            const record = JSON.parse(await handle.readFile('utf8'));
            if (!record || record.version !== 2 || record.key !== key || !('value' in record))
                return undefined;
            const { storedAt, expiresAt, value } = record;
            if (typeof storedAt !== 'number' || !Number.isFinite(storedAt) || storedAt < 0
                || typeof expiresAt !== 'number' || !Number.isFinite(expiresAt) || expiresAt < storedAt
                || storedAt > Date.now() || Date.now() - storedAt > MAX_STALE_AGE_MS)
                return undefined;
            const entry = { storedAt, expiresAt, value };
            if (record.sha256 !== snapshotHash(key, entry))
                return undefined;
            return entry;
        }
        catch (error) {
            if (error.code === 'ENOENT')
                return undefined;
            throw error;
        }
        finally {
            await handle?.close();
        }
    }
    async write(key, entry) {
        const body = JSON.stringify({ version: 2, key, ...entry, sha256: snapshotHash(key, entry) });
        const oversized = Buffer.byteLength(body) > MAX_ENTRY_BYTES;
        // Serialize publication and pruning within this host. Each response awaits
        // its write, so quitting after reading a page does not lose a delayed flush.
        const pending = this.writes.then(async () => {
            // An unpersistable refresh must not resurrect the previous version after
            // restart. Serialize invalidation with ordinary writes of the same key.
            if (oversized) {
                await fs.rm(this.filename(key), { force: true });
                return;
            }
            await fs.mkdir(this.directory, { recursive: true, mode: 0o700 });
            const temporary = path.join(this.directory, `${randomUUID()}.tmp`);
            try {
                await fs.writeFile(temporary, body, { mode: 0o600, flag: 'wx' });
                await fs.rename(temporary, this.filename(key));
                await this.prune();
            }
            finally {
                await fs.rm(temporary, { force: true });
            }
        });
        this.writes = pending.catch(() => { });
        await pending;
    }
    async prune() {
        const names = (await fs.readdir(this.directory)).filter((name) => CACHE_FILE.test(name) || TEMP_FILE.test(name));
        const records = await Promise.all(names.map(async (name) => {
            const filename = path.join(this.directory, name);
            try {
                const stat = await fs.stat(filename);
                if (TEMP_FILE.test(name)) {
                    // A killed host can leave a partial write. Leave recent files alone:
                    // another host may still be publishing in this shared home.
                    if (Date.now() - stat.mtimeMs > MAX_TEMP_AGE_MS)
                        await fs.rm(filename, { force: true });
                    return undefined;
                }
                return { filename, size: stat.size, modifiedAt: stat.mtimeMs };
            }
            catch (error) {
                if (error.code === 'ENOENT')
                    return undefined;
                throw error;
            }
        }));
        const newest = records.filter((record) => record !== undefined).sort((a, b) => b.modifiedAt - a.modifiedAt);
        let count = 0;
        let bytes = 0;
        for (const record of newest) {
            if (Date.now() - record.modifiedAt > MAX_STALE_AGE_MS
                || record.size > MAX_ENTRY_BYTES || count >= MAX_CACHE_ENTRIES || bytes + record.size > MAX_DISK_BYTES) {
                await fs.rm(record.filename, { force: true });
            }
            else {
                count += 1;
                bytes += record.size;
            }
        }
    }
}
