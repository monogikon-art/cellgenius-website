// Copied from ppm-app origin/master@b3f65f48 on 2026-11-11 (ChaingeIcon from src/components/brand/chainge-logo.tsx).

const ACCENT = "var(--chainge-accent, #D4AF6A)";

export function ChaingeIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 64 64" className={className} role="img" aria-label="Changenius">
            <path stroke="currentColor" d="M52.1 40.95 A22 22 0 1 1 44.3 13.76" fill="none" strokeWidth="11" />
            <path fill={ACCENT} d="M51.05 14.5 Q52.48 19.57 57.55 21 Q52.48 22.43 51.05 27.5 Q49.62 22.43 44.55 21 Q49.62 19.57 51.05 14.5 Z" />
        </svg>
    );
}
