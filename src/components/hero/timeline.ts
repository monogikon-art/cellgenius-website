import { BURST, CLOSE, INTRO_STATEMENT } from "@/data/content";

export type Phase = { kind: "intro" } | { kind: "word"; index: number } | { kind: "close" };
export type Step = { phase: Phase; ms: number };

export const TIMING = { intro: 2400, word: 5000, close: 6000, flyOut: 750, morphIn: 600 } as const;

export function buildCycle(wordCount: number): Step[] {
    return [
        { phase: { kind: "intro" }, ms: TIMING.intro },
        ...Array.from({ length: wordCount }, (_, index): Step => ({ phase: { kind: "word", index }, ms: TIMING.word })),
        { phase: { kind: "close" }, ms: TIMING.close },
    ];
}

export function launchedCount(phase: Phase, wordCount: number): number {
    if (phase.kind === "intro") return 0;
    if (phase.kind === "close") return wordCount;
    return phase.index;
}

export function statementFor(phase: Phase): string {
    if (phase.kind === "intro") return INTRO_STATEMENT;
    if (phase.kind === "close") return CLOSE.statement;
    return BURST[phase.index].statement;
}

export function wordFor(phase: Phase): string | null {
    if (phase.kind === "intro") return null;
    if (phase.kind === "close") return CLOSE.word;
    return BURST[phase.index].word;
}
