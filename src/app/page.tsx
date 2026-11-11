import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SignInPanel } from "@/components/SignInPanel";

export default function Home() {
    return (
        <>
            <Header />
            <main id="main" className="pt-16">
                <SignInPanel />
            </main>
            <Footer />
        </>
    );
}
