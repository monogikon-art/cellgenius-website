import { z } from "zod";

const secureOrLocal = (u: URL) => u.protocol === "https:" || (u.protocol === "http:" && (u.hostname === "localhost" || u.hostname === "127.0.0.1"));

const httpsUrl = z.url().refine((v) => URL.canParse(v) && secureOrLocal(new URL(v)), "must be https (http only for localhost)");

const AssistantEnvSchema = z.object({
    TURNSTILE_SECRET_KEY: z.string().min(1),
    ASSISTANT_COOKIE_SECRET: z.string().min(32),
    IP_HASH_SALT: z.string().min(16),
    WEBSITE_ASSISTANT_SECRET: z.string().min(32),
    APP_ASSISTANT_URL: httpsUrl.refine((v) => {
        if (!URL.canParse(v)) return false;
        const u = new URL(v);
        return !u.search && !u.hash && !u.username && !u.password;
    }, "must not have a query, hash or credentials"),
    SITE_ORIGIN: httpsUrl.refine((v) => URL.canParse(v) && v === new URL(v).origin, "must be an origin only"),
});

export type AssistantEnv = z.infer<typeof AssistantEnvSchema>;

export function readAssistantEnv(source: Record<string, string | undefined> = process.env): AssistantEnv | null {
    const parsed = AssistantEnvSchema.safeParse(source);
    return parsed.success ? parsed.data : null;
}
