import { describe, expect, it } from "vitest";
import { CLOSING_LINE, SHOW_LABEL, WORDS } from "./copy";
import { NAME, lettersOf } from "./letters";
import { LOOP_SECONDS, SCENE_SECONDS, SCENES, phaseAt, sceneAt } from "./timeline";

describe("words", () => {
    it("are the seven words in story order with the owner's captions", () => {
        expect(WORDS.map((w) => w.word)).toEqual(["CHANGE", "AI", "AGENTIC AI", "CHAIN", "SIGN", "GAIN", "GENIUS"]);
        expect(WORDS.find((w) => w.word === "SIGN")!.caption).toBe("A person signs every decision, on the record");
        expect(WORDS.find((w) => w.word === "GAIN")!.caption).toBe("Every gain measured and written back to the strategy");
        expect(WORDS.every((w) => !w.caption.endsWith("."))).toBe(true);
        expect(CLOSING_LINE).toBe("The change is in us");
    });
    it("label names every word's caption and the closing line", () => {
        for (const w of WORDS) expect(SHOW_LABEL.toLowerCase()).toContain(w.caption.toLowerCase().split(",")[0]);
        expect(SHOW_LABEL).toContain("The change is in us");
    });
});

describe("lettersOf", () => {
    it("takes each letter from the name, in order where the word runs in order", () => {
        expect(lettersOf("CHANGE")).toEqual([0, 1, 2, 3, 4, 5]);
        expect(lettersOf("GENIUS")).toEqual([4, 5, 6, 7, 8, 9]);
        expect(lettersOf("SIGN")).toEqual([9, 7, 4, 6]);
        expect(lettersOf("GAIN")).toEqual([4, 2, 7, 3]);
        expect(lettersOf("AI")).toEqual([2, 7]);
    });
    it("gives AGENTIC's T no source letter, and reuses letters across the space", () => {
        const at = lettersOf("AGENTIC AI");
        expect(at).toHaveLength(9);
        expect(at[4]).toBeNull();
        expect(at.filter((i) => i !== null).every((i) => NAME[i!] !== undefined)).toBe(true);
        expect(lettersOf("AGENTIC AI").slice(7)).toEqual([2, 7]);
    });
});

describe("timeline", () => {
    it("plays the five scenes in the owner's order and loops", () => {
        expect(SCENES).toEqual(["particles", "circuit", "helix", "rising", "orbit"]);
        expect(SCENE_SECONDS).toBeCloseTo(39.6);
        expect(LOOP_SECONDS).toBeCloseTo(198);
        expect(sceneAt(0).id).toBe("particles");
        expect(sceneAt(40).id).toBe("circuit");
        expect(sceneAt(2 * 39.6 + 1).id).toBe("helix");
        expect(sceneAt(3 * 39.6 + 1).id).toBe("rising");
        expect(sceneAt(4 * 39.6 + 39).id).toBe("orbit");
        expect(sceneAt(198 + 1).id).toBe("particles");
    });
    it("fades across each boundary", () => {
        expect(sceneAt(0.2).alpha).toBeCloseTo(0.5);
        expect(sceneAt(20).alpha).toBe(1);
        expect(sceneAt(39.4).alpha).toBeCloseTo(0.5);
    });
    it("maps a scene's seconds to arrival, the seven words and the closure", () => {
        expect(phaseAt(1.2)).toEqual({ kind: "arrive", p: 0.5 });
        const w = phaseAt(2.4 + 4.6 * 4 + 0.1);
        expect(w.kind).toBe("word");
        expect(w.kind === "word" && w.k).toBe(4);
        expect(phaseAt(2.4 + 4.6 * 7 + 2.5)).toEqual({ kind: "closure", p: 0.5 });
    });
    it("word progress reaches the hold at 0.52 after the lead and the fade at 0.9", () => {
        const lead = 4.6 * 0.4;
        const at = (s: number) => phaseAt(2.4 + s);
        expect(at(lead)).toMatchObject({ kind: "word", k: 0 });
        expect((at(lead) as { p: number }).p).toBeCloseTo(0.52, 2);
        expect((at(4.6 - 0.46) as { p: number }).p).toBeCloseTo(0.9, 2);
    });
});
