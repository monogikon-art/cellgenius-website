# Hero: five illustrations and a 3D C — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the website hero's CSS wordmark show with one canvas stage that plays five illustrations of words drawn from CHANGENIUS (golden circuit, particles, rising words, the bank's DNA, orbit) in a loop, each with seven words and the CHANGE IN US closure, under a larger 3D C with light motion.

**Architecture:** A pure timeline module maps elapsed seconds to (scene, phase). A client component owns one `<canvas>`, sizes it to the stage, picks a logical frame (wide 1920×1080 or narrow 1080×1350), advances time only while running, and calls the current scene's `draw`. Each scene is a pure drawing module working in logical coordinates. The three CEO-film openings are ported from `draw.ts`; the two current ways (rising, orbit) are redrawn on canvas to match today's look. The C is a cropped transparent WebP from the film's Blender render, animated with CSS.

**Tech Stack:** Next.js 15.5 App Router, React 19, TypeScript strict, Tailwind v4, Canvas 2D, Vitest 3 (node environment), Playwright, sharp (already installed).

**Spec:** `docs/superpowers/specs/2026-11-12-hero-five-illustrations-design.md`.

## Global Constraints

- Repo: `C:/Websites/cellgenius-website`, branch `hero/five-illustrations` (cut from `master` `db48345`). Never push, never deploy; the owner deploys on their yes.
- Scene order: `circuit`, `particles`, `rising`, `helix`, `orbit`, then back to `circuit`.
- Word order in every scene: CHANGE, AI, AGENTIC AI, CHAIN, SIGN, GAIN, GENIUS, then the CHANGE IN US closure.
- Captions verbatim (sentence case, no full stop):
  - CHANGE `Every change in your organisation, governed end to end`
  - AI `Powered by artificial intelligence, grounded in your own policies`
  - AGENTIC AI `150 AI agents prepare the work, your people decide`
  - CHAIN `One chain covering strategy, planning, delivery and benefits realisation`
  - SIGN `A person signs every decision, on the record`
  - GAIN `Every gain measured and written back to the strategy`
  - GENIUS `Built-in Genius automation keeps every step moving`
  - closure `The change is in us`
- Timing per scene: arrival 2.4 s, seven word beats of 4.6 s each, closure 5.0 s → 39.6 s; loop 198 s. Cross-fade 0.8 s at each scene boundary (the last 0.4 s of one scene fades out, the first 0.4 s of the next fades in).
- Colours: gold `#D4AF6A`, goldHi `#f0d29a`, goldLo `#c39a55`, AI periwinkle `#818cf8`, text `#eef2f8`, muted letters `rgba(154,166,189,.55)`, AGENTIC sheen gradient `#22d3ee → #818cf8 (40%) → #e879f9 (65%) → #22d3ee`.
- Font: the page's Inter. Canvas cannot use the CSS variable; read the real family once from `getComputedStyle(document.body).fontFamily` after `document.fonts.ready`.
- Letters come only from CHANGENIUS; AGENTIC's T is a white guest letter that arrives from outside the name.
- No new third-party script, stylesheet or request; the CSP is unchanged. No `eval`, no workers.
- `prefers-reduced-motion: reduce` → no canvas animation: show the still name (text) and the still C.
- Pause button, an out-of-view hero, and a hidden tab all stop time; resuming continues from the same moment.
- Device pixel ratio capped at 2. Particle count: 12,000 on a wide frame, 5,000 on a narrow frame, halved again when `navigator.hardwareConcurrency <= 4`.
- TypeScript strict, functional components, `cn()` for conditional classes, no comments unless the why is non-obvious.
- The film source is read-only reference: `git -C C:/CellGenius-PPM/wt-ceo-film show cc5397b8:remotion/src/ceo-film/draw.ts` (and `words.ts`). Never edit anything under `C:/CellGenius-PPM`.
- Checks before each commit: `npm run typecheck`, `npm run lint`, `npm run test`.

## File structure

