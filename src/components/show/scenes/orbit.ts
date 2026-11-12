import { WORDS } from "../copy";
import {
    C,
    NAME_WEIGHT,
    captionMeasurer,
    centres,
    drawClosure,
    ease,
    fitCaption,
    fontOf,
    nameLayout,
    seg,
    sourceLetter,
    txt,
    type DrawArgs,
    type Frame,
    type NameLayout,
    type Scene,
} from "../kit";
import { NAME } from "../letters";
import { drawName, drawSlot, slotsOf, type Slot } from "./word-style";

const PLACES: Record<"wide" | "narrow", [number, number][]> = {
    wide: [
        [330, 210],
        [750, 210],
        [1170, 210],
        [1590, 210],
        [540, 810],
        [960, 810],
        [1380, 810],
    ],
    narrow: [
        [290, 150],
        [790, 150],
        [290, 390],
        [790, 390],
        [290, 830],
        [790, 830],
        [540, 1070],
    ],
};

const nameAt = (frame: Frame): NameLayout => {
    const lay = nameLayout(frame);
    return { ...lay, ls: Math.round(lay.size * 0.02) };
};

type Built = {
    size: number;
    slots: Slot[];
    cx: number;
    cy: number;
    capSize: number;
    capLines: string[];
};

const cache = new Map<string, Built>();

function build(a: DrawArgs, k: number): Built {
    const { g, frame, font } = a;
    const key = `${frame.W}x${frame.H}|${font}|${k}`;
    const hit = cache.get(key);
    if (hit) return hit;
    const [cx, cy] = PLACES[frame.narrow ? "narrow" : "wide"][k];
    const size = frame.narrow ? 52 : 64;
    const ls = Math.round(size * 0.02);
    const xs = centres(g, WORDS[k].word, fontOf(font, NAME_WEIGHT, size), ls, cx);
    const cap = fitCaption(WORDS[k].caption, frame.narrow ? 30 : 28, frame.narrow ? 460 : 400, captionMeasurer(g, font), 3, frame.narrow ? 28 : 26);
    const built: Built = {
        size,
        slots: slotsOf(WORDS[k].word, xs),
        cx,
        cy,
        capSize: cap.size,
        capLines: cap.lines,
    };
    cache.set(key, built);
    return built;
}

function drawCaption(a: DrawArgs, b: Built, alpha: number) {
    const { g, font } = a;
    const f = fontOf(font, 500, b.capSize);
    const lead = b.capSize * 1.25;
    const top = b.cy + b.size * 0.5 + b.capSize * 0.9;
    b.capLines.forEach((l, i) => txt(g, l, b.cx, top + i * lead, f, C.text, alpha, "rgba(7,11,22,.9)", 18));
}

function drawPlaced(a: DrawArgs, k: number, alpha: number) {
    const { g, font } = a;
    const b = build(a, k);
    b.slots.forEach((s) => drawSlot(g, font, s, s.x, b.cy, b.size, b.size, alpha));
    drawCaption(a, b, alpha);
}

function drawFlying(a: DrawArgs, k: number, p: number) {
    const { g, frame, font } = a;
    const lay = nameAt(frame);
    const b = build(a, k);
    const nxs = centres(g, NAME, fontOf(font, NAME_WEIGHT, lay.size), lay.ls, frame.W / 2);
    const gold = b.slots.flatMap((s) => (s.src === null ? [] : [s.src]));
    drawName(a, lay, gold, seg(p, 0, 0.1) * (1 - seg(p, 0.5, 0.7)), 1, 0);

    const dur = Math.min(0.3, 0.45 - 0.03 * (b.slots.length - 1));
    b.slots.forEach((s, n) => {
        const start = 0.05 + 0.03 * n;
        const e = ease(seg(p, start, start + dur));
        const guest = s.src === null;
        const sx = guest ? frame.W + b.size : nxs[s.src as number];
        const sy = guest ? b.cy : lay.y;
        const x = sx + (s.x - sx) * e;
        const y = sy + (b.cy - sy) * e;
        const size = guest ? b.size : lay.size + (b.size - lay.size) * e;
        const alpha = guest ? seg(p, start, start + 0.06) : seg(p, start, start + 0.05);
        drawSlot(g, font, s, x, y, b.size, size, alpha);
    });
    drawCaption(a, b, seg(p, 0.45, 0.6));
}

function drawGoldName(a: DrawArgs, lay: NameLayout, alpha: number) {
    const { g, frame, font } = a;
    const f = fontOf(font, NAME_WEIGHT, lay.size);
    const xs = centres(g, NAME, f, lay.ls, frame.W / 2);
    [...NAME].forEach((ch, i) => sourceLetter(g, ch, xs[i], lay.y, f, alpha));
}

export const orbit: Scene = {
    id: "orbit",
    draw(a) {
        const { phase, frame } = a;
        const lay = nameAt(frame);
        if (phase.kind === "arrive") {
            const al = ease(seg(phase.p, 0, 0.8));
            drawName(a, lay, [], 0, al, (1 - al) * 18);
        } else if (phase.kind === "word") {
            for (let j = 0; j < phase.k; j++) drawPlaced(a, j, 1);
            drawFlying(a, phase.k, phase.p);
        } else {
            const p = phase.p;
            const fade = 1 - seg(p, 0, 0.25);
            if (fade > 0) for (let j = 0; j < WORDS.length; j++) drawPlaced(a, j, fade);
            drawClosure(a, seg(p, 0.2, 1), lay);
            drawGoldName(a, lay, seg(p, 0, 0.15) * (1 - seg(p, 0.15, 0.2)));
        }
    },
};
