import type { AppEvent, FallbackReason, Proposal } from "./protocol";

const REASONS: readonly string[] = ["limit", "ceiling", "unavailable", "expired"] satisfies FallbackReason[];
const REQUEST_TYPES: readonly string[] = ["demo", "information", "contact"] satisfies Proposal["type"][];

type Fields = Record<string, unknown>;
const isFields = (v: unknown): v is Fields => typeof v === "object" && v !== null && !Array.isArray(v);
const isText = (v: unknown): v is string => typeof v === "string";
const isOptionalText = (v: unknown) => v === undefined || isText(v);

function isProposal(v: unknown): v is Proposal {
    return (
        isFields(v) &&
        isText(v.requestId) &&
        isText(v.type) &&
        REQUEST_TYPES.includes(v.type) &&
        isText(v.name) &&
        isText(v.email) &&
        isText(v.company) &&
        isText(v.message) &&
        isOptionalText(v.role) &&
        isOptionalText(v.preferredTimes) &&
        isOptionalText(v.timezone)
    );
}

// The relay has already passed every line through AppEventSchema; this hand-written check keeps zod out of the browser.
export function parseClientEvent(line: string): AppEvent | null {
    let v: unknown;
    try {
        v = JSON.parse(line);
    } catch {
        return null;
    }
    if (!isFields(v)) return null;
    switch (v.type) {
        case "delta":
            return isText(v.text) ? { type: "delta", text: v.text } : null;
        case "proposal":
            return isProposal(v.request) ? { type: "proposal", request: v.request } : null;
        case "confirmed":
            return isText(v.email) ? { type: "confirmed", email: v.email } : null;
        case "fallback":
            return isText(v.reason) && REASONS.includes(v.reason) ? { type: "fallback", reason: v.reason as FallbackReason } : null;
        case "done":
            return { type: "done" };
        default:
            return null;
    }
}
