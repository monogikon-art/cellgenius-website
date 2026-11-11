import { describe, expect, it } from "vitest";
import { STATIC_SECURITY_HEADERS, contentSecurityPolicy } from "./security-headers";

const directive = (csp: string, name: string) => csp.split("; ").find((d) => d.startsWith(`${name} `)) ?? "";

describe("contentSecurityPolicy", () => {
    it("allows scripts only by nonce in production", () => {
        const csp = contentSecurityPolicy({ nonce: "abc123", dev: false });
        const scripts = directive(csp, "script-src");
        expect(scripts).toContain("'nonce-abc123'");
        expect(scripts).not.toContain("'unsafe-inline'");
        expect(scripts).not.toContain("'unsafe-eval'");
        expect(directive(csp, "frame-ancestors")).toBe("frame-ancestors 'none'");
        expect(directive(csp, "object-src")).toBe("object-src 'none'");
        expect(directive(csp, "media-src")).toBe("media-src 'self'");
        expect(directive(csp, "frame-src")).toBe("frame-src https://challenges.cloudflare.com");
        expect(csp).toContain("upgrade-insecure-requests");
    });

    it("allows dev tooling only in dev", () => {
        const csp = contentSecurityPolicy({ nonce: "n", dev: true });
        expect(directive(csp, "script-src")).toContain("'unsafe-eval'");
        expect(csp).not.toContain("upgrade-insecure-requests");
    });
});

describe("STATIC_SECURITY_HEADERS", () => {
    it("sets nosniff, referrer policy, HSTS and denies framing", () => {
        const map = Object.fromEntries(STATIC_SECURITY_HEADERS.map((h) => [h.key, h.value]));
        expect(map["X-Content-Type-Options"]).toBe("nosniff");
        expect(map["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
        expect(map["Strict-Transport-Security"]).toBe("max-age=63072000");
        expect(map["X-Frame-Options"]).toBe("DENY");
    });
});
