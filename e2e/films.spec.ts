import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    await page.route("**/media/**", (route) => route.fulfill({ status: 204 }));
});

test("the featured film opens in the viewer and Escape returns focus", async ({ page }) => {
    await page.goto("/#films");
    const tile = page.getByRole("button", { name: /Play The Changenius film/ });
    await tile.click();
    const dialog = page.getByRole("dialog", { name: "The Changenius film" });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("video")).toHaveAttribute("src", "/media/films/changenius-film-2min-v1.mp4");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(tile).toBeFocused();
});

test("a demo chapter offers the next chapter", async ({ page }) => {
    await page.goto("/#demos");
    await page.getByRole("button", { name: /Play 1\.1 The campus/ }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: "Next: 1.2 Strategy & OKR" }).click();
    await expect(dialog.getByRole("heading", { name: "1.2 Strategy & OKR" })).toBeVisible();
});
