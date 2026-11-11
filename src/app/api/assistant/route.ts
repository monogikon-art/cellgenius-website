import { clientIp, hashIp } from "@/lib/assistant/client-ip";
import { COOKIE_NAME, cookieHeader, issueConversation, readConversation } from "@/lib/assistant/cookie";
import { readAssistantEnv } from "@/lib/assistant/env";
import { encodeEvent, filterEventStream } from "@/lib/assistant/ndjson";
import { ClientRequestSchema, type AppCall, type FallbackReason } from "@/lib/assistant/protocol";
import { createTokenBucket } from "@/lib/assistant/rate-limit";
import { signedHeaders } from "@/lib/assistant/sign";
import { verifyTurnstile } from "@/lib/assistant/turnstile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 4096;
const APP_TIMEOUT_MS = 35_000;
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

    const raw = await request.text();
    if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) return json(413, { error: "too_large" });

    let body;
    try {
        const parsed = ClientRequestSchema.safeParse(JSON.parse(raw));
        if (!parsed.success) return json(400, { error: "bad_request" });
        body = parsed.data;
    } catch {
        return json(400, { error: "bad_request" });
    }

    const ip = clientIp(request.headers);
    const ipHash = hashIp(ip, env.IP_HASH_SALT);
    if (!ipBucket.take(ipHash)) return body.action === "start" ? json(429, { error: "limit" }) : fallback("limit");

    if (body.action === "start") {
        if (!(await verifyTurnstile(body.turnstileToken, env.TURNSTILE_SECRET_KEY, ip))) return json(403, { error: "verification_failed" });
        const conversation = issueConversation(env.ASSISTANT_COOKIE_SECRET);
        return json(200, { ok: true }, { "set-cookie": cookieHeader(conversation.value, env.SITE_ORIGIN.startsWith("https:")) });
    }

    const conversationId = readConversation(env.ASSISTANT_COOKIE_SECRET, readCookie(request.headers.get("cookie"), COOKIE_NAME));
    if (!conversationId) return json(401, { error: "expired" });

    const userAgent = (request.headers.get("user-agent") ?? "").slice(0, 200);
    const call: AppCall =
        body.action === "message"
            ? { conversationId, kind: "message", message: body.message, ipHash, userAgent }
            : { conversationId, kind: "confirm", requestId: body.requestId, ipHash, userAgent };
    const payload = JSON.stringify(call);

    let upstream: Response;
    try {
        upstream = await fetch(env.APP_ASSISTANT_URL, {
            method: "POST",
            headers: signedHeaders(env.WEBSITE_ASSISTANT_SECRET, "POST", env.APP_ASSISTANT_URL, payload),
            body: payload,
            signal: AbortSignal.timeout(APP_TIMEOUT_MS),
        });
    } catch {
        return fallback("unavailable");
    }
    if (upstream.status === 429) return fallback("limit");
    if (!upstream.ok || !upstream.body) return fallback("unavailable");

    return new Response(filterEventStream(upstream.body), { status: 200, headers: NDJSON_HEADERS });
}
