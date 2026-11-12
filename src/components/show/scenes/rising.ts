import { WORDS } from "../copy";
import {
    C,
    NAME_WEIGHT,
    caption,
    centres,
    drawClosure,
    ease,
    fontOf,
    nameLayout,
    seg,
    type DrawArgs,
    type Frame,
    type NameLayout,
    type Scene,
} from "../kit";
import { NAME } from "../letters";
import { drawName, drawSlot, slotsOf, type Slot } from "./word-style";

const nameAt = (frame: Frame): NameLayout => {
    const lay = nameLayout(frame);
    return { ...lay, ls: Math.round(lay.size * 0.02), y: frame.narrow ? 560 : 430 };
};
const wordY = (frame: Frame) => (frame.narrow ? 820 : 640);

type Built = { size: number; slots: Slot[] };

const cache = new Map<string, Built>();

function build(a: DrawArgs, k: number): Built {
    const { g, frame, font } = a;
    const key = `${frame.W}x${frame.H}|${font}|${k}`;
    const hit = cache.get(key);
    if (hit) return hit;
    const word = WORDS[k].word;
    const want = frame.narrow ? (word === "AGENTIC AI" ? 84 : 120) : 150;
    const probe = centres(g, word, fontOf(font, NAME_WEIGHT, want), Math.round(want * 0.02), frame.W / 2);
    const fit = Math.min(1, (frame.W * 0.92) / (probe[probe.length - 1] - probe[0] + want * 0.8));
    const size = want * fit;
    const xs = centres(g, word, fontOf(font, NAME_WEIGHT, size), Math.round(want * 0.02) * fit, frame.W / 2);
    const slots = slotsOf(word, xs);
    const built = { size, slots };
    cache.set(key, built);
    return built;
}

function drawWord(a: DrawArgs, k: number, p: number) {
    const { g, frame, font } = a;
    const lay = nameAt(frame);
    const b = build(a, k);
    const gold = b.slots.flatMap((s) => (s.src === null ? [] : [s.src]));
    const goldAmt = seg(p, 0, 0.1) * (1 - seg(p, 0.9, 1));
    drawName(a, lay, gold, goldAmt, 1, 0);

    const fo = 1 - seg(p, 0.9, 1);
    const nameF = fontOf(font, NAME_WEIGHT, lay.size);
    const nxs = centres(g, NAME, nameF, lay.ls, frame.W / 2);
    const wy = wordY(frame);
    const count = b.slots.length;
    const dur = Math.min(0.3, 0.45 - 0.03 * (count - 1));

    b.slots.forEach((s, n) => {
        const start = 0.05 + 0.03 * n;
        const e = ease(seg(p, start, start + dur));
        const guest = s.src === null;
        const sx = guest ? frame.W + b.size : nxs[s.src as number];
        const sy = guest ? wy : lay.y;
        const x = sx + (s.x - sx) * e;
        const y = sy + (wy - sy) * e;
        const size = guest ? b.size : lay.size + (b.size - lay.size) * e;
        const alpha = (guest ? seg(p, start, start + 0.06) : seg(p, start, start + 0.05)) * fo;
        drawSlot(g, font, s, x, y, b.size, size, alpha);
    });

    const capTop = wy + b.size / 2 + (frame.narrow ? 80 : 60);
    caption(g, frame, font, WORDS[k].caption, capTop, seg(p, 0.52, 0.62) * fo, C.text, "top");
}

export const rising: Scene = {
    id: "rising",
    draw(a) {
        const { phase, frame } = a;
        if (phase.kind === "arrive") {
            const al = ease(seg(phase.p, 0, 0.8));
            drawName(a, nameAt(frame), [], 0, al, (1 - al) * 18);
        } else if (phase.kind === "word") drawWord(a, phase.k, phase.p);
        else drawClosure(a, phase.p, nameAt(frame));
    },
};
