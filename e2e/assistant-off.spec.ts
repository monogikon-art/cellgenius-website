import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    await page.route((url) => url.pathname.startsWith("/media/"), (route) => route.fulfill({ status: 204 }));
});

test("with the assistant off, there is no assistant section and no email address, only Contact us", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("section#assistant")).toHaveCount(0);
    await expect(page.locator("body")).not.toContainText("@cellgenius-ai.com");
    await expect(page.getByRole("contentinfo").getByRole("link", { name: "Contact us" })).toHaveAttribute("href", "mailto:support@cellgenius-ai.com");
    await expect(page.getByRole("heading", { name: /EPMO AI Assistant/ })).toHaveCount(0);
    await expect(page.locator("#assistant-input")).toHaveCount(0);
    await expect(page.locator('script[src*="challenges.cloudflare.com"]')).toHaveCount(0);
});

test("with the assistant off, the footer makes no AI note", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("contentinfo")).not.toContainText("EPMO AI Assistant");
});
