export const MAX_LINE = 32 * 1024;

export function createLineSplitter(): TransformStream<string, string> {
    let buffer = "";
    let skipping = false;
    return new TransformStream<string, string>({
        transform(chunk, controller) {
            let start = 0;
            for (let nl = chunk.indexOf("\n", start); nl !== -1; nl = chunk.indexOf("\n", start)) {
                const line = buffer + chunk.slice(start, nl);
                if (!skipping && line.length <= MAX_LINE && line.trim()) controller.enqueue(line);
                buffer = "";
                skipping = false;
                start = nl + 1;
            }
            if (!skipping) buffer += chunk.slice(start);
            if (buffer.length > MAX_LINE) {
                buffer = "";
                skipping = true;
            }
        },
        flush(controller) {
            if (!skipping && buffer.trim()) controller.enqueue(buffer);
        },
    });
}
