import { beforeEach, describe, expect, it, vi } from "vitest";
import { issueConversation } from "@/lib/assistant/cookie";
import { sign } from "@/lib/assistant/sign";

const ENV = {
    TURNSTILE_SECRET_KEY: "turnstile-secret",
    ASSISTANT_COOKIE_SECRET: "c".repeat(32),
    IP_HASH_SALT: "s".repeat(16),
    WEBSITE_ASSISTANT_SECRET: "w".repeat(32),
    APP_ASSISTANT_URL: "https://app.example.test/api/public/website-assistant",
    SITE_ORIGIN: "https://site.example.test",
};

const fetchMock = vi.fn();
let POST: (req: Request) => Promise<Response>;

beforeEach(async () => {
    vi.resetModules();
    vi.unstubAllEnvs();
    for (const [k, v] of Object.entries(ENV)) vi.stubEnv(k, v);
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    ({ POST } = await import("./route"));
});

function req(body: unknown, init: { origin?: string; cookie?: string } = {}) {
    const headers: Record<string, string> = {
        origin: init.origin ?? ENV.SITE_ORIGIN,
        "content-type": "application/json",
        "x-real-ip": "203.0.113.7",
        "user-agent": "vitest",
    };
    if (init.cookie) headers.cookie = init.cookie;
    return new Request("https://site.example.test/api/assistant", { method: "POST", headers, body: JSON.stringify(body) });
}

const ndjson = (lines: string[], status = 200) => new Response(`${lines.join("\n")}\n`, { status, headers: { "content-type": "application/x-ndjson" } });
const events = async (res: Response) => (await res.text()).trim().split("\n").map((l) => JSON.parse(l));

async function start(): Promise<string> {
    fetchMock.mockResolvedValueOnce(Response.json({ success: true }));
    const res = await POST(req({ action: "start", turnstileToken: "tok" }));
    expect(res.status).toBe(200);
    return res.headers.get("set-cookie")!.split(";")[0];
}

