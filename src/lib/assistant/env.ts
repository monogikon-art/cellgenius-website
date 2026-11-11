import { z } from "zod";

const isLocal = (u: URL) => u.hostname === "localhost" || u.hostname === "127.0.0.1";
const secureOrLocal = (u: URL) => u.protocol === "https:" || (u.protocol === "http:" && isLocal(u));
const httpsUrl = z.url().refine((v) => secureOrLocal(new URL(v)), "must be https (http only for localhost)");

const AssistantEnvSchema = z.object({
    TURNSTILE_SECRET_KEY: z.string().min(1),
    ASSISTANT_COOKIE_SECRET: z.string().min(32),
    IP_HASH_SALT: z.string().min(16),
    WEBSITE_ASSISTANT_SECRET: z.string().min(32),
    APP_ASSISTANT_URL: httpsUrl.refine((v) => {
        const u = new URL(v);
        return !u.search && !u.hash;
    }, "must not have a query or hash"),
    SITE_ORIGIN: httpsUrl.refine((v) => {
        const u = new URL(v);
        return u.pathname === "/" && !u.search && !u.hash && !v.slice(u.origin.length).includes("?");
    }, "must be an origin only"),
});

export type AssistantEnv = z.infer<typeof AssistantEnvSchema>;

export function readAssistantEnv(source: Record<string, string | undefined> = process.env): AssistantEnv | null {
    const parsed = AssistantEnvSchema.safeParse(source);
    return parsed.success ? parsed.data : null;
}
