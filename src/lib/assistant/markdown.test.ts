import { describe, expect, it } from "vitest";
import { parseMarkdown, safeHref } from "./markdown";

describe("parseMarkdown", () => {
    it("keeps HTML as plain text", () => {
        expect(parseMarkdown("<script>alert(1)</script>")).toEqual([{ kind: "p", inlines: [{ kind: "text", text: "<script>alert(1)</script>" }] }]);
    });
    it("supports bold, lists and links to our own domains only", () => {
        expect(parseMarkdown("Changenius is **one system**.\n\n- [the app](https://app.cellgenius-ai.com/login)\n- [this](https://evil.example.com)")).toEqual([
            {
                kind: "p",
                inlines: [
                    { kind: "text", text: "Changenius is " },
                    { kind: "bold", text: "one system" },
                    { kind: "text", text: "." },
                ],
            },
            {
                kind: "ul",
                items: [[{ kind: "link", text: "the app", href: "https://app.cellgenius-ai.com/login" }], [{ kind: "text", text: "this" }]],
            },
        ]);
    });
    it("splits an intro line and the list that follows it with no blank line", () => {
        expect(parseMarkdown("Here's what it does:\n- A\n- B")).toEqual([
            { kind: "p", inlines: [{ kind: "text", text: "Here's what it does:" }] },
            { kind: "ul", items: [[{ kind: "text", text: "A" }], [{ kind: "text", text: "B" }]] },
        ]);
    });
    it("keeps a closing line after a list as its own paragraph", () => {
        expect(parseMarkdown("Intro\n- A\nOutro").map((b) => b.kind)).toEqual(["p", "ul", "p"]);
    });
});

describe("safeHref", () => {
    it("allows https on our domains only", () => {
        expect(safeHref("https://cellgenius-ai.com/")).toBe("https://cellgenius-ai.com/");
        expect(safeHref("http://cellgenius-ai.com/")).toBeNull();
        expect(safeHref("javascript:alert(1)")).toBeNull();
        expect(safeHref("https://cellgenius-ai.com.evil.example/")).toBeNull();
        expect(safeHref("not a url")).toBeNull();
    });
    it("rejects user info and explicit ports", () => {
        expect(safeHref("https://user:pass@cellgenius-ai.com/")).toBeNull();
        expect(safeHref("https://evil.example@cellgenius-ai.com/")).toBeNull();
        expect(safeHref("https://cellgenius-ai.com:8443/")).toBeNull();
    });
    it("accepts an uppercase host and normalises it", () => {
        expect(safeHref("https://APP.CellGenius-AI.com/login")).toBe("https://app.cellgenius-ai.com/login");
    });
});
