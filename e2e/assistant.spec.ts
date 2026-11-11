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
    await expect(log).toBeFocused();
    await expect(page.locator("#assistant-input")).not.toBeFocused();
});

test("prepares a demo request and sends it only on confirm", async ({ page }) => {
    await page.goto("/#assistant");
    await page.getByRole("button", { name: "Book a demo" }).click();
    const card = page.getByRole("region", { name: "Demo request" });
    await expect(card).toBeVisible({ timeout: 20_000 });
    await expect(card.getByText("Maria Lopez")).toBeVisible();
    const sent = page.getByText("Thanks — the team will reply to maria@example.com within one working day.", { exact: true });
    await expect(sent).toHaveCount(0);
    await card.getByRole("button", { name: "Confirm and send" }).click();
    await expect(sent).toBeVisible();
    await expect(sent).toBeFocused();
    await expect(page.locator("#assistant-input")).not.toBeFocused();
});

test("Enter while a reply is on its way keeps the draft", async ({ page }) => {
    await page.goto("/#assistant");
    const input = page.locator("#assistant-input");
    await input.fill("A slow question");
    await input.press("Enter");
    await expect(page.getByText("Thinking…", { exact: true })).toBeVisible({ timeout: 20_000 });
    await input.fill("My next question");
    await input.press("Enter");
    await expect(input).toHaveValue("My next question");
    await expect(page.getByRole("log", { name: "Conversation" }).getByText("A slow answer.")).toBeVisible({ timeout: 20_000 });
    await expect(input).toHaveValue("My next question");
});

test("the hero button lands in the assistant input", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Ask the EPMO AI Assistant" }).click();
    await expect(page.locator("#assistant-input")).toBeFocused({ timeout: 3_000 });
});

test("with the assistant on, the header, hero and footer name it", async ({ page, isMobile }) => {
    await page.goto("/");
    if (isMobile) await page.getByRole("button", { name: "Open menu" }).click();
    const nav = page.getByRole("navigation", { name: "Sections" });
    await expect(nav.getByRole("link", { name: "Assistant" })).toHaveAttribute("href", "#assistant");
    await expect(nav.getByRole("link", { name: "Contact" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Ask the EPMO AI Assistant" })).toBeVisible();
    await expect(page.getByRole("contentinfo")).toContainText("The EPMO AI Assistant is AI.");
});

test("Turnstile loads only once the visitor reaches the chat", async ({ page }) => {
    const turnstile: string[] = [];
    page.on("request", (r) => {
        if (r.url().includes("challenges.cloudflare.com")) turnstile.push(r.url());
    });
    await page.goto("/");
    await expect(page.locator("#assistant-input")).toBeAttached();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1_000);
    expect(turnstile).toEqual([]);

    const loaded = page.waitForRequest((r) => r.url().includes("challenges.cloudflare.com"));
    await page.getByRole("log", { name: "Conversation" }).scrollIntoViewIfNeeded();
    await loaded;
});

test("a message sent before Turnstile is ready still gets its answer", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Ask the EPMO AI Assistant" }).click();
    const input = page.locator("#assistant-input");
    await expect(input).toBeFocused({ timeout: 3_000 });
    await input.fill("What can Changenius do?");
    await input.press("Enter");
    await expect(page.getByRole("log", { name: "Conversation" }).getByText("one system")).toBeVisible({ timeout: 30_000 });
});
