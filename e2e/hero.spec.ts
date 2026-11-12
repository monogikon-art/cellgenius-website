import { expect, test, type Page } from "@playwright/test";
import { SHOW_LABEL } from "../src/components/show/copy";

test.beforeEach(async ({ page }) => {
    await page.route((url) => url.pathname.startsWith("/media/"), (route) => route.fulfill({ status: 204 }));
});

function hero(page: Page) {
    return page.locator("section.hero-show");
}

function stage(page: Page) {
    return page.locator("[data-show-stage]");
}

async function showSeconds(page: Page) {
    const value = await stage(page).getAttribute("data-show-seconds");
    return value === null ? -1 : Number(value);
}

async function waitForRunning(page: Page) {
    await expect.poll(() => showSeconds(page)).toBeGreaterThan(0.5);
}

test("the hero is the five-illustration stage and the 3D C alone, with no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => {
        if (m.type() === "error") errors.push(m.text());
    });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Changenius/);
    await expect(hero(page).getByRole("img", { name: SHOW_LABEL })).toBeVisible();
    await expect(hero(page).locator('img[src="/hero/mark-3d.webp"]')).toHaveAttribute("alt", "");
    await expect(hero(page).locator('[aria-hidden="true"] img[src="/hero/mark-3d.webp"]')).toHaveCount(1);
    await expect(stage(page).locator("canvas")).toBeVisible();
    await expect(page.getByText("Meet Changenius.")).toHaveCount(0);
    await expect(hero(page).locator("p")).toHaveCount(0);
    await expect(hero(page).getByRole("button")).toHaveCount(1);
    await expect(hero(page).getByRole("button", { name: "Pause animation" })).toBeVisible();
    await expect(hero(page).getByRole("link")).toHaveCount(1);
    await expect(hero(page).getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "https://app.cellgenius-ai.com/login");
    expect(errors.filter((e) => !/Failed to load resource|challenges\.cloudflare/.test(e))).toEqual([]);
});

test("the show starts on the golden circuit and loops back to it from the end of the orbit", async ({ page }) => {
    await page.goto("/");
    await expect(stage(page)).toHaveAttribute("data-scene", "circuit");
    await page.goto("/?scene=orbit&t=36");
    await expect(stage(page)).toHaveAttribute("data-scene", "orbit");
    await expect(stage(page)).toHaveAttribute("data-scene", "circuit", { timeout: 10_000 });
});

test("pause stops time and the backdrop video, and play resumes them", async ({ page }) => {
    await page.goto("/");
    await waitForRunning(page);
    const videoPaused = () => page.locator("video[data-hero-backdrop]").evaluate((v: HTMLVideoElement) => v.paused);
    await expect.poll(videoPaused).toBe(false);
    await page.getByRole("button", { name: "Pause animation" }).click();
    await expect.poll(videoPaused).toBe(true);
    await page.waitForTimeout(500);
    const held = await showSeconds(page);
    await page.waitForTimeout(1_000);
    expect(await showSeconds(page)).toBe(held);
    await page.getByRole("button", { name: "Play animation" }).click();
    await expect.poll(() => showSeconds(page)).toBeGreaterThan(held);
    await expect.poll(videoPaused).toBe(false);
});

test("time stops while the hero is scrolled out of view", async ({ page }) => {
    await page.goto("/");
    await waitForRunning(page);
    await page.evaluate(() => {
        const spacer = document.createElement("div");
        spacer.style.height = "300vh";
        document.body.appendChild(spacer);
        window.scrollTo(0, window.innerHeight * 2);
    });
    await expect(hero(page)).not.toBeInViewport();
    await page.waitForTimeout(600);
    const held = await showSeconds(page);
    await page.waitForTimeout(1_000);
    expect(await showSeconds(page)).toBe(held);
});

test("time stops while the tab is hidden and resumes when it is shown again", async ({ page }) => {
    await page.goto("/");
    await waitForRunning(page);
    const setVisibility = (state: "hidden" | "visible") =>
        page.evaluate((value) => {
            Object.defineProperty(document, "visibilityState", { configurable: true, get: () => value });
            document.dispatchEvent(new Event("visibilitychange"));
        }, state);
    await setVisibility("hidden");
    await page.waitForTimeout(600);
    const held = await showSeconds(page);
    await page.waitForTimeout(1_000);
    expect(await showSeconds(page)).toBe(held);
    await setVisibility("visible");
    await expect.poll(() => showSeconds(page)).toBeGreaterThan(held);
});

