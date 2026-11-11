import { createHash } from "node:crypto";

export function clientIp(headers: Headers): string | null {
    const real = headers.get("x-real-ip")?.trim();
    if (real) return real;
    const first = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    return first || null;
}

export function hashIp(ip: string | null, salt: string): string {
    return createHash("sha256").update(`${salt}:${ip ?? "unknown"}`).digest("hex");
}
