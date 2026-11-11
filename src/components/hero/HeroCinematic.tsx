"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { BURST, CLOSE } from "@/data/content";
import { HeroActions } from "./HeroActions";
import { useCycle, useInView, usePageVisible, usePrefersReducedMotion } from "./hooks";
import { NameMorph } from "./NameMorph";
import { OrbitStage } from "./OrbitStage";
import { StatementRotator } from "./StatementRotator";
import { buildCycle, launchedCount, statementFor, type Phase } from "./timeline";

const LABELS = BURST.map((b) => b.word);
const STILL_PHASE: Phase = { kind: "intro" };
const STILL_STEP_MS = 6000;

export function HeroCinematic({ assistantOn }: { assistantOn: boolean }) {
    const ref = useRef<HTMLElement>(null);
    const reduced = usePrefersReducedMotion();
    const inView = useInView(ref);
    const visible = usePageVisible();
    const [paused, setPaused] = useState(false);
    const running = !paused && inView && visible;

    return (
        <section ref={ref} aria-labelledby="hero-title" className="relative isolate flex min-h-[calc(100dvh-4rem)] flex-col overflow-hidden">
            <h1 id="hero-title" className="sr-only">
                Changenius — every change in your organisation, governed in one place
            </h1>
            <Backdrop reduced={reduced} running={running} />
            {reduced ? <HeroStill paused={paused} assistantOn={assistantOn} /> : <HeroMotion running={running} assistantOn={assistantOn} />}
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

function HeroLayout({ statement, stage, assistantOn }: { statement: string; stage: React.ReactNode; assistantOn: boolean }) {
    return (
        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-4 pb-20 pt-12 sm:px-6">
            <StatementRotator text={statement} />
            <div className="relative grid w-full flex-1 place-items-center py-10">{stage}</div>
            <HeroActions assistantOn={assistantOn} />
        </div>
    );
}

function HeroMotion({ running, assistantOn }: { running: boolean; assistantOn: boolean }) {
    const steps = useMemo(() => buildCycle(BURST.length), []);
    const step = useCycle(steps, running);
    const word = useRef<HTMLDivElement>(null);
    return (
        <HeroLayout
            assistantOn={assistantOn}
            statement={statementFor(step.phase)}
            stage={
                <>
                    <OrbitStage launched={launchedCount(step.phase, BURST.length)} running={running} labels={LABELS} avoid={word} />
                    <NameMorph ref={word} phase={step.phase} running={running} />
                </>
            }
        />
    );
}

function HeroStill({ paused, assistantOn }: { paused: boolean; assistantOn: boolean }) {
    const statements = useMemo(() => [...BURST.map((b) => b.statement), CLOSE.statement], []);
    const [index, setIndex] = useState(0);
    const word = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (paused) return;
        const timer = window.setTimeout(() => setIndex((i) => (i + 1) % statements.length), STILL_STEP_MS);
        return () => window.clearTimeout(timer);
    }, [index, paused, statements.length]);
    return (
        <HeroLayout
            assistantOn={assistantOn}
            statement={statements[index]}
            stage={
                <>
                    <OrbitStage launched={BURST.length} running={false} labels={LABELS} still avoid={word} />
                    <NameMorph ref={word} phase={STILL_PHASE} running={false} />
                </>
            }
        />
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
