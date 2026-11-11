"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { Bot, Send } from "lucide-react";
import { ASSISTANT, QUICK_STARTS, SITE } from "@/data/content";
import { MAX_MESSAGE, type FallbackReason } from "@/lib/assistant/protocol";
import { cn } from "@/lib/cn";
import { AssistantText } from "./AssistantText";
import { RequestCard } from "./RequestCard";
import { useAssistant } from "./use-assistant";
import { useTurnstile } from "./use-turnstile";

const FALLBACK_TEXT: Record<FallbackReason, string> = {
    limit: `You've reached the message limit for now. Email us at ${SITE.email} and we'll pick it up.`,
    ceiling: `The assistant is unavailable right now — email ${SITE.email}.`,
    unavailable: `The assistant is unavailable right now — email ${SITE.email}.`,
    expired: "This conversation has expired. Send your message again to continue.",
};

export function AssistantSection({ nonce, enabled, siteKey }: { nonce?: string; enabled: boolean; siteKey: string }) {
    if (!enabled || !siteKey) {
        return (
            <section id="assistant" className="mx-auto max-w-4xl scroll-mt-20 px-4 py-16 sm:px-6">
                <p className="rounded-2xl border border-white/10 bg-ink-1/70 p-6 text-fg">
                    Questions or a demo? Email{" "}
                    <a id="assistant-contact" href={`mailto:${SITE.email}`} className="text-gold underline underline-offset-2">
                        {SITE.email}
                    </a>
                    .
                </p>
            </section>
        );
    }
    return (
        <section id="assistant" aria-labelledby="assistant-title" className="mx-auto max-w-4xl scroll-mt-20 px-4 py-24 sm:px-6">
            <div className="mb-8 flex items-start gap-4 sm:items-center">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-peri to-peri-deep text-white shadow-lg shadow-peri/30">
                    <Bot aria-hidden="true" className="size-6" />
                </span>
                <div>
                    <h2 id="assistant-title" className="text-2xl font-bold text-fg sm:text-3xl">
                        Ask the {ASSISTANT.name}
                    </h2>
                    <p className="mt-1 text-muted">{ASSISTANT.tagline}</p>
                </div>
            </div>
            <AssistantChat nonce={nonce} siteKey={siteKey} />
        </section>
    );
}

function AssistantChat({ nonce, siteKey }: { nonce?: string; siteKey: string }) {
    const turnstile = useTurnstile(siteKey);
    const assistant = useAssistant(turnstile.getToken, turnstile.resetToken);
    const [draft, setDraft] = useState("");
    const input = useRef<HTMLTextAreaElement>(null);
    const log = useRef<HTMLDivElement>(null);
    const busy = assistant.status !== "idle";

    // Scroll the log itself, never the page: scrollIntoView would yank the visitor down from the hero on load.
    useEffect(() => {
        if (log.current) log.current.scrollTop = log.current.scrollHeight;
    }, [assistant.messages, assistant.proposal, assistant.confirmedEmail, assistant.fallback, busy]);

    const submit = (text: string) => {
        if (assistant.send(text)) setDraft("");
    };

    return (
        <div className="rounded-3xl border border-white/10 bg-ink-1/70 shadow-2xl backdrop-blur">
            <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" nonce={nonce} onReady={turnstile.mount} />
            <div ref={log} role="log" aria-label="Conversation" aria-busy={assistant.status === "streaming"} className="max-h-[28rem] min-h-48 space-y-4 overflow-y-auto p-4 sm:p-6">
                {assistant.messages.length === 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {QUICK_STARTS.map((prompt) => (
                            <button
                                key={prompt}
                                type="button"
                                disabled={busy}
                                onClick={() => {
                                    submit(prompt);
                                    input.current?.focus();
                                }}
                                className="rounded-full border border-peri/40 px-4 py-2 text-sm text-fg hover:border-peri hover:bg-peri/10 disabled:opacity-50"
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>
                ) : null}
                {assistant.messages.map((m) => (
                    <div
                        key={m.id}
                        className={cn(
                            "max-w-[85%] break-words rounded-2xl px-4 py-3 text-[15px] leading-relaxed text-fg",
                            m.role === "user" ? "ml-auto w-fit whitespace-pre-wrap bg-peri-deep/30" : "bg-ink-2/80",
                        )}
                    >
                        {m.role === "assistant" ? <AssistantText text={m.text} /> : m.text}
                    </div>
                ))}
                {busy ? <p className="text-sm text-muted">{assistant.status === "verifying" ? "Checking you're human…" : "Thinking…"}</p> : null}
                {assistant.proposal ? (
                    <RequestCard
                        proposal={assistant.proposal}
                        busy={busy}
                        onConfirm={() => {
                            if (assistant.proposal) assistant.confirm(assistant.proposal.requestId);
                            input.current?.focus();
                        }}
                        onEdit={() => {
                            assistant.dismissProposal();
                            input.current?.focus();
                        }}
                    />
                ) : null}
                {assistant.confirmedEmail ? (
                    <p className="rounded-2xl border border-white/15 p-4 text-fg">
                        Thanks — the team will reply to {assistant.confirmedEmail} within one working day.
                    </p>
                ) : null}
                {assistant.fallback ? <p className="rounded-2xl border border-white/15 p-4 text-fg">{FALLBACK_TEXT[assistant.fallback]}</p> : null}
            </div>
            <form
                className="border-t border-white/10 p-4"
                onSubmit={(e) => {
                    e.preventDefault();
                    submit(draft);
                }}
            >
                <label htmlFor="assistant-input" className="sr-only">
                    Your message
                </label>
                <div className="flex items-end gap-3">
                    <textarea
                        id="assistant-input"
                        ref={input}
                        rows={2}
                        maxLength={MAX_MESSAGE}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                                e.preventDefault();
                                if (!busy) submit(draft);
                            }
                        }}
                        placeholder="Ask about Changenius, or ask for a demo…"
                        className="min-h-12 min-w-0 flex-1 resize-none rounded-2xl border border-white/10 bg-ink-0/60 px-4 py-3 text-fg placeholder:text-muted focus:border-peri focus:outline-none"
                    />
                    <button
                        type="submit"
                        disabled={busy || !draft.trim()}
                        aria-label="Send message"
                        className="grid size-12 shrink-0 place-items-center rounded-full bg-gold text-ink-0 hover:bg-gold-hi disabled:opacity-40"
                    >
                        <Send aria-hidden="true" className="size-5" />
                    </button>
                </div>
                <div className="mt-3 flex items-start justify-between gap-4 text-xs text-muted">
                    <p>{ASSISTANT.consent}</p>
                    {draft.length > MAX_MESSAGE - 200 ? <span className="tabular-nums">{MAX_MESSAGE - draft.length}</span> : null}
                </div>
                <div ref={turnstile.containerRef} className="mt-2" />
            </form>
        </div>
    );
}
