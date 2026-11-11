import { describe, expect, it } from "vitest";
import { BURST, CLOSE, INTRO_STATEMENT, NAME } from "@/data/content";
import { planMorph } from "./morph";
import { LABEL_OVER_WORD_OPACITY, ORBIT_FLATTEN, ORBIT_RADII, ORBIT_SCALE, angularSpeed, orbitPoint, placeLabel } from "./orbit";
import { TIMING, buildCycle, launchedCount, statementFor, wordFor } from "./timeline";

describe("planMorph", () => {
    it("reuses each name letter once, left to right", () => {
        expect(planMorph(NAME, "CHANGE").map((l) => l.from)).toEqual([0, 1, 2, 3, 4, 5]);
        expect(planMorph(NAME, "GENIUS").map((l) => l.from)).toEqual([4, 5, 3, 7, 8, 9]);
        expect(planMorph(NAME, "CHAIN").map((l) => l.from)).toEqual([0, 1, 2, 7, 3]);
    });

    it("marks letters the name cannot supply as guests", () => {
        expect(planMorph(NAME, "AGENTIC AI")).toEqual([
            { char: "A", from: 2 },
            { char: "G", from: 4 },
            { char: "E", from: 5 },
            { char: "N", from: 3 },
            { char: "T", from: null },
            { char: "I", from: 7 },
            { char: "C", from: 0 },
            { char: " ", from: null },
            { char: "A", from: null },
            { char: "I", from: null },
        ]);
    });
});

describe("timeline", () => {
    it("runs intro, one step per word, then the close", () => {
        const cycle = buildCycle(BURST.length);
        expect(cycle.map((s) => s.phase.kind)).toEqual(["intro", "word", "word", "word", "word", "word", "close"]);
        expect(cycle.reduce((t, s) => t + s.ms, 0)).toBe(TIMING.intro + 5 * TIMING.word + TIMING.close);
    });

    it("counts launched planets", () => {
        expect(launchedCount({ kind: "intro" }, 5)).toBe(0);
        expect(launchedCount({ kind: "word", index: 3 }, 5)).toBe(3);
        expect(launchedCount({ kind: "close" }, 5)).toBe(5);
    });

    it("picks the statement and word for each phase", () => {
        expect(statementFor({ kind: "intro" })).toBe(INTRO_STATEMENT);
        expect(statementFor({ kind: "word", index: 2 })).toBe(BURST[2].statement);
        expect(statementFor({ kind: "close" })).toBe(CLOSE.statement);
        expect(wordFor({ kind: "intro" })).toBeNull();
        expect(wordFor({ kind: "word", index: 4 })).toBe("GENIUS");
        expect(wordFor({ kind: "close" })).toBe("CHANGE IN US");
    });
});

describe("orbit", () => {
    it("has one orbit per word", () => {
        expect(ORBIT_RADII).toHaveLength(BURST.length);
    });

    it("turns outer orbits more slowly", () => {
        const speeds = ORBIT_RADII.map(angularSpeed);
        for (let i = 1; i < speeds.length; i++) expect(speeds[i]).toBeLessThan(speeds[i - 1]);
        expect(angularSpeed(ORBIT_RADII[0])).toBeCloseTo((2 * Math.PI) / 40);
    });

    it("places planets on a flattened ellipse", () => {
        expect(orbitPoint(3, 0)).toEqual({ x: 3 * ORBIT_SCALE, y: 0 });
        const top = orbitPoint(3, Math.PI / 2);
        expect(top.x).toBeCloseTo(0);
        expect(top.y).toBeCloseTo(3 * ORBIT_SCALE * ORBIT_FLATTEN);
    });
});

describe("placeLabel", () => {
    const edges = { left: 8, right: 382 };
    const box = (left: number, width = 60, top = 100) => ({ left, right: left + width, top, bottom: top + 14 });

    it("leaves a label that fits alone", () => {
        expect(placeLabel(box(100), edges, null)).toEqual({ dx: 0, opacity: 1 });
    });

    it("slides a label back inside either edge", () => {
        expect(placeLabel(box(-10), edges, null)).toEqual({ dx: 18, opacity: 1 });
        expect(placeLabel(box(340), edges, null)).toEqual({ dx: -18, opacity: 1 });
    });

    it("fades a label out once its planet has left the screen", () => {
        expect(placeLabel(box(-22), edges, null)).toEqual({ dx: 30, opacity: 1 });
        expect(placeLabel(box(-34), edges, null)).toEqual({ dx: 42, opacity: 0.5 });
        expect(placeLabel(box(-200), edges, null).opacity).toBe(0);
    });

    it("dims a label crossing the word, and only while it does", () => {
        const word = { left: 150, right: 300, top: 90, bottom: 160 };
        expect(placeLabel(box(170), edges, word).opacity).toBeCloseTo(LABEL_OVER_WORD_OPACITY);
        expect(placeLabel(box(84), edges, word).opacity).toBe(1);
        expect(placeLabel(box(96), edges, word).opacity).toBeCloseTo(1 - 0.75 * 0.5);
        expect(placeLabel(box(170, 60, 200), edges, word).opacity).toBe(1);
    });
});
