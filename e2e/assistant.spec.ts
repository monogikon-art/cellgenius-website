import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    await page.route((url) => url.pathname.startsWith("/media/"), (route) => route.fulfill({ status: 204 }));
});

test("answers a question, and links only to our own domains", async ({ page }) => {
    await page.goto("/#assistant");
    await expect(page.getByText("This assistant is AI.", { exact: false })).toBeVisible();
    await page.getByRole("button", { name: "What can Changenius do?" }).click();
    const log = page.getByRole("log", { name: "Conversation" });
    await expect(log.getByText("one system")).toBeVisible({ timeout: 20_000 });
    await expect(log.getByRole("link", { name: "the app" })).toHaveAttribute("href", "https://app.cellgenius-ai.com/login");
    await expect(log.getByRole("link", { name: "this" })).toHaveCount(0);
});

test("prepares a demo request and sends it only on confirm", async ({ page }) => {
    await page.goto("/#assistant");
    await page.getByRole("button", { name: "Book a demo" }).click();
    const card = page.getByRole("region", { name: "Demo request" });
    await expect(card).toBeVisible({ timeout: 20_000 });
    await expect(card.getByText("Maria Lopez")).toBeVisible();
    await expect(page.getByText("The team will reply to maria@example.com", { exact: false })).toHaveCount(0);
    await card.getByRole("button", { name: "Confirm and send" }).click();
    await expect(page.getByText("The team will reply to maria@example.com", { exact: false })).toBeVisible();
});

test("the hero button lands in the assistant input", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Ask the EPMO AI Assistant" }).click();
    await expect(page.locator("#assistant-input")).toBeFocused({ timeout: 3_000 });
});
