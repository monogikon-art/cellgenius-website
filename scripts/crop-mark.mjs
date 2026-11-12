// Builds the hero C from the film's Blender render (frames 0142-0284 of "mark-close", 1920x1080 RGBA).
//   public/hero/mark-3d-turn.webp  animated, alpha: the C turning a little back and forth, in place
//   public/hero/mark-3d.webp       still: the most three-dimensional frame of that loop
// Run: node scripts/crop-mark.mjs [source-folder]   (default: the film worktree below; read-only)
// The C slides across the frame and its width changes as it turns, so each frame is cropped to the same
// square, centred on the C's own centre of mass (spark excluded), at the same scale: it turns in place.
import { existsSync } from "node:fs";
import sharp from "sharp";

const SRC = process.argv[2] ?? "C:/CellGenius-PPM/wt-ceo-film/remotion/public/exec-film/blender/mark-close";
const OUT_TURN = "public/hero/mark-3d-turn.webp";
const OUT_STILL = "public/hero/mark-3d.webp";
const FIRST = 190;
const LAST = 284;
const STEP = 2;
const SIZE = 288;
const FPS = 24;
const HOLD_MS = 500;
const QUALITY = 70;
const MARGIN = 0.04;
const ALPHA_MIN = 8;

if (!existsSync(SRC)) {
    console.error(`Source frames not found: ${SRC}\nPass the mark-close folder as the first argument.`);
    process.exit(1);
}

const name = (n) => `${SRC}/${String(n).padStart(4, "0")}.png`;
const frameNumbers = [];
for (let n = FIRST; n <= LAST; n += STEP) frameNumbers.push(n);

// Largest connected blob of the alpha mask: the ring with its walls, not the free-floating spark.
function ringMask(alpha, w, h) {
    const label = new Int32Array(w * h);
    const sizes = [0];
    const stack = [];
    for (let s = 0; s < w * h; s++) {
        if (alpha[s] <= ALPHA_MIN || label[s]) continue;
        const id = sizes.length;
        let count = 0;
        label[s] = id;
        stack.push(s);
        while (stack.length) {
            const p = stack.pop();
            count++;
            const x = p % w;
            const y = (p - x) / w;
            for (const q of [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, y > 0 ? p - w : -1, y < h - 1 ? p + w : -1]) {
                if (q >= 0 && alpha[q] > ALPHA_MIN && !label[q]) {
                    label[q] = id;
                    stack.push(q);
                }
            }
        }
        sizes.push(count);
    }
    let best = 1;
    for (let i = 2; i < sizes.length; i++) if (sizes[i] > sizes[best]) best = i;
    return { label, best };
}

const measured = [];
for (const n of frameNumbers) {
    const { data, info } = await sharp(name(n)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const alpha = new Uint8Array(info.width * info.height);
    for (let i = 0; i < alpha.length; i++) alpha[i] = data[i * 4 + 3];
    const { label, best } = ringMask(alpha, info.width, info.height);
    let sx = 0, sy = 0, count = 0;
    let x0 = info.width, y0 = info.height, x1 = 0, y1 = 0;
    for (let p = 0; p < alpha.length; p++) {
        const x = p % info.width;
        const y = (p - x) / info.width;
        if (label[p] === best) { sx += x; sy += y; count++; }
        if (alpha[p] > ALPHA_MIN) {
            x0 = Math.min(x0, x); x1 = Math.max(x1, x);
            y0 = Math.min(y0, y); y1 = Math.max(y1, y);
        }
    }
    measured.push({ n, cx: sx / count, cy: sy / count, x0, y0, x1, y1, width: info.width, height: info.height });
}

// One square for every frame, big enough that the whole C (spark included) fits at its widest.
let half = 0;
for (const m of measured) half = Math.max(half, m.cx - m.x0, m.x1 - m.cx, m.cy - m.y0, m.y1 - m.cy);
const side = Math.ceil(half * 2 * (1 + MARGIN * 2));
console.log(`frames ${FIRST}-${LAST} step ${STEP}: ${frameNumbers.length} frames, crop ${side}px square -> ${SIZE}px`);

const buffers = [];
for (const m of measured) {
    const left = Math.round(m.cx - side / 2);
    const top = Math.round(m.cy - side / 2);
    const fit = { left: Math.max(left, 0), top: Math.max(top, 0) };
    const buf = await sharp(name(m.n))
        .ensureAlpha()
        .extract({ left: fit.left, top: fit.top, width: Math.min(side - (fit.left - left), m.width - fit.left), height: Math.min(side - (fit.top - top), m.height - fit.top) })
        .extend({
            left: fit.left - left,
            top: fit.top - top,
            right: Math.max(0, left + side - m.width),
            bottom: Math.max(0, top + side - m.height),
            background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .resize(SIZE, SIZE)
        .raw()
        .toBuffer();
    buffers.push(buf);
}

// Most three-dimensional frame: the one with the most warm (gold) wall pixels outside the spark.
function wallScore(buf) {
    let score = 0;
    for (let i = 0; i < buf.length; i += 4) if (buf[i + 3] > 200 && buf[i] - buf[i + 2] > 18 && (i / 4) % SIZE < SIZE * 0.6) score++;
    return score;
}
let stillIndex = 0;
buffers.forEach((b, i) => { if (wallScore(b) > wallScore(buffers[stillIndex])) stillIndex = i; });

// Ping-pong with no duplicated end frames, a short hold at each end.
const order = [...buffers.keys(), ...[...buffers.keys()].slice(1, -1).reverse()];
const frameMs = Math.round(1000 / FPS);
const delay = order.map((_, i) => (i === 0 || i === buffers.length - 1 ? HOLD_MS : frameMs));
const stacked = Buffer.concat(order.map((i) => buffers[i]));

await sharp(stacked, { raw: { width: SIZE, height: SIZE * order.length, channels: 4, pageHeight: SIZE } })
    .webp({ quality: QUALITY, alphaQuality: 80, effort: 6, loop: 0, delay, minSize: false })
    .toFile(OUT_TURN);
await sharp(buffers[stillIndex], { raw: { width: SIZE, height: SIZE, channels: 4 } })
    .webp({ quality: 90, alphaQuality: 100 })
    .toFile(OUT_STILL);

for (const f of [OUT_TURN, OUT_STILL]) {
    const meta = await sharp(f, { animated: true }).metadata();
    console.log(`${f}: ${meta.width}x${meta.pageHeight ?? meta.height}, ${meta.pages ?? 1} frames, hasAlpha=${meta.hasAlpha}`);
}
console.log(`still = frame ${frameNumbers[stillIndex]}`);
