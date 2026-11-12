import { C, NAME_WEIGHT, centres, fontOf, setGlow, txt, type DrawArgs, type NameLayout } from "../kit";
import { NAME, lettersOf } from "../letters";

export const GOLD_GLOW = "rgba(212,175,106,.75)";
export const AI_GLOW = "rgba(129,140,248,.6)";
export const WHITE_GLOW = "rgba(238,242,248,.28)";

export type SlotKind = "white" | "gold" | "ai" | "sheen";
export type Slot = { ch: string; src: number | null; x: number; kind: SlotKind };

function kindOf(word: string, pos: number, ch: string): SlotKind {
    if (word === "AI") return ch === "A" ? "ai" : "gold";
    if (word === "AGENTIC AI") {
        if (pos > 7) return ch === "A" ? "ai" : "gold";
        return ch === "T" ? "white" : "sheen";
    }
    if (word === "GENIUS") return pos >= 3 ? "gold" : "white";
    if (word === "CHANGE" || word === "CHAIN") return ch === "A" ? "gold" : "white";
    return ch === "I" ? "gold" : "white";
}

export function slotsOf(word: string, xs: number[]): Slot[] {
    const src = lettersOf(word);
    const slots: Slot[] = [];
    let n = 0;
    [...word].forEach((ch, pos) => {
        if (ch === " ") return;
        slots.push({ ch, src: src[n++], x: xs[pos], kind: kindOf(word, pos, ch) });
    });
    return slots;
}

export function sheen(g: CanvasRenderingContext2D, left: number, span: number, t: number) {
    const off = ((t * 0.08) % 1) * span;
    const x0 = left - span + off;
    const gr = g.createLinearGradient(x0, 0, x0 + span * 3, 0);
    const stops: [number, string][] = [
        [0, "#22d3ee"],
        [0.4, "#818cf8"],
        [0.65, "#e879f9"],
        [1, "#22d3ee"],
    ];
    for (let r = 0; r < 3; r++) stops.forEach(([s, c]) => gr.addColorStop((r + s) / 3, c));
    return gr;
}

export function letter(
    g: CanvasRenderingContext2D,
    ch: string,
    x: number,
    y: number,
    f: string,
    fill: string | CanvasGradient,
    alpha: number,
    glow: string,
    blur: number,
) {
    if (alpha <= 0) return;
    g.save();
    g.globalAlpha *= alpha;
    g.font = f;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.letterSpacing = "0px";
    setGlow(g, glow, blur);
    g.fillStyle = fill;
    g.fillText(ch, x, y);
    g.restore();
}

export function drawName(a: DrawArgs, lay: NameLayout, gold: number[], goldAmt: number, alpha: number, dy: number) {
    const { g, frame, font } = a;
    const f = fontOf(font, NAME_WEIGHT, lay.size);
    const xs = centres(g, NAME, f, lay.ls, frame.W / 2);
    [...NAME].forEach((ch, i) => {
        const base = i === 2 || i === 7 ? C.ai : C.text;
        txt(g, ch, xs[i], lay.y + dy, f, base, alpha);
        if (gold.includes(i) && goldAmt > 0) txt(g, ch, xs[i], lay.y + dy, f, C.goldHi, goldAmt * alpha, GOLD_GLOW, 18);
    });
}

export function drawSlot(
    g: CanvasRenderingContext2D,
    s: Slot,
    x: number,
    y: number,
    f: string,
    alpha: number,
    flying: boolean,
    grad: CanvasGradient | null,
) {
    const guest = s.src === null;
    const fill = s.kind === "sheen" ? (grad as CanvasGradient) : s.kind === "gold" ? C.goldHi : s.kind === "ai" ? C.ai : C.text;
    const glow = flying && !guest ? GOLD_GLOW : s.kind === "gold" ? GOLD_GLOW : s.kind === "ai" ? AI_GLOW : WHITE_GLOW;
    const blur = flying && !guest ? 36 : s.kind === "white" ? 18 : 28;
    letter(g, s.ch, x, y, f, fill, alpha, glow, blur);
}
