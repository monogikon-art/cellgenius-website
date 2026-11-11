"use client";

import { FEATURED_FILM, MODULE_COMMERCIALS } from "@/data/content";
import { SectionHeading } from "../SectionHeading";
import { useFilmPlayer } from "./film-player";
import { VideoTile } from "./VideoTile";

export function CommercialsSection() {
    const { open } = useFilmPlayer();
    return (
        <section id="films" aria-labelledby="films-title" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
            <SectionHeading
                id="films-title"
                eyebrow="Films"
                title="See Changenius in motion"
                lead="Two minutes on the whole idea, then one short film per module."
            />
            <VideoTile film={FEATURED_FILM} size="lg" onPlay={() => open([FEATURED_FILM], 0)} />
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {MODULE_COMMERCIALS.map((film, i) => (
                    <VideoTile key={film.src} film={film} onPlay={() => open(MODULE_COMMERCIALS, i)} />
                ))}
            </div>
        </section>
    );
}
