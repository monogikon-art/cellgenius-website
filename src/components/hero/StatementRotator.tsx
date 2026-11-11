export function StatementRotator({ text }: { text: string }) {
    return (
        <p
            aria-live="off"
            className="flex min-h-[5em] max-w-4xl flex-col justify-center sm:min-h-[3.75em] text-balance text-center text-[clamp(1.6rem,4.2vw,3.4rem)] font-semibold leading-tight tracking-tight text-fg"
        >
            <span key={text} className="block animate-statement">
                {text}
            </span>
        </p>
    );
}
