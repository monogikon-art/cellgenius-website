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
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
    const assistantOn = process.env.NEXT_PUBLIC_ASSISTANT_ENABLED === "true" && siteKey !== "";
    return (
        <FilmPlayerProvider>
            <Header assistantOn={assistantOn} />
            <main id="main" className="pt-16">
                <HeroCinematic assistantOn={assistantOn} />
                <AssistantSection nonce={nonce} enabled={assistantOn} siteKey={siteKey} />
                <CommercialsSection />
                <SignInPanel />
                <DemosSection />
            </main>
            <Footer assistantOn={assistantOn} />
        </FilmPlayerProvider>
    );
}
