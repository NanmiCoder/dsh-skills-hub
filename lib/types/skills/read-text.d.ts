/** Read at most limit + 1 bytes; reject special files and detect growth without an unbounded allocation. */
export declare function readBoundedText(filePath: string, limit: number): Promise<{
    text: string;
    truncated: boolean;
}>;
