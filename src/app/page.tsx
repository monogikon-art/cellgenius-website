import { headers } from "next/headers";
import { AssistantSection } from "@/components/assistant/AssistantSection";
import { FilmPlayerProvider } from "@/components/films/film-player";
import { FilmsSection } from "@/components/films/FilmsSection";
import { Footer } from "@/components/Footer";
import { HeroCinematic } from "@/components/hero/HeroCinematic";
import { SignInPanel } from "@/components/SignInPanel";

export default async function Home() {
    const nonce = (await headers()).get("x-nonce") ?? undefined;
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
    const assistantOn = process.env.NEXT_PUBLIC_ASSISTANT_ENABLED === "true" && siteKey !== "";
    return (
        <FilmPlayerProvider>
            <main>
                <HeroCinematic />
                <AssistantSection nonce={nonce} enabled={assistantOn} siteKey={siteKey} />
                <SignInPanel />
                <FilmsSection />
            </main>
            <Footer assistantOn={assistantOn} />
        </FilmPlayerProvider>
    );
}
