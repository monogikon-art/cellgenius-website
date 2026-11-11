export function SectionHeading({ id, eyebrow, title, lead }: { id: string; eyebrow: string; title: string; lead?: string }) {
    return (
        <div className="mb-10 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted">{eyebrow}</p>
            <h2 id={id} className="mt-3 text-balance text-3xl font-bold tracking-tight text-fg sm:text-4xl">
                {title}
            </h2>
            {lead ? <p className="mt-4 text-pretty text-lg text-muted">{lead}</p> : null}
        </div>
    );
}
