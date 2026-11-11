"use client";

import { useEffect, useState } from "react";
import { HERO_STATEMENTS } from "@/data/content";

const STEP_MS = 6000;

export function StatementRotator({ running }: { running: boolean }) {
    const [index, setIndex] = useState(0);
    useEffect(() => {
        if (!running) return;
        const timer = window.setTimeout(() => setIndex((i) => (i + 1) % HERO_STATEMENTS.length), STEP_MS);
        return () => window.clearTimeout(timer);
    }, [index, running]);
    const text = HERO_STATEMENTS[index];
    return (
        <p
            aria-live="off"
            className="flex min-h-[5em] max-w-4xl flex-col justify-center sm:min-h-[3.75em] text-balance text-center text-[clamp(1.6rem,4.2vw,3.4rem)] font-semibold leading-tight tracking-tight text-fg"
        >
            <span key={text} className="block animate-statement">
                {text}
            </span>
        </p>
    );
}
