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

test("with the assistant off, the hero button offers email and lands on the email link", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: /Ask the EPMO AI Assistant/ })).toHaveCount(0);
    await page.getByRole("button", { name: "Questions? Email us" }).click();
    await expect(page.locator("#assistant-contact")).toBeFocused({ timeout: 3_000 });
});

test("with the assistant off, the header says Contact and the footer makes no AI note", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Sections" });
    await expect(nav.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "#assistant");
    await expect(nav.getByRole("link", { name: "Assistant" })).toHaveCount(0);
    await expect(page.getByRole("contentinfo")).not.toContainText("EPMO AI Assistant");
});

test("with the assistant off, the phone menu says Contact too", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    const menu = page.locator("#mobile-nav");
    await expect(menu.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "#assistant");
    await expect(menu.getByRole("link", { name: "Assistant" })).toHaveCount(0);
});
