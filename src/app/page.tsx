import { headers } from "next/headers";
import { AssistantSection } from "@/components/assistant/AssistantSection";
import { CommercialsSection } from "@/components/films/CommercialsSection";
import { DemosSection } from "@/components/films/DemosSection";
import { FilmPlayerProvider } from "@/components/films/film-player";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HeroCinematic } from "@/components/hero/HeroCinematic";
import { SignInPanel } from "@/components/SignInPanel";

export default async function Home() {
    const nonce = (await headers()).get("x-nonce") ?? undefined;
    return (
        <FilmPlayerProvider>
            <Header />
            <main id="main" className="pt-16">
                <HeroCinematic />
                <AssistantSection
                    nonce={nonce}
                    enabled={process.env.NEXT_PUBLIC_ASSISTANT_ENABLED === "true"}
                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""}
                />
                <CommercialsSection />
                <SignInPanel />
                <DemosSection />
            </main>
            <Footer />
        </FilmPlayerProvider>
    );
}
