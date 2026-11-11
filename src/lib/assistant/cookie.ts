import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

export const COOKIE_NAME = "cg_assistant";
export const COOKIE_TTL_MS = 30 * 60 * 1000;

const mac = (secret: string, payload: string) => createHmac("sha256", secret).update(payload).digest("base64url");

export function issueConversation(secret: string, now = Date.now()) {
    const conversationId = randomUUID();
    const expiresAt = Math.floor(now) + COOKIE_TTL_MS;
    const payload = `${conversationId}.${expiresAt}`;
    return { conversationId, expiresAt, value: `${payload}.${mac(secret, payload)}` };
}

export function readConversation(secret: string, value: string | undefined, now = Date.now()): string | null {
    if (!value) return null;
    const parts = value.split(".");
    if (parts.length !== 3) return null;
    const [conversationId, expires, given] = parts;
    const expected = Buffer.from(mac(secret, `${conversationId}.${expires}`));
    const actual = Buffer.from(given);
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
    return Number(expires) > now ? conversationId : null;
}

export function cookieHeader(value: string, secure: boolean): string {
    const parts = [`${COOKIE_NAME}=${value}`, "Path=/api/assistant", "HttpOnly", "SameSite=Strict", `Max-Age=${COOKIE_TTL_MS / 1000}`];
    if (secure) parts.push("Secure");
    return parts.join("; ");
}

export function clearCookieHeader(secure: boolean): string {
    const parts = [`${COOKIE_NAME}=`, "Path=/api/assistant", "HttpOnly", "SameSite=Strict", "Max-Age=0"];
    if (secure) parts.push("Secure");
    return parts.join("; ");
}
