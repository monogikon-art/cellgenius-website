import { LogIn } from "lucide-react";
import { SITE } from "@/data/content";

export function SignInPanel() {
    return (
        <section id="signin" aria-labelledby="signin-title" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="flex flex-col items-start gap-6 rounded-3xl border border-white/10 bg-ink-1/70 p-8 shadow-2xl backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:p-12">
                <div>
                    <h2 id="signin-title" className="text-2xl font-bold text-fg sm:text-3xl">
                        Already a Changenius customer?
                    </h2>
                    <p className="mt-2 text-muted">Sign in to your organisation&apos;s workspace.</p>
                </div>
                <a
                    href={SITE.appLoginUrl}
                    className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 font-semibold text-ink-0 transition-colors hover:bg-gold-hi focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
                >
                    <LogIn aria-hidden="true" className="size-5" />
                    Sign in to Changenius
                </a>
            </div>
        </section>
    );
}
