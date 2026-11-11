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
    webServer: [{ command: `npx next dev -p ${PORT}`, port: PORT, reuseExistingServer: false, timeout: 120_000 }],
});
