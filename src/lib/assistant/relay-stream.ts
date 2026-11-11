import { encodeEvent, filterEventStream } from "./ndjson";

const encoder = new TextEncoder();
const DONE_LINE = encodeEvent({ type: "done" });
const FALLBACK_TAIL = encodeEvent({ type: "fallback", reason: "unavailable" }) + DONE_LINE;

// Relays validated events and guarantees the client always sees a closing `done`:
// an upstream error, early end or overall timeout becomes "unavailable" + done; nothing follows `done`.
export function guardEventStream(source: ReadableStream<Uint8Array>, maxMs: number): ReadableStream<Uint8Array> {
    const reader = filterEventStream(source).getReader();
    const deadline = Date.now() + maxMs;
    const decoder = new TextDecoder();

    const finish = (controller: ReadableStreamDefaultController<Uint8Array>, sawDone: boolean) => {
        if (!sawDone) controller.enqueue(encoder.encode(FALLBACK_TAIL));
        controller.close();
        reader.cancel().catch(() => {});
    };

    return new ReadableStream<Uint8Array>({
        async pull(controller) {
            let timer: ReturnType<typeof setTimeout> | undefined;
            try {
                const timeout = new Promise<"timeout">((resolve) => {
                    timer = setTimeout(() => resolve("timeout"), Math.max(0, deadline - Date.now()));
                });
                const result = await Promise.race([reader.read(), timeout]);
                if (result === "timeout" || result.done) return finish(controller, false);
                const text = decoder.decode(result.value, { stream: true });
                const at = text.indexOf(DONE_LINE);
                if (at === -1) return controller.enqueue(result.value);
                controller.enqueue(encoder.encode(text.slice(0, at + DONE_LINE.length)));
                finish(controller, true);
            } catch {
                finish(controller, false);
            } finally {
                clearTimeout(timer);
            }
        },
        cancel() {
            return reader.cancel().catch(() => {});
        },
    });
}
