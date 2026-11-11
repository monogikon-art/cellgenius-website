export const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(token: string, secret: string, ip: string | null): Promise<boolean> {
    const form = new URLSearchParams({ secret, response: token });
    if (ip) form.set("remoteip", ip);
    try {
        const res = await fetch(TURNSTILE_VERIFY_URL, { method: "POST", body: form, signal: AbortSignal.timeout(8000) });
        if (!res.ok) return false;
        const data = (await res.json()) as { success?: unknown };
        return data.success === true;
    } catch {
        return false;
    }
}
