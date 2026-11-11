import { afterEach, describe, expect, it, vi } from "vitest";
import { clientIp, hashIp } from "./client-ip";
import { COOKIE_TTL_MS, cookieHeader, issueConversation, readConversation } from "./cookie";
import { readAssistantEnv } from "./env";
import { createLineSplitter, encodeEvent, filterEventStream, parseEventLine } from "./ndjson";
import { AppEventSchema, ClientRequestSchema } from "./protocol";
import { createTokenBucket } from "./rate-limit";
import { sign, signedHeaders } from "./sign";
import { TURNSTILE_VERIFY_URL, verifyTurnstile } from "./turnstile";

afterEach(() => vi.unstubAllGlobals());

const streamOf = (text: string) =>
    new ReadableStream<Uint8Array>({
        start(c) {
            c.enqueue(new TextEncoder().encode(text));
            c.close();
        },
    });

describe("sign", () => {
    it("matches the shared test vector that the app must also pass", () => {
        expect(
            sign("test-secret", {
                method: "POST",
                path: "/api/public/website-assistant",
                timestamp: "1700000000000",
                nonce: "00112233445566778899aabbccddeeff",
                body: '{"conversationId":"c1","kind":"message","message":"hi","ipHash":"h","userAgent":"ua"}',
            }),
        ).toBe("a9ac0a9487b475385de7b5ff4028da33937af898ae228925e970998783237328");
    });

    it("builds headers whose signature verifies", () => {
        const body = '{"x":1}';
        const h = signedHeaders("s3cret", "POST", "https://app.test/api/public/website-assistant", body, 1700000000000);
        expect(h["x-cg-timestamp"]).toBe("1700000000000");
        expect(h["x-cg-nonce"]).toMatch(/^[0-9a-f]{32}$/);
        expect(h["x-cg-signature"]).toBe(
            sign("s3cret", { method: "POST", path: "/api/public/website-assistant", timestamp: "1700000000000", nonce: h["x-cg-nonce"], body }),
        );
    });
});

describe("conversation cookie", () => {
    const secret = "k".repeat(32);
    it("round-trips and expires", () => {
        const c = issueConversation(secret, 1000);
        expect(readConversation(secret, c.value, 1001)).toBe(c.conversationId);
        expect(readConversation(secret, c.value, 1000 + COOKIE_TTL_MS + 1)).toBeNull();
    });
    it("rejects tampering and other secrets", () => {
        const c = issueConversation(secret, 1000);
        const [id, exp, mac] = c.value.split(".");
        expect(readConversation(secret, `${id}.${Number(exp) + 99999}.${mac}`, 1001)).toBeNull();
        expect(readConversation("x".repeat(32), c.value, 1001)).toBeNull();
        expect(readConversation(secret, undefined)).toBeNull();
        expect(readConversation(secret, "garbage")).toBeNull();
    });
    it("is HttpOnly, SameSite=Strict and scoped to the route", () => {
        const header = cookieHeader("v", true);
        expect(header).toContain("cg_assistant=v");
        expect(header).toContain("HttpOnly");
        expect(header).toContain("SameSite=Strict");
        expect(header).toContain("Path=/api/assistant");
        expect(header).toContain("Secure");
        expect(cookieHeader("v", false)).not.toContain("Secure");
    });
});

describe("protocol", () => {
    it("caps messages at 1000 characters", () => {
        expect(ClientRequestSchema.safeParse({ action: "message", message: "a".repeat(1000) }).success).toBe(true);
        expect(ClientRequestSchema.safeParse({ action: "message", message: "a".repeat(1001) }).success).toBe(false);
        expect(ClientRequestSchema.safeParse({ action: "message", message: "   " }).success).toBe(false);
    });
    it("only accepts known event types", () => {
        expect(AppEventSchema.safeParse({ type: "delta", text: "hi" }).success).toBe(true);
        expect(AppEventSchema.safeParse({ type: "html", text: "<b>" }).success).toBe(false);
    });
});

describe("ndjson", () => {
    it("splits chunks into lines across boundaries", async () => {
        const out: string[] = [];
        const writer = new WritableStream<string>({ write: (l) => void out.push(l) });
        const source = new ReadableStream<string>({
            start(c) {
                c.enqueue('{"type":"del');
                c.enqueue('ta","text":"a"}\n{"type":"done"}');
                c.close();
            },
        });
        await source.pipeThrough(createLineSplitter()).pipeTo(writer);
        expect(out).toEqual(['{"type":"delta","text":"a"}', '{"type":"done"}']);
    });
    it("drops lines that are not valid events", async () => {
        const text = [encodeEvent({ type: "delta", text: "ok" }).trim(), "<script>", '{"type":"evil"}', '{"type":"done"}'].join("\n");
        const filtered = await new Response(filterEventStream(streamOf(text))).text();
        expect(filtered.trim().split("\n").map((l) => parseEventLine(l))).toEqual([{ type: "delta", text: "ok" }, { type: "done" }]);
    });
});

describe("rate limit", () => {
    it("allows the capacity, then refills over time, per key", () => {
        const bucket = createTokenBucket({ capacity: 2, refillPerMinute: 60 });
        expect(bucket.take("a", 0)).toBe(true);
        expect(bucket.take("a", 0)).toBe(true);
        expect(bucket.take("a", 0)).toBe(false);
        expect(bucket.take("b", 0)).toBe(true);
        expect(bucket.take("a", 1000)).toBe(true);
    });
});

describe("client ip", () => {
    it("prefers x-real-ip, then the first forwarded address, and hashes with a salt", () => {
        expect(clientIp(new Headers({ "x-real-ip": "203.0.113.7" }))).toBe("203.0.113.7");
        expect(clientIp(new Headers({ "x-forwarded-for": "198.51.100.2, 10.0.0.1" }))).toBe("198.51.100.2");
        expect(clientIp(new Headers())).toBeNull();
        expect(hashIp("203.0.113.7", "salt-a")).toMatch(/^[0-9a-f]{64}$/);
        expect(hashIp("203.0.113.7", "salt-a")).not.toBe(hashIp("203.0.113.7", "salt-b"));
    });
});

describe("turnstile", () => {
    it("is true only when Cloudflare says success", async () => {
        const fetchMock = vi.fn().mockResolvedValueOnce(Response.json({ success: true })).mockResolvedValueOnce(Response.json({ success: false }));
        vi.stubGlobal("fetch", fetchMock);
        expect(await verifyTurnstile("tok", "sec", "203.0.113.7")).toBe(true);
        expect(await verifyTurnstile("tok", "sec", null)).toBe(false);
        expect(fetchMock.mock.calls[0][0]).toBe(TURNSTILE_VERIFY_URL);
        expect(String(fetchMock.mock.calls[0][1].body)).toContain("remoteip=203.0.113.7");
    });
    it("fails closed when Cloudflare is unreachable", async () => {
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
        expect(await verifyTurnstile("tok", "sec", null)).toBe(false);
    });
});

describe("env", () => {
    it("is null when anything is missing or too short", () => {
        expect(readAssistantEnv({})).toBeNull();
        expect(
            readAssistantEnv({
                TURNSTILE_SECRET_KEY: "t",
                ASSISTANT_COOKIE_SECRET: "c".repeat(32),
                IP_HASH_SALT: "s".repeat(16),
                WEBSITE_ASSISTANT_SECRET: "w".repeat(32),
                APP_ASSISTANT_URL: "https://app.test/api/public/website-assistant",
                SITE_ORIGIN: "https://site.test",
            }),
        ).not.toBeNull();
    });
});
