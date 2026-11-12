import { NAME_WEIGHT, centres, fontOf, holoGlyph, restColor, sourceLetter, txt, type DrawArgs, type NameLayout } from "../kit";
import { NAME, lettersOf } from "../letters";

export type Slot = { ch: string; src: number | null; x: number };

export function slotsOf(word: string, xs: number[]): Slot[] {
    const src = lettersOf(word);
    const slots: Slot[] = [];
    let n = 0;
    [...word].forEach((ch, pos) => {
        if (ch === " ") return;
        slots.push({ ch, src: src[n++], x: xs[pos] });
    });
    return slots;
}

export function drawName(a: DrawArgs, lay: NameLayout, gold: number[], goldAmt: number, alpha: number, dy: number) {
    const { g, frame, font } = a;
    const f = fontOf(font, NAME_WEIGHT, lay.size);
    const xs = centres(g, NAME, f, lay.ls, frame.W / 2);
    [...NAME].forEach((ch, i) => {
        txt(g, ch, xs[i], lay.y + dy, f, restColor(i), alpha);
        if (gold.includes(i) && goldAmt > 0) sourceLetter(g, ch, xs[i], lay.y + dy, f, goldAmt * alpha);
    });
}

export function drawSlot(
    g: CanvasRenderingContext2D,
    font: string,
    s: Slot,
    x: number,
    y: number,
    finalSize: number,
    size: number,
    alpha: number,
) {
    holoGlyph(g, font, NAME_WEIGHT, s.ch, x, y, finalSize, size, alpha);
}
