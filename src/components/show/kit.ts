import { CLOSING_LINE } from "./copy";
import type { SceneId, Phase } from "./timeline";

export type { Phase };

type Ctx = CanvasRenderingContext2D;

export type Frame = { W: number; H: number; narrow: boolean };
export const WIDE: Frame = { W: 1920, H: 1080, narrow: false };
export const NARROW: Frame = { W: 1080, H: 1350, narrow: true };

export type DrawArgs = { g: Ctx; frame: Frame; phase: Phase; t: number; font: string };
export type Scene = { id: SceneId; prepare?: (frame: Frame, font: string) => void; draw: (a: DrawArgs) => void };

export const C = {
    gold: "#D4AF6A",
    goldHi: "#f0d29a",
    goldLo: "#c39a55",
    ai: "#818cf8",
    text: "#eef2f8",
};

export const restColor = (i: number) => (i === 2 || i === 7 ? C.ai : C.text);

export const pickFrame = (cssW: number, cssH: number): Frame => (cssW / cssH < 1.1 ? NARROW : WIDE);

export const clamp = (t: number) => Math.max(0, Math.min(1, t));
export const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
export const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export const rng = (seed: number) => () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export const fontOf = (family: string, weight: number, size: number) => `${weight} ${size}px ${family}`;

export function setGlow(g: Ctx, color: string, blur: number) {
    g.shadowColor = color;
    g.shadowBlur = blur * g.getTransform().a;
}

export function txt(
    g: Ctx,
    s: string,
    x: number,
    y: number,
    f: string,
    fill: string,
    alpha = 1,
    glow?: string,
    blur = 30,
) {
    if (alpha <= 0) return;
    g.save();
    g.globalAlpha *= alpha;
    g.font = f;
    g.textAlign = "center";
    g.textBaseline = "middle";
    if (glow) {
        setGlow(g, glow, blur);
    }
    g.fillStyle = fill;
    g.fillText(s, x, y);
    g.restore();
}

export function line(g: Ctx, pts: number[][], color: string, w: number, blur = 0, alpha = 1) {
    if (pts.length < 2 || alpha <= 0) return;
    g.save();
    g.globalAlpha *= alpha;
    g.strokeStyle = color;
    g.lineWidth = w;
    g.lineJoin = "round";
    g.lineCap = "round";
    if (blur) {
        setGlow(g, color, blur);
    }
    g.beginPath();
    pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.stroke();
    g.restore();
}

export function dot(g: Ctx, x: number, y: number, r: number, color: string, blur = 0, alpha = 1) {
    if (alpha <= 0) return;
    g.save();
    g.globalAlpha *= alpha;
    g.fillStyle = color;
    if (blur) {
        setGlow(g, color, blur);
    }
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
    g.restore();
}

function glyphWidths(g: Ctx, s: string, f: string) {
    g.save();
    g.font = f;
    const ws = [...s].map((ch) => g.measureText(ch).width);
    g.restore();
    return ws;
}

export function runWidth(g: Ctx, s: string, f: string, ls: number) {
    return glyphWidths(g, s, f).reduce((a, b) => a + b, 0) + ls * (s.length - 1);
}

export function centres(g: Ctx, s: string, f: string, ls: number, cx: number) {
    const ws = glyphWidths(g, s, f);
    const total = ws.reduce((a, b) => a + b, 0) + ls * (s.length - 1);
    let x = cx - total / 2;
    return ws.map((w) => {
        const m = x + w / 2;
        x += w + ls;
        return m;
    });
}

const HOLO_LS = 14;

export function fitWordSize(g: Ctx, frame: Frame, family: string, word: string, want: number) {
    const max = frame.W * 0.92;
    let size = want;
    while (size > 40 && runWidth(g, word, fontOf(family, 700, size), HOLO_LS) > max) size -= 4;
    return size;
}

let holoCanvas: HTMLCanvasElement | null = null;
let holoBand: [number, number] | null = null;

