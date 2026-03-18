"use client";

import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { EnterpriseSection } from "@/components/sections/EnterpriseSection";
import { TrackersSection } from "@/components/sections/TrackersSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { ContactSection } from "@/components/sections/ContactSection";

export default function HomePage() {
    useScrollReveal();

    return (
        <>
            <Header />
            <main>
                <HeroSection />
                <EnterpriseSection />
                <TrackersSection />
                <AboutSection />
                <ContactSection />
            </main>
            <Footer />
        </>
    );
}
