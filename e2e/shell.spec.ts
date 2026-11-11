import { expect, test } from "@playwright/test";

test("header, sign-in panel and footer are in place", async ({ page }) => {
    await page.goto("/");
    const signIn = page.getByRole("link", { name: "Sign in to Changenius" });
    await expect(signIn).toHaveAttribute("href", "https://app.cellgenius-ai.com/login");
    await expect(page.locator("form input[type=password]")).toHaveCount(0);
    await expect(page.getByRole("contentinfo")).toContainText("Changenius by CellGenius");
    await expect(page.getByRole("link", { name: "Skip to content" })).toHaveAttribute("href", "#main");
});