| File | Responsibility |
|---|---|
| `src/components/show/copy.ts` | Words, captions, closure line, accessible label (replaces `brand/changenius-show-copy.ts`) |
| `src/components/show/letters.ts` | `NAME`, `lettersOf(word)` with the T guest |
| `src/components/show/timeline.ts` | Durations, `sceneAt(loopSeconds)`, `phaseAt(sceneSeconds)` |
| `src/components/show/kit.ts` | Canvas helpers ported from the film (`txt`, `line`, `dot`, `centres`, `holo`, `caption`, `seg`, `ease`, `rng`), frames, the shared closure |
| `src/components/show/scenes/circuit.ts`, `particles.ts`, `rising.ts`, `helix.ts`, `orbit.ts` | One scene each: `{ id, prepare?, draw }` |
| `src/components/show/ShowStage.tsx` | The client component: canvas, sizing, clock, sequencing, reduced motion, label |
| `src/components/brand/changenius-mark-3d.tsx` + `public/hero/mark-3d.webp` | The 3D C and its motion |
| `src/components/hero/HeroCinematic.tsx` | Uses `ShowStage` and the 3D mark |
| Removed | `brand/changenius-wordmark-show.tsx`, `.module.css`, `brand/changenius-show-copy.ts`, `brand/changenius-icon.tsx` (if no other user), the two `[data-chainge-show]` rules in `globals.css` |

## Shared interfaces (every task)

```ts
// src/components/show/kit.ts
export type Frame = { W: number; H: number; narrow: boolean };
export const WIDE: Frame = { W: 1920, H: 1080, narrow: false };
export const NARROW: Frame = { W: 1080, H: 1350, narrow: true };
export type Phase =
    | { kind: "arrive"; p: number }
    | { kind: "word"; k: number; p: number } // p: 0–0.52 form and rise, 0.52–0.9 hold, 0.9–1 fade
    | { kind: "closure"; p: number };
export type DrawArgs = { g: CanvasRenderingContext2D; frame: Frame; phase: Phase; t: number; font: string };
export type Scene = { id: SceneId; prepare?: (frame: Frame, font: string) => void; draw: (a: DrawArgs) => void };
```

`t` is seconds since the scene started (for continuous motion such as the helix turning and particle wobble). `font` is the resolved Inter family name; build fonts as `` `${weight} ${size}px ${font}` ``.

---

### Task 1: Words, letters and timeline

**Files:**
- Create: `src/components/show/copy.ts`, `src/components/show/letters.ts`, `src/components/show/timeline.ts`
- Test: `src/components/show/show-model.test.ts`

**Interfaces:**
- Produces: `WORDS: readonly { word: string; caption: string }[]` (7), `CLOSING_LINE`, `SHOW_LABEL`, `NAME = "CHANGENIUS"`, `lettersOf(word): (number | null)[]` (null = the guest T; spaces are skipped, so `AGENTIC AI` maps its 9 letters), `SCENES = ["circuit","particles","rising","helix","orbit"] as const`, `type SceneId`, `ARRIVE = 2.4`, `WORD = 4.6`, `CLOSURE = 5`, `SCENE_SECONDS = 39.6`, `LOOP_SECONDS = 198`, `FADE = 0.4`, `sceneAt(s): { index: number; id: SceneId; t: number; alpha: number }`, `phaseAt(t): Phase` (the `Phase` type is declared in `timeline.ts` and re-exported by `kit.ts`).

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { CLOSING_LINE, SHOW_LABEL, WORDS } from "./copy";
import { NAME, lettersOf } from "./letters";
import { LOOP_SECONDS, SCENE_SECONDS, SCENES, phaseAt, sceneAt } from "./timeline";

describe("words", () => {
    it("are the seven words in story order with the owner's captions", () => {
        expect(WORDS.map((w) => w.word)).toEqual(["CHANGE", "AI", "AGENTIC AI", "CHAIN", "SIGN", "GAIN", "GENIUS"]);
        expect(WORDS.find((w) => w.word === "SIGN")!.caption).toBe("A person signs every decision, on the record");
        expect(WORDS.find((w) => w.word === "GAIN")!.caption).toBe("Every gain measured and written back to the strategy");
        expect(WORDS.every((w) => !w.caption.endsWith("."))).toBe(true);
        expect(CLOSING_LINE).toBe("The change is in us");
    });
    it("label names every word's caption and the closing line", () => {
        for (const w of WORDS) expect(SHOW_LABEL.toLowerCase()).toContain(w.caption.toLowerCase().split(",")[0]);
        expect(SHOW_LABEL).toContain("The change is in us");
    });
});

