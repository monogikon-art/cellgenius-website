import { WORDS } from "../copy";
import {
    C,
    NAME_WEIGHT,
    caption,
    centres,
    dot,
    drawClosure,
    ease,
    fontOf,
    holo,
    line,
    nameLayout,
    seg,
    txt,
    type DrawArgs,
    type Frame,
    type Scene,
} from "../kit";
import { NAME, lettersOf } from "../letters";

const N = NAME.length;
const POINTS = 300;
const FLATTEN_END = 0.3;

const strands = [0, 1].map(() => Array.from({ length: POINTS + 1 }, () => [0, 0]));
const itemX = new Float64Array(N * 2);
const itemY = new Float64Array(N * 2);
const itemZ = new Float64Array(N * 2);
const order = Array.from({ length: N * 2 }, (_, i) => i);

const geometry = (frame: Frame) =>
    frame.narrow
        ? { x0: 120, x1: 960, amp: 170, cy: 860, size: 76, wordY: 360, wordSize: 120, agentic: 88, captionY: 500 }
        : { x0: 260, x1: 1660, amp: 210, cy: 560, size: 96, wordY: 170, wordSize: 150, agentic: 150, captionY: 290 };

function fitWordSize(a: DrawArgs, word: string, want: number) {
    const { g, frame, font } = a;
    const max = frame.W * 0.92;
    let size = want;
    g.save();
    g.letterSpacing = "14px";
    for (; size > 40; size -= 4) {
        g.font = fontOf(font, 700, size);
        if (g.measureText(word).width <= max) break;
    }
    g.restore();
    return size;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function drawHelix(a: DrawArgs, flat: number) {
    const { g, frame, phase, t, font } = a;
    const geo = geometry(frame);
    const lay = nameLayout(frame);
    const { x0, x1 } = geo;
    const step = (x1 - x0) / (N - 1);
    const turn = 0.9 + t * 0.7;
    const angle = (x: number) => turn + ((x - x0) / step) * 0.72;
    const amp = geo.amp * (1 - flat);
    const cy = lerp(geo.cy, lay.y, flat);
    const arrive = phase.kind === "arrive" ? ease(phase.p) : 1;
    const p = phase.kind === "word" ? phase.p : 0;
    const fo = phase.kind === "word" ? 1 - seg(p, 0.9, 1) : 1;
    const idx = phase.kind === "word" ? lettersOf(WORDS[phase.k].word) : [];
    const gap = Math.min(0.05, 0.28 / Math.max(1, idx.length - 1));
    const litAt = (i: number) => {
        const at = idx.indexOf(i);
        return at < 0 ? 0 : seg(p, 0.04 + at * gap, 0.12 + at * gap) * fo;
    };
    const rest = centres(g, NAME, fontOf(font, NAME_WEIGHT, lay.size), lay.ls, frame.W / 2);
    const back = arrive * (1 - flat);

    g.save();
    g.globalAlpha = back;
    for (let r = 0; r <= 36; r++) {
        const x = x0 - 80 + (r / 36) * (x1 - x0 + 160);
        const s = Math.sin(angle(x)) * amp;
        line(g, [[x, cy + s], [x, cy - s]], "rgba(129,140,248,.16)", 1.5);
    }
    for (let s = 0; s < 2; s++) {
        const pts = strands[s];
        for (let u = 0; u <= POINTS; u++) {
            const x = x0 - 80 + (u / POINTS) * (x1 - x0 + 160);
            pts[u][0] = x;
            pts[u][1] = cy + (s ? -1 : 1) * Math.sin(angle(x)) * amp;
        }
        line(g, pts, s ? "rgba(129,140,248,.55)" : "rgba(212,175,106,.55)", 3, 16);
    }
    for (let i = 0; i < N; i++) {
        const x = x0 + i * step;
        const s = Math.sin(angle(x)) * amp;
        const l = litAt(i) > 0.5;
        line(g, [[x, cy + s], [x, cy - s]], l ? "rgba(240,210,154,.75)" : "rgba(129,140,248,.22)", l ? 3 : 2, l ? 18 : 0);
    }
    g.restore();

    for (let i = 0; i < N; i++) {
        const x = x0 + i * step;
        const ang = angle(x);
        const s = Math.sin(ang) * amp;
        const z = Math.cos(ang);
        itemX[i * 2] = lerp(x, rest[i], flat);
        itemY[i * 2] = cy + s;
        itemZ[i * 2] = z;
        itemX[i * 2 + 1] = x;
        itemY[i * 2 + 1] = cy - s;
        itemZ[i * 2 + 1] = -z;
    }
    for (let i = 1; i < order.length; i++) {
        const v = order[i];
        let j = i - 1;
        while (j >= 0 && itemZ[order[j]] > itemZ[v]) {
            order[j + 1] = order[j];
            j--;
        }
        order[j + 1] = v;
    }

    for (const k of order) {
        const i = k >> 1;
        const z = itemZ[k];
        const depth01 = (z + 1) / 2;
        if (k & 1) {
            dot(g, itemX[k], itemY[k], 9 * (0.72 + 0.28 * depth01), "rgba(129,140,248,1)", 14, (0.35 + 0.5 * depth01) * back);
            continue;
        }
        const size = Math.round(lerp(geo.size * (0.72 + 0.28 * depth01), lay.size, flat));
        const f = fontOf(font, 700, size);
        const l = litAt(i);
        const depth = 0.55 + 0.45 * depth01;
        txt(g, NAME[i], itemX[k], itemY[k], f, "rgba(170,180,210,.85)", depth * arrive * (1 - l) * (1 - flat));
        txt(g, NAME[i], itemX[k], itemY[k], f, C.goldHi, depth * arrive * l, "rgba(240,210,154,.9)", 34);
        if (flat > 0) {
            txt(g, NAME[i], itemX[k], itemY[k], fontOf(font, NAME_WEIGHT, size), i === 2 || i === 7 ? C.ai : C.text, flat);
        }
    }
}

function drawWordOverlay(a: DrawArgs, k: number, p: number) {
    const { g, frame, font } = a;
    const geo = geometry(frame);
    const word = WORDS[k].word;
    const fo = 1 - seg(p, 0.9, 1);
    const size = fitWordSize(a, word, word === "AGENTIC AI" ? geo.agentic : geo.wordSize);
    const rise = ease(seg(p, 0.4, 0.55));
    holo(g, frame, font, word, frame.W / 2, geo.wordY + (1 - rise) * 30, size, rise * fo);
    caption(g, frame, font, WORDS[k].caption, geo.captionY, seg(p, 0.5, 0.62) * fo);
}

export const helix: Scene = {
    id: "helix",
    draw(a) {
        const { phase } = a;
        if (phase.kind === "closure") {
            const flat = ease(seg(phase.p, 0, FLATTEN_END));
            if (phase.p < FLATTEN_END) drawHelix(a, flat);
            else drawClosure(a, (phase.p - FLATTEN_END) / (1 - FLATTEN_END), nameLayout(a.frame));
            return;
        }
        drawHelix(a, 0);
        if (phase.kind === "word") drawWordOverlay(a, phase.k, phase.p);
    },
};
