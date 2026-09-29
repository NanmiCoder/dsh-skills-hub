import * as fs from 'node:fs/promises'

/** Read at most limit + 1 bytes; reject special files and detect growth without an unbounded allocation. */
export async function readBoundedText(filePath: string, limit: number): Promise<{ text: string; truncated: boolean }> {
  if (!(await fs.stat(filePath)).isFile()) throw new Error('Skill document is not a regular file')
  const handle = await fs.open(filePath, 'r')
  try {
    if (!(await handle.stat()).isFile()) throw new Error('Skill document is not a regular file')
    const buffer = Buffer.alloc(limit + 1)
    let size = 0
    while (size < buffer.length) {
      const { bytesRead } = await handle.read(buffer, size, buffer.length - size, size)
      if (bytesRead === 0) break
      size += bytesRead
    }
    return { text: buffer.subarray(0, Math.min(size, limit)).toString('utf8'), truncated: size > limit }
  } finally { await handle.close() }
}
