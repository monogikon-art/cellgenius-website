import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    await page.route((url) => url.pathname.startsWith("/media/"), (route) => route.fulfill({ status: 204 }));
});

test("with the assistant off, the section is only an email link", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("section#assistant");
    await expect(section).toHaveText("Questions or a demo? Email info@cellgenius-ai.com.");
    await expect(section.getByRole("link", { name: "info@cellgenius-ai.com" })).toHaveAttribute("href", "mailto:info@cellgenius-ai.com");
    await expect(page.getByRole("heading", { name: /EPMO AI Assistant/ })).toHaveCount(0);
    await expect(page.locator("#assistant-input")).toHaveCount(0);
    await expect(page.locator('script[src*="challenges.cloudflare.com"]')).toHaveCount(0);
});

test("with the assistant off, the footer makes no AI note", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("contentinfo")).not.toContainText("EPMO AI Assistant");
});
