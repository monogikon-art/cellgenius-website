import { beforeEach, describe, expect, it, vi } from "vitest";
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
