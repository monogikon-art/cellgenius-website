import { describe, expect, it } from "vitest";
import { formatDuration } from "./format-duration";

describe("formatDuration", () => {
    it("formats seconds as m:ss", () => {
        expect(formatDuration(113)).toBe("1:53");
        expect(formatDuration(49)).toBe("0:49");
        expect(formatDuration(600)).toBe("10:00");
    });
});
