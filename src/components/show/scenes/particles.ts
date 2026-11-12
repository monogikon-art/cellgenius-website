import { CLOSING_LINE, WORDS } from "../copy";
import {
    C,
    NAME_WEIGHT,
    caption,
    centres,
    clamp,
    ease,
    fontOf,
    nameLayout,
    rng,
    runWidth,
    seg,
    type Frame,
    type Scene,
} from "../kit";
import { NAME } from "../letters";

const GOLD_DOT = "rgba(240,210,154,.55)";
const AI_DOT = "rgba(129,140,248,.55)";
const GOLD_HALO = "rgba(240,210,154,.10)";
const AI_HALO = "rgba(129,140,248,.10)";
const TAU = Math.PI * 2;
const SQUARE_BELOW = 1.3;
const AI_SHARE = 0.22;
const GROUPS = 4;
const CLOSING_TEXT = "CHANGE  IN  US";

type Cloud = {
    count: number;
    sets: Float32Array[];
    burstX: Float32Array;
    burstY: Float32Array;
    delay: Float32Array;
    size: Float32Array;
    halos: Uint32Array;
    haloAi: Uint8Array;
    groupEnd: number[];
    xs: Float32Array;
    ys: Float32Array;
};

const clouds = new Map<string, Cloud>();

const particleCount = (frame: Frame) => {
    const base = frame.narrow ? 4000 : 12000;
    const cores = typeof navigator === "undefined" ? 8 : navigator.hardwareConcurrency || 8;
    return cores <= 4 ? base / 2 : base;
};

const wordLayout = (frame: Frame, word: string) => {
    const wide = !frame.narrow;
    if (word === "AGENTIC AI") return { size: wide ? 150 : 110, y: wide ? 470 : 620 };
    const size = word.length <= 4 ? (wide ? 300 : 220) : wide ? 230 : 170;
    return { size, y: wide ? 470 : 620 };
};

const captionAt = (frame: Frame) => (frame.narrow ? 1040 : 820);

function buildCloud(frame: Frame, font: string): Cloud {
    const { W, H } = frame;
    const step = frame.narrow ? 3 : 4;
    const count = particleCount(frame);
    const rnd = rng(7);
    const o = document.createElement("canvas");
    o.width = W;
    o.height = H;
    const h = o.getContext("2d", { willReadFrequently: true })!;

    const sample = (s: string, weight: number, size: number, ls: number, y: number) => {
        h.clearRect(0, 0, W, H);
        const fit = Math.min(1, (W * 0.9) / runWidth(h, s, fontOf(font, weight, size), ls));
        const f = fontOf(font, weight, size * fit);
        h.font = f;
        h.fillStyle = "#fff";
        h.textAlign = "center";
        h.textBaseline = "middle";
        const xs = centres(h, s, f, ls * fit, W / 2);
        [...s].forEach((ch, i) => {
            if (ch !== " ") h.fillText(ch, xs[i], y);
        });
        const top = Math.max(0, Math.floor(y - size));
        const bottom = Math.min(H, Math.ceil(y + size));
        const d = h.getImageData(0, top, W, bottom - top).data;
        const pts: number[] = [];
        for (let yy = top; yy < bottom; yy += step) {
            for (let xx = 0; xx < W; xx += step) {
                if (d[((yy - top) * W + xx) * 4 + 3] > 128) pts.push(xx, yy);
            }
        }
        const n = pts.length / 2;
        for (let i = n - 1; i > 0; i--) {
            const j = Math.floor(rnd() * (i + 1));
            [pts[2 * i], pts[2 * j]] = [pts[2 * j], pts[2 * i]];
            [pts[2 * i + 1], pts[2 * j + 1]] = [pts[2 * j + 1], pts[2 * i + 1]];
        }
        const out = new Float32Array(count * 2);
        for (let i = 0; i < count; i++) {
            out[2 * i] = pts[2 * (i % n)];
            out[2 * i + 1] = pts[2 * (i % n) + 1];
        }
        return out;
    };

    const scatter = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
        scatter[2 * i] = W / 2 + (rnd() - 0.5) * W * 1.15;
        scatter[2 * i + 1] = H / 2 + (rnd() - 0.5) * H * 1.3;
    }

    const lay = nameLayout(frame);
    const nameSet = () => sample(NAME, NAME_WEIGHT, lay.size, lay.ls, lay.y);
    const wordSets = WORDS.map(({ word }) => {
        const { size, y } = wordLayout(frame, word);
        return sample(word, 700, size, frame.narrow ? 10 : 18, y);
    });
    const closeSize = lay.size * 1.1;
    const sets = [
        scatter,
        nameSet(),
        ...wordSets,
        sample(CLOSING_TEXT, NAME_WEIGHT, closeSize, lay.ls * 0.6, lay.y),
    ];

    const burstX = new Float32Array(count);
    const burstY = new Float32Array(count);
    const delay = new Float32Array(count);
    const size = new Float32Array(count);
    const halos: number[] = [];
    const haloAi: number[] = [];
    const aiFrom = Math.round(count * (1 - AI_SHARE));
    const groupEnd = [aiFrom >> 1, aiFrom, aiFrom + ((count - aiFrom) >> 1), count];
    for (let i = 0; i < count; i++) {
        const a = rnd() * TAU;
        const r = 60 + rnd() * 160;
        burstX[i] = Math.cos(a) * r;
        burstY[i] = Math.sin(a) * r;
        delay[i] = rnd() * 0.35;
        size[i] = 0.7 + rnd() * 1.7;
        if (rnd() < 0.04) {
            halos.push(i);
            haloAi.push(i >= aiFrom ? 1 : 0);
        }
    }
    return {
        count,
        sets,
        burstX,
        burstY,
        delay,
        size,
        halos: Uint32Array.from(halos),
        haloAi: Uint8Array.from(haloAi),
        groupEnd,
        xs: new Float32Array(count),
        ys: new Float32Array(count),
    };
}

