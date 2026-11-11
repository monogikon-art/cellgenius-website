import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

export default defineConfig({
    testDir: "e2e",
    timeout: 60_000,
    use: { baseURL: `http://localhost:${PORT}`, trace: "retain-on-failure" },
    projects: [
        { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
        { name: "phone", use: { ...devices["Pixel 7"] } },
    ],
    webServer: [
        { command: "node e2e/stub-app.mjs 3199", port: 3199, reuseExistingServer: false },
        {
            command: `npx next dev -p ${PORT}`,
            port: PORT,
            reuseExistingServer: false,
            timeout: 120_000,
            env: {
                NEXT_PUBLIC_ASSISTANT_ENABLED: "true",
                NEXT_PUBLIC_TURNSTILE_SITE_KEY: "1x00000000000000000000AA",
                TURNSTILE_SECRET_KEY: "1x0000000000000000000000000000000AA",
                ASSISTANT_COOKIE_SECRET: "e2e-cookie-secret-0123456789abcdef0123",
                IP_HASH_SALT: "e2e-salt-0123456789",
                WEBSITE_ASSISTANT_SECRET: "e2e-signing-secret-0123456789abcdef01",
                APP_ASSISTANT_URL: "http://localhost:3199/api/public/website-assistant",
                SITE_ORIGIN: `http://localhost:${PORT}`,
            },
        },
    ],
});
