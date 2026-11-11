import { expect, test, type Page } from "@playwright/test";
import { ACT1_SUBLINE, CAPTIONS as CAPTION_TEXT, CLOSING_LINE, SHOW_LABEL as SHOW_NAME } from "../src/components/brand/changenius-show-copy";

const CAPTIONS = Object.values(CAPTION_TEXT);

const LOOP_MS = 147_200;

test.beforeEach(async ({ page }) => {
    await page.route((url) => url.pathname.startsWith("/media/"), (route) => route.fulfill({ status: 204 }));
});

function hero(page: Page) {
    return page.locator("section.hero-show");
}

function show(page: Page) {
    return page.locator("[data-chainge-show]");
}

function showStyle(page: Page, property: "animationDuration" | "animationPlayState" | "animationName") {
    return page.locator("[data-chainge-show] span").first().evaluate((el, p) => getComputedStyle(el)[p], property);
}

function holdShowAt(page: Page, fraction: number) {
    return page.evaluate(
        ([f, loop]) => {
            for (const a of document.querySelector("[data-chainge-show]")!.getAnimations({ subtree: true })) {
                a.pause();
                a.currentTime = f * loop;
            }
        },
        [fraction, LOOP_MS] as const,
    );
}

test("the hero is the enlarged wordmark show alone, at twice the tempo, with no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => {
        if (m.type() === "error") errors.push(m.text());
    });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Changenius/);
    await expect(hero(page).getByRole("img", { name: SHOW_NAME })).toBeVisible();
    await expect(hero(page).locator('svg[aria-hidden="true"][viewBox="0 0 64 64"]')).toBeVisible();
    await expect(hero(page).getByRole("img")).toHaveCount(1);
    await expect.poll(() => showStyle(page, "animationDuration")).toBe("147.2s");
    await expect(page.getByText("Meet Changenius.")).toHaveCount(0);
    await expect(hero(page).locator("p")).toHaveCount(0);
    await expect(hero(page).getByRole("button")).toHaveCount(1);
    await expect(hero(page).getByRole("button", { name: "Pause animation" })).toBeVisible();
    await expect(hero(page).getByRole("link")).toHaveCount(0);
    expect(errors.filter((e) => !/Failed to load resource|challenges\.cloudflare/.test(e))).toEqual([]);
});

test("the captions carry the owner's wording, in larger sentence case that may wrap", async ({ page }) => {
    await page.goto("/");
    for (const caption of CAPTIONS) await expect(show(page).getByText(caption, { exact: true }).first()).toBeAttached();
    await expect(show(page).getByText(ACT1_SUBLINE, { exact: true })).toBeAttached();
    await expect(show(page).getByText(CLOSING_LINE, { exact: true })).toBeAttached();
    await expect(show(page).getByText(/Enterprise Change Management|All components linked/)).toHaveCount(0);

    await holdShowAt(page, 13.8 / 147.2);
    const agentic = show(page).getByText(CAPTIONS[2], { exact: true }).first();
    await expect(agentic).toBeVisible();
    const style = await agentic.evaluate((el) => {
        const s = getComputedStyle(el);
        return { transform: s.textTransform, wrap: s.whiteSpace, size: parseFloat(s.fontSize), opacity: Number(s.opacity) };
    });
    expect(style.transform).toBe("none");
    expect(style.wrap).not.toBe("nowrap");
    expect(style.opacity).toBeGreaterThan(0.9);
    expect(style.size).toBeGreaterThanOrEqual(page.viewportSize()!.width >= 768 ? 17 : 14);
});

test("a height-only resize (a phone's address bar) leaves the show running; a width change re-measures it", async ({ page }) => {
    await page.goto("/");
    const showTime = () =>
        page.evaluate(() => Number(document.querySelector("[data-chainge-show]")!.getAnimations({ subtree: true })[0].currentTime));
    await page.waitForTimeout(2_500);
    const size = page.viewportSize()!;
    const before = await showTime();
    await page.setViewportSize({ width: size.width, height: size.height - 60 });
    await page.waitForTimeout(600);
    expect(await showTime()).toBeGreaterThan(before);
    await page.setViewportSize({ width: size.width - 40, height: size.height - 60 });
    await page.waitForTimeout(600);
    expect(await showTime()).toBeLessThan(before);
});

