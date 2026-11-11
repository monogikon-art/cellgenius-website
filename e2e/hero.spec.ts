import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    await page.route((url) => url.pathname.startsWith("/media/"), (route) => route.fulfill({ status: 204 }));
});

test("the hero cycles the film's statements with no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => {
        if (m.type() === "error") errors.push(m.text());
    });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Changenius/);
    await expect(page.getByText("Meet Changenius.", { exact: true })).toBeVisible();
    await expect(page.getByText("Every change in your organisation, governed in one place.", { exact: true })).toBeVisible({ timeout: 8_000 });
    await expect(page.getByText("AI, grounded in your own policies.", { exact: true })).toBeVisible({ timeout: 8_000 });
    await expect(page.getByRole("button", { name: "Pause animation" })).toBeVisible();
    expect(errors.filter((e) => !/Failed to load resource|challenges\.cloudflare/.test(e))).toEqual([]);
});

test("Watch the film opens the featured film", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Watch the film" }).click();
    await expect(page.getByRole("dialog", { name: "The Changenius film" })).toBeVisible();
});

test.describe("reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("shows a still with every planet, and pause holds the statement", async ({ page }) => {
        await page.goto("/");
        for (const word of ["CHANGE", "AI", "AGENTIC AI", "CHAIN", "GENIUS"]) {
            const label = page.locator("svg text", { hasText: new RegExp(`^${word}$`) });
            await expect(label).toBeInViewport({ ratio: 1 });
            await expect(label.locator("..")).toHaveCSS("opacity", "1");
        }
        await expect(page.locator("video[data-hero-backdrop]")).toHaveCount(0);
        await page.getByRole("button", { name: "Pause animation" }).click();
        const first = page.getByText("Every change in your organisation, governed in one place.", { exact: true });
        await expect(first).toBeVisible();
        await page.waitForTimeout(7_000);
        await expect(first).toBeVisible();
    });
});

test.describe("reduced motion before hydration", () => {
    test.use({ reducedMotion: "reduce", javaScriptEnabled: false });

    test("the server-rendered backdrop video stays hidden", async ({ page }) => {
        await page.goto("/");
        await expect(page.locator("video[data-hero-backdrop]")).toHaveCount(1);
        await expect(page.locator("video[data-hero-backdrop]")).toBeHidden();
    });
});
