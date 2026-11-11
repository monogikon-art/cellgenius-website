import { AppEventSchema, type AppEvent } from "./protocol";

export const MAX_LINE = 16 * 1024;

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

export function parseEventLine(line: string): AppEvent | null {
    try {
        const parsed = AppEventSchema.safeParse(JSON.parse(line));
        return parsed.success ? parsed.data : null;
    } catch {
        return null;
    }
}

export function encodeEvent(event: AppEvent): string {
    return `${JSON.stringify(event)}\n`;
}

export function filterEventStream(body: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
    return body
        .pipeThrough(new TextDecoderStream() as unknown as TransformStream<Uint8Array, string>)
        .pipeThrough(createLineSplitter())
        .pipeThrough(
            new TransformStream<string, string>({
                transform(line, controller) {
                    const event = parseEventLine(line);
                    if (event) controller.enqueue(encodeEvent(event));
                },
            }),
        )
        .pipeThrough(new TextEncoderStream() as unknown as TransformStream<string, Uint8Array>);
}
