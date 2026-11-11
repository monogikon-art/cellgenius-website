import { createHmac, randomBytes } from "node:crypto";

export type SignInput = { method: string; path: string; timestamp: string; nonce: string; body: string };

export function signatureBase(p: SignInput): string {
    return [p.method.toUpperCase(), p.path, p.timestamp, p.nonce, p.body].join("\n");
}

export function sign(secret: string, p: SignInput): string {
    return createHmac("sha256", secret).update(signatureBase(p)).digest("hex");
}

export function signedHeaders(secret: string, method: string, url: string, body: string, now = Date.now()): Record<string, string> {
    const timestamp = String(now);
    const nonce = randomBytes(16).toString("hex");
    const path = new URL(url).pathname;
    return {
        "content-type": "application/json",
        "x-cg-timestamp": timestamp,
        "x-cg-nonce": nonce,
        "x-cg-signature": sign(secret, { method, path, timestamp, nonce, body }),
    };
}
