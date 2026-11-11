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

type Waiter = { resolve: (token: string) => void; reject: (error: Error) => void };

const TOKEN_TIMEOUT_MS = 30_000;

export function useTurnstile(siteKey: string) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetId = useRef<string | null>(null);
    const token = useRef<string | null>(null);
    const waiters = useRef<Waiter[]>([]);

    const mount = useCallback(() => {
        if (!window.turnstile || !containerRef.current || widgetId.current) return;
        widgetId.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            appearance: "interaction-only",
            callback: (t: string) => {
                token.current = t;
                waiters.current.splice(0).forEach((w) => w.resolve(t));
            },
            "expired-callback": () => {
                token.current = null;
            },
            "error-callback": () => {
                token.current = null;
                waiters.current.splice(0).forEach((w) => w.reject(new Error("turnstile error")));
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
            const waiter: Waiter = {
                resolve: (t) => {
                    window.clearTimeout(timer);
                    resolve(t);
                },
                reject: (error) => {
                    window.clearTimeout(timer);
                    reject(error);
                },
            };
            const timer = window.setTimeout(() => {
                waiters.current = waiters.current.filter((w) => w !== waiter);
                reject(new Error("turnstile timeout"));
            }, TOKEN_TIMEOUT_MS);
            waiters.current.push(waiter);
        });
    }, []);

    const resetToken = useCallback(() => {
        token.current = null;
        if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
    }, []);

    return { containerRef, mount, getToken, resetToken };
}
