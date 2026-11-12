"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/cn";

export function ChangeniusMark3D({ className }: { className?: string }) {
    const [ready, setReady] = useState(false);
    const turnRef = useCallback((img: HTMLImageElement | null) => {
        if (img?.complete && img.naturalWidth > 0) setReady(true);
    }, []);

    return (
        <div aria-hidden="true" data-ready={ready ? "" : undefined} className={cn("mark-3d size-[104px] sm:size-36", className)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src="/hero/mark-3d.webp"
                alt=""
                width={288}
                height={288}
                decoding="async"
                fetchPriority="high"
                className="mark-3d-still"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                ref={turnRef}
                src="/hero/mark-3d-turn.webp"
                alt=""
                width={288}
                height={288}
                decoding="async"
                fetchPriority="low"
                onLoad={() => setReady(true)}
                className="mark-3d-turn"
            />
        </div>
    );
}
