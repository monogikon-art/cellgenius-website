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

test("with the assistant off, the hero button lands on the email link", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Ask the EPMO AI Assistant" }).click();
    await expect(page.locator("#assistant-contact")).toBeFocused({ timeout: 3_000 });
});
