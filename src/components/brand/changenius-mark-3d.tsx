export function ChangeniusMark3D({ className }: { className?: string }) {
    return (
        <div aria-hidden="true" className={`mark-3d size-[72px] sm:size-24${className ? ` ${className}` : ""}`}>
            <div className="mark-3d-tilt">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="/hero/mark-3d.webp"
                    alt=""
                    width={192}
                    height={192}
                    decoding="async"
                    fetchPriority="high"
                    className="size-full"
                />
                <span className="mark-3d-sweep" />
                <span className="mark-3d-glint" />
            </div>
        </div>
    );
}
