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
    muted: "#9aa6bd",
};

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
    ls = 0,
) {
    if (alpha <= 0) return;
    g.save();
    g.globalAlpha *= alpha;
    g.font = f;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.letterSpacing = `${ls}px`;
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

export function centres(g: Ctx, s: string, f: string, ls: number, cx: number) {
    g.save();
    g.font = f;
    g.letterSpacing = "0px";
    const ws = [...s].map((ch) => g.measureText(ch).width);
    g.restore();
    const total = ws.reduce((a, b) => a + b, 0) + ls * (s.length - 1);
    let x = cx - total / 2;
    return ws.map((w) => {
        const m = x + w / 2;
        x += w + ls;
        return m;
    });
}

let holoCanvas: HTMLCanvasElement | null = null;
export function holo(g: Ctx, frame: Frame, family: string, s: string, x: number, y: number, size: number, alpha: number) {
    if (alpha <= 0) return;
    holoCanvas ??= document.createElement("canvas");
    if (holoCanvas.width !== frame.W || holoCanvas.height !== frame.H) {
        holoCanvas.width = frame.W;
        holoCanvas.height = frame.H;
    }
    const h = holoCanvas.getContext("2d")!;
    h.globalCompositeOperation = "source-over";
    h.clearRect(0, 0, frame.W, frame.H);
    h.font = fontOf(family, 700, size);
    h.textAlign = "center";
    h.textBaseline = "middle";
    h.letterSpacing = "14px";
    const gr = h.createLinearGradient(0, y - size / 2, 0, y + size / 2);
    gr.addColorStop(0, C.goldHi);
    gr.addColorStop(0.55, C.gold);
    gr.addColorStop(1, C.goldLo);
    h.fillStyle = gr;
    h.fillText(s, x, y);
    h.globalCompositeOperation = "destination-out";
    h.fillStyle = "rgba(0,0,0,.28)";
    for (let yy = y - size / 2; yy < y + size / 2; yy += 7) h.fillRect(0, yy, frame.W, 2);
    g.save();
    g.globalAlpha *= alpha;
    setGlow(g, "rgba(240,210,154,.55)", 40);
    g.drawImage(holoCanvas, 0, 0);
    g.restore();
    g.save();
    g.globalAlpha *= alpha;
    g.drawImage(holoCanvas, 0, 0);
    g.restore();
}

export const captionY = (frame: Frame) => (frame.narrow ? 850 : 720);

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

export function caption(
    g: Ctx,
    frame: Frame,
    family: string,
    text: string,
    y: number,
    alpha: number,
    color = C.text,
) {
    if (alpha <= 0) return;
    const measureAt = (t: string, size: number) => {
        g.save();
        g.font = fontOf(family, 500, size);
        g.letterSpacing = "0px";
        const w = g.measureText(t).width;
        g.restore();
        return w;
    };
    const { size, lines } = fitCaption(text, frame.narrow ? 52 : 44, frame.W * 0.8, measureAt);
    const f = fontOf(family, 500, size);
    const lead = size * 1.25;
    const top = y - ((lines.length - 1) * lead) / 2;
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
        const start = ch === "A" || src === 7 ? C.ai : C.text;
        if (gold) {
            txt(g, ch, x, from.y, now, start, 1 - glide, undefined, 0, 0);
            txt(g, ch, x, from.y, now, C.goldHi, glide, "rgba(212,175,106,.7)", 36, 0);
        } else {
            txt(g, ch, x, from.y, now, start, 1, undefined, 0, 0);
        }
    });
    caption(g, frame, font, CLOSING_LINE, captionY(frame), ease(seg(p, 0.3, 0.5)), C.gold);
}

export function drawRestingName(a: DrawArgs, alpha = 1) {
    const { g, frame, font } = a;
    const { size, ls, y } = nameLayout(frame);
    const f = fontOf(font, NAME_WEIGHT, size);
    const xs = centres(g, "CHANGENIUS", f, ls, frame.W / 2);
    [..."CHANGENIUS"].forEach((ch, i) => txt(g, ch, xs[i], y, f, i === 2 || i === 7 ? C.ai : C.text, alpha));
}
