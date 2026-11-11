import type { Proposal } from "@/lib/assistant/protocol";

const TYPE_LABEL: Record<Proposal["type"], string> = {
    demo: "Demo request",
    information: "Information request",
    contact: "Message to the team",
};

function preferredTimes({ type, preferredTimes, timezone }: Proposal): string | undefined {
    if (type !== "demo") return undefined;
    if (preferredTimes && timezone) return `${preferredTimes} (${timezone})`;
    return preferredTimes || timezone || undefined;
}

export function RequestCard({ proposal, busy, onConfirm, onEdit }: { proposal: Proposal; busy: boolean; onConfirm: () => void; onEdit: () => void }) {
    const rows: Array<[string, string | undefined]> = [
        ["Name", proposal.name],
        ["Work email", proposal.email],
        ["Company", proposal.company],
        ["Role", proposal.role],
        ["Preferred times", preferredTimes(proposal)],
        ["Message", proposal.message || undefined],
    ];
    return (
        <section aria-label={TYPE_LABEL[proposal.type]} className="rounded-2xl border border-white/15 bg-ink-0/60 p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-peri">{TYPE_LABEL[proposal.type]}</h3>
            <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[10rem_1fr]">
                {rows
                    .filter(([, value]) => value)
                    .map(([label, value]) => (
                        <div key={label} className="contents">
                            <dt className="text-muted">{label}</dt>
                            <dd className="mb-2 break-words text-fg sm:mb-0">{value}</dd>
                        </div>
                    ))}
            </dl>
            <p className="mt-4 text-xs text-muted">Nothing is sent until you press Confirm and send.</p>
            <div className="mt-4 flex flex-wrap gap-3">
                <button
                    type="button"
                    disabled={busy}
                    onClick={onConfirm}
                    className="rounded-full bg-gold px-5 py-2 font-semibold text-ink-0 hover:bg-gold-hi disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                >
                    Confirm and send
                </button>
                <button type="button" onClick={onEdit} className="rounded-full border border-white/20 px-5 py-2 text-fg hover:border-white/40 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold">
                    Edit
                </button>
            </div>
        </section>
    );
}
