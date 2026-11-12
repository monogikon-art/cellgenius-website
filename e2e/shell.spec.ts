import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    await page.route((url) => url.pathname.startsWith("/media/"), (route) => route.fulfill({ status: 204 }));
});

test("no header banner; the sign-in panel and footer are in place", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("banner")).toHaveCount(0);
    await expect(page.getByRole("navigation")).toHaveCount(0);
    const signIn = page.getByRole("link", { name: /sign in/i });
    await expect(signIn).toHaveCount(1);
    await expect(signIn).toHaveAttribute("href", "https://app.cellgenius-ai.com/login");
    await expect(page.locator("body")).not.toContainText("@cellgenius-ai.com");
    await expect(page.locator("body")).not.toContainText(/customer|client/i);
    await expect(page.locator("input[type=password]")).toHaveCount(0);
    const footer = page.getByRole("contentinfo");
    await expect(footer.getByRole("img", { name: "Changenius" })).toBeVisible();
    await expect(footer).toContainText("by CellGenius");
    await expect(footer.getByRole("link", { name: "Contact us" })).toHaveAttribute("href", "mailto:support@cellgenius-ai.com");
});

test("the page runs hero, assistant, then films", async ({ page }) => {
    await page.goto("/");
    const ids = await page.locator("main > section").evaluateAll((sections) => sections.map((s) => s.id || s.className.split(" ")[0]));
    expect(ids).toEqual(["hero-show", "assistant", "films"]);
});

test("metadata names one canonical page for sharing", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://cellgenius-ai.com");
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", "https://cellgenius-ai.com");
    await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute("content", "Changenius");
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary");
});

test("the retired pricing page redirects home permanently", async ({ request }) => {
    const res = await request.get("/pricing", { maxRedirects: 0 });
    expect(res.status()).toBe(308);
    expect(res.headers().location).toBe("/");
});
