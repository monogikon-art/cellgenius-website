export const SCENES = ["particles", "circuit", "helix", "rising", "orbit"] as const;
export type SceneId = (typeof SCENES)[number];
export const ARRIVE = 2.4;
export const WORD = 4.6;
export const CLOSURE = 5;
export const WORD_COUNT = 7;
export const SCENE_SECONDS = ARRIVE + WORD * WORD_COUNT + CLOSURE;
export const LOOP_SECONDS = SCENE_SECONDS * SCENES.length;
export const FADE = 0.4;
const LEAD = 0.4;
const TAIL = 0.1;

export type Phase =
    | { kind: "arrive"; p: number }
    | { kind: "word"; k: number; p: number }
    | { kind: "closure"; p: number };

export function sceneAt(seconds: number) {
    const s = ((seconds % LOOP_SECONDS) + LOOP_SECONDS) % LOOP_SECONDS;
    const index = Math.min(SCENES.length - 1, Math.floor(s / SCENE_SECONDS));
    const t = s - index * SCENE_SECONDS;
    const alpha = Math.min(1, Math.min(t, SCENE_SECONDS - t) / (2 * FADE) + 0.25);
    return { index, id: SCENES[index], t, alpha };
}

export function phaseAt(t: number): Phase {
    if (t < ARRIVE) return { kind: "arrive", p: t / ARRIVE };
    const w = t - ARRIVE;
    if (w >= WORD * WORD_COUNT) {
        return { kind: "closure", p: Math.min(1, (w - WORD * WORD_COUNT) / CLOSURE) };
    }
    const k = Math.floor(w / WORD);
    const u = (w % WORD) / WORD;
    const p =
        u < LEAD
            ? (0.52 * u) / LEAD
            : u < 1 - TAIL
              ? 0.52 + (0.38 * (u - LEAD)) / (1 - LEAD - TAIL)
              : 0.9 + (0.1 * (u - (1 - TAIL))) / TAIL;
    return { kind: "word", k, p };
}
