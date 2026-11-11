import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
    metadataBase: new URL("https://cellgenius-ai.com"),
    title: "Changenius — every change, governed in one place",
    description:
        "Changenius is one system where an organisation plans, approves, runs and checks the results of all its projects — with AI that does the paperwork while people keep every decision.",
    openGraph: { title: "Changenius", description: "Every change in your organisation, governed in one place.", type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={inter.variable}>
            <body className="min-h-dvh font-sans antialiased">{children}</body>
        </html>
    );
}
