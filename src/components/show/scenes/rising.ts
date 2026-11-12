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
    setGlow,
    txt,
    type DrawArgs,
    type Frame,
    type NameLayout,
    type Scene,
} from "../kit";
import { NAME, lettersOf } from "../letters";

const GOLD_GLOW = "rgba(212,175,106,.75)";
const AI_GLOW = "rgba(129,140,248,.6)";
const WHITE_GLOW = "rgba(238,242,248,.28)";

const nameAt = (frame: Frame): NameLayout => ({ ...nameLayout(frame), y: frame.narrow ? 560 : 430 });
const wordY = (frame: Frame) => (frame.narrow ? 820 : 640);
const captionGap = (frame: Frame) => (frame.narrow ? 110 : 130);

type Slot = { ch: string; src: number | null; x: number; kind: "white" | "gold" | "ai" | "sheen" };
type Built = { size: number; slots: Slot[]; left: number; span: number };

function kindOf(word: string, pos: number, ch: string): Slot["kind"] {
    if (word === "AI") return ch === "A" ? "ai" : "gold";
    if (word === "AGENTIC AI") {
        if (pos > 7) return ch === "A" ? "ai" : "gold";
        return ch === "T" ? "white" : "sheen";
    }
    if (word === "GENIUS") return pos >= 3 ? "gold" : "white";
    if (word === "CHANGE" || word === "CHAIN") return ch === "A" ? "gold" : "white";
    return ch === "I" ? "gold" : "white";
}

const cache = new Map<string, Built>();

function build(a: DrawArgs, k: number): Built {
    const { g, frame, font } = a;
    const key = `${frame.W}x${frame.H}|${font}|${k}`;
    const hit = cache.get(key);
    if (hit) return hit;
    const word = WORDS[k].word;
    const lay = nameLayout(frame);
    const want = frame.narrow ? (word === "AGENTIC AI" ? 84 : 120) : 150;
    const ratio = want / lay.size;
    const probe = centres(g, word, fontOf(font, NAME_WEIGHT, want), lay.ls * ratio, frame.W / 2);
    const fit = Math.min(1, (frame.W * 0.92) / (probe[probe.length - 1] - probe[0] + want * 0.8));
    const size = want * fit;
    const xs = centres(g, word, fontOf(font, NAME_WEIGHT, size), lay.ls * ratio * fit, frame.W / 2);
    const src = lettersOf(word);
    const slots: Slot[] = [];
    let n = 0;
    [...word].forEach((ch, pos) => {
        if (ch === " ") return;
        slots.push({ ch, src: src[n++], x: xs[pos], kind: kindOf(word, pos, ch) });
    });
    const built = { size, slots, left: xs[0] - size * 0.4, span: xs[xs.length - 1] - xs[0] + size * 0.8 };
    cache.set(key, built);
    return built;
}

function sheen(g: CanvasRenderingContext2D, b: Built, t: number) {
    const off = ((t * 0.08) % 1) * b.span;
    const x0 = b.left - b.span + off;
    const gr = g.createLinearGradient(x0, 0, x0 + b.span * 3, 0);
    const stops: [number, string][] = [
        [0, "#22d3ee"],
        [0.4, "#818cf8"],
        [0.65, "#e879f9"],
        [1, "#22d3ee"],
    ];
    for (let r = 0; r < 3; r++) stops.forEach(([s, c]) => gr.addColorStop((r + s) / 3, c));
    return gr;
}

function letter(
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

function drawName(a: DrawArgs, lay: NameLayout, gold: number[], goldAmt: number, alpha: number, dy: number) {
    const { g, frame, font } = a;
    const f = fontOf(font, NAME_WEIGHT, lay.size);
    const xs = centres(g, NAME, f, lay.ls, frame.W / 2);
    [...NAME].forEach((ch, i) => {
        const base = i === 2 || i === 7 ? C.ai : C.text;
        txt(g, ch, xs[i], lay.y + dy, f, base, alpha);
        if (gold.includes(i) && goldAmt > 0) txt(g, ch, xs[i], lay.y + dy, f, C.goldHi, goldAmt * alpha, GOLD_GLOW, 36);
    });
}

function drawWord(a: DrawArgs, k: number, p: number) {
    const { g, frame, font, t } = a;
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
    const grad = b.slots.some((s) => s.kind === "sheen") ? sheen(g, b, t) : null;

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
        const flying = 1 - e;
        const f = fontOf(font, NAME_WEIGHT, size);
        const fill = s.kind === "sheen" ? (grad as CanvasGradient) : s.kind === "gold" ? C.goldHi : s.kind === "ai" ? C.ai : C.text;
        const glow = flying > 0.02 && !guest ? GOLD_GLOW : s.kind === "gold" ? GOLD_GLOW : s.kind === "ai" ? AI_GLOW : WHITE_GLOW;
        const blur = flying > 0.02 && !guest ? 36 : s.kind === "white" ? 18 : 28;
        letter(g, s.ch, x, y, f, fill, alpha, glow, blur);
    });

    const capY = wy + captionGap(frame);
    caption(g, frame, font, WORDS[k].caption, capY, seg(p, 0.52, 0.62) * fo);
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
