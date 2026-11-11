import { z } from "zod";

export const MAX_MESSAGE = 1000;

export const ClientRequestSchema = z.discriminatedUnion("action", [
    z.strictObject({ action: z.literal("start"), turnstileToken: z.string().min(1).max(2048) }),
    z.strictObject({ action: z.literal("message"), message: z.string().trim().min(1).max(MAX_MESSAGE) }),
    z.strictObject({ action: z.literal("confirm"), requestId: z.uuid() }),
]);
export type ClientRequest = z.infer<typeof ClientRequestSchema>;

export type AppCall =
    | { conversationId: string; kind: "message"; message: string; ipHash: string; userAgent: string }
    | { conversationId: string; kind: "confirm"; requestId: string; ipHash: string; userAgent: string };

export const ProposalSchema = z.object({
    requestId: z.uuid(),
    type: z.enum(["demo", "information", "contact"]),
    name: z.string().min(1).max(120),
    email: z.email().max(254),
    company: z.string().min(1).max(160),
    role: z.string().max(120).optional(),
    preferredTimes: z.string().max(200).optional(),
    timezone: z.string().max(64).optional(),
    message: z.string().max(1000),
});
export type Proposal = z.infer<typeof ProposalSchema>;

export const FallbackReasonSchema = z.enum(["limit", "ceiling", "unavailable", "expired"]);
export type FallbackReason = z.infer<typeof FallbackReasonSchema>;

export const AppEventSchema = z.discriminatedUnion("type", [
    z.object({ type: z.literal("delta"), text: z.string().max(4000) }),
    z.object({ type: z.literal("proposal"), request: ProposalSchema }),
    z.object({ type: z.literal("confirmed"), email: z.email().max(254) }),
    z.object({ type: z.literal("fallback"), reason: FallbackReasonSchema }),
    z.object({ type: z.literal("done") }),
]);
export type AppEvent = z.infer<typeof AppEventSchema>;
