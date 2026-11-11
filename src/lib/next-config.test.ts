import { afterEach, describe, expect, it, vi } from "vitest";

const load = async () => (await import("../../next.config")).default;

afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.resetModules();
});

describe("next.config", () => {
    it("sends the retired /pricing page home, permanently", async () => {
        const config = await load();
        expect(await config.redirects?.()).toContainEqual({ source: "/pricing", destination: "/", permanent: true });
    });

    it("warns a Vercel build that has no MEDIA_BASE_URL", async () => {
        vi.stubEnv("VERCEL", "1");
        vi.stubEnv("MEDIA_BASE_URL", "");
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        await load();
        expect(warn).toHaveBeenCalledWith(expect.stringContaining("MEDIA_BASE_URL"));
    });

    it("stays quiet when MEDIA_BASE_URL is set, or off Vercel", async () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        vi.stubEnv("VERCEL", "1");
        vi.stubEnv("MEDIA_BASE_URL", "https://media.example.test");
        await load();
        vi.resetModules();
        vi.stubEnv("VERCEL", "");
        vi.stubEnv("MEDIA_BASE_URL", "");
        await load();
        expect(warn).not.toHaveBeenCalled();
    });
});
