"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { NavItem } from "./nav";

export function MobileNav({ items }: { items: readonly NavItem[] }) {
    const [open, setOpen] = useState(false);
    const button = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setOpen(false);
                button.current?.focus();
            }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open]);

    return (
        <div className="sm:hidden">
            <button
                ref={button}
                type="button"
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                aria-controls="mobile-nav"
                onClick={() => setOpen((o) => !o)}
                className="rounded-md p-2 text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
                {open ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}
            </button>
            {open ? (
                <nav
                    id="mobile-nav"
                    aria-label="Sections"
                    className="absolute inset-x-0 top-16 flex flex-col border-b border-white/5 bg-ink-1 px-4 py-2"
                >
                    {items.map((item) => (
                        <a
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className="rounded-sm py-3 text-base text-muted transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                        >
                            {item.label}
                        </a>
                    ))}
                </nav>
            ) : null}
        </div>
    );
}