describe("lettersOf", () => {
    it("takes each letter from the name, in order where the word runs in order", () => {
        expect(lettersOf("CHANGE")).toEqual([0, 1, 2, 3, 4, 5]);
        expect(lettersOf("GENIUS")).toEqual([4, 5, 6, 7, 8, 9]);
        expect(lettersOf("SIGN")).toEqual([9, 7, 4, 6]);
        expect(lettersOf("GAIN")).toEqual([4, 2, 7, 3]);
        expect(lettersOf("AI")).toEqual([2, 7]);
    });
    it("gives AGENTIC's T no source letter, and reuses letters across the space", () => {
        const at = lettersOf("AGENTIC AI");
        expect(at).toHaveLength(9);
        expect(at[4]).toBeNull();
        expect(at.filter((i) => i !== null).every((i) => NAME[i!] !== undefined)).toBe(true);
    });
});

describe("timeline", () => {
    it("plays the five scenes in the owner's order and loops", () => {
        expect(SCENES).toEqual(["circuit", "particles", "rising", "helix", "orbit"]);
        expect(SCENE_SECONDS).toBeCloseTo(39.6);
        expect(LOOP_SECONDS).toBeCloseTo(198);
        expect(sceneAt(0).id).toBe("circuit");
        expect(sceneAt(40).id).toBe("particles");
        expect(sceneAt(3 * 39.6 + 1).id).toBe("helix");
        expect(sceneAt(4 * 39.6 + 39).id).toBe("orbit");
        expect(sceneAt(198 + 1).id).toBe("circuit");
    });
    it("fades across each boundary", () => {
        expect(sceneAt(0.2).alpha).toBeCloseTo(0.5);
        expect(sceneAt(20).alpha).toBe(1);
        expect(sceneAt(39.4).alpha).toBeCloseTo(0.5);
    });
    it("maps a scene's seconds to arrival, the seven words and the closure", () => {
        expect(phaseAt(1.2)).toEqual({ kind: "arrive", p: 0.5 });
        const w = phaseAt(2.4 + 4.6 * 4 + 0.1);
        expect(w.kind).toBe("word");
        expect(w.kind === "word" && w.k).toBe(4);
        expect(phaseAt(2.4 + 4.6 * 7 + 2.5)).toEqual({ kind: "closure", p: 0.5 });
    });
    it("word progress reaches the hold at 0.52 after the lead and the fade at 0.9", () => {
        const lead = 4.6 * 0.4;
        const at = (s: number) => phaseAt(2.4 + s);
        expect(at(lead)).toMatchObject({ kind: "word", k: 0 });
        expect((at(lead) as { p: number }).p).toBeCloseTo(0.52, 2);
        expect((at(4.6 - 0.46) as { p: number }).p).toBeCloseTo(0.9, 2);
    });
});
```

- [ ] **Step 2: Run it and see it fail** — `npx vitest run src/components/show/show-model.test.ts` → FAIL, modules not found.

- [ ] **Step 3: Implement**

`vitest.config.ts` already includes `src/**/*.test.ts`. Write:

```ts
// copy.ts
export const WORDS = [
    { word: "CHANGE", caption: "Every change in your organisation, governed end to end" },
    { word: "AI", caption: "Powered by artificial intelligence, grounded in your own policies" },
    { word: "AGENTIC AI", caption: "150 AI agents prepare the work, your people decide" },
    { word: "CHAIN", caption: "One chain covering strategy, planning, delivery and benefits realisation" },
    { word: "SIGN", caption: "A person signs every decision, on the record" },
    { word: "GAIN", caption: "Every gain measured and written back to the strategy" },
    { word: "GENIUS", caption: "Built-in Genius automation keeps every step moving" },
] as const;

export const CLOSING_LINE = "The change is in us";

export const SHOW_LABEL =
    "Changenius: every change in your organisation governed end to end, powered by artificial intelligence grounded in your own policies, with 150 AI agents preparing the work while your people decide, one chain covering strategy, planning, delivery and benefits realisation, a person signing every decision on the record, every gain measured and written back to the strategy, and built-in Genius automation keeping every step moving. The change is in us.";
