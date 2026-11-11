import { createHash } from "node:crypto";

export function clientIp(headers: Headers): string | null {
    // Trusting these headers is only safe because Vercel overwrites x-real-ip and x-forwarded-for.
    const real = headers.get("x-real-ip")?.trim();
    const first = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    return (real || first || "").slice(0, 64) || null;
}

export function hashIp(ip: string | null, salt: string): string {
    return createHash("sha256").update(`${salt}:${ip ?? "unknown"}`).digest("hex");
}
