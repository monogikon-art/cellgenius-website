"use client";

import { useEffect, useRef, useState } from "react";
import { SHOW_LABEL } from "./copy";
import { pickFrame, type Frame } from "./kit";
import { SCENE_BY_ID } from "./scenes";
import { SCENES, SCENE_SECONDS, phaseAt, sceneAt, type SceneId } from "./timeline";

const HEIGHT_BANDS: [number, number][] = [[920, 640], [730, 600], [680, 560], [0, 480]];

function bandHeight(): number {
    const probe = document.createElement("div");
    probe.style.cssText = "position:fixed;top:0;left:0;width:0;height:100lvh;visibility:hidden;pointer-events:none";
    document.body.appendChild(probe);
    const lvh = probe.getBoundingClientRect().height || window.innerHeight;
    probe.remove();
    return HEIGHT_BANDS.find(([min]) => lvh >= min)![1];
}

function startSeconds(): number {
    if (process.env.NODE_ENV === "production") return 0;
    const q = new URLSearchParams(window.location.search);
    const index = SCENES.indexOf(q.get("scene") as SceneId);
    if (index < 0) return 0;
    const at = Number(q.get("t") ?? 0);
    return index * SCENE_SECONDS + (Number.isFinite(at) ? at : 0);
}

export function ShowStage({ running, reduced }: { running: boolean; reduced: boolean }) {
    const rootRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const runningRef = useRef(running);
    const resumeRef = useRef<() => void>(() => undefined);
    const [scene, setScene] = useState<SceneId>(SCENES[0]);
    const [seconds, setSeconds] = useState<number | undefined>(undefined);

    useEffect(() => {
        runningRef.current = running;
        if (running) resumeRef.current();
    }, [running]);

    useEffect(() => {
        if (reduced) return;
        const root = rootRef.current;
        const canvas = canvasRef.current;
        const g = canvas?.getContext("2d");
        if (!root || !canvas || !g) return;

        let cancelled = false;
        let raf = 0;
        let last = 0;
        let lastReport = 0;
        let seconds = startSeconds();
        let family = "";
        let frame: Frame = pickFrame(1, 1);
        let scale = 1;
        let offX = 0;
        let offY = 0;
        let dpr = 1;
        let cssW = 0;
        let ratio = 0;
        let band = 0;
        let shown: SceneId | null = null;
        const prepared = new Map<SceneId, Frame>();

        const render = (report: boolean) => {
            const { id, t, alpha } = sceneAt(seconds);
            const impl = SCENE_BY_ID[id];
            if (prepared.get(id) !== frame) {
                impl.prepare?.(frame, family);
                prepared.set(id, frame);
            }
            g.setTransform(1, 0, 0, 1, 0, 0);
            g.clearRect(0, 0, canvas.width, canvas.height);
            g.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * offX, dpr * offY);
            g.globalAlpha = alpha;
            impl.draw({ g, frame, phase: phaseAt(t), t, font: family });
            g.globalAlpha = 1;
            if (id !== shown) {
                shown = id;
                setScene(id);
            }
            if (report) setSeconds(Math.round(seconds * 10) / 10);
        };

        const layout = () => {
            const nextBand = bandHeight();
            const w = root.clientWidth;
            const nextDpr = Math.min(2, window.devicePixelRatio || 1);
            if (w === cssW && nextBand === band && nextDpr === ratio) return;
            cssW = w;
            ratio = nextDpr;
            band = nextBand;
            root.style.setProperty("--show-h", `${band}px`);
            dpr = nextDpr;
            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(band * dpr);
            frame = pickFrame(w, band);
            scale = Math.min(w / frame.W, band / frame.H);
            offX = (w - frame.W * scale) / 2;
            offY = (band - frame.H * scale) / 2;
            prepared.clear();
            if (!raf) render(true);
        };

        const tick = (now: number) => {
            raf = 0;
            if (cancelled || !runningRef.current) return;
            seconds += last ? Math.min(0.25, (now - last) / 1000) : 0;
            last = now;
            const report = now - lastReport >= 250;
            if (report) lastReport = now;
            render(report);
            raf = requestAnimationFrame(tick);
        };

        resumeRef.current = () => {
            if (raf || cancelled || !family) return;
            last = 0;
            raf = requestAnimationFrame(tick);
        };

        const ro = new ResizeObserver(layout);
        const onResize = () => {
            if (family) layout();
        };
        const onVisible = () => {
            if (document.visibilityState === "visible") last = 0;
        };
        document.addEventListener("visibilitychange", onVisible);
        window.addEventListener("resize", onResize);
        void document.fonts.ready.then(() => {
            if (cancelled) return;
            family = getComputedStyle(document.body).fontFamily;
            layout();
            ro.observe(root);
            render(true);
            if (runningRef.current) resumeRef.current();
        });

        return () => {
            cancelled = true;
            resumeRef.current = () => undefined;
            if (raf) cancelAnimationFrame(raf);
            ro.disconnect();
            document.removeEventListener("visibilitychange", onVisible);
            window.removeEventListener("resize", onResize);
        };
    }, [reduced]);

    return (
        <div
            ref={rootRef}
            data-show-stage
            data-scene={scene}
            data-show-seconds={seconds}
            data-reduced={reduced ? "" : undefined}
            role="img"
            aria-label={SHOW_LABEL}
            className="relative w-full"
            style={{ height: "var(--show-h, 480px)" }}
        >
            {reduced ? (
                <p
                    aria-hidden="true"
                    className="grid h-full place-items-center text-[clamp(34px,11.5vw,88px)] font-extrabold tracking-[-0.02em] text-[#eef2f8]"
                >
                    <span>
                        CH<span className="text-[#818cf8]">A</span>NGEN<span className="text-[#818cf8]">I</span>US
                    </span>
                </p>
            ) : (
                <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 size-full" />
            )}
        </div>
    );
}
