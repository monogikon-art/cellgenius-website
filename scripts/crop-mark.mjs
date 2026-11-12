import sharp from "sharp";

const SRC = "C:/CellGenius-PPM/wt-ceo-film/remotion/public/exec-film/blender/mark-close/0284.png";
const OUT = "public/hero/mark-3d.webp";
const SIZE = 384;
const MARGIN = 0.06;

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const at = (x, y) => (y * info.width + x) * 4;

let x0 = info.width, y0 = info.height, x1 = 0, y1 = 0;
for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
        if (data[at(x, y) + 3] > 8) {
            x0 = Math.min(x0, x);
            x1 = Math.max(x1, x);
            y0 = Math.min(y0, y);
            y1 = Math.max(y1, y);
        }
    }
}
const w = x1 - x0 + 1;
const h = y1 - y0 + 1;
const side = Math.round(Math.max(w, h) * (1 + 2 * MARGIN));
const left = Math.round((side - w) / 2);
const top = Math.round((side - h) / 2);

// The spark is the warm-hued star right of x = 520 (the C's upper arm ends left of it).
let sx0 = info.width, sy0 = info.height, sx1 = 0, sy1 = 0;
for (let y = y0; y < y0 + h / 2; y++) {
    for (let x = 520; x <= x1; x++) {
        const i = at(x, y);
        if (data[i + 3] > 200 && data[i] - data[i + 2] > 25) {
            sx0 = Math.min(sx0, x);
            sx1 = Math.max(sx1, x);
            sy0 = Math.min(sy0, y);
            sy1 = Math.max(sy1, y);
        }
    }
}
const px = (((sx0 + sx1) / 2 - x0 + left) / side) * 100;
const py = (((sy0 + sy1) / 2 - y0 + top) / side) * 100;
console.log(`spark centre in the square: ${px.toFixed(1)}% across, ${py.toFixed(1)}% down`);

const squared = await sharp(SRC)
    .extract({ left: x0, top: y0, width: w, height: h })
    .extend({
        top,
        left,
        bottom: side - h - top,
        right: side - w - left,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

await sharp(squared)
    .resize(SIZE, SIZE)
    .webp({ quality: 90, alphaQuality: 100 })
    .toFile(OUT);

const meta = await sharp(OUT).metadata();
console.log(`${OUT}: ${meta.width}x${meta.height}, hasAlpha=${meta.hasAlpha}`);
