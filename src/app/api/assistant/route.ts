import { readBoundedBody } from "@/lib/assistant/body";
import { clientIp, hashIp } from "@/lib/assistant/client-ip";
import { COOKIE_NAME, clearCookieHeader, cookieHeader, issueConversation, readConversation } from "@/lib/assistant/cookie";
import { readAssistantEnv } from "@/lib/assistant/env";
import { encodeEvent } from "@/lib/assistant/ndjson";
import { ClientRequestSchema, type AppCall, type FallbackReason } from "@/lib/assistant/protocol";
import { guardEventStream } from "@/lib/assistant/relay-stream";
import { createTokenBucket } from "@/lib/assistant/rate-limit";
import { signedHeaders } from "@/lib/assistant/sign";
import { verifyTurnstile } from "@/lib/assistant/turnstile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const MAX_BODY_BYTES = 4096;
const APP_HEADERS_TIMEOUT_MS = 35_000;
const APP_BODY_TIMEOUT_MS = 90_000;
const NDJSON_HEADERS = { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store" };

// Best effort only: each serverless instance has its own memory. The app's limits are the ones that count.
const ipBucket = createTokenBucket({ capacity: 20, refillPerMinute: 10 });

function json(status: number, body: unknown, extra: Record<string, string> = {}) {
    return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store", ...extra } });
}

function fallback(reason: FallbackReason) {
    return new Response(encodeEvent({ type: "fallback", reason }) + encodeEvent({ type: "done" }), { status: 200, headers: NDJSON_HEADERS });
}

function readCookie(header: string | null, name: string): string | undefined {
    return header
        ?.split(";")
        .map((part) => part.trim())
        .find((part) => part.startsWith(`${name}=`))
        ?.slice(name.length + 1);
}

export async function POST(request: Request): Promise<Response> {
    const env = readAssistantEnv();
    if (!env) return json(503, { error: "unavailable" });

    if (request.headers.get("origin") !== new URL(env.SITE_ORIGIN).origin) return json(403, { error: "forbidden" });

    const secure = env.SITE_ORIGIN.startsWith("https:");
    const ip = clientIp(request.headers);
    const ipHash = hashIp(ip, env.IP_HASH_SALT);
    const allowed = ipBucket.take(ipHash);

    const read = await readBoundedBody(request, MAX_BODY_BYTES);
    if (!read.ok) return read.reason === "too_large" ? json(413, { error: "too_large" }) : json(400, { error: "bad_request" });

    let body;
    try {
        const parsed = ClientRequestSchema.safeParse(JSON.parse(read.text));
        if (!parsed.success) return allowed ? json(400, { error: "bad_request" }) : json(429, { error: "limit" });
        body = parsed.data;
    } catch {
        return allowed ? json(400, { error: "bad_request" }) : json(429, { error: "limit" });
    }

    if (!allowed) return body.action === "start" ? json(429, { error: "limit" }) : fallback("limit");

    if (body.action === "start") {
        if (!(await verifyTurnstile(body.turnstileToken, env.TURNSTILE_SECRET_KEY, ip))) return json(403, { error: "verification_failed" });
        const conversation = issueConversation(env.ASSISTANT_COOKIE_SECRET);
        return json(200, { ok: true }, { "set-cookie": cookieHeader(conversation.value, secure) });
    }

    const conversationId = readConversation(env.ASSISTANT_COOKIE_SECRET, readCookie(request.headers.get("cookie"), COOKIE_NAME));
    if (!conversationId) return json(401, { error: "expired" }, { "set-cookie": clearCookieHeader(secure) });

    const userAgent = (request.headers.get("user-agent") ?? "").slice(0, 200);
    const call: AppCall =
        body.action === "message"
            ? { conversationId, kind: "message", message: body.message, ipHash, userAgent }
            : { conversationId, kind: "confirm", requestId: body.requestId, ipHash, userAgent };
    const payload = JSON.stringify(call);

    const controller = new AbortController();
    const headersTimer = setTimeout(() => controller.abort(), APP_HEADERS_TIMEOUT_MS);
    let upstream: Response;
    try {
        upstream = await fetch(env.APP_ASSISTANT_URL, {
            method: "POST",
            headers: signedHeaders(env.WEBSITE_ASSISTANT_SECRET, "POST", env.APP_ASSISTANT_URL, payload),
            body: payload,
            redirect: "manual",
            signal: controller.signal,
        });
    } catch {
        return fallback("unavailable");
    } finally {
        clearTimeout(headersTimer);
    }
    if (upstream.status === 429) return fallback("limit");
    const isNdjson = (upstream.headers.get("content-type") ?? "").toLowerCase().startsWith("application/x-ndjson");
    if (upstream.status !== 200 || !upstream.body || !isNdjson) return fallback("unavailable");

    return new Response(guardEventStream(upstream.body, APP_BODY_TIMEOUT_MS), { status: 200, headers: NDJSON_HEADERS });
}
