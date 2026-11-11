import { SITE } from "@/data/content";
import { MobileNav } from "./MobileNav";
import { navItems } from "./nav";
import { Wordmark } from "./Wordmark";

export function Header({ assistantOn }: { assistantOn: boolean }) {
    const items = navItems(assistantOn);
    return (
        <header className="fixed inset-x-0 top-0 z-40 border-b border-white/5 bg-ink-0/60 backdrop-blur-md">
            <a
                href="#main"
                className="sr-only rounded-md bg-gold px-3 py-2 text-ink-0 focus:not-sr-only focus:absolute focus:left-4 focus:top-3"
            >
                Skip to content
            </a>
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
                <a href="#main" className="rounded-sm text-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold">
                    <Wordmark />
                </a>
                <nav aria-label="Sections" className="hidden items-center gap-8 text-sm text-muted sm:flex">
                    {items.map((item) => (
                        <a key={item.href} href={item.href} className="rounded-sm transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold">
                            {item.label}
                        </a>
                    ))}
                </nav>
                <div className="flex items-center gap-2">
                    <MobileNav items={items} />
                    <a
                        href={SITE.appLoginUrl}
                        className="rounded-full border border-gold/60 px-4 py-1.5 text-sm font-semibold text-gold transition-colors hover:bg-gold hover:text-ink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                    >
                        Sign in
                    </a>
                </div>
            </div>
        </header>
    );
}
