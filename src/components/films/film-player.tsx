"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Film } from "@/data/content";
import { VideoLightbox } from "./VideoLightbox";

type FilmPlayer = { open: (playlist: readonly Film[], index: number) => void };

const FilmPlayerContext = createContext<FilmPlayer | null>(null);

export function FilmPlayerProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<{ playlist: readonly Film[]; index: number } | null>(null);
    const open = useCallback((playlist: readonly Film[], index: number) => setState({ playlist, index }), []);
    const value = useMemo(() => ({ open }), [open]);
    return (
        <FilmPlayerContext value={value}>
            {children}
            <VideoLightbox
                playlist={state?.playlist ?? []}
                index={state?.index ?? null}
                onClose={() => setState(null)}
                onIndex={(index) => setState((s) => (s ? { ...s, index } : s))}
            />
        </FilmPlayerContext>
    );
}

export function useFilmPlayer(): FilmPlayer {
    const player = useContext(FilmPlayerContext);
    if (!player) throw new Error("useFilmPlayer must be used inside FilmPlayerProvider");
    return player;
}
