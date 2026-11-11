import { CommercialsSection } from "@/components/films/CommercialsSection";
import { DemosSection } from "@/components/films/DemosSection";
import { FilmPlayerProvider } from "@/components/films/film-player";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HeroCinematic } from "@/components/hero/HeroCinematic";
import { SignInPanel } from "@/components/SignInPanel";

export default function Home() {
    return (
        <FilmPlayerProvider>
            <Header />
            <main id="main" className="pt-16">
                <HeroCinematic />
                <CommercialsSection />
                <SignInPanel />
                <DemosSection />
            </main>
            <Footer />
        </FilmPlayerProvider>
    );
}
