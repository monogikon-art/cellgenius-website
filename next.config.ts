import type { NextConfig } from "next";
import { STATIC_SECURITY_HEADERS } from "./src/lib/security-headers";

const mediaBase = process.env.MEDIA_BASE_URL?.replace(/\/$/, "");

const nextConfig: NextConfig = {
    poweredByHeader: false,
    async headers() {
        return [{ source: "/:path*", headers: [...STATIC_SECURITY_HEADERS] }];
    },
    async rewrites() {
        return mediaBase ? [{ source: "/media/:path*", destination: `${mediaBase}/:path*` }] : [];
    },
};

export default nextConfig;
