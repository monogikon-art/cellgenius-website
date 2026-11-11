"use client";

import { useCallback, useEffect, useRef } from "react";

type TurnstileApi = {
    render(el: HTMLElement, options: Record<string, unknown>): string;
    reset(id: string): void;
    remove(id: string): void;
};

declare global {
    interface Window {
        turnstile?: TurnstileApi;
    }
}

const TOKEN_TIMEOUT_MS = 15_000;

export function useTurnstile(siteKey: string) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetId = useRef<string | null>(null);
    const token = useRef<string | null>(null);
    const waiters = useRef<Array<(t: string) => void>>([]);

    const mount = useCallback(() => {
        if (!window.turnstile || !containerRef.current || widgetId.current) return;
        widgetId.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            appearance: "interaction-only",
            callback: (t: string) => {
                token.current = t;
                waiters.current.splice(0).forEach((resolve) => resolve(t));
            },
            "expired-callback": () => {
                token.current = null;
            },
        });
    }, [siteKey]);

    useEffect(() => {
        mount();
        return () => {
            if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
            widgetId.current = null;
        };
    }, [mount]);

    const getToken = useCallback((): Promise<string> => {
        if (token.current) return Promise.resolve(token.current);
        return new Promise<string>((resolve, reject) => {
            const timer = window.setTimeout(() => reject(new Error("turnstile timeout")), TOKEN_TIMEOUT_MS);
            waiters.current.push((t) => {
                window.clearTimeout(timer);
                resolve(t);
            });
        });
    }, []);

    const resetToken = useCallback(() => {
        token.current = null;
        if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
    }, []);

    return { containerRef, mount, getToken, resetToken };
}