export function holo(g: Ctx, frame: Frame, family: string, s: string, x: number, y: number, size: number, alpha: number) {
    if (alpha <= 0) return;
    holoCanvas ??= document.createElement("canvas");
    if (holoCanvas.width !== frame.W || holoCanvas.height !== frame.H) {
        holoCanvas.width = frame.W;
        holoCanvas.height = frame.H;
        holoBand = null;
    }
    const h = holoCanvas.getContext("2d")!;
    h.globalCompositeOperation = "source-over";
    if (holoBand) h.clearRect(0, holoBand[0], frame.W, holoBand[1] - holoBand[0]);
    const top = Math.max(0, Math.floor(y - size * 0.6));
    const bottom = Math.min(frame.H, Math.ceil(y + size * 0.6));
    holoBand = [top, bottom];
    const f = fontOf(family, 700, size);
    h.font = f;
    h.textAlign = "center";
    h.textBaseline = "middle";
    const gr = h.createLinearGradient(0, y - size / 2, 0, y + size / 2);
    gr.addColorStop(0, C.goldHi);
    gr.addColorStop(0.55, C.gold);
    gr.addColorStop(1, C.goldLo);
    h.fillStyle = gr;
    const xs = centres(h, s, f, HOLO_LS, x);
    [...s].forEach((ch, i) => {
        if (ch !== " ") h.fillText(ch, xs[i], y);
    });
    h.globalCompositeOperation = "destination-out";
    h.fillStyle = "rgba(0,0,0,.28)";
    for (let yy = y - size / 2; yy < y + size / 2; yy += 7) h.fillRect(0, yy, frame.W, 2);
    g.save();
    g.globalAlpha *= alpha;
    setGlow(g, "rgba(240,210,154,.55)", 40);
    g.drawImage(holoCanvas, 0, top, frame.W, bottom - top, 0, top, frame.W, bottom - top);
    g.restore();
    g.save();
    g.globalAlpha *= alpha;
    g.drawImage(holoCanvas, 0, top, frame.W, bottom - top, 0, top, frame.W, bottom - top);
    g.restore();
}

export function wrapLines(text: string, maxW: number, measure: (s: string) => number): string[] {
    const lines: string[] = [];
    let cur = "";
    for (const w of text.split(" ")) {
        const next = cur ? `${cur} ${w}` : w;
        if (cur && measure(next) > maxW) {
            lines.push(cur);
            cur = w;
        } else cur = next;
    }
    lines.push(cur);
    return lines;
}

export function fitCaption(
    text: string,
    size: number,
    maxW: number,
    measureAt: (s: string, size: number) => number,
    maxLines = 2,
    floor = 20,
) {
    let s = size;
    let lines = wrapLines(text, maxW, (t) => measureAt(t, s));
    while (lines.length > maxLines && s > floor) {
        s -= 2;
        lines = wrapLines(text, maxW, (t) => measureAt(t, s));
    }
    return { size: s, lines };
}

export function captionMeasurer(g: Ctx, family: string) {
    return (t: string, size: number) => {
        g.save();
        g.font = fontOf(family, 500, size);
        const w = g.measureText(t).width;
        g.restore();
        return w;
    };
}

export function caption(
    g: Ctx,
    frame: Frame,
    family: string,
    text: string,
    y: number,
    alpha: number,
    color = C.text,
    anchor: "middle" | "top" = "middle",
) {
    if (alpha <= 0) return;
    const { size, lines } = fitCaption(text, frame.narrow ? 52 : 44, frame.W * 0.8, captionMeasurer(g, family));
    const f = fontOf(family, 500, size);
    const lead = size * 1.25;
    const top = anchor === "top" ? y : y - ((lines.length - 1) * lead) / 2;
    lines.forEach((l, i) => txt(g, l, frame.W / 2, top + i * lead, f, color, alpha, "rgba(7,11,22,.9)", 18));
}

export type NameLayout = { size: number; ls: number; y: number };

export const nameLayout = (frame: Frame): NameLayout =>
    frame.narrow ? { size: 124, ls: 8, y: 675 } : { size: 150, ls: 30, y: 540 };

export const NAME_WEIGHT = 800;

const CLOSURE_SOURCE = [0, 1, 2, 3, 4, 5, 7, 6, 8, 9];

export function drawClosure(a: DrawArgs, p: number, from: NameLayout) {
    const { g, frame, font } = a;
    const f = fontOf(font, NAME_WEIGHT, from.size);
    const rest = centres(g, "CHANGENIUS", f, from.ls, frame.W / 2);
    const spacedText = "CHANGE" + "N" + "IN" + "N" + "US";
    const wide = centres(g, spacedText, f, from.ls, frame.W / 2);
    const span = wide[wide.length - 1] - wide[0] + from.size * 0.8;
    const k = Math.min(1, (frame.W * 0.92) / span);
    const spaced = centres(g, spacedText, fontOf(font, NAME_WEIGHT, from.size * k), from.ls * k, frame.W / 2);
    const target = [0, 1, 2, 3, 4, 5, 7, 8, 10, 11].map((i) => spaced[i]);
    const glide = ease(seg(p, 0, 0.35));
    const now = fontOf(font, NAME_WEIGHT, from.size * (1 + (k - 1) * glide));
    const letters = "CHANGENIUS";
    CLOSURE_SOURCE.forEach((src, slot) => {
        const x = rest[src] + (target[slot] - rest[src]) * glide;
        const ch = letters[src];
        const gold = slot >= 6;
        const start = restColor(src);
        if (gold) {
            txt(g, ch, x, from.y, now, start, 1 - glide, undefined, 0);
            txt(g, ch, x, from.y, now, C.goldHi, glide, "rgba(212,175,106,.7)", 36);
        } else {
            txt(g, ch, x, from.y, now, start, 1, undefined, 0);
        }
    });
    caption(g, frame, font, CLOSING_LINE, from.y + from.size * 0.9, ease(seg(p, 0.3, 0.5)), C.gold, "top");
}
