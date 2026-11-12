import { Mail } from "lucide-react";
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
                    <a
                        href={`mailto:${SITE.email}`}
                        className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold/60 px-5 py-2 font-medium text-gold hover:bg-gold hover:text-ink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                    >
                        <Mail aria-hidden="true" className="size-4" />
                        Contact us
                    </a>
                </div>
                <div className="space-y-3">
                    {assistantOn ? (
                        <p>
                            The EPMO AI Assistant is AI. Details you share to arrange a demo or a reply are sent to the
                            Changenius team by email and WhatsApp (Meta), kept for 12 months and then deleted.
                        </p>
                    ) : null}
                    <p>© {new Date().getFullYear()} {SITE.company}. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
