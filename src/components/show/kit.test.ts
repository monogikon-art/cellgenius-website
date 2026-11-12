import { describe, expect, it } from "vitest";
import { CLOSING_LINE, WORDS } from "./copy";
import { NARROW, WIDE, ease, fitCaption, nameLayout, pickFrame, rng, seg } from "./kit";

describe("kit", () => {
    it("picks the frame from the aspect ratio", () => {
        expect(pickFrame(896, 640)).toBe(WIDE);
        expect(pickFrame(390, 560)).toBe(NARROW);
    });

    it("clamps segments and eases between 0 and 1", () => {
        expect(seg(0.5, 0, 1)).toBe(0.5);
        expect(seg(2, 0, 1)).toBe(1);
        expect(ease(0)).toBe(0);
        expect(ease(1)).toBe(1);
    });

    it("seeds the generator deterministically", () => {
        expect(rng(7)()).toBe(rng(7)());
    });

    it.each([WIDE, NARROW])("fits the resting name inside the frame", (frame) => {
        const { size, ls } = nameLayout(frame);
        expect(size * 10 * 0.72 + ls * 9).toBeLessThanOrEqual(frame.W * 0.9);
    });

    it.each([WIDE, NARROW])("keeps every caption to two lines", (frame) => {
        const measureAt = (t: string, size: number) => t.length * size * 0.55;
        for (const text of [...WORDS.map((w) => w.caption), CLOSING_LINE]) {
            const { lines, size } = fitCaption(text, frame.narrow ? 52 : 44, frame.W * 0.8, measureAt);
            expect(lines.length).toBeLessThanOrEqual(2);
            for (const l of lines) expect(measureAt(l, size)).toBeLessThanOrEqual(frame.W * 0.8);
        }
    });

    it("shrinks the font when two lines are not enough", () => {
        const { lines, size } = fitCaption("word ".repeat(20).trim(), 44, 800, (t, s) => t.length * s * 0.55);
        expect(lines.length).toBeLessThanOrEqual(2);
        expect(size).toBeLessThan(44);
    });
});
