import { AppEventSchema, type AppEvent } from "./protocol";

export function createLineSplitter(): TransformStream<string, string> {
    let buffer = "";
    return new TransformStream<string, string>({
        transform(chunk, controller) {
            buffer += chunk;
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";
            for (const line of lines) if (line.trim()) controller.enqueue(line);
        },
        flush(controller) {
            if (buffer.trim()) controller.enqueue(buffer);
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