```

`letters.ts`: `NAME = "CHANGENIUS"`. `lettersOf(word)` walks the word's letters skipping spaces; for each letter take the next unused occurrence in NAME after the previous one, else the first unused occurrence anywhere, else `null` (only T). The used-set resets at the space, so `AGENTIC AI`'s second A and I map to 2 and 7 again. (This is the film's `lettersOf` from `words.ts`, plus the guest and the space.)

`timeline.ts`:

```ts
export const SCENES = ["circuit", "particles", "rising", "helix", "orbit"] as const;
export type SceneId = (typeof SCENES)[number];
export const ARRIVE = 2.4;
export const WORD = 4.6;
export const CLOSURE = 5;
export const WORD_COUNT = 7;
export const SCENE_SECONDS = ARRIVE + WORD * WORD_COUNT + CLOSURE;
export const LOOP_SECONDS = SCENE_SECONDS * SCENES.length;
export const FADE = 0.4;
const LEAD = 0.4; // share of a word beat spent forming and rising (p 0–0.52)
const TAIL = 0.1; // share spent fading (p 0.9–1)

export type Phase =
    | { kind: "arrive"; p: number }
    | { kind: "word"; k: number; p: number }
    | { kind: "closure"; p: number };

export function sceneAt(seconds: number) {
    const s = ((seconds % LOOP_SECONDS) + LOOP_SECONDS) % LOOP_SECONDS;
    const index = Math.min(SCENES.length - 1, Math.floor(s / SCENE_SECONDS));
    const t = s - index * SCENE_SECONDS;
    // At a boundary the outgoing scene has faded to 0.25 and the next starts at 0.25.
    const alpha = Math.min(1, Math.min(t, SCENE_SECONDS - t) / (2 * FADE) + 0.25);
    return { index, id: SCENES[index], t, alpha };
}
```

`phaseAt(t)`: `t < ARRIVE` → arrive with `p = t / ARRIVE`; within the words → `k = floor((t - ARRIVE) / WORD)`, `u = ((t - ARRIVE) % WORD) / WORD`, `p = u < LEAD ? 0.52 * u / LEAD : u < 1 - TAIL ? 0.52 + 0.38 * (u - LEAD) / (1 - LEAD - TAIL) : 0.9 + 0.1 * (u - (1 - TAIL)) / TAIL`; after → closure with `p = min(1, (t - ARRIVE - WORD * 7) / CLOSURE)`.

- [ ] **Step 4: Run** `npx vitest run src/components/show/show-model.test.ts` → PASS. Then `npm run typecheck && npm run lint`.
- [ ] **Step 5: Commit** `feat(hero): words, letters and timeline for the five-illustration show`

---

### Task 2: Drawing kit, the shared closure and the stage

**Files:**
- Create: `src/components/show/kit.ts`, `src/components/show/ShowStage.tsx`, `src/components/show/scenes/index.ts`
- Test: `src/components/show/kit.test.ts`

**Interfaces:**
- Consumes: Task 1.
- Produces: the `Frame`, `WIDE`, `NARROW`, `DrawArgs`, `Scene` types (see Shared interfaces); `C` colour constants; helpers `clamp, seg, ease, rng, txt, line, dot, centres, holo, caption`; `nameLayout(frame)` → `{ size, ls, y }` for the resting name; `drawClosure(a: DrawArgs, p: number, from: { size: number; ls: number; y: number })`; `pickFrame(cssW, cssH): Frame` (narrow when `cssW / cssH < 1.1`); `<ShowStage running={boolean} reduced={boolean} />`; `SCENE_BY_ID: Record<SceneId, Scene>` in `scenes/index.ts` (filled with stub scenes that draw only `drawClosure`-style resting name until Tasks 3–7 replace each).

- [ ] **Step 1: Failing test** — `kit.test.ts` (node environment, no canvas): `pickFrame(896, 640)` → WIDE; `pickFrame(390, 560)` → NARROW; `seg(0.5, 0, 1) === 0.5`; `ease(0) === 0`, `ease(1) === 1`; `rng(7)()` returns the same first value twice for two new generators; `nameLayout(WIDE).size` and `nameLayout(NARROW).size` such that `size * 10 * 0.72 + ls * 9 <= frame.W * 0.9` (the name fits its frame with margin).
- [ ] **Step 2: Run, see it fail.**
- [ ] **Step 3: Implement `kit.ts`** by porting the film helpers (`git -C C:/CellGenius-PPM/wt-ceo-film show cc5397b8:remotion/src/ceo-film/draw.ts`, lines 8–130) with these changes:
  - `W`/`H` constants become parameters taken from `Frame`; every helper that used them takes the frame or the width.
  - `font(weight, size)` takes the resolved family: `` `${weight} ${size}px ${family}` ``.
  - `holo` keeps one offscreen canvas sized to the frame (re-create when the frame changes).
  - `caption(g, frame, family, text, y, alpha)` draws at 44 px (wide) / 52 px (narrow), weight 500, colour `#eef2f8`, with a dark glow, **wrapping** to at most two lines within `frame.W * 0.8` (measure words, break at spaces). Captions are long; they must never run off the frame.
  - No `vignette` — the hero already has its backdrop and glow.
  - `nameLayout`: wide `{ size: 118, ls: 26, y: 540 }`; narrow `{ size: 92, ls: 8, y: 675 }` (adjust so the fit test passes; keep the name as large as fits).
  - `drawClosure`: from the resting name at `from`, over `p` 0–0.35 the name's letters glide to spell `CHANGE IN US` centred at `from.y`: C H A N G E keep their order, then a gap of one letter width, then the I (index 7) and the N (index 6) swap so they read `IN`, another gap, then U S. CHANGE in `#eef2f8` with the A in periwinkle; IN US in goldHi with a gold glow. Over `p` 0.3–0.5 the caption `The change is in us` fades in, in gold (`#D4AF6A`), 44/52 px, below. Over `p` 0.9–1 everything holds (the stage fade handles the hand-over).
