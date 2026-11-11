import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    await page.route((url) => url.pathname.startsWith("/media/"), (route) => route.fulfill({ status: 204 }));
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

    await tile.click();
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Close video" }).click();
    await expect(dialog).toBeHidden();
    await expect(tile).toBeFocused();
});

test("a demo chapter offers the next chapter", async ({ page }) => {
    await page.goto("/#demos");
    await page.getByRole("button", { name: /Play 1\.1 The campus/ }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: "Next: 1.2 Strategy & OKR" }).click();
    await expect(dialog.getByRole("heading", { name: "1.2 Strategy & OKR" })).toBeVisible();
    await expect(dialog.locator("video")).toHaveAttribute("src", "/media/films/executive-demo-v3/02-strategy.mp4");
    await dialog.getByRole("button", { name: "Close video" }).click();
    await expect(dialog).toBeHidden();

    await page.getByRole("button", { name: /Play 1.8 Planning the delivery/ }).click();
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Next: 1.9 Go-live, and after" }).click();
    await expect(dialog.getByRole("button", { name: /^Next:/ })).toHaveCount(0);
    await expect(dialog.locator("video")).toBeFocused();
});

test("a chapter that ends moves on and keeps focus on the new video", async ({ page }) => {
    await page.goto("/#demos");
    await page.getByRole("button", { name: /Play 1\.1 The campus/ }).click();
    const dialog = page.getByRole("dialog");
    await dialog.locator("video").dispatchEvent("ended");
    await expect(dialog.getByRole("heading", { name: "1.2 Strategy & OKR" })).toBeVisible();
    await expect(dialog.locator("video")).toBeFocused();
});
