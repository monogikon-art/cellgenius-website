// Adapted from ppm-app's login wordmark show (origin/master@b3f65f48): larger sizes, sentence-case longer captions, website-only. The app's own copy is unchanged.
// A resize re-measures (which restarts the loop) only when the width or the show's own height changes, so a phone's address bar showing or hiding does not restart the show.
"use client";

import { useEffect, useRef } from "react";
import styles from "./changenius-wordmark-show.module.css";

/**
 * The CHANGENIUS wordmark show — the website hero's brand animation.
 *
 * One 294.4s master loop. CHANGENIUS is the centralized state that
 * produces every word. The resting AI pair — the A and the I — wears the
 * AI colour (periwinkle); champagne gold is reserved for action: the
 * selection glow, the travelling duplicates, the built words, the finale.
 * The acts run in the owner's B B A B B C order:
 *   B (born from the top, 50s, played 0–100s and 132.4–232.4s) — five word
 *     beats: CHANGE, AI, AGENTIC AI, CHAIN, GENIUS. GEN AI is retired by
 *     owner direction (agentic is what the platform does); AGENTIC AI is
 *     built from the name's own A·G·E·N·I·C — the T, the one letter
 *     CHANGENIUS lacks, arrives as a white guest from outside the word.
 *   A (hub cascade, 100–132.4s) — CHANGE, AI and GENIUS morph in place.
 *   C (the constellation, 232.4–280.4s) — duplicates fly outward into five
 *     orbiting words, accumulating to a gold finale — finishing with the
 *     closure (280.4–294.4s): the name resolves into its own anagram,
 *     CHANGE IN US, with the closing line beneath.
 *
 * The CSS module's keyframes are generated choreography; its layout rules
 * set the sizes. Travel vectors depend on layout, so this component
 * measures them at runtime into --dx/--dy/--sc (and the closure's N↔I swap
 * distance into --dsw), suspending animations for one frame during
 * measurement. Honours prefers-reduced-motion (static resolved wordmark).
 */

const SHOW_LABEL =
    "Changenius — every change governed end to end, with AI grounded in your own policies, AI agents that prepare the work for your people to decide, and one chain from strategy to benefit.";

const LETTERS = ["C", "H", "A", "N", "G", "E", "N", "I", "U", "S"];

type Piece = [string, number | null, string];

// word pieces: [glyph, source letter index, kind]
// kinds: w white · g/a/ag gold · f iridescent gradient · t the white guest
// letter (no source in the name) · sp spacer
const W_CHANGE: Piece[] = [["C", 0, "w"], ["H", 1, "w"], ["A", 2, "a"], ["N", 3, "w"], ["G", 4, "w"], ["E", 5, "w"]];
const W_AI: Piece[] = [["A", 2, "ag"], ["I", 7, "g"]];
const W_AGENTIC: Piece[] = [["A", 2, "f"], ["G", 4, "f"], ["E", 5, "f"], ["N", 6, "f"], ["T", null, "t"], ["I", 7, "f"], ["C", 0, "f"], [" ", null, "sp"], ["A", 2, "ag"], ["I", 7, "g"]];
const W_CHAIN: Piece[] = [["C", 0, "w"], ["H", 1, "w"], ["A", 2, "a"], ["I", 7, "w"], ["N", 3, "w"]];
const W_GENIUS: Piece[] = [["G", 4, "w"], ["E", 5, "w"], ["N", 6, "w"], ["I", 7, "g"], ["U", 8, "g"], ["S", 9, "g"]];

const CAPTION_CHANGE = "Every change in your organisation, governed end to end";
const CAPTION_AI = "Powered by artificial intelligence, grounded in your own policies";
const CAPTION_GENIUS = "Built-in Genius automation keeps every step moving";

const WORDS: { pieces: Piece[]; script: string }[] = [
    { pieces: W_CHANGE, script: CAPTION_CHANGE },
    { pieces: W_AI, script: CAPTION_AI },
    { pieces: W_AGENTIC, script: "150 AI agents prepare the work, your people decide" },
    { pieces: W_CHAIN, script: "One chain covering strategy, planning, delivery and benefits realisation" },
    { pieces: W_GENIUS, script: CAPTION_GENIUS },
];

