"use client";

import { useEffect, useState, useSyncExternalStore, type RefObject } from "react";
import type { Step } from "./timeline";

function subscribeReducedMotion(onChange: () => void) {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
}

export function usePrefersReducedMotion(): boolean {
    return useSyncExternalStore(
        subscribeReducedMotion,
        () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        () => false,
    );
}

function subscribeVisibility(onChange: () => void) {
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
}

export function usePageVisible(): boolean {
    return useSyncExternalStore(subscribeVisibility, () => document.visibilityState === "visible", () => true);
}

export function useInView(ref: RefObject<Element | null>): boolean {
    const [inView, setInView] = useState(true);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.15 });
        observer.observe(el);
        return () => observer.disconnect();
    }, [ref]);
    return inView;
}

export function useCycle(steps: readonly Step[], running: boolean): Step {
    const [index, setIndex] = useState(0);
    useEffect(() => {
        if (!running) return;
        const timer = window.setTimeout(() => setIndex((i) => (i + 1) % steps.length), steps[index].ms);
        return () => window.clearTimeout(timer);
    }, [index, running, steps]);
    return steps[index];
}
