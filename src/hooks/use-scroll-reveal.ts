"use client";

import { useEffect, useRef } from "react";

/** Adds class "visible" to elements with class "reveal" when they scroll into view. */
export function useScrollReveal() {
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
        );

        // Small delay so elements are in the DOM
        setTimeout(() => {
            document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
        }, 100);

        return () => observer.disconnect();
    }, []);
}
