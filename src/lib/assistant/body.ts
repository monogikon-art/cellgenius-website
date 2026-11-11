export type BodyResult = { ok: true; text: string } | { ok: false; reason: "too_large" | "unreadable" };

export async function readBoundedBody(request: Request, maxBytes: number): Promise<BodyResult> {
    const declared = Number(request.headers.get("content-length"));
    if (Number.isFinite(declared) && declared > maxBytes) return { ok: false, reason: "too_large" };
    if (!request.body) return { ok: true, text: "" };

    const reader = request.body.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;
    try {
        for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            total += value.byteLength;
            if (total > maxBytes) {
                await reader.cancel().catch(() => {});
                return { ok: false, reason: "too_large" };
            }
            chunks.push(value);
        }
    } catch {
        return { ok: false, reason: "unreadable" };
    }
    const all = new Uint8Array(total);
    let at = 0;
    for (const c of chunks) {
        all.set(c, at);
        at += c.byteLength;
    }
    return { ok: true, text: new TextDecoder().decode(all) };
}