test.describe("large-viewport height bands", () => {
    test.use({ viewport: { width: 390, height: 800 } });

    const showTime = (page: Page) =>
        page.evaluate(() => Number(document.querySelector("[data-chainge-show]")!.getAnimations({ subtree: true })[0].currentTime));
    const showHeight = (page: Page) => show(page).evaluate((el) => (el as HTMLElement).offsetHeight);

    test("a small height change within a band keeps the show running at the same height", async ({ page }) => {
        await page.goto("/");
        await page.waitForTimeout(2_500);
        const height = await showHeight(page);
        const before = await showTime(page);
        await page.setViewportSize({ width: 390, height: 740 });
        await page.waitForTimeout(600);
        expect(await showHeight(page)).toBe(height);
        expect(await showTime(page)).toBeGreaterThan(before);
    });

    test("crossing into another band resizes the show and re-measures it", async ({ page }) => {
        await page.goto("/");
        await page.waitForTimeout(2_500);
        const height = await showHeight(page);
        const before = await showTime(page);
        await page.setViewportSize({ width: 390, height: 700 });
        await page.waitForTimeout(600);
        expect(await showHeight(page)).toBeLessThan(height);
        expect(await showTime(page)).toBeLessThan(before);
    });
});

test("pause stops the wordmark show and the backdrop video, and play resumes them", async ({ page }) => {
    await page.goto("/");
    const videoPaused = () => page.locator("video[data-hero-backdrop]").evaluate((v: HTMLVideoElement) => v.paused);
    await expect.poll(() => showStyle(page, "animationPlayState")).toBe("running");
    await page.getByRole("button", { name: "Pause animation" }).click();
    await expect.poll(() => showStyle(page, "animationPlayState")).toBe("paused");
    await expect.poll(videoPaused).toBe(true);
    await page.getByRole("button", { name: "Play animation" }).click();
    await expect.poll(() => showStyle(page, "animationPlayState")).toBe("running");
    await expect.poll(videoPaused).toBe(false);
});

for (const width of [390, 360]) {
    test(`nothing in the show runs off a ${width} px screen in any act`, async ({ page }) => {
        await page.setViewportSize({ width, height: width === 390 ? 844 : 740 });
        await page.goto("/");
        await page.waitForTimeout(500);
        for (const seconds of [4, 13.8, 18.8, 53.6, 56, 138, 144.6]) {
            await holdShowAt(page, seconds / 147.2);
            const overflow = await page.evaluate(() => {
                const root = document.querySelector("[data-chainge-show]")!;
                const shown = (el: Element) => {
                    let o = 1;
                    for (let n: Element | null = el; n && n !== root.parentElement; n = n.parentElement) o *= Number(getComputedStyle(n).opacity);
                    return o > 0.3;
                };
                const off = [...root.querySelectorAll("span, div")]
                    .filter((el) => el.children.length === 0 && el.textContent!.trim() && shown(el))
                    .filter((el) => {
                        const r = el.getBoundingClientRect();
                        return r.left < 0 || r.right > window.innerWidth;
                    })
                    .map((el) => el.textContent);
                return { scroll: document.documentElement.scrollWidth, inner: window.innerWidth, off };
            });
            expect(overflow.scroll, `scrollWidth at ${seconds}s`).toBeLessThanOrEqual(overflow.inner);
            expect(overflow.off, `text off screen at ${seconds}s`).toEqual([]);
        }
    });
}

test.describe("reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("shows the still wordmark with no backdrop video, and the pause button still toggles", async ({ page }) => {
        await page.goto("/");
        await expect(hero(page).getByRole("img", { name: SHOW_NAME })).toBeVisible();
        await expect.poll(() => showStyle(page, "animationName")).toBe("none");
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
