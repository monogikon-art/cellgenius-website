import Image from "next/image";
import { Play } from "lucide-react";
import type { Film } from "@/data/content";
import { cn } from "@/lib/cn";
import { formatDuration } from "@/lib/format-duration";

export function VideoTile({ film, onPlay, size = "md" }: { film: Film; onPlay: () => void; size?: "md" | "lg" }) {
    return (
        <button
            type="button"
            onClick={onPlay}
            aria-label={`Play ${film.title}${film.seconds ? `, ${formatDuration(film.seconds)}` : ""}`}
            className={cn(
                "group relative block aspect-video w-full overflow-hidden rounded-2xl border border-white/10 text-left",
                "bg-[radial-gradient(ellipse_at_30%_20%,var(--color-ink-2),var(--color-ink-0))]",
                "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold",
            )}
        >
            {film.poster ? (
                <Image
                    src={film.poster}
                    alt=""
                    fill
                    unoptimized
                    sizes={size === "lg" ? "(min-width: 1152px) 1152px, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
                    className="object-cover opacity-80 transition-opacity group-hover:opacity-100"
                />
            ) : null}
            <span className="absolute inset-0 bg-gradient-to-t from-ink-0/90 via-ink-0/20 to-transparent" />
            <span className="absolute inset-0 grid place-items-center">
                <span
                    className={cn(
                        "grid place-items-center rounded-full border border-gold/70 bg-ink-0/60 text-gold transition-transform group-hover:scale-110",
                        size === "lg" ? "size-20" : "size-12",
                    )}
                >
                    <Play aria-hidden="true" className={size === "lg" ? "size-8" : "size-5"} />
                </span>
            </span>
            <span className="absolute inset-x-4 bottom-3 flex items-end justify-between gap-3">
                <span className={cn("font-semibold text-fg", size === "lg" ? "text-xl" : "text-sm")}>{film.title}</span>
                {film.seconds ? <span className="text-xs tabular-nums text-muted">{formatDuration(film.seconds)}</span> : null}
            </span>
        </button>
    );
}
