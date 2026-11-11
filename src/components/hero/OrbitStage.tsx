"use client";

import { useEffect, useId, useRef, type RefObject } from "react";
import { cn } from "@/lib/cn";
import { ORBIT_FLATTEN, ORBIT_RADII, ORBIT_SCALE, angularSpeed, orbitPoint, placeLabel, type Box } from "./orbit";

const MOTION_START = ORBIT_RADII.map((_, i) => -Math.PI / 2 + i * 1.3);
// Hand-placed so all five planets and labels stay on a 390px-wide phone and clear of the name, "Meet" and the buttons.
const STILL_START = [Math.PI / 2, Math.PI / 2 + 0.6, Math.PI / 2 - 0.6, -Math.PI / 2 + 0.45, -Math.PI / 2 - 0.45];
const VIEW_WIDTH = 1600;
const TILT = (-6 * Math.PI) / 180;
const EDGE_GAP = 8;
const WORD_PAD = 6;

type LabelMetrics = { ox: number; oy: number; halfWidth: number; halfHeight: number };

type OrbitStageProps = {
    launched: number;
    running: boolean;
    labels: readonly string[];
    still?: boolean;
    avoid?: RefObject<HTMLElement | null>;
};

export function OrbitStage({ launched, running, labels, still = false, avoid }: OrbitStageProps) {
    const stage = useRef<SVGSVGElement>(null);
    const planets = useRef<(SVGGElement | null)[]>([]);
    const texts = useRef<(SVGTextElement | null)[]>([]);
    const metrics = useRef<(LabelMetrics | null)[]>([]);
    const angles = useRef([...(still ? STILL_START : MOTION_START)]);
    const gradient = `planet-${useId().replace(/[^\w-]/g, "")}`;

    useEffect(() => {
        const svg = stage.current;
        if (!svg) return;

        // Label offsets are measured in screen pixels so the per-frame work needs no layout read per label.
        const measure = () => {
            texts.current.forEach((text) => text?.setAttribute("x", "0"));
            metrics.current = texts.current.map((text, i) => {
                const dot = planets.current[i]?.firstElementChild?.getBoundingClientRect();
                const box = text?.getBoundingClientRect();
                if (!dot || !box) return null;
                return {
                    ox: box.left + box.width / 2 - (dot.left + dot.width / 2),
                    oy: box.top + box.height / 2 - (dot.top + dot.height / 2),
                    halfWidth: box.width / 2,
                    halfHeight: box.height / 2,
                };
            });
        };

        const place = () => {
            const frame = svg.getBoundingClientRect();
            const scale = frame.width / VIEW_WIDTH;
            const cx = frame.left + frame.width / 2;
            const cy = frame.top + frame.height / 2;
            const word = avoid?.current?.getBoundingClientRect();
            const wordBox: Box | null = word?.width
                ? { left: word.left - WORD_PAD, right: word.right + WORD_PAD, top: word.top - WORD_PAD, bottom: word.bottom + WORD_PAD }
                : null;
            const edges = { left: EDGE_GAP, right: document.documentElement.clientWidth - EDGE_GAP };

            ORBIT_RADII.forEach((radius, i) => {
                const { x, y } = orbitPoint(radius, angles.current[i]);
                planets.current[i]?.setAttribute("transform", `translate(${x} ${y})`);
                const m = metrics.current[i];
                const text = texts.current[i];
                if (!m || !text || !scale) return;
                const px = cx + (x * Math.cos(TILT) - y * Math.sin(TILT)) * scale + m.ox;
                const py = cy + (x * Math.sin(TILT) + y * Math.cos(TILT)) * scale + m.oy;
                const { dx, opacity } = placeLabel(
                    { left: px - m.halfWidth, right: px + m.halfWidth, top: py - m.halfHeight, bottom: py + m.halfHeight },
                    edges,
                    wordBox,
                );
                text.setAttribute("x", (dx / (scale * Math.cos(TILT))).toFixed(1));
                text.style.opacity = opacity.toFixed(2);
            });
        };

        const refresh = () => {
            measure();
            place();
        };
        refresh();
        let live = true;
        void document.fonts?.ready.then(() => {
            if (live) refresh();
        });
        const resize = new ResizeObserver(refresh);
        resize.observe(svg);

        let frame = 0;
        if (running) {
            let last = performance.now();
            const tick = (now: number) => {
                const dt = Math.min(0.05, (now - last) / 1000);
                last = now;
                ORBIT_RADII.forEach((radius, i) => {
                    angles.current[i] += angularSpeed(radius) * dt;
                });
                place();
                frame = requestAnimationFrame(tick);
            };
            frame = requestAnimationFrame(tick);
        }
        return () => {
            live = false;
            resize.disconnect();
            cancelAnimationFrame(frame);
        };
    }, [running, avoid]);

    return (
        <svg
            ref={stage}
            viewBox="-800 -300 1600 600"
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 w-[min(1600px,180vw)] -translate-x-1/2 -translate-y-1/2"
        >
            <defs>
                <radialGradient id={`${gradient}-gold`} cx="35%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#f0d29a" />
                    <stop offset="55%" stopColor="#c39a55" />
                    <stop offset="100%" stopColor="#1b2540" />
                </radialGradient>
                <radialGradient id={`${gradient}-peri`} cx="35%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#c7cdfd" />
                    <stop offset="55%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#101828" />
                </radialGradient>
            </defs>
            <g transform="rotate(-6)">
                {ORBIT_RADII.map((radius) => (
                    <ellipse
                        key={radius}
                        rx={radius * ORBIT_SCALE}
                        ry={radius * ORBIT_SCALE * ORBIT_FLATTEN}
                        fill="none"
                        stroke="#D4AF6A"
                        strokeOpacity={0.28}
                        strokeWidth={1.2}
                    />
                ))}
                {ORBIT_RADII.map((radius, i) => (
                    <g
                        key={radius}
                        ref={(el) => {
                            planets.current[i] = el;
                        }}
                        className={cn("transition-opacity duration-700", i < launched ? "opacity-100" : "opacity-0")}
                    >
                        <circle r={9 + i * 1.5} fill={`url(#${gradient}-${i % 2 ? "peri" : "gold"})`} />
                        <text
                            ref={(el) => {
                                texts.current[i] = el;
                            }}
                            y={30 + i * 1.5}
                            textAnchor="middle"
                            className="fill-[#c8d0de] stroke-ink-0/60 stroke-[0.24em] text-[13px] font-semibold tracking-[0.25em] [paint-order:stroke] [stroke-linejoin:round] max-sm:translate-y-3 max-sm:text-[24px]"
                        >
                            {labels[i]}
                        </text>
                    </g>
                ))}
            </g>
        </svg>
    );
}