let active: Cloud | null = null;

const keyOf = (frame: Frame, font: string) => `${frame.W}x${frame.H}|${font}`;

export const particles: Scene = {
    id: "particles",
    prepare(frame, font) {
        const key = keyOf(frame, font);
        let cloud = clouds.get(key);
        if (!cloud) {
            cloud = buildCloud(frame, font);
            clouds.set(key, cloud);
        }
        active = cloud;
    },
    draw({ g, frame, phase, t, font }) {
        const cloud = clouds.get(keyOf(frame, font)) ?? active;
        if (!cloud) return;
        const from = phase.kind === "arrive" ? 0 : phase.kind === "word" ? phase.k + 1 : WORDS.length + 1;
        const to = from + 1;
        const m = phase.kind === "arrive" ? seg(phase.p, 0, 0.9) : seg(phase.p, 0, 0.5);
        const A = cloud.sets[from];
        const B = cloud.sets[to];
        const { count, delay, burstX, burstY, xs, ys, size } = cloud;
        const w1 = t * 1.8;
        const w2 = t * 1.5;
        for (let i = 0; i < count; i++) {
            const k = ease(clamp((m - delay[i]) / 0.65));
            const burst = Math.sin(Math.PI * k);
            const sx = A[2 * i];
            const sy = A[2 * i + 1];
            xs[i] = sx + (B[2 * i] - sx) * k + burstX[i] * burst + Math.sin(w1 + i) * 1.1;
            ys[i] = sy + (B[2 * i + 1] - sy) * k + burstY[i] * burst + Math.cos(w2 + i) * 1.1;
        }

        const prevOp = g.globalCompositeOperation;
        g.globalCompositeOperation = "lighter";
        let lo = 0;
        for (let q = 0; q < GROUPS; q++) {
            const hi = cloud.groupEnd[q];
            g.fillStyle = q < 2 ? GOLD_DOT : AI_DOT;
            g.beginPath();
            for (let i = lo; i < hi; i++) {
                const r = size[i];
                if (r < SQUARE_BELOW) {
                    g.rect(xs[i] - r, ys[i] - r, r * 2, r * 2);
                } else {
                    g.moveTo(xs[i] + r, ys[i]);
                    g.arc(xs[i], ys[i], r, 0, TAU);
                }
            }
            g.fill();
            lo = hi;
        }
        for (let pass = 0; pass < 2; pass++) {
            g.fillStyle = pass ? AI_HALO : GOLD_HALO;
            g.beginPath();
            for (let n = 0; n < cloud.halos.length; n++) {
                if (cloud.haloAi[n] !== pass) continue;
                const i = cloud.halos[n];
                const r = size[i] * 6;
                g.moveTo(xs[i] + r, ys[i]);
                g.arc(xs[i], ys[i], r, 0, TAU);
            }
            g.fill();
        }
        g.globalCompositeOperation = prevOp;

        if (phase.kind === "word") {
            const alpha = seg(phase.p, 0.5, 0.62) * (1 - seg(phase.p, 0.9, 1));
            caption(g, frame, font, WORDS[phase.k].caption, captionAt(frame), alpha);
        } else if (phase.kind === "closure") {
            const lay = nameLayout(frame);
            caption(g, frame, font, CLOSING_LINE, lay.y + lay.size * 0.9, ease(seg(phase.p, 0.5, 0.65)), C.gold, "top");
        }
    },
};
