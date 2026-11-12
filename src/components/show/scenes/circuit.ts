import { WORDS } from "../copy";
import {
    C,
    NAME_WEIGHT,
    caption,
    centres,
    dot,
    drawClosure,
    ease,
    fitWordSize,
    fontOf,
    holo,
    line,
    nameLayout,
    REST_DIM,
    SOURCE_GLOW,
    restColor,
    seg,
    sourceLetter,
    txt,
    type DrawArgs,
    type Frame,
    type NameLayout,
    type Scene,
} from "../kit";
import { NAME, lettersOf } from "../letters";

const nameAt = (frame: Frame): NameLayout => {
    return { ...nameLayout(frame), y: frame.narrow ? 900 : 700 };
};

const wordY = (frame: Frame) => (frame.narrow ? 420 : 300);
const captionAt = (frame: Frame) => (frame.narrow ? 1190 : 1015);
const laneStep = (frame: Frame) => (frame.narrow ? 10 : 12);
const unit = (lay: NameLayout) => lay.size / 118;

function route(xs: number[], idx: number[], base: number, lane: number, gap: number) {
    const out: number[][] = [];
    idx.forEach((i, n) => {
        const x = xs[i];
        if (n === 0) {
            out.push([x, base], [x, lane - gap]);
            return;
        }
        const px = xs[idx[n - 1]];
        const dir = Math.sign(x - px) || 1;
        out.push([px + dir * gap, lane], [x - dir * gap, lane], [x, lane - gap], [x, base]);
        if (n < idx.length - 1) out.push([x, lane - gap]);
    });
    return out;
}

const lengths = (pts: number[][]) => pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));

function partial(pts: number[][], t: number) {
    const lens = lengths(pts);
    const total = lens.reduce((a, b) => a + b, 0);
    let left = t * total;
    const out = [pts[0]];
    for (let i = 0; i < lens.length && left > 0; i++) {
        const k = Math.min(1, left / lens[i]);
        out.push([pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k]);
        left -= lens[i];
    }
    return out;
}

function reachedAt(pts: number[][], base: number) {
    const lens = lengths(pts);
    const total = lens.reduce((a, b) => a + b, 0);
    const marks: number[] = [];
    let acc = 0;
    pts.forEach((p, i) => {
        if (i > 0) acc += lens[i - 1];
        if (p[1] === base) marks.push(acc / total);
    });
    return marks;
}

function drawArrive(a: DrawArgs, p: number) {
    const { g, frame, font } = a;
    const lay = nameAt(frame);
    const f = fontOf(font, NAME_WEIGHT, lay.size);
    const xs = centres(g, NAME, f, lay.ls, frame.W / 2);
    [...NAME].forEach((ch, i) => {
        const al = ease(seg(p, i * 0.05, i * 0.05 + 0.45));
        const glint = Math.max(0, 1 - Math.abs(p * 13 - 1.5 - i));
        const hot = glint > 0.2;
        txt(g, ch, xs[i], lay.y + (1 - al) * 18, f, hot ? C.goldHi : restColor(i), al * (hot ? 1 : REST_DIM), hot ? SOURCE_GLOW : undefined, 30 * glint);
    });
}

