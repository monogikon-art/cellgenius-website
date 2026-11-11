"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { ORBIT_FLATTEN, ORBIT_RADII, ORBIT_SCALE, angularSpeed, orbitPoint } from "./orbit";

export function OrbitStage({ launched, running, labels }: { launched: number; running: boolean; labels: readonly string[] }) {
    const planets = useRef<(SVGGElement | null)[]>([]);
    const angles = useRef(ORBIT_RADII.map((_, i) => Math.PI / 2 + i * 1.3));

    useEffect(() => {
        const place = () =>
            ORBIT_RADII.forEach((radius, i) => {
                const { x, y } = orbitPoint(radius, angles.current[i]);
                planets.current[i]?.setAttribute("transform", `translate(${x} ${y})`);
            });
        place();
        if (!running) return;
        let frame = 0;
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
        return () => cancelAnimationFrame(frame);
    }, [running]);

    return (
        <svg
            viewBox="-800 -300 1600 600"
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 w-[min(1600px,180vw)] -translate-x-1/2 -translate-y-1/2"
        >
            <defs>
                <radialGradient id="planet-gold" cx="35%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#f0d29a" />
                    <stop offset="55%" stopColor="#c39a55" />
                    <stop offset="100%" stopColor="#1b2540" />
                </radialGradient>
                <radialGradient id="planet-peri" cx="35%" cy="30%" r="70%">
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
                        <circle r={9 + i * 1.5} fill={`url(#planet-${i % 2 ? "peri" : "gold"})`} />
                        <text y={30 + i * 1.5} textAnchor="middle" className="fill-muted text-[13px] font-semibold tracking-[0.25em] max-sm:translate-y-3 max-sm:text-[24px]">
                            {labels[i]}
                        </text>
                    </g>
                ))}
            </g>
        </svg>
    );
}
