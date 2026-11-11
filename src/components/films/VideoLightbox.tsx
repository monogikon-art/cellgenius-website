"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { Film } from "@/data/content";

type Props = {
    playlist: readonly Film[];
    index: number | null;
    onClose: () => void;
    onIndex: (index: number) => void;
};

export function VideoLightbox({ playlist, index, onClose, onIndex }: Props) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const returnFocus = useRef<HTMLElement | null>(null);
    const film = index === null ? null : playlist[index];
    const next = index !== null && index < playlist.length - 1 ? index + 1 : null;

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (film && !dialog.open) {
            returnFocus.current = document.activeElement as HTMLElement | null;
            dialog.showModal();
        }
        if (!film && dialog.open) dialog.close();
    }, [film]);

    return (
        <dialog
            ref={dialogRef}
            aria-label={film?.title ?? "Video"}
            onClose={() => {
                onClose();
                returnFocus.current?.focus();
            }}
            className="m-auto w-[min(1100px,94vw)] rounded-2xl border border-white/10 bg-ink-1 p-0 text-fg shadow-2xl backdrop:bg-ink-0/85 backdrop:backdrop-blur-sm"
        >
            {film ? (
                <div className="p-4 sm:p-6">
                    <div className="mb-4 flex items-center justify-between gap-4">
                        <h2 className="text-lg font-semibold">{film.title}</h2>
                        <button
                            type="button"
                            onClick={() => dialogRef.current?.close()}
                            aria-label="Close video"
                            className="grid size-10 place-items-center rounded-full border border-white/15 hover:border-gold hover:text-gold"
                        >
                            <X aria-hidden="true" className="size-5" />
                        </button>
                    </div>
                    <video
                        key={film.src}
                        src={film.src}
                        poster={film.poster}
                        controls
                        autoPlay
                        playsInline
                        preload="metadata"
                        onEnded={() => next !== null && onIndex(next)}
                        className="aspect-video w-full rounded-xl bg-black"
                    />
                    {next !== null ? (
                        <div className="mt-4 flex justify-end">
                            <button
                                type="button"
                                onClick={() => onIndex(next)}
                                className="rounded-full border border-gold/60 px-4 py-2 text-sm font-semibold text-gold hover:bg-gold hover:text-ink-0"
                            >
                                Next: {playlist[next].title}
                            </button>
                        </div>
                    ) : null}
                </div>
            ) : null}
        </dialog>
    );
}
