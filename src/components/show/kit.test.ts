import { describe, expect, it } from "vitest";
import { NARROW, WIDE, ease, nameLayout, pickFrame, rng, seg } from "./kit";

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
});