describe("POST /api/assistant", () => {
    it("refuses another origin", async () => {
        const res = await POST(req({ action: "start", turnstileToken: "tok" }, { origin: "https://evil.example" }));
        expect(res.status).toBe(403);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("refuses to start when Turnstile fails", async () => {
        fetchMock.mockResolvedValueOnce(Response.json({ success: false }));
        const res = await POST(req({ action: "start", turnstileToken: "tok" }));
        expect(res.status).toBe(403);
        expect(res.headers.get("set-cookie")).toBeNull();
    });

    it("issues a strict, HttpOnly, Secure cookie on start", async () => {
        fetchMock.mockResolvedValueOnce(Response.json({ success: true }));
        const res = await POST(req({ action: "start", turnstileToken: "tok" }));
        const cookie = res.headers.get("set-cookie")!;
        expect(cookie).toMatch(/HttpOnly/);
        expect(cookie).toMatch(/SameSite=Strict/);
        expect(cookie).toMatch(/Secure/);
    });

    it("asks for a new check without a valid cookie", async () => {
        const res = await POST(req({ action: "message", message: "hello" }, { cookie: "cg_assistant=forged.1.x" }));
        expect(res.status).toBe(401);
        expect(await res.json()).toEqual({ error: "expired" });
    });

    it("rejects an oversized message without calling the app", async () => {
        const cookie = await start();
        const res = await POST(req({ action: "message", message: "a".repeat(1001) }, { cookie }));
        expect(res.status).toBe(400);
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("rejects a body with an unknown key without calling the app", async () => {
        const cookie = await start();
        const res = await POST(req({ action: "message", message: "hi", extra: 1 }, { cookie }));
        expect(res.status).toBe(400);
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("forwards a signed call without the raw IP and passes only valid events", async () => {
        const cookie = await start();
        fetchMock.mockImplementationOnce(async (_url: string, init: RequestInit) => {
            const h = init.headers as Record<string, string>;
            const body = init.body as string;
            expect(h["x-cg-signature"]).toBe(
                sign(ENV.WEBSITE_ASSISTANT_SECRET, {
                    method: "POST",
                    path: "/api/public/website-assistant",
                    timestamp: h["x-cg-timestamp"],
                    nonce: h["x-cg-nonce"],
                    body,
                }),
            );
            const call = JSON.parse(body);
            expect(call).toMatchObject({ kind: "message", message: "hello", userAgent: "vitest" });
            expect(call.ipHash).toMatch(/^[0-9a-f]{64}$/);
            expect(body).not.toContain("203.0.113.7");
            return ndjson([JSON.stringify({ type: "delta", text: "Hi" }), "<script>alert(1)</script>", '{"type":"evil"}', '{"type":"done"}']);
        });
        const res = await POST(req({ action: "message", message: "hello" }, { cookie }));
        expect(res.headers.get("content-type")).toContain("application/x-ndjson");
        expect(await events(res)).toEqual([{ type: "delta", text: "Hi" }, { type: "done" }]);
    });

    it("turns an app failure into the unavailable fallback", async () => {
        const cookie = await start();
        fetchMock.mockResolvedValueOnce(new Response("boom", { status: 500 }));
        const res = await POST(req({ action: "message", message: "hello" }, { cookie }));
        expect(await events(res)).toEqual([{ type: "fallback", reason: "unavailable" }, { type: "done" }]);
    });

    it("turns an app 429 into the limit fallback", async () => {
        const cookie = await start();
        fetchMock.mockResolvedValueOnce(new Response("", { status: 429 }));
        const res = await POST(req({ action: "message", message: "hello" }, { cookie }));
        expect(await events(res)).toEqual([{ type: "fallback", reason: "limit" }, { type: "done" }]);
    });

    it("is unavailable when not configured", async () => {
        vi.stubEnv("WEBSITE_ASSISTANT_SECRET", "");
        vi.resetModules();
        ({ POST } = await import("./route"));
        const res = await POST(req({ action: "start", turnstileToken: "tok" }));
        expect(res.status).toBe(503);
    });
});

const raw = (body: BodyInit | null, headers: Record<string, string> = {}, extra: RequestInit = {}) =>
    new Request("https://site.example.test/api/assistant", {
        method: "POST",
        headers: { origin: ENV.SITE_ORIGIN, "content-type": "application/json", "x-real-ip": "203.0.113.7", ...headers },
        body,
        ...extra,
    });

describe("POST /api/assistant hardening", () => {
    it("refuses a missing Origin", async () => {
        const r = new Request("https://site.example.test/api/assistant", { method: "POST", body: JSON.stringify({ action: "start", turnstileToken: "t" }) });
        expect((await POST(r)).status).toBe(403);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("refuses a declared Content-Length over the limit without reading or calling the app", async () => {
        const res = await POST(raw(JSON.stringify({ action: "start", turnstileToken: "t" }), { "content-length": "5000" }));
        expect(res.status).toBe(413);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("refuses a chunked body over the limit", async () => {
        const chunk = new TextEncoder().encode("a".repeat(1500));
        const stream = new ReadableStream<Uint8Array>({
            start(c) {
                for (let i = 0; i < 4; i++) c.enqueue(chunk);
                c.close();
            },
        });
        const res = await POST(raw(stream, {}, { duplex: "half" } as RequestInit));
        expect(res.status).toBe(413);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("answers invalid JSON with 400", async () => {
        const res = await POST(raw("{not json"));
        expect(res.status).toBe(400);
    });

    it("answers an aborted body read with a friendly 400", async () => {
        const stream = new ReadableStream<Uint8Array>({
            pull(c) {
                c.error(new Error("aborted"));
            },
        });
        const res = await POST(raw(stream, {}, { duplex: "half" } as RequestInit));
        expect(res.status).toBe(400);
    });

    it("forwards a confirm with its requestId", async () => {
        const cookie = await start();
        const requestId = "7f0f4f5e-3c1a-4b8e-9a52-6d1f2b3c4d5e";
        fetchMock.mockImplementationOnce(async (_u: string, init: RequestInit) => {
            expect(JSON.parse(init.body as string)).toMatchObject({ kind: "confirm", requestId });
            return ndjson(['{"type":"confirmed","email":"a@b.co"}', '{"type":"done"}']);
        });
        const res = await POST(req({ action: "confirm", requestId }, { cookie }));
        expect((await events(res))[0]).toMatchObject({ type: "confirmed" });
    });

    it("rate limits: 429 on start, limit fallback on message", async () => {
        for (let i = 0; i < 20; i++) await POST(req({ nope: true }));
        const s = await POST(req({ action: "start", turnstileToken: "t" }));
        expect(s.status).toBe(429);
        const m = await POST(req({ action: "message", message: "hi" }));
        expect(await events(m)).toEqual([{ type: "fallback", reason: "limit" }, { type: "done" }]);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("turns a rejected fetch into the unavailable fallback", async () => {
        const cookie = await start();
        fetchMock.mockRejectedValueOnce(new Error("down"));
        const res = await POST(req({ action: "message", message: "hello" }, { cookie }));
        expect(await events(res)).toEqual([{ type: "fallback", reason: "unavailable" }, { type: "done" }]);
    });

    it("ends with fallback and done when the upstream body errors mid-stream", async () => {
        const cookie = await start();
        let n = 0;
        const body = new ReadableStream<Uint8Array>({
            pull(c) {
                if (n++ === 0) c.enqueue(new TextEncoder().encode('{"type":"delta","text":"Hi"}\n'));
                else c.error(new Error("reset"));
            },
        });
        fetchMock.mockResolvedValueOnce(new Response(body, { status: 200, headers: { "content-type": "application/x-ndjson" } }));
        const res = await POST(req({ action: "message", message: "hello" }, { cookie }));
        expect(await events(res)).toEqual([{ type: "delta", text: "Hi" }, { type: "fallback", reason: "unavailable" }, { type: "done" }]);
    });

    it("ends with fallback and done when the upstream finishes without done", async () => {
        const cookie = await start();
        fetchMock.mockResolvedValueOnce(ndjson(['{"type":"delta","text":"Hi"}']));
        const res = await POST(req({ action: "message", message: "hello" }, { cookie }));
        expect(await events(res)).toEqual([{ type: "delta", text: "Hi" }, { type: "fallback", reason: "unavailable" }, { type: "done" }]);
    });

    it("stops forwarding after done", async () => {
        const cookie = await start();
        fetchMock.mockResolvedValueOnce(ndjson(['{"type":"done"}', '{"type":"delta","text":"late"}']));
        const res = await POST(req({ action: "message", message: "hello" }, { cookie }));
        expect(await events(res)).toEqual([{ type: "done" }]);
    });

    it("treats a non-ndjson 200 as unavailable", async () => {
        const cookie = await start();
        fetchMock.mockResolvedValueOnce(new Response("<html></html>", { status: 200, headers: { "content-type": "text/html" } }));
        const res = await POST(req({ action: "message", message: "hello" }, { cookie }));
        expect(await events(res)).toEqual([{ type: "fallback", reason: "unavailable" }, { type: "done" }]);
    });

    it("never follows a redirect", async () => {
        const cookie = await start();
        fetchMock.mockResolvedValueOnce(new Response(null, { status: 302, headers: { location: "https://evil.example" } }));
        const res = await POST(req({ action: "message", message: "hello" }, { cookie }));
        expect(await events(res)).toEqual([{ type: "fallback", reason: "unavailable" }, { type: "done" }]);
        expect(fetchMock.mock.calls[1][1]).toMatchObject({ redirect: "manual" });
    });

    it("sends cache-control no-store", async () => {
        const res = await POST(req({ action: "message", message: "hi" }));
        expect(res.headers.get("cache-control")).toBe("no-store");
    });

    it("clears the cookie when it has genuinely expired", async () => {
        const old = issueConversation(ENV.ASSISTANT_COOKIE_SECRET, 0);
        const res = await POST(req({ action: "message", message: "hi" }, { cookie: `cg_assistant=${old.value}` }));
        expect(res.status).toBe(401);
        const set = res.headers.get("set-cookie")!;
        expect(set).toMatch(/cg_assistant=;/);
        expect(set).toMatch(/Max-Age=0/);
        expect(set).toMatch(/Path=\/api\/assistant/);
        expect(set).toMatch(/HttpOnly/);
        expect(set).toMatch(/SameSite=Strict/);
        expect(set).toMatch(/Secure/);
    });
});