- [ ] **Step 4: Implement `ShowStage.tsx`** (`"use client"`):
  - Renders `<div data-show-stage role="img" aria-label={SHOW_LABEL} className="relative w-full" style={{ height: "var(--show-h)" }}>` with a `<canvas aria-hidden className="absolute inset-0 size-full">`.
  - Keeps the height-band logic of today's show (copy `HEIGHT_BANDS` and `bandHeight()` from `brand/changenius-wordmark-show.tsx` lines 60–71; set `--show-h` on the root; re-read on resize only when width or band changes).
  - On mount: wait for `document.fonts.ready`, read `getComputedStyle(document.body).fontFamily`, size the canvas to `cssW × cssH × min(2, devicePixelRatio)`, compute `frame = pickFrame(cssW, cssH)` and the fit transform `scale = min(cssW / frame.W, cssH / frame.H)`, centred. Call each scene's `prepare(frame, family)` lazily the first time it is about to play.
  - Clock: a `requestAnimationFrame` loop that adds the real elapsed time to `seconds` only while `running && !reduced`; when not running, cancel the loop (no drawing at all). Resuming continues from the same `seconds`.
  - Each frame: `const { id, t, alpha } = sceneAt(seconds)`, clear, `g.globalAlpha = alpha`, `SCENE_BY_ID[id].draw({ g, frame, phase: phaseAt(t), t, font })`.
  - `reduced`: draw nothing on the canvas and render the name as still text instead: `<p aria-hidden className="grid h-full place-items-center text-[clamp(34px,11.5vw,88px)] font-extrabold tracking-[-0.02em] text-[#eef2f8]">CHANGENIUS</p>` with the A and I in `text-[#818cf8]`.
  - Expose `data-scene={id}` on the root (updated at most when the scene changes, via a ref + state set on change) so tests can see which illustration plays.
- [ ] **Step 5:** `npx vitest run src/components/show` → PASS; `npm run typecheck && npm run lint`.
- [ ] **Step 6: Commit** `feat(hero): canvas stage, drawing kit and the shared CHANGE IN US closure`

---

### Task 3: Golden circuit

**Files:** Create `src/components/show/scenes/circuit.ts`; modify `scenes/index.ts`.

**Interfaces:** Consumes `Scene`, `DrawArgs`, kit helpers, `WORDS`, `lettersOf`, `nameLayout`, `drawClosure`. Produces `export const circuit: Scene`.

- [ ] **Step 1:** Port `drawCircuit` (film `draw.ts` lines 132–291) to `draw({ g, frame, phase, font })`:
  - `arrive` = the film's `intro` (letters fade up with a travelling glint).
  - `word` = the film's word beat, unchanged in behaviour: trace, lit letters, beams, striped gold word (`holo`), caption. Indices come from `lettersOf`; a `null` index (AGENTIC's T) has no trace stop and no beam — its letter in the risen word simply appears white with the rest. Words with a space (`AGENTIC AI`) draw as one string with the space.
  - Layout per frame. Wide: name at the film's `big` (`size 118, ls 26, y 700`), word at y 300 size 190, caption at y 470. Narrow: name `nameLayout(NARROW)` placed at y 900, word at y 420 size 150 (AGENTIC AI at 104), caption at y 600. The risen word must fit `frame.W * 0.92`; shrink its size until it does (measure).
  - Earlier words' faint traces stay (periwinkle), lanes stepping 12 logical px — with seven words, keep lanes inside the frame (step 10 on narrow).
  - `closure`: do **not** port the film's outro (route map, "thirteen chapters"). Call `drawClosure` with the name's current layout.
