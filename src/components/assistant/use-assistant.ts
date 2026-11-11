"use client";

import { useCallback, useRef, useState } from "react";
import { createLineSplitter, parseEventLine } from "@/lib/assistant/ndjson";
import type { AppEvent, FallbackReason, Proposal } from "@/lib/assistant/protocol";

export type ChatMessage = { id: string; role: "user" | "assistant"; text: string };
export type AssistantStatus = "idle" | "verifying" | "streaming";

type Body = { action: "message"; message: string } | { action: "confirm"; requestId: string };

function post(body: object): Promise<Response> {
    return fetch("/api/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
        credentials: "same-origin",
    });
}

async function readEvents(body: ReadableStream<Uint8Array>, onEvent: (event: AppEvent) => void) {
    const reader = body
        .pipeThrough(new TextDecoderStream() as unknown as TransformStream<Uint8Array, string>)
        .pipeThrough(createLineSplitter())
        .getReader();
    for (;;) {
        const { value, done } = await reader.read();
        if (done) return;
        const event = parseEventLine(value);
        if (event) onEvent(event);
    }
}

export function useAssistant(getToken: () => Promise<string>, resetToken: () => void) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [proposal, setProposal] = useState<Proposal | null>(null);
    const [confirmedEmail, setConfirmedEmail] = useState<string | null>(null);
    const [status, setStatus] = useState<AssistantStatus>("idle");
    const [fallback, setFallback] = useState<FallbackReason | null>(null);
    const started = useRef(false);

    const start = useCallback(async (): Promise<FallbackReason | null> => {
        setStatus("verifying");
        try {
            const res = await post({ action: "start", turnstileToken: await getToken() });
            if (res.status === 429) return "limit";
            if (!res.ok) return "unavailable";
            started.current = true;
            return null;
        } finally {
            resetToken();
        }
    }, [getToken, resetToken]);

    const exchange = useCallback(
        async (body: Body): Promise<void> => {
            let res: Response | null = null;
            for (let attempt = 0; attempt < 2; attempt++) {
                if (!started.current) {
                    const refused = await start();
                    if (refused) {
                        setFallback(refused);
                        return;
                    }
                }
                setStatus("streaming");
                res = await post(body);
                if (res.status !== 401) break;
                started.current = false;
            }
            if (!res || !res.ok || !res.body) {
                setFallback(res?.status === 401 ? "expired" : "unavailable");
                return;
            }
            const id = crypto.randomUUID();
            setMessages((m) => [...m, { id, role: "assistant", text: "" }]);
            try {
                await readEvents(res.body, (event) => {
                    if (event.type === "delta") setMessages((m) => m.map((x) => (x.id === id ? { ...x, text: x.text + event.text } : x)));
                    else if (event.type === "proposal") setProposal(event.request);
                    else if (event.type === "confirmed") {
                        setProposal(null);
                        setConfirmedEmail(event.email);
                    } else if (event.type === "fallback") setFallback(event.reason);
                });
            } finally {
                setMessages((m) => m.filter((x) => !(x.id === id && x.text === "")));
            }
        },
        [start],
    );

    const run = useCallback(
        async (body: Body) => {
            setFallback(null);
            try {
                await exchange(body);
            } catch {
                setFallback("unavailable");
            } finally {
                setStatus("idle");
            }
        },
        [exchange],
    );

    const send = useCallback(
        (text: string): boolean => {
            const message = text.trim();
            if (!message || status !== "idle") return false;
            setProposal(null);
            setConfirmedEmail(null);
            setMessages((m) => [...m, { id: crypto.randomUUID(), role: "user", text: message }]);
            void run({ action: "message", message });
            return true;
        },
        [run, status],
    );

    const confirm = useCallback(
        (requestId: string) => {
            if (status === "idle") void run({ action: "confirm", requestId });
        },
        [run, status],
    );

    const dismissProposal = useCallback(() => setProposal(null), []);

    return { messages, proposal, confirmedEmail, status, fallback, send, confirm, dismissProposal };
}
