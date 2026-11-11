import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseClientEvent } from "./client-events";
import { MAX_MESSAGE as LIMIT } from "./limits";
import { MAX_MESSAGE } from "./protocol";

const REQUEST = {
    requestId: "6f1c2a4e-8b3d-4c5e-9f70-1a2b3c4d5e6f",
    type: "demo",
    name: "Maria Lopez",
    email: "maria@example.com",
    company: "Example Bank",
    message: "Demo please",
};

describe("parseClientEvent", () => {
    it("accepts every event the relay can send", () => {
        for (const event of [
            { type: "delta", text: "Hi" },
            { type: "proposal", request: REQUEST },
            { type: "confirmed", email: "maria@example.com" },
            { type: "fallback", reason: "limit" },
            { type: "done" },
        ]) {
            expect(parseClientEvent(JSON.stringify(event))).toEqual(event);
        }
    });

    it("refuses anything else", () => {
        for (const line of [
            "not json",
            "null",
            "[]",
            '{"type":"html","text":"<b>"}',
            '{"type":"delta","text":1}',
            '{"type":"fallback","reason":"nope"}',
            '{"type":"confirmed"}',
            JSON.stringify({ type: "proposal", request: { ...REQUEST, type: "sale" } }),
            JSON.stringify({ type: "proposal", request: { ...REQUEST, name: 3 } }),
        ]) {
            expect(parseClientEvent(line)).toBeNull();
        }
    });
});

describe("client bundle", () => {
    it("shares the message limit with the server schema", () => {
        expect(LIMIT).toBe(MAX_MESSAGE);
    });

    it("keeps zod out of every module the browser loads for the assistant", () => {
        const files = [
            "src/components/assistant/AssistantSection.tsx",
            "src/components/assistant/AssistantChat.tsx",
            "src/components/assistant/use-assistant.ts",
            "src/components/assistant/RequestCard.tsx",
            "src/lib/assistant/client-events.ts",
            "src/lib/assistant/limits.ts",
            "src/lib/assistant/line-splitter.ts",
        ];
        for (const file of files) {
            const source = readFileSync(path.resolve(__dirname, "../../..", file), "utf8");
            expect(source, file).not.toMatch(/from "zod"/);
            expect(source, file).not.toMatch(/^import (?!type )[^;]*from "(@\/lib\/assistant|\.)\/(protocol|ndjson|env)"/m);
        }
    });
});