- [ ] **Step 2:** Register it in `SCENE_BY_ID`.
- [ ] **Step 3:** Visual check: `npm run dev -- --port 3150`, open `http://localhost:3150/?scene=circuit` (add, in `ShowStage`, a development-only override: when `process.env.NODE_ENV !== "production"` and the URL has `scene=<id>` and optionally `t=<seconds>`, start at that scene and time). Screenshot a word beat at 1280×800 and 390×844; letters, word and caption fully inside the stage.
- [ ] **Step 4:** `npm run typecheck && npm run lint && npm run test`. Commit `feat(hero): golden circuit illustration`.

---

### Task 4: Particles

**Files:** Create `src/components/show/scenes/particles.ts`; modify `scenes/index.ts`.

- [ ] **Step 1:** Port `prepareParticles` and `drawParticles` (film lines 293–371):
  - `prepare(frame, font)` samples target point sets into an offscreen canvas the size of the frame: the scatter, NAME (`nameLayout(frame)`), each of the seven words (size 300 for ≤ 4 letters, 230 for ≤ 6, 150 for AGENTIC AI on wide; on narrow 220 / 170 / 110), then NAME again, then `CHANGE IN US` (size so it fits `frame.W * 0.9`). Sample every 4 logical px (wide) / 3 (narrow). Cache per frame size; recompute when the frame changes.
  - Particle count per the Global Constraints. Keep the film's colours and halos and the `lighter` blend.
  - Sets: arrive = scatter → NAME; word k = previous set → word k (word 0 comes from NAME); closure = GENIUS → `CHANGE IN US` over `p` 0–0.5 (use the film's morph timing), then caption `The change is in us` in gold below. Do not call `drawClosure` here: the particles themselves form CHANGE IN US.
  - Wobble uses `t` (seconds) instead of the frame number: `sin(t * 1.8 + i)`, `cos(t * 1.5 + i)`.
  - Caption below the word for each beat (y 760 wide / 1010 narrow).
- [ ] **Step 2:** Register. Visual check as Task 3 with `?scene=particles`. Smoothness: in Chrome devtools performance with 4× CPU slowdown at 390×844, the scene keeps above 30 frames per second; if not, lower the narrow count until it does and record the number in the commit message.
- [ ] **Step 3:** Checks, commit `feat(hero): particle illustration`.

---

### Task 5: The bank's DNA

**Files:** Create `src/components/show/scenes/helix.ts`; modify `scenes/index.ts`.

- [ ] **Step 1:** Port `drawHelix` (film lines 373–442):
  - The helix turns with `t`: `phase = 0.9 + t * 0.7`.
  - Wide: the film's geometry (`cy 560, amp 210, x0 260, x1 1660`), word at y 170 size 150, caption at y 290. Narrow: `x0 120, x1 960, amp 170, cy 860`, letter size 76, word at y 360 size 120 (AGENTIC AI 88), caption y 500.
  - Lit letters in word order; the guest T has no helix letter — it appears only in the risen word.
  - `closure`: the film's flattening (`flat` over `p` 0.05–0.35) brings the letters into a straight line, then call `drawClosure` from that straight name (positions match `nameLayout(frame)`; set `cy` to the name's y so the hand-over is seamless). No "bank's DNA" caption.
- [ ] **Step 2:** Register, visual check with `?scene=helix`, checks, commit `feat(hero): the bank's DNA illustration`.

---

### Task 6: Rising words (today's show, redrawn)

**Files:** Create `src/components/show/scenes/rising.ts`; modify `scenes/index.ts`.

Reference for the look: the live hero today (`brand/changenius-wordmark-show.tsx` act "born from the top" and its CSS), and the screenshots in `docs/sit/2026-11-11-landing-sit/` named `hero-*`.