function drawWord(a: DrawArgs, k: number, p: number) {
    const { g, frame, font } = a;
    const lay = nameAt(frame);
    const f = fontOf(font, NAME_WEIGHT, lay.size);
    const xs = centres(g, NAME, f, lay.ls, frame.W / 2);
    const u = unit(lay);
    const base = lay.y + 72 * u;
    const step = laneStep(frame) * u;
    const handOver = k === WORDS.length - 1 ? seg(p, 0.9, 1) : 0;
    const keep = 1 - handOver;
    const fo = 1 - seg(p, 0.9, 1);

    for (let j = 0; j < k; j++) {
        const stops = lettersOf(WORDS[j].word).filter((i): i is number => i !== null);
        line(g, route(xs, stops, base, lay.y + 136 * u + j * step, 14 * u), "rgba(129,140,248,.45)", 3 * u, 12, keep);
        stops.forEach((i) => dot(g, xs[i], base, 6 * u, "rgba(129,140,248,.8)", 10, keep));
    }

    const word = WORDS[k].word;
    const all = lettersOf(word);
    const stops = all.filter((i): i is number => i !== null);
    const slots: number[] = [];
    [...word].forEach((ch, pos) => {
        if (ch !== " ") slots.push(pos);
    });
    const stopSlot = slots.filter((_, n) => all[n] !== null);

    const size = fitWordSize(g, frame, font, word, frame.narrow ? (word === "AGENTIC AI" ? 104 : 170) : 220);
    const wy = wordY(frame);
    const wxs = centres(g, word, fontOf(font, 700, size), 14, frame.W / 2);
    const wordBottom = wy + size / 2;
    const top = lay.y - lay.size * 0.525;

    const pts = route(xs, stops, base, lay.y + 118 * u, 14 * u);
    const tp = ease(seg(p, 0.04, 0.42));
    const reach = reachedAt(pts, base);
    const lit = stops.map((_, n) => tp >= reach[n] - 0.001);

    const beams = seg(p, 0.38, 0.5) * fo;
    if (beams > 0) {
        stops.forEach((i, n) => {
            const wx = wxs[stopSlot[n]];
            const gr = g.createLinearGradient(0, top, 0, wordBottom);
            gr.addColorStop(0, `rgba(240,210,154,${0.3 * beams})`);
            gr.addColorStop(0.7, `rgba(240,210,154,${0.06 * beams})`);
            gr.addColorStop(1, "rgba(240,210,154,0)");
            g.fillStyle = gr;
            g.beginPath();
            g.moveTo(xs[i] - 10, top);
            g.lineTo(xs[i] + 10, top);
            g.lineTo(wx + 3, wordBottom);
            g.lineTo(wx - 3, wordBottom);
            g.closePath();
            g.fill();
            line(g, [[xs[i], top], [wx, wordBottom]], "rgba(255,236,200,.35)", 1.2, 8, beams);
        });
    }

    const drawn = partial(pts, tp);
    line(g, drawn, C.gold, 6 * u, 34, keep);
    line(g, drawn, "#fff3d6", 2 * u, 0, keep);
    const head = drawn[drawn.length - 1];
    if (tp < 1) dot(g, head[0], head[1], 7 * u, "#fff", 24);

    [...NAME].forEach((ch, i) => {
        const n = stops.indexOf(i);
        const on = n >= 0 && lit[n];
        if (on) {
            sourceLetter(g, ch, xs[i], lay.y, f, keep);
        } else {
            txt(g, ch, xs[i], lay.y, f, restColor(i), keep * REST_DIM);
        }
        if (handOver > 0) txt(g, ch, xs[i], lay.y, f, restColor(i), handOver);
        if (on) {
            dot(g, xs[i], base, 9 * u, C.goldHi, 24, keep);
            dot(g, xs[i], base, 3.5 * u, "#fff", 0, keep);
        }
    });

    const rise = ease(seg(p, 0.4, 0.56));
    holo(g, frame, font, word, frame.W / 2, wy + (1 - rise) * 40, size, rise * fo);
    caption(g, frame, font, WORDS[k].caption, captionAt(frame), seg(p, 0.52, 0.64) * fo);
}

export const circuit: Scene = {
    id: "circuit",
    draw(a) {
        const { phase } = a;
        if (phase.kind === "arrive") drawArrive(a, phase.p);
        else if (phase.kind === "word") drawWord(a, phase.k, phase.p);
        else {
            const from = nameAt(a.frame);
            const to = nameLayout(a.frame);
            const lift = ease(seg(phase.p, 0, 0.3));
            drawClosure(a, phase.p, { ...from, y: from.y + (to.y - from.y) * lift });
        }
    },
};
