import { expect, test, type Page } from "@playwright/test";

const SHOW_NAME = "Changenius — Enterprise Change Management, powered by AI, all components linked. The change is in us.";

test.beforeEach(async ({ page }) => {
    await page.route((url) => url.pathname.startsWith("/media/"), (route) => route.fulfill({ status: 204 }));
});

function hero(page: Page) {
    return page.locator("section.hero-show");
}

function showStyle(page: Page, property: "animationDuration" | "animationPlayState" | "animationName") {
    return page.locator("[data-chainge-show] span").first().evaluate((el, p) => getComputedStyle(el)[p], property);
}

test("the hero rotates its statements over the login wordmark show, at twice the tempo, with no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => {
        if (m.type() === "error") errors.push(m.text());
    });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Changenius/);
    await expect(hero(page).getByRole("img", { name: SHOW_NAME })).toBeVisible();
    await expect(hero(page).getByRole("img", { name: "Changenius", exact: true })).toBeVisible();
    await expect.poll(() => showStyle(page, "animationDuration")).toBe("147.2s");
    await expect(page.getByText("Meet Changenius.", { exact: true })).toBeVisible();
    await expect(page.getByText("Every change in your organisation, governed in one place.", { exact: true })).toBeVisible({ timeout: 8_000 });
    await expect(page.getByText("AI, grounded in your own policies.", { exact: true })).toBeVisible({ timeout: 8_000 });
    await expect(hero(page).getByRole("button")).toHaveCount(1);
    await expect(hero(page).getByRole("button", { name: "Pause animation" })).toBeVisible();
    await expect(hero(page).getByRole("link")).toHaveCount(0);
    expect(errors.filter((e) => !/Failed to load resource|challenges\.cloudflare/.test(e))).toEqual([]);
});

test("pause stops the wordmark show and the statement, and play resumes them", async ({ page }) => {
    await page.goto("/");
    await expect.poll(() => showStyle(page, "animationPlayState")).toBe("running");
    await page.getByRole("button", { name: "Pause animation" }).click();
    await expect.poll(() => showStyle(page, "animationPlayState")).toBe("paused");
    const first = page.getByText("Meet Changenius.", { exact: true });
    await expect(first).toBeVisible();
    await page.waitForTimeout(7_000);
    await expect(first).toBeVisible();
    await page.getByRole("button", { name: "Play animation" }).click();
    await expect.poll(() => showStyle(page, "animationPlayState")).toBe("running");
    await expect(page.getByText("Every change in your organisation, governed in one place.", { exact: true })).toBeVisible({ timeout: 8_000 });
});

test.describe("reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("shows the still wordmark with no backdrop video, and pause holds the statement", async ({ page }) => {
        await page.goto("/");
        await expect(hero(page).getByRole("img", { name: SHOW_NAME })).toBeVisible();
        await expect.poll(() => showStyle(page, "animationName")).toBe("none");
        await expect(page.locator("video[data-hero-backdrop]")).toHaveCount(0);
        await page.getByRole("button", { name: "Pause animation" }).click();
        const first = page.getByText("Meet Changenius.", { exact: true });
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