- [ ] **Step 1:** Draw:
  - `arrive`: CHANGENIUS centred at `nameLayout(frame)` but nudged up (wide y 430, narrow y 560), weight 800, `#eef2f8`, the A (2) and I (7) in periwinkle; fades and settles up 18 px.
  - `word` k: the source letters in the name turn gold (`#D4AF6A`) over p 0–0.1. Copies of those letters lift from their place in the name and travel along an eased path (`ease`) to their place in the word below (wide: word y 640 size 150; narrow: word y 820 size 120, AGENTIC AI 84), p 0.05–0.5, each letter starting 0.03 later than the previous. Word colours: CHANGE white with gold A; AI gold with periwinkle A; AGENTIC in the sheen gradient, its T white and arriving from the right edge of the frame, then a space, then AI as in AI; CHAIN white with gold A; SIGN, GAIN white with gold I; GENIUS white G E N, gold I U S. Caption below the word (y + 130 / + 110), fading in p 0.52–0.62. Everything for the beat fades out p 0.9–1 and the name's gold letters return to their resting colour.
  - `closure`: `drawClosure` from the arrival layout.
- [ ] **Step 2:** Register, visual check with `?scene=rising` side by side with the live site (`https://cellgenius-ai.com`) at 1280×800: same feel — letters lift out of the name and form the word below with the caption. Checks, commit `feat(hero): rising words illustration on the canvas stage`.

---

### Task 7: Orbit (today's ending, redrawn)

**Files:** Create `src/components/show/scenes/orbit.ts`; modify `scenes/index.ts`.

