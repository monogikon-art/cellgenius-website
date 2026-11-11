"use client";

import { DEMO_GROUPS, FEATURED_FILM } from "@/data/content";
import { SectionHeading } from "../SectionHeading";
import { useFilmPlayer } from "./film-player";
import { VideoTile } from "./VideoTile";

export function FilmsSection() {
    const { open } = useFilmPlayer();
    return (
        <section id="films" aria-labelledby="films-title" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
            <SectionHeading
                id="films-title"
                eyebrow="Films"
                title="See Changenius in motion"
                lead="Two minutes on the whole idea, then the platform chapter by chapter. Start anywhere."
            />
            <VideoTile film={FEATURED_FILM} size="lg" onPlay={() => open([FEATURED_FILM], 0)} />
            <div className="mt-14 space-y-14">
                {DEMO_GROUPS.map((group) => (
                    <div key={group.id} aria-labelledby={`${group.id}-title`} role="group">
                        <h3 id={`${group.id}-title`} className="text-xl font-semibold text-fg">
                            {group.title}
                        </h3>
                        <p className="mt-1 text-muted">{group.lead}</p>
                        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {group.chapters.map((film, i) => (
                                <VideoTile key={film.src} film={film} onPlay={() => open(group.chapters, i)} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