const ORB_POS: [string, string][] = [["24%", "10%"], ["76%", "10%"], ["77%", "64%"], ["23%", "64%"], ["50%", "91%"]];

const ACT1_STORIES = [CAPTION_CHANGE, CAPTION_AI, CAPTION_GENIUS];

function pieceClass(prefix: string, beat: number, kind: string): string {
    return styles[`${prefix}${beat}${kind}` as keyof typeof styles] as string;
}

function measure(root: HTMLElement) {
    // Suspend animations so getBoundingClientRect reads resting layout —
    // a clone's natural (untransformed) position IS its landing position.
    const suspend = document.createElement("style");
    suspend.textContent = "[data-chainge-show] * { animation: none !important; }";
    document.head.appendChild(suspend);
    try {
        const tops = root.querySelectorAll<HTMLElement>("[data-tl]");
        root.querySelectorAll<HTMLElement>("[data-src]").forEach((cl) => {
            const src = tops[Number(cl.dataset.src)]?.getBoundingClientRect();
            if (!src) return;
            const t = cl.getBoundingClientRect();
            cl.style.setProperty("--dx", `${src.left + src.width / 2 - (t.left + t.width / 2)}px`);
            cl.style.setProperty("--dy", `${src.top + src.height / 2 - (t.top + t.height / 2)}px`);
        });
        const centers = root.querySelectorAll<HTMLElement>("[data-cl2]");
        root.querySelectorAll<HTMLElement>("[data-osrc]").forEach((cl) => {
            const src = centers[Number(cl.dataset.osrc)]?.getBoundingClientRect();
            if (!src) return;
            const t = cl.getBoundingClientRect();
            cl.style.setProperty("--dx", `${src.left + src.width / 2 - (t.left + t.width / 2)}px`);
            cl.style.setProperty("--dy", `${src.top + src.height / 2 - (t.top + t.height / 2)}px`);
            cl.style.setProperty("--sc", (src.height / t.height).toFixed(3));
        });
        const n = root.querySelector<HTMLElement>('[data-sw="n"]');
        const i = root.querySelector<HTMLElement>('[data-sw="i"]');
        if (n && i) {
            const rn = n.getBoundingClientRect();
            const ri = i.getBoundingClientRect();
            const d = ri.left + ri.width / 2 - (rn.left + rn.width / 2);
            n.style.setProperty("--dsw", `${d}px`);
            i.style.setProperty("--dsw", `${d}px`);
        }
    } finally {
        suspend.remove();
    }
}

function CloneSpans({ beat, prefix, srcAttr }: { beat: number; prefix: string; srcAttr: "data-src" | "data-osrc" }) {
    const gradCls = srcAttr === "data-src" ? styles.clf : styles.ocf;
    const spCls = srcAttr === "data-src" ? styles.wsp : styles.osp;
    return (
        <>
            {WORDS[beat].pieces.map(([ch, src, kind], i) =>
                kind === "sp" ? (
                    <span key={i} className={spCls} />
                ) : (
                    <span
                        key={i}
                        className={[
                            pieceClass(prefix, beat, kind),
                            kind === "f" ? gradCls : "",
                        ].filter(Boolean).join(" ")}
                        {...(src !== null ? { [srcAttr]: src } : {})}
                    >
                        {ch}
                    </span>
                ),
            )}
        </>
    );
}

