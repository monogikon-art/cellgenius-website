import { SITE } from "@/data/content";
import { Wordmark } from "./Wordmark";

export function Footer({ assistantOn }: { assistantOn: boolean }) {
    return (
        <footer className="border-t border-white/5 bg-ink-0/80">
            <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 text-sm text-muted sm:grid-cols-2 sm:px-6">
                <div>
                    <p className="text-base text-fg">
                        <Wordmark /> <span className="text-muted">by {SITE.company}</span>
                    </p>
                    <p className="mt-3">
                        <a href={`mailto:${SITE.email}`} className="rounded-sm hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold">
                            {SITE.email}
                        </a>
                        {" · "}
                        <a href={SITE.appLoginUrl} className="rounded-sm hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold">
                            Sign in
                        </a>
                    </p>
                </div>
                <div className="space-y-3">
                    {assistantOn ? (
                        <p>
                            The EPMO AI Assistant is AI. Details you share to arrange a demo or a reply are emailed to the
                            Changenius team, kept for 12 months and then deleted.
                        </p>
                    ) : null}
                    <p>© {new Date().getFullYear()} {SITE.company}. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
