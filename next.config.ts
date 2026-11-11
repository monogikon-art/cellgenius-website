import type { NextConfig } from "next";
import { STATIC_SECURITY_HEADERS } from "./src/lib/security-headers";

const mediaBase = process.env.MEDIA_BASE_URL?.replace(/\/$/, "");

if (process.env.VERCEL && !mediaBase) {
    console.warn("MEDIA_BASE_URL is not set for this Vercel build: it is read at build time, so every film under /media will 404.");
}

const nextConfig: NextConfig = {
    // Lets the e2e assistant-off server build beside the main dev server without sharing .next.
    distDir: process.env.NEXT_DIST_DIR || ".next",
    poweredByHeader: false,
    async headers() {
        return [{ source: "/:path*", headers: [...STATIC_SECURITY_HEADERS] }];
    },
    async redirects() {
        return [{ source: "/pricing", destination: "/", permanent: true }];
    },
    async rewrites() {
        return mediaBase ? [{ source: "/media/:path*", destination: `${mediaBase}/:path*` }] : [];
    },
};

export default nextConfig;
