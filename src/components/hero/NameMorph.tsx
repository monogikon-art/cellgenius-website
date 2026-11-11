"use client";

import { useLayoutEffect, useMemo, useRef, type Ref } from "react";
import { NAME } from "@/data/content";
import { cn } from "@/lib/cn";
import { planMorph } from "./morph";
import { TIMING, wordFor, type Phase } from "./timeline";

const AI_LETTERS = new Set([2, 7]);
const EASE_OUT = "cubic-bezier(0.2, 0.7, 0.2, 1)";

export function NameMorph({ phase, running, ref }: { phase: Phase; running: boolean; ref?: Ref<HTMLDivElement> }) {
    const nameRow = useRef<HTMLDivElement>(null);
    const wordRow = useRef<HTMLDivElement>(null);
    const word = wordFor(phase);
    const plan = useMemo(() => (word ? planMorph(NAME, word) : []), [word]);
    const key = phase.kind === "word" ? `word-${phase.index}` : phase.kind;

    useLayoutEffect(() => {
        const nameEl = nameRow.current;
        if (!nameEl || !running) return;
        const animations: Animation[] = [];
        const timers: number[] = [];

        if (phase.kind === "intro") {
            animations.push(
                nameEl.animate(
                    [
                        { opacity: 0, letterSpacing: "0.3em", filter: "blur(8px)" },
                        { opacity: 1, letterSpacing: "0.02em", filter: "blur(0px)" },
                    ],
                    { duration: 900, delay: 1500, easing: EASE_OUT, fill: "backwards" },
                ),
            );
        } else if (wordRow.current) {
            const wordEl = wordRow.current;
            const nameLetters = Array.from(nameEl.children) as HTMLElement[];
            const wordLetters = Array.from(wordEl.children) as HTMLElement[];
            const scale = parseFloat(getComputedStyle(nameEl).fontSize) / parseFloat(getComputedStyle(wordEl).fontSize);

            animations.push(nameEl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: "ease-out", fill: "backwards" }));
            plan.forEach((letter, i) => {
                const el = wordLetters[i];
                if (!el || letter.char === " ") return;
                if (letter.from === null) {
                    animations.push(
                        el.animate([{ opacity: 0, transform: "translateY(0.3em)" }, { opacity: 1, transform: "none" }], {
                            duration: 450,
                            delay: 350,
                            easing: "ease-out",
                            fill: "backwards",
                        }),
                    );
                    return;
                }
                const source = nameLetters[letter.from];
                const from = source.getBoundingClientRect();
                const to = el.getBoundingClientRect();
                const dx = from.left + from.width / 2 - (to.left + to.width / 2);
                const dy = from.top + from.height / 2 - (to.top + to.height / 2);
                animations.push(
                    el.animate([{ transform: `translate(${dx}px, ${dy}px) scale(${scale})`, color: getComputedStyle(source).color }, { transform: "none" }], {
                        duration: TIMING.morphIn,
                        easing: EASE_OUT,
                        fill: "backwards",
                    }),
                );
            });

            if (phase.kind === "word") {
                timers.push(
                    window.setTimeout(() => {
                        animations.push(
                            wordEl.animate(
                                [
                                    { opacity: 1, transform: "none" },
                                    { opacity: 0, transform: "translateY(-40%) scale(0.12)" },
                                ],
                                { duration: TIMING.flyOut, easing: "cubic-bezier(0.6, 0, 0.8, 0.4)", fill: "forwards" },
                            ),
                            nameEl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 350, easing: "ease-out", fill: "forwards" }),
                        );
                    }, TIMING.word - TIMING.flyOut - 50),
                );
            } else {
                timers.push(
                    window.setTimeout(() => {
                        animations.push(wordEl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 600, easing: "ease-in", fill: "forwards" }));
                    }, TIMING.close - 650),
                );
            }
        }

        return () => {
            timers.forEach((t) => window.clearTimeout(t));
            animations.forEach((a) => a.cancel());
        };
    }, [phase, plan, running]);

    return (
        <div ref={ref} className="relative grid place-items-center" aria-hidden="true">
            {phase.kind === "intro" ? (
                <p className="absolute -top-14 animate-meet text-sm font-semibold uppercase tracking-[0.6em] text-gold">Meet</p>
            ) : null}
            <div
                ref={nameRow}
                className={cn(
                    "flex font-extrabold leading-none tracking-[0.02em] text-[clamp(2.25rem,7vw,4.5rem)] [grid-area:1/1]",
                    phase.kind === "intro" ? "opacity-100" : "opacity-0",
                )}
            >
                {[...NAME].map((char, i) => (
                    <span key={i} className={AI_LETTERS.has(i) ? "text-peri" : "text-fg"}>
                        {char}
                    </span>
                ))}
            </div>
            {word ? (
                <div
                    key={key}
                    ref={wordRow}
                    className="flex whitespace-pre font-extrabold leading-none text-gold text-[clamp(2.75rem,11vw,7.5rem)] [grid-area:1/1] [text-shadow:0_0_32px_rgba(212,175,106,0.55)]"
                >
                    {plan.map((letter, i) => (
                        <span key={i} className={letter.from === null && letter.char !== " " ? "text-fg" : undefined}>
                            {letter.char}
                        </span>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