- [ ] **Step 1:** Draw:
  - `arrive`: CHANGENIUS centred (`nameLayout(frame)` at the frame's vertical centre), periwinkle A and I.
  - Seven orbit places on an ellipse around the name, starting top-left and going clockwise. Wide: centre (960, 540), radii (640, 360), angles `-140°, -40°, 0°, 40°, 140°, 180°, 90°` arranged so no two places overlap and none overlaps the name; Narrow: two columns above and below the name — places at (290, 230), (790, 230), (290, 430), (790, 430), (290, 960), (790, 960), (540, 1170). Tune so every word and its two-line caption stay inside the frame and clear of each other; test with AGENTIC AI and CHAIN's caption, the longest.
  - `word` k: the word's source letters in the name glow gold; copies fly from the name to place k (eased, p 0.05–0.45), forming the word at size 64 wide / 52 narrow, coloured as in Task 6; its caption (28 / 30 px, wrapped to two lines within 420 / 460 px) fades in beneath. **Words stay** once placed (they accumulate) — do not fade them at p 0.9.
  - At the start of `closure`, the name turns goldHi over `p` 0–0.15 while the seven orbiting words fade out over `p` 0–0.25, then `drawClosure` takes over (pass it `p` remapped from 0.2–1 to 0–1).
- [ ] **Step 2:** Register, visual check with `?scene=orbit&t=34` (all seven placed) at 1280×800, 768×1024, 390×844 and 360×740: nothing overlaps, nothing leaves the stage. Checks, commit `feat(hero): orbit illustration with seven words`.

---

### Task 8: The 3D C

**Files:**
- Create: `scripts/crop-mark.mjs` (one-off, committed for reproducibility), `public/hero/mark-3d.webp`, `src/components/brand/changenius-mark-3d.tsx`
- Modify: `src/app/globals.css` (the mark's keyframes)

- [ ] **Step 1:** `scripts/crop-mark.mjs`: with `sharp`, read `C:/CellGenius-PPM/wt-ceo-film/remotion/public/exec-film/blender/mark-close/0284.png` (1920×1080, RGBA), `.trim()` the transparent margin, pad to a square with transparency, resize to 384×384, `.webp({ quality: 90, alphaQuality: 100 })`, write `public/hero/mark-3d.webp`. Run it; the file should be under 60 KB. Read it back to confirm it has an alpha channel.
- [ ] **Step 2:** `ChangeniusMark3D({ className })`: a wrapper `div` (`aria-hidden`, `perspective: 600px`) holding an `<img src="/hero/mark-3d.webp" alt="" width={192} height={192} decoding="async" fetchPriority="high">` and an overlay `span` for the light sweep, masked to the mark (`mask-image: url(/hero/mark-3d.webp)`, `mask-size: contain`) with a moving soft white linear gradient (`mix-blend-mode: screen`, opacity ≤ 0.35). Sizes: `size-[72px] sm:size-24` (96 px).
- [ ] **Step 3:** CSS in `globals.css`:
  - `@keyframes mark-float` (translateY 0 → −4px → 0, 6 s, ease-in-out, infinite) on the wrapper.
  - `@keyframes mark-tilt` (rotateY −7° → 7°, rotateX 3° → −3°, 9 s, ease-in-out, alternate, infinite) on the image.
  - `@keyframes mark-sweep` (gradient position from −120% to 220% over 1.6 s, then hold off-mark until 7 s; infinite) on the overlay.
  - A spark glint: a small radial gold glow span positioned on the spark (top-right of the mark, about 70% across and 28% down), pulsing opacity 0.2 → 0.7 → 0.2 over 3.5 s.
  - `.hero-show[data-paused] .mark-3d *, .hero-show[data-paused] .mark-3d { animation-play-state: paused; }` and `@media (prefers-reduced-motion: reduce) { .mark-3d, .mark-3d * { animation: none; } }`.
- [ ] **Step 4:** Checks, commit `feat(hero): the 3D C with light motion`.

---

### Task 9: Wire the hero, remove the old show, update the browser tests

**Files:**
- Modify: `src/components/hero/HeroCinematic.tsx`, `src/app/globals.css`, `e2e/hero.spec.ts`
- Delete: `src/components/brand/changenius-wordmark-show.tsx`, `src/components/brand/changenius-wordmark-show.module.css`, `src/components/brand/changenius-show-copy.ts`, `src/components/brand/changenius-icon.tsx` (only if `grep -r ChaingeIcon src` finds no other user; otherwise keep it)

- [ ] **Step 1:** `HeroCinematic`: replace `ChaingeIcon` with `<ChangeniusMark3D className="mx-auto mb-4" />` and `ChangeniusWordmarkShow` with `<ShowStage running={running} reduced={reduced} />`. Remove the two `[data-chainge-show]` rules from `globals.css`. Delete the old files (`git rm`). No re-exports or shims.
- [ ] **Step 2:** Rewrite `e2e/hero.spec.ts` for the new stage (import from `src/components/show/copy`):
  1. The hero has the stage with role `img` and name `SHOW_LABEL`, the 3D mark image is present and decorative (`alt=""`), exactly one button (Pause animation), no links, no paragraph text other than the reduced-motion name, no console errors (same filter as today).
  2. `data-scene` starts at `circuit`; with the development override `?scene=orbit&t=39` it becomes `circuit` again within 2 s (the loop). Playwright runs against `next dev` (`playwright.config.ts`), so the development-only override is available to it.
  3. Pause stops time: read `data-show-seconds` (add it to the stage root, rounded to 0.1 s, updated at most 4 times a second) — it stays the same for 1 s while paused and grows after Play. The backdrop video pauses and resumes as today.
  4. Out of view: scroll the hero out of view; `data-show-seconds` stops growing.
  5. 390×844 and 360×740: `document.documentElement.scrollWidth <= innerWidth`; the stage stays inside the viewport.
  6. Reduced motion: the still name is visible, the canvas draws nothing (the stage root carries `data-reduced`), the backdrop video is absent; the pause button still toggles. Keep the "reduced motion before hydration" test as it is.
  7. The height-band tests: keep their intent (a small height change keeps the stage's height and keeps time running; crossing a band changes the stage's height). Time is `data-show-seconds` now, and crossing a band must **not** restart the show any more.
- [ ] **Step 3:** `npm run typecheck && npm run lint && npm run test && npm run build && npm run e2e` — all pass.
- [ ] **Step 4:** Commit `feat(hero): five-illustration show and 3D C replace the CSS wordmark show`.

---

### Task 10: SIT and screenshots

**Files:** Create `docs/sit/2026-11-12-hero-five-illustrations-sit.md` and `docs/sit/2026-11-12-hero-five-illustrations/*.png`.

- [ ] **Step 1:** With `npm run build && npm run start -- --port 3150` (production build, not dev), using Playwright with the seek hook disabled, take screenshots by waiting real time, or in dev with the override for each scene at one word beat and at the closure, at 1440×900, 768×1024 and 390×844: 5 scenes × 2 moments × 3 sizes = 30 images, plus the 3D C close-up at 1440×900.
- [ ] **Step 2:** Smoothness on a 4× CPU-throttled 390×844 profile for each scene (frames per second, from a 5-second `performance` sample); network: confirm no request goes to any host other than the site (and `/media/*`).
- [ ] **Step 3:** Write the SIT report: what was run, results, findings (keep fixed findings listed with their fix), and the screenshot list. Commit `docs: SIT for the five-illustration hero`.