export function ChangeniusWordmarkShow() {
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;
        let timer: ReturnType<typeof setTimeout> | undefined;
        const run = () => measure(root);
        document.fonts?.ready.then(run).catch(() => run());
        run();
        let lastWidth = window.innerWidth;
        let lastHeight = root.offsetHeight;
        const onResize = () => {
            if (window.innerWidth === lastWidth && root.offsetHeight === lastHeight) return;
            lastWidth = window.innerWidth;
            lastHeight = root.offsetHeight;
            clearTimeout(timer);
            timer = setTimeout(run, 200);
        };
        window.addEventListener("resize", onResize);
        return () => {
            clearTimeout(timer);
            window.removeEventListener("resize", onResize);
        };
    }, []);

    const letterRow = (cls: (i: number) => string, dataAttr: string) =>
        LETTERS.map((ch, i) => (
            <span key={i} className={cls(i)} {...{ [dataAttr]: true }}>
                {ch}
            </span>
        ));

    return (
        <div
            ref={rootRef}
            data-chainge-show
            className={styles.show}
            role="img"
            aria-label={SHOW_LABEL}
        >
            {/* Act 1 — hub cascade */}
            <div className={`${styles.ph} ${styles.ph0}`} aria-hidden="true">
                <div className={styles.wm}>
                    {LETTERS.map((ch, i) => (
                        <span
                            key={i}
                            className={`${styles.cl1} ${styles[`c1l${i}` as keyof typeof styles]}`}
                        >
                            {ch}
                        </span>
                    ))}
                </div>
                <div className={styles.stories}>
                    {ACT1_STORIES.map((t, b) => (
                        <span key={b} className={styles[`c1s${b}` as keyof typeof styles] as string}>{t}</span>
                    ))}
                    <span className={`${styles.c1hub} ${styles.sSub}`}>
                        Governed change&nbsp;· Powered by AI&nbsp;· One chain from strategy to benefit
                    </span>
                </div>
            </div>

            {/* Act 2 — born from the top */}
            <div className={`${styles.ph} ${styles.ph1}`} aria-hidden="true">
                <div className={styles.v1Top}>
                    {letterRow((i) => styles[`c2t${i}` as keyof typeof styles] as string, "data-tl")}
                </div>
                <div className={styles.v1Stage}>
                    {WORDS.map((w, b) => (
                        <div key={b}>
                            <div className={styles.v1Word}>
                                <CloneSpans beat={b} prefix="c2b" srcAttr="data-src" />
                            </div>
                            <div className={`${styles.v1Script} ${styles[`c2s${b}` as keyof typeof styles]}`}>
                                {w.script}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Act 3 — the constellation */}
            <div className={`${styles.ph} ${styles.ph2}`} aria-hidden="true">
                <div className={styles.v2Stage}>
                    <div className={styles.v2Center}>
                        {letterRow((i) => styles[`c3c${i}` as keyof typeof styles] as string, "data-cl2")}
                    </div>
                    {WORDS.map((w, k) => (
                        <div key={k} className={styles.orb} style={{ left: ORB_POS[k][0], top: ORB_POS[k][1] }}>
                            <div className={styles.oWord}>
                                <CloneSpans beat={k} prefix="c3o" srcAttr="data-osrc" />
                            </div>
                            <div className={`${styles.oScript} ${styles[`c3s${k}` as keyof typeof styles]}`}>
                                {w.script}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Act 4 — the closure: CHANGE IN US */}
            <div className={`${styles.ph} ${styles.ph3}`} aria-hidden="true">
                <div className={styles.v4Word}>
                    <span className={styles.v4w}>C</span>
                    <span className={styles.v4w}>H</span>
                    <span className={styles.v4a}>A</span>
                    <span className={styles.v4w}>N</span>
                    <span className={styles.v4w}>G</span>
                    <span className={styles.v4w}>E</span>
                    <span className={styles.c4gap} />
                    <span className={`${styles.v4w} ${styles.c4swR}`} data-sw="n">N</span>
                    <span className={`${styles.v4w} ${styles.c4swL}`} data-sw="i">I</span>
                    <span className={styles.c4gap} />
                    <span className={`${styles.v4w} ${styles.c4gw}`}>U</span>
                    <span className={`${styles.v4w} ${styles.c4gw}`}>S</span>
                </div>
                <div className={`${styles.v4Script} ${styles.c4scr}`}>The change is in us</div>
            </div>
        </div>
    );
}
