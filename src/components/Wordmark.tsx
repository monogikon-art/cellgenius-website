import { NAME } from "@/data/content";
import { cn } from "@/lib/cn";

const AI_LETTERS = new Set([2, 7]);

export function Wordmark({ className }: { className?: string }) {
    return (
        <span role="img" aria-label="Changenius" className={cn("font-extrabold tracking-[0.04em]", className)}>
            {[...NAME].map((char, i) => (
                <span key={i} aria-hidden="true" className={AI_LETTERS.has(i) ? "text-peri" : undefined}>
                    {char}
                </span>
            ))}
        </span>
    );
}
