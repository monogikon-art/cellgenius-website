import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
    metadataBase: new URL("https://cellgenius-ai.com"),
    title: "Changenius — every change, governed in one place",
    description:
        "Changenius is one system where an organisation plans, approves, runs and checks the results of all its projects — with AI that does the paperwork while people keep every decision.",
    alternates: { canonical: "/" },
    openGraph: {
        title: "Changenius",
        description: "Every change in your organisation, governed in one place.",
        type: "website",
        url: "/",
        siteName: "Changenius",
    },
    twitter: { card: "summary" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    // Reading headers renders every page per request, which is what lets the middleware's CSP nonce reach Next's own scripts.
    await headers();
    return (
        <html lang="en" className={inter.variable}>
            <body className="min-h-dvh font-sans antialiased">{children}</body>
        </html>
    );
}
