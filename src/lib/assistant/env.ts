import { z } from "zod";

const AssistantEnvSchema = z.object({
    TURNSTILE_SECRET_KEY: z.string().min(1),
    ASSISTANT_COOKIE_SECRET: z.string().min(32),
    IP_HASH_SALT: z.string().min(16),
    WEBSITE_ASSISTANT_SECRET: z.string().min(32),
    APP_ASSISTANT_URL: z.url(),
    SITE_ORIGIN: z.url(),
});

export type AssistantEnv = z.infer<typeof AssistantEnvSchema>;

export function readAssistantEnv(source: Record<string, string | undefined> = process.env): AssistantEnv | null {
    const parsed = AssistantEnvSchema.safeParse(source);
    return parsed.success ? parsed.data : null;
}
