import { describe, expect, it } from "vitest";
import { DEMO_GROUPS, FEATURED_FILM, NAME } from "./content";

const allFilms = [FEATURED_FILM, ...DEMO_GROUPS.flatMap((g) => g.chapters)];

describe("content", () => {
    it("names the product CHANGENIUS", () => {
        expect(NAME).toBe("CHANGENIUS");
    });

    it("keeps every video on the site's own media route, with no module commercials", () => {
        for (const film of allFilms) expect(film.src).toMatch(/^\/media\/films\/.+\.mp4$/);
    });

    it("lists the 13 deeper-look chapters, then the 9 executive-demo chapters, with durations", () => {
        expect(DEMO_GROUPS.map((g) => [g.id, g.chapters.length])).toEqual([
            ["deeper-look", 13],
            ["executive-demo", 9],
        ]);
        for (const film of DEMO_GROUPS.flatMap((g) => g.chapters)) expect(film.seconds).toBeGreaterThan(0);
    });

    it("never names the bank client", () => {
        const text = JSON.stringify({ allFilms, DEMO_GROUPS });
        expect(text).not.toMatch(/\bNBB\b|National Bank of Bahrain/i);
    });
});
