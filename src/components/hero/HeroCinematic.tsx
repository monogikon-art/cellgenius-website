"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { ChaingeIcon } from "../brand/changenius-icon";
import { ChangeniusWordmarkShow } from "../brand/changenius-wordmark-show";
import { useInView, usePageVisible, usePrefersReducedMotion } from "./hooks";
import { StatementRotator } from "./StatementRotator";

export function HeroCinematic() {
    const ref = useRef<HTMLElement>(null);
    const reduced = usePrefersReducedMotion();
    const inView = useInView(ref);
    const visible = usePageVisible();
    const [paused, setPaused] = useState(false);
    const running = !paused && inView && visible;

    return (
        <section
            ref={ref}
            aria-labelledby="hero-title"
            data-paused={running ? undefined : ""}
            className="hero-show relative isolate flex min-h-dvh flex-col overflow-hidden"
        >
            <h1 id="hero-title" className="sr-only">
                Changenius — every change in your organisation, governed in one place
            </h1>
            <Backdrop reduced={reduced} running={running} />
            <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-4 pb-4 pt-6 sm:px-6">
                <StatementRotator running={running} />
                <div className="grid w-full flex-1 place-items-center">
                    <div className="w-full max-w-md">
                        <ChaingeIcon className="mx-auto mb-5 h-16 w-16 text-white" />
                        <div className="text-center">
                            <ChangeniusWordmarkShow />
                        </div>
                    </div>
                </div>
            </div>
            <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                aria-label={paused ? "Play animation" : "Pause animation"}
                className="absolute bottom-6 right-6 z-20 grid size-11 place-items-center rounded-full border border-white/15 bg-ink-0/50 text-muted backdrop-blur hover:border-gold hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
            >
                {paused ? <Play aria-hidden="true" className="size-4" /> : <Pause aria-hidden="true" className="size-4" />}
            </button>
        </section>
    );
}

function Backdrop({ reduced, running }: { reduced: boolean; running: boolean }) {
    const video = useRef<HTMLVideoElement>(null);
    useEffect(() => {
        const el = video.current;
        if (!el) return;
        if (running) void el.play().catch(() => undefined);
        else el.pause();
    }, [running]);
    return (
        <div aria-hidden="true" className="absolute inset-0 -z-10">
            <div className="absolute inset-0 opacity-40 sm:opacity-60">
                <div className="size-full bg-[url(/hero/backdrop-poster.webp)] bg-cover bg-center" />
                {reduced ? null : (
                    <video
                        ref={video}
                        data-hero-backdrop
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="auto"
                        poster="/hero/backdrop-poster.webp"
                        className="absolute inset-0 size-full object-cover"
                    >
                        <source src="/hero/backdrop.webm" type="video/webm" />
                        <source src="/hero/backdrop.mp4" type="video/mp4" />
                    </video>
                )}
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(3,6,12,0.55)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-ink-0" />
        </div>
    );
}
