import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
    it("joins truthy classes and lets the last Tailwind class win", () => {
        expect(cn("px-2 text-fg", false && "hidden", "px-4")).toBe("text-fg px-4");
    });
});
