const TURNSTILE = "https://challenges.cloudflare.com";

export function contentSecurityPolicy({ nonce, dev }: { nonce: string; dev: boolean }): string {
    const directives: Record<string, string[]> = {
        "default-src": ["'self'"],
        "script-src": ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'", TURNSTILE, ...(dev ? ["'unsafe-eval'"] : [])],
        "style-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", "data:", "blob:"],
        "font-src": ["'self'"],
        "media-src": ["'self'"],
        "connect-src": ["'self'", TURNSTILE, ...(dev ? ["ws:"] : [])],
        "frame-src": [TURNSTILE],
        "object-src": ["'none'"],
        "base-uri": ["'self'"],
        "form-action": ["'self'"],
        "frame-ancestors": ["'none'"],
    };
    const csp = Object.entries(directives)
        .map(([name, values]) => `${name} ${values.join(" ")}`)
        .join("; ");
    return dev ? csp : `${csp}; upgrade-insecure-requests`;
}

export const STATIC_SECURITY_HEADERS = [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Strict-Transport-Security", value: "max-age=63072000" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
] as const;