async function runUntil(page: Page, seconds: number) {
    await expect.poll(() => showSeconds(page), { timeout: 15_000 }).toBeGreaterThanOrEqual(seconds);
    return showSeconds(page);
}

async function expectNoRestart(page: Page, before: number) {
    const after = await showSeconds(page);
    expect(after).toBeGreaterThanOrEqual(before);
    await expect.poll(() => showSeconds(page)).toBeGreaterThan(after);
}

test("a height-only resize (a phone's address bar) and a width change both leave time running", async ({ page }) => {
    await page.goto("/");
    const size = page.viewportSize()!;
    const before = await runUntil(page, 3);
    await page.setViewportSize({ width: size.width, height: size.height - 60 });
    await page.waitForTimeout(600);
    await expectNoRestart(page, before);
    const mid = await showSeconds(page);
    await page.setViewportSize({ width: size.width - 40, height: size.height - 60 });
    await page.waitForTimeout(600);
    await expectNoRestart(page, mid);
});

test.describe("large-viewport height bands", () => {
    test.use({ viewport: { width: 390, height: 800 } });

    const stageHeight = (page: Page) => stage(page).evaluate((el) => (el as HTMLElement).offsetHeight);

    test("a small height change within a band keeps the stage's height and time running", async ({ page }) => {
        await page.goto("/");
        const before = await runUntil(page, 3);
        const height = await stageHeight(page);
        await page.setViewportSize({ width: 390, height: 740 });
        await page.waitForTimeout(600);
        expect(await stageHeight(page)).toBe(height);
        await expectNoRestart(page, before);
    });

    test("crossing into another band changes the stage's height without restarting time", async ({ page }) => {
        await page.goto("/");
        const before = await runUntil(page, 3);
        const height = await stageHeight(page);
        await page.setViewportSize({ width: 390, height: 700 });
        await expect.poll(() => stageHeight(page)).toBeLessThan(height);
        await expectNoRestart(page, before);
    });
});

for (const [width, height] of [[390, 844], [360, 740]]) {
    test(`nothing runs off a ${width} px screen`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto("/");
        await waitForRunning(page);
        const metrics = await page.evaluate(() => {
            const r = document.querySelector("[data-show-stage]")!.getBoundingClientRect();
            return { scroll: document.documentElement.scrollWidth, inner: window.innerWidth, left: r.left, right: r.right };
        });
        expect(metrics.scroll).toBeLessThanOrEqual(metrics.inner);
        expect(metrics.left).toBeGreaterThanOrEqual(0);
        expect(metrics.right).toBeLessThanOrEqual(metrics.inner);
    });
}

test.describe("reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("shows the still name with no animation and no backdrop video, and the pause button still toggles", async ({ page }) => {
        await page.goto("/");
        await expect(hero(page).getByRole("img", { name: SHOW_LABEL })).toBeVisible();
        await expect(stage(page)).toHaveAttribute("data-reduced", "");
        await expect(stage(page).locator("canvas")).toHaveCount(0);
        await expect(stage(page).getByText("CHANGENIUS")).toBeVisible();
        await expect(page.locator("video[data-hero-backdrop]")).toHaveCount(0);
        await page.getByRole("button", { name: "Pause animation" }).click();
        await expect(page.getByRole("button", { name: "Play animation" })).toBeVisible();
        await expect(page.getByText("Meet Changenius.")).toHaveCount(0);
    });
});

test.describe("reduced motion before hydration", () => {
    test.use({ reducedMotion: "reduce", javaScriptEnabled: false });

    test("the server-rendered backdrop video stays hidden", async ({ page }) => {
        await page.goto("/");
        await expect(page.locator("video[data-hero-backdrop]")).toHaveCount(1);
        await expect(page.locator("video[data-hero-backdrop]")).toBeHidden();
    });
});
