export const ORBIT_RADII = [3.0, 3.9, 4.8, 5.7, 6.6] as const;
export const ORBIT_SCALE = 110;
export const ORBIT_FLATTEN = 0.32;

const INNER_PERIOD_SECONDS = 40;

export function angularSpeed(radius: number): number {
    return ((2 * Math.PI) / INNER_PERIOD_SECONDS) * Math.pow(ORBIT_RADII[0] / radius, 1.5);
}

export function orbitPoint(radius: number, angle: number): { x: number; y: number } {
    return {
        x: radius * ORBIT_SCALE * Math.cos(angle),
        y: radius * ORBIT_SCALE * ORBIT_FLATTEN * Math.sin(angle),
    };
}

export type Box = { left: number; top: number; right: number; bottom: number };

export const LABEL_OVER_WORD_OPACITY = 0.25;
const EDGE_FADE_PX = 24;
const WORD_FADE_PX = 12;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

// Slides a label back inside the screen edges (fading it once its planet has left the screen) and dims it over the big word.
export function placeLabel(label: Box, edges: { left: number; right: number }, avoid: Box | null): { dx: number; opacity: number } {
    const halfWidth = (label.right - label.left) / 2;
    const dx = label.left < edges.left ? edges.left - label.left : label.right > edges.right ? edges.right - label.right : 0;
    let opacity = clamp01(1 - Math.max(0, Math.abs(dx) - halfWidth) / EDGE_FADE_PX);
    if (avoid) {
        const overlap = Math.min(
            Math.min(label.right + dx, avoid.right) - Math.max(label.left + dx, avoid.left),
            Math.min(label.bottom, avoid.bottom) - Math.max(label.top, avoid.top),
        );
        opacity *= 1 - (1 - LABEL_OVER_WORD_OPACITY) * clamp01(overlap / WORD_FADE_PX);
    }
    return { dx, opacity };
}
