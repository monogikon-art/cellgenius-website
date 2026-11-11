import { expect, test } from "@playwright/test";

test("header, sign-in panel and footer are in place", async ({ page }) => {
    await page.goto("/");
    const signIn = page.getByRole("link", { name: "Sign in to Changenius" });
    await expect(signIn).toHaveAttribute("href", "https://app.cellgenius-ai.com/login");
    await expect(page.locator("input[type=password]")).toHaveCount(0);
    const footer = page.getByRole("contentinfo");
    await expect(footer.getByRole("img", { name: "Changenius" })).toBeVisible();
    await expect(footer).toContainText("by CellGenius");
    await expect(page.getByRole("link", { name: "Skip to content" })).toHaveAttribute("href", "#main");
});

test("phone menu opens, lists the sections and closes on selection", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "phone", "phone menu only exists below sm");
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    const menu = page.locator("#mobile-nav");
    for (const name of ["Assistant", "Films", "Demos"]) {
        await expect(menu.getByRole("link", { name })).toBeVisible();
    }
    await menu.getByRole("link", { name: "Films" }).click();
    await expect(menu).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Open menu" })).toHaveAttribute("aria-expanded", "false");
});
