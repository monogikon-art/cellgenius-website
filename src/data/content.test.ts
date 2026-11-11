import { describe, expect, it } from "vitest";
import { BURST, CLOSE, DEMO_GROUPS, FEATURED_FILM, MODULE_COMMERCIALS, NAME } from "./content";

const allFilms = [FEATURED_FILM, ...MODULE_COMMERCIALS, ...DEMO_GROUPS.flatMap((g) => g.chapters)];

describe("content", () => {
    it("carries the film's five words in order, then the close", () => {
        expect(NAME).toBe("CHANGENIUS");
        expect(BURST.map((b) => b.word)).toEqual(["CHANGE", "AI", "AGENTIC AI", "CHAIN", "GENIUS"]);
        expect(CLOSE).toEqual({ word: "CHANGE IN US", statement: "The change is in us." });
    });

    it("keeps every video on the site's own media route", () => {
        for (const film of allFilms) expect(film.src).toMatch(/^\/media\/.+\.mp4$/);
    });

    it("lists all 9 executive-demo and 13 deeper-look chapters with durations", () => {
        expect(DEMO_GROUPS.map((g) => g.chapters.length)).toEqual([9, 13]);
        for (const film of DEMO_GROUPS.flatMap((g) => g.chapters)) expect(film.seconds).toBeGreaterThan(0);
    });

    it("never names the bank client", () => {
        const text = JSON.stringify({ BURST, CLOSE, allFilms, DEMO_GROUPS });
        expect(text).not.toMatch(/\bNBB\b|National Bank of Bahrain/i);
    });
});
