"use client";

import dynamic from "next/dynamic";
import { Bot } from "lucide-react";
import { ASSISTANT } from "@/data/content";

const AssistantChat = dynamic(() => import("./AssistantChat").then((m) => m.AssistantChat), {
    ssr: false,
    loading: () => <div className="min-h-80 rounded-3xl border border-white/10 bg-ink-1/70" />,
});

export function AssistantSection({ nonce, enabled, siteKey }: { nonce?: string; enabled: boolean; siteKey: string }) {
    if (!enabled) return null;
    return (
        <section id="assistant" aria-labelledby="assistant-title" className="mx-auto max-w-4xl px-4 py-24 sm:px-6">
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
