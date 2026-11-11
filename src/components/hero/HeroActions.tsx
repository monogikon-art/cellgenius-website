"use client";

import { LogIn, MessageSquareText, Play } from "lucide-react";
import { FEATURED_FILM, SITE } from "@/data/content";
import { useFilmPlayer } from "../films/film-player";

export function AskAssistantButton() {
    return (
        <button
            type="button"
            onClick={() => {
                const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                document.getElementById("assistant")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
                window.setTimeout(() => document.getElementById("assistant-input")?.focus({ preventScroll: true }), reduce ? 0 : 600);
            }}
            className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 font-semibold text-ink-0 transition-colors hover:bg-gold-hi focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
        >
            <MessageSquareText aria-hidden="true" className="size-5" />
            Ask the EPMO AI Assistant
        </button>
    );
}

export function HeroActions() {
    const { open } = useFilmPlayer();
    const outline =
        "inline-flex items-center gap-2 rounded-full border border-gold/60 px-6 py-3 font-semibold text-gold transition-colors hover:bg-gold hover:text-ink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold";
    return (
        <div className="flex flex-wrap items-center justify-center gap-3">
            <AskAssistantButton />
            <button type="button" onClick={() => open([FEATURED_FILM], 0)} className={outline}>
                <Play aria-hidden="true" className="size-5" />
                Watch the film
            </button>
            <a href={SITE.appLoginUrl} className={outline}>
                <LogIn aria-hidden="true" className="size-5" />
                Sign in
            </a>
        </div>
    );
}
