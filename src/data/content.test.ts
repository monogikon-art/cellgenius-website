import { describe, expect, it } from "vitest";
import { DEMO_GROUPS, FEATURED_FILM, HERO_STATEMENTS, NAME } from "./content";

const allFilms = [FEATURED_FILM, ...DEMO_GROUPS.flatMap((g) => g.chapters)];

describe("content", () => {
    it("opens the hero on the name and closes on the change in us", () => {
        expect(NAME).toBe("CHANGENIUS");
        expect(HERO_STATEMENTS).toHaveLength(7);
        expect(HERO_STATEMENTS[0]).toBe("Meet Changenius.");
        expect(HERO_STATEMENTS.at(-1)).toBe("The change is in us.");
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
        const text = JSON.stringify({ HERO_STATEMENTS, allFilms, DEMO_GROUPS });
        expect(text).not.toMatch(/\bNBB\b|National Bank of Bahrain/i);
    });
});
