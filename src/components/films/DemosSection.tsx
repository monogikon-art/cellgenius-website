"use client";

import { DEMO_GROUPS } from "@/data/content";
import { SectionHeading } from "../SectionHeading";
import { useFilmPlayer } from "./film-player";
import { VideoTile } from "./VideoTile";

export function DemosSection() {
    const { open } = useFilmPlayer();
    return (
        <section id="demos" aria-labelledby="demos-title" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
            <SectionHeading
                id="demos-title"
                eyebrow="Demos"
                title="Walk through the platform"
                lead="Real screens, chapter by chapter. Start anywhere."
            />
            <div className="space-y-14">
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
