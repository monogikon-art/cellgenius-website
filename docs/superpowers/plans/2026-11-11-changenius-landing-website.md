# Changenius Landing Page (Website) Implementation Plan

> **Executed, then partly superseded (owner, 11 Nov 2026).** Tasks 1–11 are complete. The planet hero
> (Tasks 6–7), the header and its menu (Task 4), the hero buttons and the module commercials (Task 5)
> were later replaced or removed at the owner's request. `docs/sit/2026-11-11-landing-sit.md`, section
> "Hero swap and page restructure", has the current state.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the cellgenius-ai.com site with a Changenius-only landing page: a cinematic "planets" opening with rotating statements, the EPMO AI Assistant chat panel (with its secure server relay), the commercial films, a sign-in panel, and the demo films.

**Architecture:** A Next.js 15 App Router site styled with Tailwind v4. Animation runs in the browser: pure TypeScript planners (`morph`, `timeline`, `orbit`) drive the Web Animations API, an SVG orbit stage, and a looping backdrop video. Videos stream from the app's existing R2 media store through a `/media/*` rewrite. The assistant's browser panel talks only to this site's `/api/assistant`. That route checks Turnstile, holds a signed conversation cookie, limits each IP, signs every call with HMAC, and relays a newline-delimited JSON event stream from the app. The app endpoint itself is **Plan B** (a separate plan in `ppm-app`), and it must implement the wire contract in Task 8 exactly.

**Tech Stack:** Next.js 15.5, React 19, TypeScript (strict), Tailwind CSS 4, clsx + tailwind-merge, zod 4, lucide-react, Vitest 3, Playwright, Cloudflare Turnstile.

**Spec:** `docs/superpowers/specs/2026-11-11-changenius-landing-design.md`

## Global Constraints

- Branch: `revamp/changenius-landing`. **Never push or open a PR without the owner's yes.** Never commit `.env*` files (except `.env.example`).
- Palette, verbatim from the spec: ink-0 `#070b16`, ink-1 `#101828`, ink-2 `#1b2540`, porcelain `#f2f5f8`, gold `#D4AF6A`, gold-hi `#f0d29a`, gold-lo `#c39a55`, periwinkle `#818cf8` (`#6366f1` on light), text `#eef2f8`, muted `#9aa6bd`. **Gold is for actions only.** Periwinkle is for anything AI.
- Font: Inter 400–800 via `next/font/google`.
- Styling: Tailwind only. Use `cn()` from `src/lib/cn.ts`. No CSS Modules.
- The assistant is named **"EPMO AI Assistant"**. The request email address is `info@cellgenius-ai.com`.
- Hero words and statements are copied verbatim from the spec's §4.1 table. Any text mentioning NBB or "National Bank of Bahrain" is forbidden.
- No password is ever typed on this site. Sign-in links to `https://app.cellgenius-ai.com/login`.
- The only `NEXT_PUBLIC_` variables are `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `NEXT_PUBLIC_ASSISTANT_ENABLED`.
- No `dangerouslySetInnerHTML` anywhere. Assistant text is rendered through the safe parser in Task 10.
- Comments only where the reason is not obvious from the code.
- Laptop rule: run only the tests for the files you changed (`npx vitest run <paths>`). This site is small, so a full `npm run build` is fine.

---

### Task 1: Tooling and a clean slate

**Files:**
- Modify: `package.json`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `.gitignore`
- Create: `postcss.config.mjs`, `eslint.config.mjs`, `vitest.config.ts`, `src/lib/cn.ts`, `src/lib/cn.test.ts`, `src/app/icon.svg`
- Delete: `src/app/pricing/`, `src/app/api/contact/`, `src/components/` (all of it), `src/hooks/use-scroll-reveal.ts`, `src/data/content.ts` (rewritten in Task 2)

**Interfaces:**
- Produces: `cn(...inputs: ClassValue[]): string`; the Tailwind tokens `ink-0`, `ink-1`, `ink-2`, `porcelain`, `gold`, `gold-hi`, `gold-lo`, `peri`, `peri-deep`, `fg`, `muted`; the animations `animate-statement` and `animate-meet`; the scripts `test`, `lint`, `typecheck`, `e2e`.

- [ ] **Step 1: Install the dependencies**

```bash
npm install clsx@^2.1.1 tailwind-merge@^3.3.0 zod@^4.1.0
npm install -D tailwindcss@^4.1.0 @tailwindcss/postcss@^4.1.0 postcss@^8.5.0 vitest@^3.2.0 @playwright/test@^1.55.0 eslint@^9.30.0 eslint-config-next@15.5.13 @eslint/eslintrc@^3.3.0
```

- [ ] **Step 2: Set the scripts in `package.json`** (replace the `"scripts"` block)

```json
"scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "e2e": "playwright test"
}
```

- [ ] **Step 3: Remove the old site**

```bash
git rm -r -q src/app/pricing src/app/api/contact src/components src/hooks src/data/content.ts
```

- [ ] **Step 4: Create the config files**

`postcss.config.mjs`:
```js
export default { plugins: { "@tailwindcss/postcss": {} } };
```

`eslint.config.mjs`:
```js
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

export default [
    { ignores: [".next/**", "node_modules/**", "playwright-report/**", "test-results/**", "next-env.d.ts"] },
    ...compat.extends("next/core-web-vitals", "next/typescript"),
];
```

`vitest.config.ts`:
```ts
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
    resolve: { alias: { "@": path.resolve(__dirname, "src") } },
    test: { environment: "node", include: ["src/**/*.test.ts"] },
});
```

Append to `.gitignore`:
```
/test-results
/playwright-report
.env*.local
.env
```

- [ ] **Step 5: Write the failing test for `cn`**

`src/lib/cn.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
    it("joins truthy classes and lets the last Tailwind class win", () => {
        expect(cn("px-2 text-fg", false && "hidden", "px-4")).toBe("text-fg px-4");
    });
});
```

- [ ] **Step 6: Run it and watch it fail**

Run: `npx vitest run src/lib/cn.test.ts`
Expected: FAIL, `Failed to resolve import "./cn"`.

- [ ] **Step 7: Implement `cn`**

`src/lib/cn.ts`:
```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}
```

- [ ] **Step 8: Run it and watch it pass**

Run: `npx vitest run src/lib/cn.test.ts`
Expected: PASS (1 test).

- [ ] **Step 9: Theme, layout, placeholder page and icon**

`src/app/globals.css` (replaces the whole file):
```css
@import "tailwindcss";

@theme {
    --color-ink-0: #070b16;
    --color-ink-1: #101828;
    --color-ink-2: #1b2540;
    --color-porcelain: #f2f5f8;
    --color-gold: #d4af6a;
    --color-gold-hi: #f0d29a;
    --color-gold-lo: #c39a55;
    --color-peri: #818cf8;
    --color-peri-deep: #6366f1;
    --color-fg: #eef2f8;
    --color-muted: #9aa6bd;
    --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;

    --animate-statement: statement-in 700ms cubic-bezier(0.2, 0.7, 0.2, 1) both;
    --animate-meet: meet-in 900ms ease-out 600ms both;

    @keyframes statement-in {
        from { opacity: 0; transform: translateY(10px); filter: blur(6px); }
        to { opacity: 1; transform: none; filter: none; }
    }
    @keyframes meet-in {
        from { opacity: 0; letter-spacing: 1.2em; }
        to { opacity: 1; letter-spacing: 0.6em; }
    }
}

@keyframes fade-only {
    from { opacity: 0; }
    to { opacity: 1; }
}

html {
    color-scheme: dark;
    scroll-behavior: smooth;
    background: var(--color-ink-0);
}

body {
    background: radial-gradient(ellipse 90% 80% at 50% 36%, var(--color-ink-2) 0%, var(--color-ink-1) 52%, var(--color-ink-0) 100%) fixed;
    color: var(--color-fg);
}

@media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
    .animate-statement { animation: fade-only 400ms ease-out both; }
    .animate-meet { animation: none; }
}
```

`src/app/layout.tsx` (replaces the whole file):
```tsx
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
```

`src/app/page.tsx` (a placeholder until Task 4):
```tsx
export default function Home() {
    return <main id="main" className="grid min-h-dvh place-items-center text-fg">Changenius</main>;
}
```

Copy the app icon:
```bash
cp "C:/CellGenius-PPM/ppm-app/docs/brand/changenius-app-icon.svg" src/app/icon.svg
```

- [ ] **Step 10: Check that it builds and lints**

Run: `npm run build && npm run lint && npm run typecheck`
Expected: the build succeeds with the `/` route listed, and lint and typecheck exit 0.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "chore: Tailwind v4, Vitest, ESLint; remove the old CellGenius site

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Content model

**Files:**
- Create: `src/data/content.ts`, `src/data/content.test.ts`

**Interfaces:**
- Produces:
  - Constants `SITE`, `NAME`, `INTRO_STATEMENT`, `BURST`, `CLOSE`, `FEATURED_FILM`, `MODULE_COMMERCIALS`, `DEMO_GROUPS`, `QUICK_STARTS` and `ASSISTANT`
  - Types `BurstWord = { word: string; statement: string }`, `Film = { title: string; src: string; poster?: string; seconds?: number }` and `DemoGroup = { id: string; title: string; lead: string; chapters: readonly Film[] }`

- [ ] **Step 1: Write the failing test**

`src/data/content.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { BURST, CLOSE, DEMO_GROUPS, FEATURED_FILM, MODULE_COMMERCIALS, NAME } from "./content";

const allFilms = [FEATURED_FILM, ...MODULE_COMMERCIALS, ...DEMO_GROUPS.flatMap((g) => g.chapters)];

describe("content", () => {
    it("carries the film's five words in order, then the close", () => {
        expect(NAME).toBe("CHANGENIUS");
        expect(BURST.map((b) => b.word)).toEqual(["CHANGE", "AI", "AGENTIC AI", "CHAIN", "GENIUS"]);
        expect(CLOSE).toEqual({ word: "CHANGE IN US", statement: "The change is in us." });
    });

    it("keeps every video on the site's own media route", () => {
        for (const film of allFilms) expect(film.src).toMatch(/^\/media\/.+\.mp4$/);
    });

    it("lists all 9 executive-demo and 13 deeper-look chapters with durations", () => {
        expect(DEMO_GROUPS.map((g) => g.chapters.length)).toEqual([9, 13]);
        for (const film of DEMO_GROUPS.flatMap((g) => g.chapters)) expect(film.seconds).toBeGreaterThan(0);
    });

    it("never names the bank client", () => {
        const text = JSON.stringify({ BURST, CLOSE, allFilms, DEMO_GROUPS });
        expect(text).not.toMatch(/\bNBB\b|National Bank of Bahrain/i);
    });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/data/content.test.ts`
Expected: FAIL, `Failed to resolve import "./content"`.

- [ ] **Step 3: Write the content**

`src/data/content.ts`:
```ts
export const SITE = {
    name: "Changenius",
    company: "CellGenius",
    url: "https://cellgenius-ai.com",
    appLoginUrl: "https://app.cellgenius-ai.com/login",
    email: "info@cellgenius-ai.com",
} as const;

export const NAME = "CHANGENIUS";

export type BurstWord = { readonly word: string; readonly statement: string };

export const INTRO_STATEMENT = "Meet Changenius.";

export const BURST: readonly BurstWord[] = [
    { word: "CHANGE", statement: "Every change in your organisation, governed in one place." },
    { word: "AI", statement: "AI, grounded in your own policies." },
    { word: "AGENTIC AI", statement: "Agentic AI prepares the work. People decide." },
    { word: "CHAIN", statement: "One chain, from strategy to benefit." },
    {
        word: "GENIUS",
        statement: "Built-in genius: native, embedded automation across every step. Late work escalates on its own.",
    },
];

export const CLOSE: BurstWord = { word: "CHANGE IN US", statement: "The change is in us." };

export type Film = { readonly title: string; readonly src: string; readonly poster?: string; readonly seconds?: number };

export type DemoGroup = { readonly id: string; readonly title: string; readonly lead: string; readonly chapters: readonly Film[] };

const media = (path: string) => `/media${path}`;

export const FEATURED_FILM: Film = {
    title: "The Changenius film",
    src: media("/films/changenius-film-2min-v1.mp4"),
    poster: media("/films/changenius-film-2min-v1-poster.jpg"),
    seconds: 113,
};

const MODULES = [
    ["ai-agents", "AI agents"],
    ["augmented-gate-workflow", "Augmented gate workflow"],
    ["benefits-realization", "Benefits realisation"],
    ["control-tower", "Control tower"],
    ["financial-planning", "Financial planning"],
    ["initiation-gates", "Initiation gates"],
    ["project-delivery", "Project delivery"],
    ["project-lifecycle", "Project lifecycle"],
] as const;

export const MODULE_COMMERCIALS: readonly Film[] = MODULES.map(([slug, title]) => ({
    title,
    src: media(`/manual/${slug}/commercial.mp4`),
}));

const chapter = (title: string, path: string, seconds: number): Film => ({ title, src: media(path), seconds });

export const DEMO_GROUPS: readonly DemoGroup[] = [
    {
        id: "executive-demo",
        title: "The executive demo",
        lead: "Nine short chapters, from strategy to go-live.",
        chapters: [
            chapter("1.1 The campus", "/films/executive-demo-v3/01-campus.mp4", 94),
            chapter("1.2 Strategy & OKR", "/films/executive-demo-v3/02-strategy.mp4", 231),
            chapter("1.3 Registering a request", "/films/executive-demo-v2/03-request.mp4", 167),
            chapter("1.4 Business requirements", "/films/executive-demo-v3/04-requirements.mp4", 172),
            chapter("1.5 Benefits", "/films/executive-demo-v2/05-benefits.mp4", 169),
            chapter("1.6 Deliverables, generated", "/films/executive-demo-v3/06-deliverables.mp4", 184),
            chapter("1.7 Investment decision", "/films/executive-demo-v3/07-decision.mp4", 98),
            chapter("1.8 Planning the delivery", "/films/executive-demo-v3/08-planning.mp4", 205),
            chapter("1.9 Go-live, and after", "/films/executive-demo-v3/09-golive.mp4", 87),
        ],
    },
    {
        id: "deeper-look",
        title: "A deeper look",
        lead: "Two changes at an illustrative bank, followed module by module.",
        chapters: [
            chapter("A deeper look: two changes, one bank", "/films/deeper-look-v3/00-opening.mp4", 89),
            chapter("1 A strategy every change answers to", "/films/deeper-look-v3/01-strategy-ideas.mp4", 101),
            chapter("2 Registered and governed", "/films/deeper-look-v3/02-registered-governed.mp4", 116),
            chapter("3 What comes first", "/films/deeper-look-v3/03-what-comes-first.mp4", 109),
            chapter("4 Solution and requirements", "/films/deeper-look-v3/04-solution-requirements.mp4", 196),
            chapter("5 Buying and deciding", "/films/deeper-look-v3/05-buying-deciding.mp4", 154),
            chapter("6 Planning and delivering", "/films/deeper-look-v3/06-planning-delivering.mp4", 97),
            chapter("7 Go-live based on evidence", "/films/deeper-look-v3/07-go-live.mp4", 93),
            chapter("8 Thirty minutes, proven", "/films/deeper-look-v3/08-benefits.mp4", 49),
            chapter("9 The teammates behind every step", "/films/deeper-look-v3/09-digital-workforce.mp4", 131),
            chapter("10 The Knowledge Base", "/films/deeper-look-v3/10-knowledge-base.mp4", 120),
            chapter("11 The Enterprise Baseline", "/films/deeper-look-v3/11-enterprise-baseline.mp4", 119),
            chapter("12 Built for a regulated bank", "/films/deeper-look-v3/12-regulated-bank.mp4", 55),
        ],
    },
];

export const QUICK_STARTS = ["What can Changenius do?", "Book a demo", "Send me information", "Contact the team"] as const;

export const ASSISTANT = {
    name: "EPMO AI Assistant",
    tagline: "Ask anything about Changenius — or let me arrange a demo, send you information or pass a message to the team.",
    consent:
        "This assistant is AI. Don't share sensitive information. Details you give to arrange a demo or a reply are emailed to the Changenius team and kept for 12 months.",
} as const;
```

- [ ] **Step 4: Run it and watch it pass**

Run: `npx vitest run src/data/content.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/data
git commit -m "feat: Changenius content model (words, statements, films)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Security headers, nonce CSP and media rewrite

**Files:**
- Create: `src/lib/security-headers.ts`, `src/lib/security-headers.test.ts`, `src/middleware.ts`
- Modify: `next.config.ts`

**Interfaces:**
- Produces:
  - `contentSecurityPolicy(opts: { nonce: string; dev: boolean }): string`
  - `STATIC_SECURITY_HEADERS: ReadonlyArray<{ key: string; value: string }>`
  - The request header `x-nonce`, which pages read via `headers()`

- [ ] **Step 1: Write the failing test**

`src/lib/security-headers.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { STATIC_SECURITY_HEADERS, contentSecurityPolicy } from "./security-headers";

const directive = (csp: string, name: string) => csp.split("; ").find((d) => d.startsWith(`${name} `)) ?? "";

describe("contentSecurityPolicy", () => {
    it("allows scripts only by nonce in production", () => {
        const csp = contentSecurityPolicy({ nonce: "abc123", dev: false });
        const scripts = directive(csp, "script-src");
        expect(scripts).toContain("'nonce-abc123'");
        expect(scripts).not.toContain("'unsafe-inline'");
        expect(scripts).not.toContain("'unsafe-eval'");
        expect(directive(csp, "frame-ancestors")).toBe("frame-ancestors 'none'");
        expect(directive(csp, "object-src")).toBe("object-src 'none'");
        expect(directive(csp, "media-src")).toBe("media-src 'self'");
        expect(directive(csp, "frame-src")).toBe("frame-src https://challenges.cloudflare.com");
        expect(csp).toContain("upgrade-insecure-requests");
    });

    it("allows dev tooling only in dev", () => {
        const csp = contentSecurityPolicy({ nonce: "n", dev: true });
        expect(directive(csp, "script-src")).toContain("'unsafe-eval'");
        expect(csp).not.toContain("upgrade-insecure-requests");
    });
});

describe("STATIC_SECURITY_HEADERS", () => {
    it("sets nosniff, referrer policy, HSTS and denies framing", () => {
        const map = Object.fromEntries(STATIC_SECURITY_HEADERS.map((h) => [h.key, h.value]));
        expect(map["X-Content-Type-Options"]).toBe("nosniff");
        expect(map["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
        expect(map["Strict-Transport-Security"]).toBe("max-age=63072000");
        expect(map["X-Frame-Options"]).toBe("DENY");
    });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/lib/security-headers.test.ts`
Expected: FAIL, `Failed to resolve import "./security-headers"`.

- [ ] **Step 3: Implement**

`src/lib/security-headers.ts`:
```ts
const TURNSTILE = "https://challenges.cloudflare.com";

export function contentSecurityPolicy({ nonce, dev }: { nonce: string; dev: boolean }): string {
    const directives: Record<string, string[]> = {
        "default-src": ["'self'"],
        "script-src": ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'", TURNSTILE, ...(dev ? ["'unsafe-eval'"] : [])],
        "style-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", "data:", "blob:"],
        "font-src": ["'self'"],
        "media-src": ["'self'"],
        "connect-src": ["'self'", TURNSTILE, ...(dev ? ["ws:"] : [])],
        "frame-src": [TURNSTILE],
        "object-src": ["'none'"],
        "base-uri": ["'self'"],
        "form-action": ["'self'"],
        "frame-ancestors": ["'none'"],
    };
    const csp = Object.entries(directives)
        .map(([name, values]) => `${name} ${values.join(" ")}`)
        .join("; ");
    return dev ? csp : `${csp}; upgrade-insecure-requests`;
}

export const STATIC_SECURITY_HEADERS = [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Strict-Transport-Security", value: "max-age=63072000" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
] as const;
```

`src/middleware.ts`:
```ts
import { NextResponse, type NextRequest } from "next/server";
import { contentSecurityPolicy } from "@/lib/security-headers";

export function middleware(request: NextRequest) {
    const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
    const csp = contentSecurityPolicy({ nonce, dev: process.env.NODE_ENV !== "production" });
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-nonce", nonce);
    requestHeaders.set("Content-Security-Policy", csp);
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.headers.set("Content-Security-Policy", csp);
    return response;
}

export const config = {
    matcher: [
        {
            source: "/((?!api|media|_next/static|_next/image|icon.svg|hero/).*)",
            missing: [
                { type: "header", key: "next-router-prefetch" },
                { type: "header", key: "purpose", value: "prefetch" },
            ],
        },
    ],
};
```

`next.config.ts` (replaces the whole file):
```ts
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
```

- [ ] **Step 4: Run the tests and the build**

Run: `npx vitest run src/lib/security-headers.test.ts && npm run build`
Expected: PASS (3 tests). The build succeeds and lists `ƒ Middleware`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/security-headers.ts src/lib/security-headers.test.ts src/middleware.ts next.config.ts
git commit -m "feat: nonce CSP, security headers and /media rewrite to the R2 store

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Page shell (header, footer, sign-in panel) and Playwright

**Files:**
- Create: `src/components/Wordmark.tsx`, `src/components/Header.tsx`, `src/components/Footer.tsx`, `src/components/SectionHeading.tsx`, `src/components/SignInPanel.tsx`, `playwright.config.ts`, `e2e/shell.spec.ts`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `SITE`, `NAME` (Task 2); `cn` (Task 1).
- Produces:
  - `<Wordmark className? />`
  - `<SectionHeading id eyebrow title lead? />`
  - The section ids `main`, `assistant`, `films`, `signin` and `demos`

- [ ] **Step 1: Playwright config** (Task 10 adds the stub app and assistant settings to `webServer`)

`playwright.config.ts`:
```ts
import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

export default defineConfig({
    testDir: "e2e",
    timeout: 60_000,
    use: { baseURL: `http://localhost:${PORT}`, trace: "retain-on-failure" },
    projects: [
        { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
        { name: "phone", use: { ...devices["Pixel 7"] } },
    ],
    webServer: [{ command: `npx next dev -p ${PORT}`, port: PORT, reuseExistingServer: false, timeout: 120_000 }],
});
```

Run once: `npx playwright install chromium`.

- [ ] **Step 2: Write the failing e2e test**

`e2e/shell.spec.ts`:
```ts
import { expect, test } from "@playwright/test";

test("header, sign-in panel and footer are in place", async ({ page }) => {
    await page.goto("/");
    const signIn = page.getByRole("link", { name: "Sign in to Changenius" });
    await expect(signIn).toHaveAttribute("href", "https://app.cellgenius-ai.com/login");
    await expect(page.locator("form input[type=password]")).toHaveCount(0);
    await expect(page.getByRole("contentinfo")).toContainText("Changenius by CellGenius");
    await expect(page.getByRole("link", { name: "Skip to content" })).toHaveAttribute("href", "#main");
});
```

Run: `npx playwright test e2e/shell.spec.ts --project=desktop`
Expected: FAIL, because the sign-in link is not found.

- [ ] **Step 3: Build the shell components**

`src/components/Wordmark.tsx`:
```tsx
import { NAME } from "@/data/content";
import { cn } from "@/lib/cn";

const AI_LETTERS = new Set([2, 7]);

export function Wordmark({ className }: { className?: string }) {
    return (
        <span role="img" aria-label="Changenius" className={cn("font-extrabold tracking-[0.04em]", className)}>
            {[...NAME].map((char, i) => (
                <span key={i} aria-hidden="true" className={AI_LETTERS.has(i) ? "text-peri" : undefined}>
                    {char}
                </span>
            ))}
        </span>
    );
}
```

`src/components/Header.tsx`:
```tsx
import { SITE } from "@/data/content";
import { Wordmark } from "./Wordmark";

const NAV = [
    { href: "#assistant", label: "Assistant" },
    { href: "#films", label: "Films" },
    { href: "#demos", label: "Demos" },
];

export function Header() {
    return (
        <header className="fixed inset-x-0 top-0 z-40 border-b border-white/5 bg-ink-0/60 backdrop-blur-md">
            <a
                href="#main"
                className="sr-only rounded-md bg-gold px-3 py-2 text-ink-0 focus:not-sr-only focus:absolute focus:left-4 focus:top-3"
            >
                Skip to content
            </a>
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
                <a href="#main" className="text-lg">
                    <Wordmark />
                </a>
                <nav aria-label="Sections" className="hidden items-center gap-8 text-sm text-muted sm:flex">
                    {NAV.map((item) => (
                        <a key={item.href} href={item.href} className="transition-colors hover:text-fg">
                            {item.label}
                        </a>
                    ))}
                </nav>
                <a
                    href={SITE.appLoginUrl}
                    className="rounded-full border border-gold/60 px-4 py-1.5 text-sm font-semibold text-gold transition-colors hover:bg-gold hover:text-ink-0"
                >
                    Sign in
                </a>
            </div>
        </header>
    );
}
```

`src/components/SectionHeading.tsx`:
```tsx
export function SectionHeading({ id, eyebrow, title, lead }: { id: string; eyebrow: string; title: string; lead?: string }) {
    return (
        <div className="mb-10 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gold">{eyebrow}</p>
            <h2 id={id} className="mt-3 text-balance text-3xl font-bold tracking-tight text-fg sm:text-4xl">
                {title}
            </h2>
            {lead ? <p className="mt-4 text-pretty text-lg text-muted">{lead}</p> : null}
        </div>
    );
}
```

`src/components/SignInPanel.tsx`:
```tsx
import { LogIn } from "lucide-react";
import { SITE } from "@/data/content";

export function SignInPanel() {
    return (
        <section id="signin" aria-labelledby="signin-title" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="flex flex-col items-start gap-6 rounded-3xl border border-white/10 bg-ink-1/70 p-8 shadow-2xl backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:p-12">
                <div>
                    <h2 id="signin-title" className="text-2xl font-bold text-fg sm:text-3xl">
                        Already a Changenius customer?
                    </h2>
                    <p className="mt-2 text-muted">Sign in to your organisation&apos;s workspace.</p>
                </div>
                <a
                    href={SITE.appLoginUrl}
                    className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 font-semibold text-ink-0 transition-colors hover:bg-gold-hi focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
                >
                    <LogIn aria-hidden="true" className="size-5" />
                    Sign in to Changenius
                </a>
            </div>
        </section>
    );
}
```

`src/components/Footer.tsx`:
```tsx
import { SITE } from "@/data/content";
import { Wordmark } from "./Wordmark";

export function Footer() {
    return (
        <footer className="border-t border-white/5 bg-ink-0/80">
            <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 text-sm text-muted sm:grid-cols-2 sm:px-6">
                <div>
                    <p className="text-base text-fg">
                        <Wordmark /> <span className="text-muted">by {SITE.company}</span>
                    </p>
                    <p className="sr-only">Changenius by CellGenius</p>
                    <p className="mt-3">
                        <a href={`mailto:${SITE.email}`} className="hover:text-fg">
                            {SITE.email}
                        </a>
                        {" · "}
                        <a href={SITE.appLoginUrl} className="hover:text-fg">
                            Sign in
                        </a>
                    </p>
                </div>
                <div className="space-y-3">
                    <p>
                        The EPMO AI Assistant is AI. Details you share to arrange a demo or a reply are emailed to the
                        Changenius team, kept for 12 months and then deleted.
                    </p>
                    <p>© {new Date().getFullYear()} {SITE.company}. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
```

`src/app/page.tsx` (sections are added in later tasks):
```tsx
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
```

- [ ] **Step 4: Run the e2e test and watch it pass**

Run: `npx playwright test e2e/shell.spec.ts`
Expected: PASS on both `desktop` and `phone`.

- [ ] **Step 5: Commit**

```bash
git add src/components src/app/page.tsx playwright.config.ts e2e
git commit -m "feat: page shell with header, footer and sign-in panel

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Films (tiles, viewer, commercials and demos)

**Files:**
- Create: `src/lib/format-duration.ts`, `src/lib/format-duration.test.ts`, `src/components/films/VideoTile.tsx`, `src/components/films/VideoLightbox.tsx`, `src/components/films/film-player.tsx`, `src/components/films/CommercialsSection.tsx`, `src/components/films/DemosSection.tsx`, `e2e/films.spec.ts`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `Film`, `FEATURED_FILM`, `MODULE_COMMERCIALS`, `DEMO_GROUPS` (Task 2); `SectionHeading` (Task 4).
- Produces:
  - `formatDuration(seconds: number): string`
  - `<FilmPlayerProvider>`
  - `useFilmPlayer(): { open(playlist: readonly Film[], index: number): void }`, which Task 7 uses for "Watch the film"

- [ ] **Step 1: Write the failing unit test**

`src/lib/format-duration.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { formatDuration } from "./format-duration";

describe("formatDuration", () => {
    it("formats seconds as m:ss", () => {
        expect(formatDuration(113)).toBe("1:53");
        expect(formatDuration(49)).toBe("0:49");
        expect(formatDuration(600)).toBe("10:00");
    });
});
```

Run: `npx vitest run src/lib/format-duration.test.ts`. Expected: FAIL (import not found).

- [ ] **Step 2: Implement**

`src/lib/format-duration.ts`:
```ts
export function formatDuration(seconds: number): string {
    const s = Math.max(0, Math.round(seconds));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
```

Run: `npx vitest run src/lib/format-duration.test.ts`. Expected: PASS.

- [ ] **Step 3: Write the failing e2e test**

`e2e/films.spec.ts`:
```ts
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    await page.route("**/media/**", (route) => route.fulfill({ status: 204 }));
});

test("the featured film opens in the viewer and Escape returns focus", async ({ page }) => {
    await page.goto("/#films");
    const tile = page.getByRole("button", { name: /Play The Changenius film/ });
    await tile.click();
    const dialog = page.getByRole("dialog", { name: "The Changenius film" });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("video")).toHaveAttribute("src", "/media/films/changenius-film-2min-v1.mp4");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(tile).toBeFocused();
});

test("a demo chapter offers the next chapter", async ({ page }) => {
    await page.goto("/#demos");
    await page.getByRole("button", { name: /Play 1\.1 The campus/ }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: "Next: 1.2 Strategy & OKR" }).click();
    await expect(dialog.getByRole("heading", { name: "1.2 Strategy & OKR" })).toBeVisible();
});
```

Run: `npx playwright test e2e/films.spec.ts --project=desktop`. Expected: FAIL (no tile).

- [ ] **Step 4: Build the film components**

`src/components/films/VideoTile.tsx`:
```tsx
import Image from "next/image";
import { Play } from "lucide-react";
import type { Film } from "@/data/content";
import { cn } from "@/lib/cn";
import { formatDuration } from "@/lib/format-duration";

export function VideoTile({ film, onPlay, size = "md" }: { film: Film; onPlay: () => void; size?: "md" | "lg" }) {
    return (
        <button
            type="button"
            onClick={onPlay}
            aria-label={`Play ${film.title}${film.seconds ? `, ${formatDuration(film.seconds)}` : ""}`}
            className={cn(
                "group relative block aspect-video w-full overflow-hidden rounded-2xl border border-white/10 text-left",
                "bg-[radial-gradient(ellipse_at_30%_20%,var(--color-ink-2),var(--color-ink-0))]",
                "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold",
            )}
        >
            {film.poster ? (
                <Image
                    src={film.poster}
                    alt=""
                    fill
                    unoptimized
                    sizes={size === "lg" ? "(min-width: 1152px) 1152px, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
                    className="object-cover opacity-80 transition-opacity group-hover:opacity-100"
                />
            ) : null}
            <span className="absolute inset-0 bg-gradient-to-t from-ink-0/90 via-ink-0/20 to-transparent" />
            <span className="absolute inset-0 grid place-items-center">
                <span
                    className={cn(
                        "grid place-items-center rounded-full border border-gold/70 bg-ink-0/60 text-gold transition-transform group-hover:scale-110",
                        size === "lg" ? "size-20" : "size-12",
                    )}
                >
                    <Play aria-hidden="true" className={size === "lg" ? "size-8" : "size-5"} />
                </span>
            </span>
            <span className="absolute inset-x-4 bottom-3 flex items-end justify-between gap-3">
                <span className={cn("font-semibold text-fg", size === "lg" ? "text-xl" : "text-sm")}>{film.title}</span>
                {film.seconds ? <span className="text-xs tabular-nums text-muted">{formatDuration(film.seconds)}</span> : null}
            </span>
        </button>
    );
}
```

`src/components/films/VideoLightbox.tsx`:
```tsx
"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { Film } from "@/data/content";

type Props = {
    playlist: readonly Film[];
    index: number | null;
    onClose: () => void;
    onIndex: (index: number) => void;
};

export function VideoLightbox({ playlist, index, onClose, onIndex }: Props) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const returnFocus = useRef<HTMLElement | null>(null);
    const film = index === null ? null : playlist[index];
    const next = index !== null && index < playlist.length - 1 ? index + 1 : null;

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (film && !dialog.open) {
            returnFocus.current = document.activeElement as HTMLElement | null;
            dialog.showModal();
        }
        if (!film && dialog.open) dialog.close();
    }, [film]);

    return (
        <dialog
            ref={dialogRef}
            aria-label={film?.title ?? "Video"}
            onClose={() => {
                onClose();
                returnFocus.current?.focus();
            }}
            className="m-auto w-[min(1100px,94vw)] rounded-2xl border border-white/10 bg-ink-1 p-0 text-fg shadow-2xl backdrop:bg-ink-0/85 backdrop:backdrop-blur-sm"
        >
            {film ? (
                <div className="p-4 sm:p-6">
                    <div className="mb-4 flex items-center justify-between gap-4">
                        <h2 className="text-lg font-semibold">{film.title}</h2>
                        <button
                            type="button"
                            onClick={() => dialogRef.current?.close()}
                            aria-label="Close video"
                            className="grid size-10 place-items-center rounded-full border border-white/15 hover:border-gold hover:text-gold"
                        >
                            <X aria-hidden="true" className="size-5" />
                        </button>
                    </div>
                    <video
                        key={film.src}
                        src={film.src}
                        poster={film.poster}
                        controls
                        autoPlay
                        playsInline
                        preload="metadata"
                        onEnded={() => next !== null && onIndex(next)}
                        className="aspect-video w-full rounded-xl bg-black"
                    />
                    {next !== null ? (
                        <div className="mt-4 flex justify-end">
                            <button
                                type="button"
                                onClick={() => onIndex(next)}
                                className="rounded-full border border-gold/60 px-4 py-2 text-sm font-semibold text-gold hover:bg-gold hover:text-ink-0"
                            >
                                Next: {playlist[next].title}
                            </button>
                        </div>
                    ) : null}
                </div>
            ) : null}
        </dialog>
    );
}
```

`src/components/films/film-player.tsx`:
```tsx
"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Film } from "@/data/content";
import { VideoLightbox } from "./VideoLightbox";

type FilmPlayer = { open: (playlist: readonly Film[], index: number) => void };

const FilmPlayerContext = createContext<FilmPlayer | null>(null);

export function FilmPlayerProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<{ playlist: readonly Film[]; index: number } | null>(null);
    const open = useCallback((playlist: readonly Film[], index: number) => setState({ playlist, index }), []);
    const value = useMemo(() => ({ open }), [open]);
    return (
        <FilmPlayerContext value={value}>
            {children}
            <VideoLightbox
                playlist={state?.playlist ?? []}
                index={state?.index ?? null}
                onClose={() => setState(null)}
                onIndex={(index) => setState((s) => (s ? { ...s, index } : s))}
            />
        </FilmPlayerContext>
    );
}

export function useFilmPlayer(): FilmPlayer {
    const player = useContext(FilmPlayerContext);
    if (!player) throw new Error("useFilmPlayer must be used inside FilmPlayerProvider");
    return player;
}
```

`src/components/films/CommercialsSection.tsx`:
```tsx
"use client";

import { FEATURED_FILM, MODULE_COMMERCIALS } from "@/data/content";
import { SectionHeading } from "../SectionHeading";
import { useFilmPlayer } from "./film-player";
import { VideoTile } from "./VideoTile";

export function CommercialsSection() {
    const { open } = useFilmPlayer();
    return (
        <section id="films" aria-labelledby="films-title" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
            <SectionHeading
                id="films-title"
                eyebrow="Films"
                title="See Changenius in motion"
                lead="Two minutes on the whole idea, then one short film per module."
            />
            <VideoTile film={FEATURED_FILM} size="lg" onPlay={() => open([FEATURED_FILM], 0)} />
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {MODULE_COMMERCIALS.map((film, i) => (
                    <VideoTile key={film.src} film={film} onPlay={() => open(MODULE_COMMERCIALS, i)} />
                ))}
            </div>
        </section>
    );
}
```

`src/components/films/DemosSection.tsx`:
```tsx
"use client";

import { DEMO_GROUPS } from "@/data/content";
import { SectionHeading } from "../SectionHeading";
import { useFilmPlayer } from "./film-player";
import { VideoTile } from "./VideoTile";

export function DemosSection() {
    const { open } = useFilmPlayer();
    return (
        <section id="demos" aria-labelledby="demos-title" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
            <SectionHeading
                id="demos-title"
                eyebrow="Demos"
                title="Walk through the platform"
                lead="Real screens, chapter by chapter. Start anywhere."
            />
            <div className="space-y-14">
                {DEMO_GROUPS.map((group) => (
                    <div key={group.id} aria-labelledby={`${group.id}-title`} role="group">
                        <h3 id={`${group.id}-title`} className="text-xl font-semibold text-fg">
                            {group.title}
                        </h3>
                        <p className="mt-1 text-muted">{group.lead}</p>
                        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {group.chapters.map((film, i) => (
                                <VideoTile key={film.src} film={film} onPlay={() => open(group.chapters, i)} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
```

`src/app/page.tsx`:
```tsx
import { CommercialsSection } from "@/components/films/CommercialsSection";
import { DemosSection } from "@/components/films/DemosSection";
import { FilmPlayerProvider } from "@/components/films/film-player";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SignInPanel } from "@/components/SignInPanel";

export default function Home() {
    return (
        <FilmPlayerProvider>
            <Header />
            <main id="main" className="pt-16">
                <CommercialsSection />
                <SignInPanel />
                <DemosSection />
            </main>
            <Footer />
        </FilmPlayerProvider>
    );
}
```

- [ ] **Step 5: Run the tests and watch them pass**

Run: `npx playwright test e2e/films.spec.ts e2e/shell.spec.ts && npm run lint`
Expected: PASS on both projects; lint is clean.

- [ ] **Step 6: Commit**

```bash
git add src/lib/format-duration* src/components/films src/app/page.tsx e2e/films.spec.ts
git commit -m "feat: commercial and demo films with a shared full-screen viewer

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Hero planners (morph, timeline, orbit)

**Files:**
- Create: `src/components/hero/morph.ts`, `src/components/hero/timeline.ts`, `src/components/hero/orbit.ts`, `src/components/hero/planners.test.ts`

**Interfaces:**
- Consumes: `NAME`, `BURST`, `CLOSE`, `INTRO_STATEMENT` (Task 2).
- Produces:
  - `type MorphLetter = { char: string; from: number | null }`
  - `planMorph(name: string, word: string): MorphLetter[]`
  - `type Phase = { kind: "intro" } | { kind: "word"; index: number } | { kind: "close" }`
  - `type Step = { phase: Phase; ms: number }`
  - `TIMING = { intro: 2400, word: 5000, close: 6000, flyOut: 750, morphIn: 600 }`
  - `buildCycle(wordCount: number): Step[]`
  - `launchedCount(phase: Phase, wordCount: number): number`
  - `statementFor(phase: Phase): string`
  - `wordFor(phase: Phase): string | null`
  - `ORBIT_RADII`, `ORBIT_SCALE = 110`, `ORBIT_FLATTEN = 0.32`
  - `angularSpeed(radius: number): number` (radians per second)
  - `orbitPoint(radius: number, angle: number): { x: number; y: number }`

- [ ] **Step 1: Write the failing tests**

`src/components/hero/planners.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { BURST, CLOSE, INTRO_STATEMENT, NAME } from "@/data/content";
import { planMorph } from "./morph";
import { ORBIT_FLATTEN, ORBIT_RADII, ORBIT_SCALE, angularSpeed, orbitPoint } from "./orbit";
import { TIMING, buildCycle, launchedCount, statementFor, wordFor } from "./timeline";

describe("planMorph", () => {
    it("reuses each name letter once, left to right", () => {
        expect(planMorph(NAME, "CHANGE").map((l) => l.from)).toEqual([0, 1, 2, 3, 4, 5]);
        expect(planMorph(NAME, "GENIUS").map((l) => l.from)).toEqual([4, 5, 3, 7, 8, 9]);
        expect(planMorph(NAME, "CHAIN").map((l) => l.from)).toEqual([0, 1, 2, 7, 3]);
    });

    it("marks letters the name cannot supply as guests", () => {
        expect(planMorph(NAME, "AGENTIC AI")).toEqual([
            { char: "A", from: 2 },
            { char: "G", from: 4 },
            { char: "E", from: 5 },
            { char: "N", from: 3 },
            { char: "T", from: null },
            { char: "I", from: 7 },
            { char: "C", from: 0 },
            { char: " ", from: null },
            { char: "A", from: null },
            { char: "I", from: null },
        ]);
    });
});

describe("timeline", () => {
    it("runs intro, one step per word, then the close", () => {
        const cycle = buildCycle(BURST.length);
        expect(cycle.map((s) => s.phase.kind)).toEqual(["intro", "word", "word", "word", "word", "word", "close"]);
        expect(cycle.reduce((t, s) => t + s.ms, 0)).toBe(TIMING.intro + 5 * TIMING.word + TIMING.close);
    });

    it("counts launched planets", () => {
        expect(launchedCount({ kind: "intro" }, 5)).toBe(0);
        expect(launchedCount({ kind: "word", index: 3 }, 5)).toBe(3);
        expect(launchedCount({ kind: "close" }, 5)).toBe(5);
    });

    it("picks the statement and word for each phase", () => {
        expect(statementFor({ kind: "intro" })).toBe(INTRO_STATEMENT);
        expect(statementFor({ kind: "word", index: 2 })).toBe(BURST[2].statement);
        expect(statementFor({ kind: "close" })).toBe(CLOSE.statement);
        expect(wordFor({ kind: "intro" })).toBeNull();
        expect(wordFor({ kind: "word", index: 4 })).toBe("GENIUS");
        expect(wordFor({ kind: "close" })).toBe("CHANGE IN US");
    });
});

describe("orbit", () => {
    it("has one orbit per word", () => {
        expect(ORBIT_RADII).toHaveLength(BURST.length);
    });

    it("turns outer orbits more slowly", () => {
        const speeds = ORBIT_RADII.map(angularSpeed);
        for (let i = 1; i < speeds.length; i++) expect(speeds[i]).toBeLessThan(speeds[i - 1]);
        expect(angularSpeed(ORBIT_RADII[0])).toBeCloseTo((2 * Math.PI) / 40);
    });

    it("places planets on a flattened ellipse", () => {
        expect(orbitPoint(3, 0)).toEqual({ x: 3 * ORBIT_SCALE, y: 0 });
        const top = orbitPoint(3, Math.PI / 2);
        expect(top.x).toBeCloseTo(0);
        expect(top.y).toBeCloseTo(3 * ORBIT_SCALE * ORBIT_FLATTEN);
    });
});
```

Run: `npx vitest run src/components/hero/planners.test.ts`. Expected: FAIL (imports not found).

- [ ] **Step 2: Implement the three planners**

`src/components/hero/morph.ts`:
```ts
export type MorphLetter = { char: string; from: number | null };

export function planMorph(name: string, word: string): MorphLetter[] {
    const used = new Set<number>();
    return [...word].map((char) => {
        if (char !== " ") {
            for (let i = 0; i < name.length; i++) {
                if (!used.has(i) && name[i] === char) {
                    used.add(i);
                    return { char, from: i };
                }
            }
        }
        return { char, from: null };
    });
}
```

`src/components/hero/timeline.ts`:
```ts
import { BURST, CLOSE, INTRO_STATEMENT } from "@/data/content";

export type Phase = { kind: "intro" } | { kind: "word"; index: number } | { kind: "close" };
export type Step = { phase: Phase; ms: number };

export const TIMING = { intro: 2400, word: 5000, close: 6000, flyOut: 750, morphIn: 600 } as const;

export function buildCycle(wordCount: number): Step[] {
    return [
        { phase: { kind: "intro" }, ms: TIMING.intro },
        ...Array.from({ length: wordCount }, (_, index): Step => ({ phase: { kind: "word", index }, ms: TIMING.word })),
        { phase: { kind: "close" }, ms: TIMING.close },
    ];
}

export function launchedCount(phase: Phase, wordCount: number): number {
    if (phase.kind === "intro") return 0;
    if (phase.kind === "close") return wordCount;
    return phase.index;
}

export function statementFor(phase: Phase): string {
    if (phase.kind === "intro") return INTRO_STATEMENT;
    if (phase.kind === "close") return CLOSE.statement;
    return BURST[phase.index].statement;
}

export function wordFor(phase: Phase): string | null {
    if (phase.kind === "intro") return null;
    if (phase.kind === "close") return CLOSE.word;
    return BURST[phase.index].word;
}
```

`src/components/hero/orbit.ts`:
```ts
export const ORBIT_RADII = [3.0, 3.9, 4.8, 5.7, 6.6] as const;
export const ORBIT_SCALE = 110;
export const ORBIT_FLATTEN = 0.32;

const INNER_PERIOD_SECONDS = 40;

export function angularSpeed(radius: number): number {
    return ((2 * Math.PI) / INNER_PERIOD_SECONDS) * Math.pow(ORBIT_RADII[0] / radius, 1.5);
}

export function orbitPoint(radius: number, angle: number): { x: number; y: number } {
    return {
        x: radius * ORBIT_SCALE * Math.cos(angle),
        y: radius * ORBIT_SCALE * ORBIT_FLATTEN * Math.sin(angle),
    };
}
```

- [ ] **Step 3: Run the tests and watch them pass**

Run: `npx vitest run src/components/hero/planners.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 4: Commit**

```bash
git add src/components/hero
git commit -m "feat: hero planners for letter morph, cycle timeline and orbits

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Cinematic hero

**Files:**
- Create: `public/hero/backdrop.mp4`, `public/hero/backdrop.webm`, `public/hero/backdrop-poster.webp`, `src/components/hero/hooks.ts`, `src/components/hero/NameMorph.tsx`, `src/components/hero/OrbitStage.tsx`, `src/components/hero/StatementRotator.tsx`, `src/components/hero/HeroActions.tsx`, `src/components/hero/HeroCinematic.tsx`, `e2e/hero.spec.ts`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: Task 6's planners; `useFilmPlayer` and `FEATURED_FILM` (Tasks 5 and 2); `SITE`, `NAME`, `BURST`, `CLOSE`.
- Produces:
  - `<HeroCinematic />`
  - `<AskAssistantButton />`, which scrolls to `#assistant` and focuses `#assistant-input` (Task 10 provides that input)

- [ ] **Step 1: Encode the backdrop assets** (sources are in the media folder; keep each video under about 3 MB)

```bash
mkdir -p public/hero
SRC="C:/CellGenius-PPM/ppm-media/marketing/exec-film/fal"
ffmpeg -y -i "$SRC/backdrop-video-1.mp4" -an -vf "scale=1920:-2,fps=30" -c:v libx264 -crf 30 -preset slow -pix_fmt yuv420p -movflags +faststart public/hero/backdrop.mp4
ffmpeg -y -i "$SRC/backdrop-video-1.mp4" -an -vf "scale=1920:-2,fps=30" -c:v libvpx-vp9 -crf 42 -b:v 0 -row-mt 1 public/hero/backdrop.webm
ffmpeg -y -i "$SRC/backdrop-still-1.png" -vf "scale=1920:-2" -c:v libwebp -quality 72 public/hero/backdrop-poster.webp
ls -la public/hero
```
Expected: three files. If an mp4 or webm is larger than 3.5 MB, raise `-crf` by 3 and encode it again.

- [ ] **Step 2: Write the failing e2e tests**

`e2e/hero.spec.ts`:
```ts
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    await page.route("**/media/**", (route) => route.fulfill({ status: 204 }));
});

test("the hero cycles the film's statements with no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => {
        if (m.type() === "error") errors.push(m.text());
    });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Changenius/);
    await expect(page.getByText("Meet Changenius.", { exact: true })).toBeVisible();
    await expect(page.getByText("Every change in your organisation, governed in one place.", { exact: true })).toBeVisible({ timeout: 8_000 });
    await expect(page.getByText("AI, grounded in your own policies.", { exact: true })).toBeVisible({ timeout: 8_000 });
    await expect(page.getByRole("button", { name: "Pause animation" })).toBeVisible();
    expect(errors.filter((e) => !/Failed to load resource|challenges\.cloudflare/.test(e))).toEqual([]);
});

test("Watch the film opens the featured film", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Watch the film" }).click();
    await expect(page.getByRole("dialog", { name: "The Changenius film" })).toBeVisible();
});

test.describe("reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("shows a still with every planet, and pause holds the statement", async ({ page }) => {
        await page.goto("/");
        for (const word of ["CHANGE", "AI", "AGENTIC AI", "CHAIN", "GENIUS"]) {
            await expect(page.locator("svg text", { hasText: new RegExp(`^${word}$`) })).toBeVisible();
        }
        await expect(page.locator("video[data-hero-backdrop]")).toHaveCount(0);
        await page.getByRole("button", { name: "Pause animation" }).click();
        const first = page.getByText("Every change in your organisation, governed in one place.", { exact: true });
        await expect(first).toBeVisible();
        await page.waitForTimeout(7_000);
        await expect(first).toBeVisible();
    });
});
```

Run: `npx playwright test e2e/hero.spec.ts --project=desktop`. Expected: FAIL (no h1).

- [ ] **Step 3: Write the hooks**

`src/components/hero/hooks.ts`:
```ts
"use client";

import { useEffect, useState, useSyncExternalStore, type RefObject } from "react";
import type { Step } from "./timeline";

function subscribeReducedMotion(onChange: () => void) {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
}

export function usePrefersReducedMotion(): boolean {
    return useSyncExternalStore(
        subscribeReducedMotion,
        () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        () => false,
    );
}

function subscribeVisibility(onChange: () => void) {
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
}

export function usePageVisible(): boolean {
    return useSyncExternalStore(subscribeVisibility, () => document.visibilityState === "visible", () => true);
}

export function useInView(ref: RefObject<Element | null>): boolean {
    const [inView, setInView] = useState(true);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.15 });
        observer.observe(el);
        return () => observer.disconnect();
    }, [ref]);
    return inView;
}

export function useCycle(steps: readonly Step[], running: boolean): Step {
    const [index, setIndex] = useState(0);
    useEffect(() => {
        if (!running) return;
        const timer = window.setTimeout(() => setIndex((i) => (i + 1) % steps.length), steps[index].ms);
        return () => window.clearTimeout(timer);
    }, [index, running, steps]);
    return steps[index];
}
```

- [ ] **Step 4: Write the visual components**

`src/components/hero/NameMorph.tsx`:
```tsx
"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { NAME } from "@/data/content";
import { cn } from "@/lib/cn";
import { planMorph } from "./morph";
import { TIMING, wordFor, type Phase } from "./timeline";

const AI_LETTERS = new Set([2, 7]);
const EASE_OUT = "cubic-bezier(0.2, 0.7, 0.2, 1)";

export function NameMorph({ phase, running }: { phase: Phase; running: boolean }) {
    const nameRow = useRef<HTMLDivElement>(null);
    const wordRow = useRef<HTMLDivElement>(null);
    const word = wordFor(phase);
    const plan = useMemo(() => (word ? planMorph(NAME, word) : []), [word]);
    const key = phase.kind === "word" ? `word-${phase.index}` : phase.kind;

    useLayoutEffect(() => {
        const nameEl = nameRow.current;
        if (!nameEl || !running) return;
        const animations: Animation[] = [];
        const timers: number[] = [];

        if (phase.kind === "intro") {
            animations.push(
                nameEl.animate(
                    [
                        { opacity: 0, letterSpacing: "0.3em", filter: "blur(8px)" },
                        { opacity: 1, letterSpacing: "0.02em", filter: "blur(0px)" },
                    ],
                    { duration: 900, delay: 1500, easing: EASE_OUT, fill: "backwards" },
                ),
            );
        } else if (wordRow.current) {
            const wordEl = wordRow.current;
            const nameLetters = Array.from(nameEl.children) as HTMLElement[];
            const wordLetters = Array.from(wordEl.children) as HTMLElement[];
            const scale = parseFloat(getComputedStyle(nameEl).fontSize) / parseFloat(getComputedStyle(wordEl).fontSize);

            animations.push(nameEl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: "ease-out", fill: "backwards" }));
            plan.forEach((letter, i) => {
                const el = wordLetters[i];
                if (!el || letter.char === " ") return;
                if (letter.from === null) {
                    animations.push(
                        el.animate([{ opacity: 0, transform: "translateY(0.3em)" }, { opacity: 1, transform: "none" }], {
                            duration: 450,
                            delay: 350,
                            easing: "ease-out",
                            fill: "backwards",
                        }),
                    );
                    return;
                }
                const from = nameLetters[letter.from].getBoundingClientRect();
                const to = el.getBoundingClientRect();
                const dx = from.left + from.width / 2 - (to.left + to.width / 2);
                const dy = from.top + from.height / 2 - (to.top + to.height / 2);
                animations.push(
                    el.animate([{ transform: `translate(${dx}px, ${dy}px) scale(${scale})`, color: "#eef2f8" }, { transform: "none" }], {
                        duration: TIMING.morphIn,
                        easing: EASE_OUT,
                        fill: "backwards",
                    }),
                );
            });

            if (phase.kind === "word") {
                timers.push(
                    window.setTimeout(() => {
                        animations.push(
                            wordEl.animate(
                                [
                                    { opacity: 1, transform: "none" },
                                    { opacity: 0, transform: "translateY(-40%) scale(0.12)" },
                                ],
                                { duration: TIMING.flyOut, easing: "cubic-bezier(0.6, 0, 0.8, 0.4)", fill: "forwards" },
                            ),
                            nameEl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 350, easing: "ease-out", fill: "forwards" }),
                        );
                    }, TIMING.word - TIMING.flyOut - 50),
                );
            }
        }

        return () => {
            timers.forEach((t) => window.clearTimeout(t));
            animations.forEach((a) => a.cancel());
        };
    }, [phase, plan, running]);

    return (
        <div className="relative grid place-items-center" aria-hidden="true">
            {phase.kind === "intro" ? (
                <p className="absolute -top-14 animate-meet text-sm font-semibold uppercase tracking-[0.6em] text-gold">Meet</p>
            ) : null}
            <div
                ref={nameRow}
                className={cn(
                    "flex font-extrabold leading-none tracking-[0.02em] text-[clamp(2.25rem,7vw,4.5rem)] [grid-area:1/1]",
                    phase.kind === "intro" ? "opacity-100" : "opacity-0",
                )}
            >
                {[...NAME].map((char, i) => (
                    <span key={i} className={AI_LETTERS.has(i) ? "text-peri" : "text-fg"}>
                        {char}
                    </span>
                ))}
            </div>
            {word ? (
                <div
                    key={key}
                    ref={wordRow}
                    className="flex whitespace-pre font-extrabold leading-none text-gold text-[clamp(2.75rem,11vw,7.5rem)] [grid-area:1/1] [text-shadow:0_0_32px_rgba(212,175,106,0.55)]"
                >
                    {plan.map((letter, i) => (
                        <span key={i} className={letter.from === null && letter.char !== " " ? "text-fg" : undefined}>
                            {letter.char}
                        </span>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
```

`src/components/hero/OrbitStage.tsx`:
```tsx
"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { ORBIT_FLATTEN, ORBIT_RADII, ORBIT_SCALE, angularSpeed, orbitPoint } from "./orbit";

export function OrbitStage({ launched, running, labels }: { launched: number; running: boolean; labels: readonly string[] }) {
    const planets = useRef<(SVGGElement | null)[]>([]);
    const angles = useRef(ORBIT_RADII.map((_, i) => -Math.PI / 2 + i * 1.3));

    useEffect(() => {
        const place = () =>
            ORBIT_RADII.forEach((radius, i) => {
                const { x, y } = orbitPoint(radius, angles.current[i]);
                planets.current[i]?.setAttribute("transform", `translate(${x} ${y})`);
            });
        place();
        if (!running) return;
        let frame = 0;
        let last = performance.now();
        const tick = (now: number) => {
            const dt = Math.min(0.05, (now - last) / 1000);
            last = now;
            ORBIT_RADII.forEach((radius, i) => {
                angles.current[i] += angularSpeed(radius) * dt;
            });
            place();
            frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [running]);

    return (
        <svg
            viewBox="-800 -300 1600 600"
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 w-[min(1600px,180vw)] -translate-x-1/2 -translate-y-1/2"
        >
            <defs>
                <radialGradient id="planet-gold" cx="35%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#f0d29a" />
                    <stop offset="55%" stopColor="#c39a55" />
                    <stop offset="100%" stopColor="#1b2540" />
                </radialGradient>
                <radialGradient id="planet-peri" cx="35%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#c7cdfd" />
                    <stop offset="55%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#101828" />
                </radialGradient>
            </defs>
            <g transform="rotate(-6)">
                {ORBIT_RADII.map((radius) => (
                    <ellipse
                        key={radius}
                        rx={radius * ORBIT_SCALE}
                        ry={radius * ORBIT_SCALE * ORBIT_FLATTEN}
                        fill="none"
                        stroke="#D4AF6A"
                        strokeOpacity={0.28}
                        strokeWidth={1.2}
                    />
                ))}
                {ORBIT_RADII.map((radius, i) => (
                    <g
                        key={radius}
                        ref={(el) => {
                            planets.current[i] = el;
                        }}
                        className={cn("transition-opacity duration-700", i < launched ? "opacity-100" : "opacity-0")}
                    >
                        <circle r={9 + i * 1.5} fill={`url(#planet-${i % 2 ? "peri" : "gold"})`} />
                        <text y={30 + i * 1.5} textAnchor="middle" className="fill-muted text-[13px] font-semibold tracking-[0.25em]">
                            {labels[i]}
                        </text>
                    </g>
                ))}
            </g>
        </svg>
    );
}
```

`src/components/hero/StatementRotator.tsx`:
```tsx
export function StatementRotator({ text }: { text: string }) {
    return (
        <p
            aria-live="off"
            className="min-h-[2.6em] max-w-4xl text-balance text-center text-[clamp(1.6rem,4.2vw,3.4rem)] font-semibold leading-tight tracking-tight text-fg"
        >
            <span key={text} className="block animate-statement">
                {text}
            </span>
        </p>
    );
}
```

`src/components/hero/HeroActions.tsx`:
```tsx
"use client";

import { LogIn, MessageSquareText, Play } from "lucide-react";
import { FEATURED_FILM, SITE } from "@/data/content";
import { useFilmPlayer } from "../films/film-player";

export function AskAssistantButton() {
    return (
        <button
            type="button"
            onClick={() => {
                const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                document.getElementById("assistant")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
                window.setTimeout(() => document.getElementById("assistant-input")?.focus({ preventScroll: true }), reduce ? 0 : 600);
            }}
            className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 font-semibold text-ink-0 transition-colors hover:bg-gold-hi focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
        >
            <MessageSquareText aria-hidden="true" className="size-5" />
            Ask the EPMO AI Assistant
        </button>
    );
}

export function HeroActions() {
    const { open } = useFilmPlayer();
    const outline =
        "inline-flex items-center gap-2 rounded-full border border-gold/60 px-6 py-3 font-semibold text-gold transition-colors hover:bg-gold hover:text-ink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold";
    return (
        <div className="flex flex-wrap items-center justify-center gap-3">
            <AskAssistantButton />
            <button type="button" onClick={() => open([FEATURED_FILM], 0)} className={outline}>
                <Play aria-hidden="true" className="size-5" />
                Watch the film
            </button>
            <a href={SITE.appLoginUrl} className={outline}>
                <LogIn aria-hidden="true" className="size-5" />
                Sign in
            </a>
        </div>
    );
}
```

`src/components/hero/HeroCinematic.tsx`:
```tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { BURST, CLOSE } from "@/data/content";
import { HeroActions } from "./HeroActions";
import { useCycle, useInView, usePageVisible, usePrefersReducedMotion } from "./hooks";
import { NameMorph } from "./NameMorph";
import { OrbitStage } from "./OrbitStage";
import { StatementRotator } from "./StatementRotator";
import { buildCycle, launchedCount, statementFor, type Phase } from "./timeline";

const LABELS = BURST.map((b) => b.word);
const STILL_PHASE: Phase = { kind: "intro" };
const STILL_STEP_MS = 6000;

export function HeroCinematic() {
    const ref = useRef<HTMLElement>(null);
    const reduced = usePrefersReducedMotion();
    const inView = useInView(ref);
    const visible = usePageVisible();
    const [paused, setPaused] = useState(false);
    const running = !paused && inView && visible;

    return (
        <section ref={ref} aria-labelledby="hero-title" className="relative isolate flex min-h-[calc(100dvh-4rem)] flex-col overflow-hidden">
            <h1 id="hero-title" className="sr-only">
                Changenius — every change in your organisation, governed in one place
            </h1>
            <Backdrop reduced={reduced} running={running} />
            {reduced ? <HeroStill paused={paused} /> : <HeroMotion running={running} />}
            <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                aria-label={paused ? "Play animation" : "Pause animation"}
                className="absolute bottom-6 right-6 grid size-11 place-items-center rounded-full border border-white/15 bg-ink-0/50 text-muted backdrop-blur hover:border-gold hover:text-gold"
            >
                {paused ? <Play aria-hidden="true" className="size-4" /> : <Pause aria-hidden="true" className="size-4" />}
            </button>
        </section>
    );
}

function HeroLayout({ statement, stage }: { statement: string; stage: React.ReactNode }) {
    return (
        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-4 pb-20 pt-12 sm:px-6">
            <StatementRotator text={statement} />
            <div className="relative grid w-full flex-1 place-items-center py-10">{stage}</div>
            <HeroActions />
        </div>
    );
}

function HeroMotion({ running }: { running: boolean }) {
    const steps = useMemo(() => buildCycle(BURST.length), []);
    const step = useCycle(steps, running);
    return (
        <HeroLayout
            statement={statementFor(step.phase)}
            stage={
                <>
                    <OrbitStage launched={launchedCount(step.phase, BURST.length)} running={running} labels={LABELS} />
                    <NameMorph phase={step.phase} running={running} />
                </>
            }
        />
    );
}

function HeroStill({ paused }: { paused: boolean }) {
    const statements = useMemo(() => [...BURST.map((b) => b.statement), CLOSE.statement], []);
    const [index, setIndex] = useState(0);
    useEffect(() => {
        if (paused) return;
        const timer = window.setTimeout(() => setIndex((i) => (i + 1) % statements.length), STILL_STEP_MS);
        return () => window.clearTimeout(timer);
    }, [index, paused, statements.length]);
    return (
        <HeroLayout
            statement={statements[index]}
            stage={
                <>
                    <OrbitStage launched={BURST.length} running={false} labels={LABELS} />
                    <NameMorph phase={STILL_PHASE} running={false} />
                </>
            }
        />
    );
}

function Backdrop({ reduced, running }: { reduced: boolean; running: boolean }) {
    const video = useRef<HTMLVideoElement>(null);
    useEffect(() => {
        const el = video.current;
        if (!el) return;
        if (running) void el.play().catch(() => undefined);
        else el.pause();
    }, [running]);
    return (
        <div aria-hidden="true" className="absolute inset-0 -z-10">
            {reduced ? (
                <div className="size-full bg-[url(/hero/backdrop-poster.webp)] bg-cover bg-center opacity-60" />
            ) : (
                <video
                    ref={video}
                    data-hero-backdrop
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    poster="/hero/backdrop-poster.webp"
                    className="size-full object-cover opacity-60"
                >
                    <source src="/hero/backdrop.webm" type="video/webm" />
                    <source src="/hero/backdrop.mp4" type="video/mp4" />
                </video>
            )}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(3,6,12,0.55)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-ink-0" />
        </div>
    );
}
```

Add the hero to `src/app/page.tsx`. Import `HeroCinematic` from `@/components/hero/HeroCinematic` and put `<HeroCinematic />` as the first child of `<main>`, before `<CommercialsSection />`.

- [ ] **Step 5: Run the tests and watch them pass**

Run: `npx playwright test e2e/hero.spec.ts e2e/films.spec.ts && npx vitest run src/components/hero && npm run lint`
Expected: PASS on both projects.

- [ ] **Step 6: Look at it**

Run `npm run dev` and open `http://localhost:3000` in the browser pane. Watch one full cycle (about 33 s). Check that the letters move from the name into each word, that guest letters arrive in white, that words fly out, that planets appear one by one, and that "CHANGE IN US" closes the cycle. Check it at 390 px wide as well. Fix anything that clips or jumps before you commit.

- [ ] **Step 7: Commit**

```bash
git add public/hero src/components/hero src/app/page.tsx e2e/hero.spec.ts
git commit -m "feat: cinematic hero with letter morph, orbiting planets and rotating statements

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Assistant wire contract and server libraries

This task fixes the **wire contract with the app (Plan B must match it byte for byte).** The website POSTs JSON to `APP_ASSISTANT_URL` with these headers:
- `content-type: application/json`
- `x-cg-timestamp`: Unix milliseconds, as a string
- `x-cg-nonce`: 32 hex characters
- `x-cg-signature`: lowercase hex HMAC-SHA256, keyed with `WEBSITE_ASSISTANT_SECRET`, over `METHOD\nPATH\nTIMESTAMP\nNONCE\nBODY`, where PATH is the URL pathname and BODY is the exact raw body string

The body is an `AppCall`. The app answers `200 application/x-ndjson`, one `AppEvent` JSON per line, and ends with `{"type":"done"}`. It answers `429` when limited, and any other status for a failure.

**Files:**
- Create: `src/lib/assistant/protocol.ts`, `ndjson.ts`, `sign.ts`, `cookie.ts`, `turnstile.ts`, `rate-limit.ts`, `client-ip.ts`, `env.ts`, and `src/lib/assistant/assistant-lib.test.ts`

**Interfaces:**
- Produces:
  - `ClientRequestSchema` and `ClientRequest`
  - `AppCall`
  - `ProposalSchema` and `Proposal`
  - `AppEventSchema` and `AppEvent`
  - `FallbackReason = "limit" | "ceiling" | "unavailable" | "expired"`
  - `MAX_MESSAGE = 1000`
  - `createLineSplitter(): TransformStream<string, string>`
  - `parseEventLine(line: string): AppEvent | null`
  - `encodeEvent(e: AppEvent): string`
  - `filterEventStream(body: ReadableStream<Uint8Array>): ReadableStream<Uint8Array>`
  - `signatureBase(p: SignInput): string` and `sign(secret: string, p: SignInput): string`
  - `signedHeaders(secret: string, method: string, url: string, body: string, now?: number): Record<string, string>`
  - `COOKIE_NAME = "cg_assistant"` and `COOKIE_TTL_MS`
  - `issueConversation(secret: string, now?: number): { conversationId: string; value: string; expiresAt: number }`
  - `readConversation(secret: string, value: string | undefined, now?: number): string | null`
  - `cookieHeader(value: string, secure: boolean): string`
  - `verifyTurnstile(token: string, secret: string, ip: string | null): Promise<boolean>`
  - `createTokenBucket(opts: { capacity: number; refillPerMinute: number; maxKeys?: number }): { take(key: string, now?: number): boolean }`
  - `clientIp(headers: Headers): string | null` and `hashIp(ip: string | null, salt: string): string`
  - `readAssistantEnv(source?: NodeJS.ProcessEnv): AssistantEnv | null`

- [ ] **Step 1: Write the failing tests**

`src/lib/assistant/assistant-lib.test.ts`:
```ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { clientIp, hashIp } from "./client-ip";
import { COOKIE_TTL_MS, cookieHeader, issueConversation, readConversation } from "./cookie";
import { readAssistantEnv } from "./env";
import { createLineSplitter, encodeEvent, filterEventStream, parseEventLine } from "./ndjson";
import { AppEventSchema, ClientRequestSchema } from "./protocol";
import { createTokenBucket } from "./rate-limit";
import { sign, signedHeaders } from "./sign";
import { TURNSTILE_VERIFY_URL, verifyTurnstile } from "./turnstile";

afterEach(() => vi.unstubAllGlobals());

const streamOf = (text: string) =>
    new ReadableStream<Uint8Array>({
        start(c) {
            c.enqueue(new TextEncoder().encode(text));
            c.close();
        },
    });

describe("sign", () => {
    it("matches the shared test vector that the app must also pass", () => {
        expect(
            sign("test-secret", {
                method: "POST",
                path: "/api/public/website-assistant",
                timestamp: "1700000000000",
                nonce: "00112233445566778899aabbccddeeff",
                body: '{"conversationId":"c1","kind":"message","message":"hi","ipHash":"h","userAgent":"ua"}',
            }),
        ).toBe("a9ac0a9487b475385de7b5ff4028da33937af898ae228925e970998783237328");
    });

    it("builds headers whose signature verifies", () => {
        const body = '{"x":1}';
        const h = signedHeaders("s3cret", "POST", "https://app.test/api/public/website-assistant", body, 1700000000000);
        expect(h["x-cg-timestamp"]).toBe("1700000000000");
        expect(h["x-cg-nonce"]).toMatch(/^[0-9a-f]{32}$/);
        expect(h["x-cg-signature"]).toBe(
            sign("s3cret", { method: "POST", path: "/api/public/website-assistant", timestamp: "1700000000000", nonce: h["x-cg-nonce"], body }),
        );
    });
});

describe("conversation cookie", () => {
    const secret = "k".repeat(32);
    it("round-trips and expires", () => {
        const c = issueConversation(secret, 1000);
        expect(readConversation(secret, c.value, 1001)).toBe(c.conversationId);
        expect(readConversation(secret, c.value, 1000 + COOKIE_TTL_MS + 1)).toBeNull();
    });
    it("rejects tampering and other secrets", () => {
        const c = issueConversation(secret, 1000);
        const [id, exp, mac] = c.value.split(".");
        expect(readConversation(secret, `${id}.${Number(exp) + 99999}.${mac}`, 1001)).toBeNull();
        expect(readConversation("x".repeat(32), c.value, 1001)).toBeNull();
        expect(readConversation(secret, undefined)).toBeNull();
        expect(readConversation(secret, "garbage")).toBeNull();
    });
    it("is HttpOnly, SameSite=Strict and scoped to the route", () => {
        const header = cookieHeader("v", true);
        expect(header).toContain("cg_assistant=v");
        expect(header).toContain("HttpOnly");
        expect(header).toContain("SameSite=Strict");
        expect(header).toContain("Path=/api/assistant");
        expect(header).toContain("Secure");
        expect(cookieHeader("v", false)).not.toContain("Secure");
    });
});

describe("protocol", () => {
    it("caps messages at 1000 characters", () => {
        expect(ClientRequestSchema.safeParse({ action: "message", message: "a".repeat(1000) }).success).toBe(true);
        expect(ClientRequestSchema.safeParse({ action: "message", message: "a".repeat(1001) }).success).toBe(false);
        expect(ClientRequestSchema.safeParse({ action: "message", message: "   " }).success).toBe(false);
    });
    it("only accepts known event types", () => {
        expect(AppEventSchema.safeParse({ type: "delta", text: "hi" }).success).toBe(true);
        expect(AppEventSchema.safeParse({ type: "html", text: "<b>" }).success).toBe(false);
    });
});

describe("ndjson", () => {
    it("splits chunks into lines across boundaries", async () => {
        const out: string[] = [];
        const writer = new WritableStream<string>({ write: (l) => void out.push(l) });
        const source = new ReadableStream<string>({
            start(c) {
                c.enqueue('{"type":"del');
                c.enqueue('ta","text":"a"}\n{"type":"done"}');
                c.close();
            },
        });
        await source.pipeThrough(createLineSplitter()).pipeTo(writer);
        expect(out).toEqual(['{"type":"delta","text":"a"}', '{"type":"done"}']);
    });
    it("drops lines that are not valid events", async () => {
        const text = [encodeEvent({ type: "delta", text: "ok" }).trim(), "<script>", '{"type":"evil"}', '{"type":"done"}'].join("\n");
        const filtered = await new Response(filterEventStream(streamOf(text))).text();
        expect(filtered.trim().split("\n").map((l) => parseEventLine(l))).toEqual([{ type: "delta", text: "ok" }, { type: "done" }]);
    });
});

describe("rate limit", () => {
    it("allows the capacity, then refills over time, per key", () => {
        const bucket = createTokenBucket({ capacity: 2, refillPerMinute: 60 });
        expect(bucket.take("a", 0)).toBe(true);
        expect(bucket.take("a", 0)).toBe(true);
        expect(bucket.take("a", 0)).toBe(false);
        expect(bucket.take("b", 0)).toBe(true);
        expect(bucket.take("a", 1000)).toBe(true);
    });
});

describe("client ip", () => {
    it("prefers x-real-ip, then the first forwarded address, and hashes with a salt", () => {
        expect(clientIp(new Headers({ "x-real-ip": "203.0.113.7" }))).toBe("203.0.113.7");
        expect(clientIp(new Headers({ "x-forwarded-for": "198.51.100.2, 10.0.0.1" }))).toBe("198.51.100.2");
        expect(clientIp(new Headers())).toBeNull();
        expect(hashIp("203.0.113.7", "salt-a")).toMatch(/^[0-9a-f]{64}$/);
        expect(hashIp("203.0.113.7", "salt-a")).not.toBe(hashIp("203.0.113.7", "salt-b"));
    });
});

describe("turnstile", () => {
    it("is true only when Cloudflare says success", async () => {
        const fetchMock = vi.fn().mockResolvedValueOnce(Response.json({ success: true })).mockResolvedValueOnce(Response.json({ success: false }));
        vi.stubGlobal("fetch", fetchMock);
        expect(await verifyTurnstile("tok", "sec", "203.0.113.7")).toBe(true);
        expect(await verifyTurnstile("tok", "sec", null)).toBe(false);
        expect(fetchMock.mock.calls[0][0]).toBe(TURNSTILE_VERIFY_URL);
        expect(String(fetchMock.mock.calls[0][1].body)).toContain("remoteip=203.0.113.7");
    });
    it("fails closed when Cloudflare is unreachable", async () => {
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
        expect(await verifyTurnstile("tok", "sec", null)).toBe(false);
    });
});

describe("env", () => {
    it("is null when anything is missing or too short", () => {
        expect(readAssistantEnv({})).toBeNull();
        expect(
            readAssistantEnv({
                TURNSTILE_SECRET_KEY: "t",
                ASSISTANT_COOKIE_SECRET: "c".repeat(32),
                IP_HASH_SALT: "s".repeat(16),
                WEBSITE_ASSISTANT_SECRET: "w".repeat(32),
                APP_ASSISTANT_URL: "https://app.test/api/public/website-assistant",
                SITE_ORIGIN: "https://site.test",
            }),
        ).not.toBeNull();
    });
});
```

Run: `npx vitest run src/lib/assistant`. Expected: FAIL (imports not found).

- [ ] **Step 2: Implement the libraries**

`src/lib/assistant/protocol.ts`:
```ts
import { z } from "zod";

export const MAX_MESSAGE = 1000;

export const ClientRequestSchema = z.discriminatedUnion("action", [
    z.object({ action: z.literal("start"), turnstileToken: z.string().min(1).max(2048) }),
    z.object({ action: z.literal("message"), message: z.string().trim().min(1).max(MAX_MESSAGE) }),
    z.object({ action: z.literal("confirm"), requestId: z.uuid() }),
]);
export type ClientRequest = z.infer<typeof ClientRequestSchema>;

export type AppCall =
    | { conversationId: string; kind: "message"; message: string; ipHash: string; userAgent: string }
    | { conversationId: string; kind: "confirm"; requestId: string; ipHash: string; userAgent: string };

export const ProposalSchema = z.object({
    requestId: z.uuid(),
    type: z.enum(["demo", "information", "contact"]),
    name: z.string().min(1).max(120),
    email: z.email().max(254),
    company: z.string().min(1).max(160),
    role: z.string().max(120).optional(),
    preferredTimes: z.string().max(200).optional(),
    timezone: z.string().max(64).optional(),
    message: z.string().max(1000),
});
export type Proposal = z.infer<typeof ProposalSchema>;

export const FallbackReasonSchema = z.enum(["limit", "ceiling", "unavailable", "expired"]);
export type FallbackReason = z.infer<typeof FallbackReasonSchema>;

export const AppEventSchema = z.discriminatedUnion("type", [
    z.object({ type: z.literal("delta"), text: z.string().max(4000) }),
    z.object({ type: z.literal("proposal"), request: ProposalSchema }),
    z.object({ type: z.literal("confirmed"), email: z.email().max(254) }),
    z.object({ type: z.literal("fallback"), reason: FallbackReasonSchema }),
    z.object({ type: z.literal("done") }),
]);
export type AppEvent = z.infer<typeof AppEventSchema>;
```

`src/lib/assistant/ndjson.ts`:
```ts
import { AppEventSchema, type AppEvent } from "./protocol";

export function createLineSplitter(): TransformStream<string, string> {
    let buffer = "";
    return new TransformStream<string, string>({
        transform(chunk, controller) {
            buffer += chunk;
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";
            for (const line of lines) if (line.trim()) controller.enqueue(line);
        },
        flush(controller) {
            if (buffer.trim()) controller.enqueue(buffer);
        },
    });
}

export function parseEventLine(line: string): AppEvent | null {
    try {
        const parsed = AppEventSchema.safeParse(JSON.parse(line));
        return parsed.success ? parsed.data : null;
    } catch {
        return null;
    }
}

export function encodeEvent(event: AppEvent): string {
    return `${JSON.stringify(event)}\n`;
}

export function filterEventStream(body: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
    return body
        .pipeThrough(new TextDecoderStream())
        .pipeThrough(createLineSplitter())
        .pipeThrough(
            new TransformStream<string, string>({
                transform(line, controller) {
                    const event = parseEventLine(line);
                    if (event) controller.enqueue(encodeEvent(event));
                },
            }),
        )
        .pipeThrough(new TextEncoderStream());
}
```

`src/lib/assistant/sign.ts`:
```ts
import { createHmac, randomBytes } from "node:crypto";

export type SignInput = { method: string; path: string; timestamp: string; nonce: string; body: string };

export function signatureBase(p: SignInput): string {
    return [p.method.toUpperCase(), p.path, p.timestamp, p.nonce, p.body].join("\n");
}

export function sign(secret: string, p: SignInput): string {
    return createHmac("sha256", secret).update(signatureBase(p)).digest("hex");
}

export function signedHeaders(secret: string, method: string, url: string, body: string, now = Date.now()): Record<string, string> {
    const timestamp = String(now);
    const nonce = randomBytes(16).toString("hex");
    const path = new URL(url).pathname;
    return {
        "content-type": "application/json",
        "x-cg-timestamp": timestamp,
        "x-cg-nonce": nonce,
        "x-cg-signature": sign(secret, { method, path, timestamp, nonce, body }),
    };
}
```

`src/lib/assistant/cookie.ts`:
```ts
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

export const COOKIE_NAME = "cg_assistant";
export const COOKIE_TTL_MS = 30 * 60 * 1000;

const mac = (secret: string, payload: string) => createHmac("sha256", secret).update(payload).digest("base64url");

export function issueConversation(secret: string, now = Date.now()) {
    const conversationId = randomUUID();
    const expiresAt = now + COOKIE_TTL_MS;
    const payload = `${conversationId}.${expiresAt}`;
    return { conversationId, expiresAt, value: `${payload}.${mac(secret, payload)}` };
}

export function readConversation(secret: string, value: string | undefined, now = Date.now()): string | null {
    if (!value) return null;
    const parts = value.split(".");
    if (parts.length !== 3) return null;
    const [conversationId, expires, given] = parts;
    const expected = Buffer.from(mac(secret, `${conversationId}.${expires}`));
    const actual = Buffer.from(given);
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
    return Number(expires) > now ? conversationId : null;
}

export function cookieHeader(value: string, secure: boolean): string {
    const parts = [`${COOKIE_NAME}=${value}`, "Path=/api/assistant", "HttpOnly", "SameSite=Strict", `Max-Age=${COOKIE_TTL_MS / 1000}`];
    if (secure) parts.push("Secure");
    return parts.join("; ");
}
```

`src/lib/assistant/turnstile.ts`:
```ts
export const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(token: string, secret: string, ip: string | null): Promise<boolean> {
    const form = new URLSearchParams({ secret, response: token });
    if (ip) form.set("remoteip", ip);
    try {
        const res = await fetch(TURNSTILE_VERIFY_URL, { method: "POST", body: form, signal: AbortSignal.timeout(8000) });
        if (!res.ok) return false;
        const data = (await res.json()) as { success?: unknown };
        return data.success === true;
    } catch {
        return false;
    }
}
```

`src/lib/assistant/rate-limit.ts`:
```ts
export type TokenBucket = { take(key: string, now?: number): boolean };

export function createTokenBucket(opts: { capacity: number; refillPerMinute: number; maxKeys?: number }): TokenBucket {
    const state = new Map<string, { tokens: number; at: number }>();
    const maxKeys = opts.maxKeys ?? 10_000;
    const perMs = opts.refillPerMinute / 60_000;
    return {
        take(key, now = Date.now()) {
            const prev = state.get(key);
            const tokens = prev ? Math.min(opts.capacity, prev.tokens + (now - prev.at) * perMs) : opts.capacity;
            if (!prev && state.size >= maxKeys) state.clear();
            if (tokens < 1) {
                state.set(key, { tokens, at: now });
                return false;
            }
            state.set(key, { tokens: tokens - 1, at: now });
            return true;
        },
    };
}
```

`src/lib/assistant/client-ip.ts`:
```ts
import { createHash } from "node:crypto";

export function clientIp(headers: Headers): string | null {
    const real = headers.get("x-real-ip")?.trim();
    if (real) return real;
    const first = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    return first || null;
}

export function hashIp(ip: string | null, salt: string): string {
    return createHash("sha256").update(`${salt}:${ip ?? "unknown"}`).digest("hex");
}
```

`src/lib/assistant/env.ts`:
```ts
import { z } from "zod";

const AssistantEnvSchema = z.object({
    TURNSTILE_SECRET_KEY: z.string().min(1),
    ASSISTANT_COOKIE_SECRET: z.string().min(32),
    IP_HASH_SALT: z.string().min(16),
    WEBSITE_ASSISTANT_SECRET: z.string().min(32),
    APP_ASSISTANT_URL: z.url(),
    SITE_ORIGIN: z.url(),
});

export type AssistantEnv = z.infer<typeof AssistantEnvSchema>;

export function readAssistantEnv(source: NodeJS.ProcessEnv = process.env): AssistantEnv | null {
    const parsed = AssistantEnvSchema.safeParse(source);
    return parsed.success ? parsed.data : null;
}
```

- [ ] **Step 3: Run the tests and watch them pass**

Run: `npx vitest run src/lib/assistant`
Expected: PASS (all describe blocks).

- [ ] **Step 4: Commit**

```bash
git add src/lib/assistant
git commit -m "feat: assistant wire contract, HMAC signing, cookie, Turnstile and limits

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: `/api/assistant` relay route

**Files:**
- Create: `src/app/api/assistant/route.ts`, `src/app/api/assistant/route.test.ts`

**Interfaces:**
- Consumes: everything from Task 8.
- Produces: `POST /api/assistant`, with these responses:
  - `{action:"start", turnstileToken}`: `200 {ok:true}` plus a cookie, or `403`
  - `{action:"message"|"confirm", …}`: `200 application/x-ndjson` (events), or `401 {error:"expired"}`
  - `403` for a wrong Origin, `400` for a bad body, `413` for a body over 4096 bytes, `503` when not configured

- [ ] **Step 1: Write the failing tests**

`src/app/api/assistant/route.test.ts`:
```ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { sign } from "@/lib/assistant/sign";

const ENV = {
    TURNSTILE_SECRET_KEY: "turnstile-secret",
    ASSISTANT_COOKIE_SECRET: "c".repeat(32),
    IP_HASH_SALT: "s".repeat(16),
    WEBSITE_ASSISTANT_SECRET: "w".repeat(32),
    APP_ASSISTANT_URL: "https://app.example.test/api/public/website-assistant",
    SITE_ORIGIN: "https://site.example.test",
};

const fetchMock = vi.fn();
let POST: (req: Request) => Promise<Response>;

beforeEach(async () => {
    vi.resetModules();
    vi.unstubAllEnvs();
    for (const [k, v] of Object.entries(ENV)) vi.stubEnv(k, v);
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    ({ POST } = await import("./route"));
});

function req(body: unknown, init: { origin?: string; cookie?: string } = {}) {
    const headers: Record<string, string> = {
        origin: init.origin ?? ENV.SITE_ORIGIN,
        "content-type": "application/json",
        "x-real-ip": "203.0.113.7",
        "user-agent": "vitest",
    };
    if (init.cookie) headers.cookie = init.cookie;
    return new Request("https://site.example.test/api/assistant", { method: "POST", headers, body: JSON.stringify(body) });
}

const ndjson = (lines: string[], status = 200) => new Response(`${lines.join("\n")}\n`, { status, headers: { "content-type": "application/x-ndjson" } });
const events = async (res: Response) => (await res.text()).trim().split("\n").map((l) => JSON.parse(l));

async function start(): Promise<string> {
    fetchMock.mockResolvedValueOnce(Response.json({ success: true }));
    const res = await POST(req({ action: "start", turnstileToken: "tok" }));
    expect(res.status).toBe(200);
    return res.headers.get("set-cookie")!.split(";")[0];
}

describe("POST /api/assistant", () => {
    it("refuses another origin", async () => {
        const res = await POST(req({ action: "start", turnstileToken: "tok" }, { origin: "https://evil.example" }));
        expect(res.status).toBe(403);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("refuses to start when Turnstile fails", async () => {
        fetchMock.mockResolvedValueOnce(Response.json({ success: false }));
        const res = await POST(req({ action: "start", turnstileToken: "tok" }));
        expect(res.status).toBe(403);
        expect(res.headers.get("set-cookie")).toBeNull();
    });

    it("issues a strict, HttpOnly, Secure cookie on start", async () => {
        fetchMock.mockResolvedValueOnce(Response.json({ success: true }));
        const res = await POST(req({ action: "start", turnstileToken: "tok" }));
        const cookie = res.headers.get("set-cookie")!;
        expect(cookie).toMatch(/HttpOnly/);
        expect(cookie).toMatch(/SameSite=Strict/);
        expect(cookie).toMatch(/Secure/);
    });

    it("asks for a new check without a valid cookie", async () => {
        const res = await POST(req({ action: "message", message: "hello" }, { cookie: "cg_assistant=forged.1.x" }));
        expect(res.status).toBe(401);
        expect(await res.json()).toEqual({ error: "expired" });
    });

    it("rejects an oversized message without calling the app", async () => {
        const cookie = await start();
        const res = await POST(req({ action: "message", message: "a".repeat(1001) }, { cookie }));
        expect(res.status).toBe(400);
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("forwards a signed call without the raw IP and passes only valid events", async () => {
        const cookie = await start();
        fetchMock.mockImplementationOnce(async (_url: string, init: RequestInit) => {
            const h = init.headers as Record<string, string>;
            const body = init.body as string;
            expect(h["x-cg-signature"]).toBe(
                sign(ENV.WEBSITE_ASSISTANT_SECRET, {
                    method: "POST",
                    path: "/api/public/website-assistant",
                    timestamp: h["x-cg-timestamp"],
                    nonce: h["x-cg-nonce"],
                    body,
                }),
            );
            const call = JSON.parse(body);
            expect(call).toMatchObject({ kind: "message", message: "hello", userAgent: "vitest" });
            expect(call.ipHash).toMatch(/^[0-9a-f]{64}$/);
            expect(body).not.toContain("203.0.113.7");
            return ndjson([JSON.stringify({ type: "delta", text: "Hi" }), "<script>alert(1)</script>", '{"type":"evil"}', '{"type":"done"}']);
        });
        const res = await POST(req({ action: "message", message: "hello" }, { cookie }));
        expect(res.headers.get("content-type")).toContain("application/x-ndjson");
        expect(await events(res)).toEqual([{ type: "delta", text: "Hi" }, { type: "done" }]);
    });

    it("turns an app failure into the unavailable fallback", async () => {
        const cookie = await start();
        fetchMock.mockResolvedValueOnce(new Response("boom", { status: 500 }));
        const res = await POST(req({ action: "message", message: "hello" }, { cookie }));
        expect(await events(res)).toEqual([{ type: "fallback", reason: "unavailable" }, { type: "done" }]);
    });

    it("turns an app 429 into the limit fallback", async () => {
        const cookie = await start();
        fetchMock.mockResolvedValueOnce(new Response("", { status: 429 }));
        const res = await POST(req({ action: "message", message: "hello" }, { cookie }));
        expect(await events(res)).toEqual([{ type: "fallback", reason: "limit" }, { type: "done" }]);
    });

    it("is unavailable when not configured", async () => {
        vi.stubEnv("WEBSITE_ASSISTANT_SECRET", "");
        vi.resetModules();
        ({ POST } = await import("./route"));
        const res = await POST(req({ action: "start", turnstileToken: "tok" }));
        expect(res.status).toBe(503);
    });
});
```

Run: `npx vitest run src/app/api/assistant`. Expected: FAIL (`./route` not found).

- [ ] **Step 2: Implement the route**

`src/app/api/assistant/route.ts`:
```ts
import { clientIp, hashIp } from "@/lib/assistant/client-ip";
import { COOKIE_NAME, cookieHeader, issueConversation, readConversation } from "@/lib/assistant/cookie";
import { readAssistantEnv } from "@/lib/assistant/env";
import { encodeEvent, filterEventStream } from "@/lib/assistant/ndjson";
import { ClientRequestSchema, type AppCall, type FallbackReason } from "@/lib/assistant/protocol";
import { createTokenBucket } from "@/lib/assistant/rate-limit";
import { signedHeaders } from "@/lib/assistant/sign";
import { verifyTurnstile } from "@/lib/assistant/turnstile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 4096;
const APP_TIMEOUT_MS = 35_000;
const NDJSON_HEADERS = { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store" };

// Best effort only: each serverless instance has its own memory. The app's limits are the ones that count.
const ipBucket = createTokenBucket({ capacity: 20, refillPerMinute: 10 });

function json(status: number, body: unknown, extra: Record<string, string> = {}) {
    return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store", ...extra } });
}

function fallback(reason: FallbackReason) {
    return new Response(encodeEvent({ type: "fallback", reason }) + encodeEvent({ type: "done" }), { status: 200, headers: NDJSON_HEADERS });
}

function readCookie(header: string | null, name: string): string | undefined {
    return header
        ?.split(";")
        .map((part) => part.trim())
        .find((part) => part.startsWith(`${name}=`))
        ?.slice(name.length + 1);
}

export async function POST(request: Request): Promise<Response> {
    const env = readAssistantEnv();
    if (!env) return json(503, { error: "unavailable" });

    if (request.headers.get("origin") !== new URL(env.SITE_ORIGIN).origin) return json(403, { error: "forbidden" });

    const raw = await request.text();
    if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) return json(413, { error: "too_large" });

    let body;
    try {
        const parsed = ClientRequestSchema.safeParse(JSON.parse(raw));
        if (!parsed.success) return json(400, { error: "bad_request" });
        body = parsed.data;
    } catch {
        return json(400, { error: "bad_request" });
    }

    const ip = clientIp(request.headers);
    const ipHash = hashIp(ip, env.IP_HASH_SALT);
    if (!ipBucket.take(ipHash)) return body.action === "start" ? json(429, { error: "limit" }) : fallback("limit");

    if (body.action === "start") {
        if (!(await verifyTurnstile(body.turnstileToken, env.TURNSTILE_SECRET_KEY, ip))) return json(403, { error: "verification_failed" });
        const conversation = issueConversation(env.ASSISTANT_COOKIE_SECRET);
        return json(200, { ok: true }, { "set-cookie": cookieHeader(conversation.value, env.SITE_ORIGIN.startsWith("https:")) });
    }

    const conversationId = readConversation(env.ASSISTANT_COOKIE_SECRET, readCookie(request.headers.get("cookie"), COOKIE_NAME));
    if (!conversationId) return json(401, { error: "expired" });

    const userAgent = (request.headers.get("user-agent") ?? "").slice(0, 200);
    const call: AppCall =
        body.action === "message"
            ? { conversationId, kind: "message", message: body.message, ipHash, userAgent }
            : { conversationId, kind: "confirm", requestId: body.requestId, ipHash, userAgent };
    const payload = JSON.stringify(call);

    let upstream: Response;
    try {
        upstream = await fetch(env.APP_ASSISTANT_URL, {
            method: "POST",
            headers: signedHeaders(env.WEBSITE_ASSISTANT_SECRET, "POST", env.APP_ASSISTANT_URL, payload),
            body: payload,
            signal: AbortSignal.timeout(APP_TIMEOUT_MS),
        });
    } catch {
        return fallback("unavailable");
    }
    if (upstream.status === 429) return fallback("limit");
    if (!upstream.ok || !upstream.body) return fallback("unavailable");

    return new Response(filterEventStream(upstream.body), { status: 200, headers: NDJSON_HEADERS });
}
```

- [ ] **Step 3: Run the tests and watch them pass**

Run: `npx vitest run src/app/api/assistant && npm run typecheck`
Expected: PASS (9 tests); typecheck exits 0.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/assistant
git commit -m "feat: /api/assistant relay with origin, Turnstile, cookie, limits and signing

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Assistant panel (UI), stub app and end-to-end

**Files:**
- Create: `src/lib/assistant/markdown.ts`, `src/lib/assistant/markdown.test.ts`, `src/components/assistant/use-turnstile.ts`, `src/components/assistant/use-assistant.ts`, `src/components/assistant/AssistantText.tsx`, `src/components/assistant/RequestCard.tsx`, `src/components/assistant/AssistantSection.tsx`, `e2e/stub-app.mjs`, `e2e/assistant.spec.ts`
- Modify: `src/app/page.tsx`, `playwright.config.ts`

**Interfaces:**
- Consumes: `ASSISTANT`, `QUICK_STARTS`, `SITE` (Task 2); `Proposal`, `AppEvent`, `FallbackReason`, `createLineSplitter`, `parseEventLine` (Task 8); `POST /api/assistant` (Task 9).
- Produces:
  - `<AssistantSection nonce?: string; enabled: boolean; siteKey: string />`, which renders `section#assistant` and `textarea#assistant-input`
  - `parseMarkdown(text: string): Block[]` and `safeHref(raw: string): string | null`

- [ ] **Step 1: Write the failing markdown tests**

`src/lib/assistant/markdown.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { parseMarkdown, safeHref } from "./markdown";

describe("parseMarkdown", () => {
    it("keeps HTML as plain text", () => {
        expect(parseMarkdown("<script>alert(1)</script>")).toEqual([{ kind: "p", inlines: [{ kind: "text", text: "<script>alert(1)</script>" }] }]);
    });
    it("supports bold, lists and links to our own domains only", () => {
        expect(parseMarkdown("Changenius is **one system**.\n\n- [the app](https://app.cellgenius-ai.com/login)\n- [this](https://evil.example.com)")).toEqual([
            {
                kind: "p",
                inlines: [
                    { kind: "text", text: "Changenius is " },
                    { kind: "bold", text: "one system" },
                    { kind: "text", text: "." },
                ],
            },
            {
                kind: "ul",
                items: [[{ kind: "link", text: "the app", href: "https://app.cellgenius-ai.com/login" }], [{ kind: "text", text: "this" }]],
            },
        ]);
    });
});

describe("safeHref", () => {
    it("allows https on our domains only", () => {
        expect(safeHref("https://cellgenius-ai.com/")).toBe("https://cellgenius-ai.com/");
        expect(safeHref("http://cellgenius-ai.com/")).toBeNull();
        expect(safeHref("javascript:alert(1)")).toBeNull();
        expect(safeHref("https://cellgenius-ai.com.evil.example/")).toBeNull();
        expect(safeHref("not a url")).toBeNull();
    });
});
```

Run: `npx vitest run src/lib/assistant/markdown.test.ts`. Expected: FAIL.

- [ ] **Step 2: Implement the parser**

`src/lib/assistant/markdown.ts`:
```ts
export type Inline = { kind: "text"; text: string } | { kind: "bold"; text: string } | { kind: "link"; text: string; href: string };
export type Block = { kind: "p"; inlines: Inline[] } | { kind: "ul"; items: Inline[][] };

const ALLOWED_HOSTS = new Set(["cellgenius-ai.com", "www.cellgenius-ai.com", "app.cellgenius-ai.com"]);
const INLINE = /\*\*([^*\n]+)\*\*|\[([^\]\n]+)\]\(([^)\s]+)\)/g;
const BULLET = /^\s*[-*]\s+/;

export function safeHref(raw: string): string | null {
    try {
        const url = new URL(raw);
        return url.protocol === "https:" && ALLOWED_HOSTS.has(url.hostname) ? url.href : null;
    } catch {
        return null;
    }
}

function parseInline(source: string): Inline[] {
    const out: Inline[] = [];
    let last = 0;
    for (const match of source.matchAll(INLINE)) {
        const at = match.index ?? 0;
        if (at > last) out.push({ kind: "text", text: source.slice(last, at) });
        if (match[1] !== undefined) {
            out.push({ kind: "bold", text: match[1] });
        } else {
            const href = safeHref(match[3]);
            out.push(href ? { kind: "link", text: match[2], href } : { kind: "text", text: match[2] });
        }
        last = at + match[0].length;
    }
    if (last < source.length) out.push({ kind: "text", text: source.slice(last) });
    return out;
}

export function parseMarkdown(source: string): Block[] {
    const blocks: Block[] = [];
    for (const chunk of source.replace(/\r\n/g, "\n").split(/\n{2,}/)) {
        const lines = chunk.split("\n").filter((line) => line.trim() !== "");
        if (lines.length === 0) continue;
        if (lines.every((line) => BULLET.test(line))) {
            blocks.push({ kind: "ul", items: lines.map((line) => parseInline(line.replace(BULLET, ""))) });
        } else {
            blocks.push({ kind: "p", inlines: parseInline(lines.join(" ")) });
        }
    }
    return blocks;
}
```

Run: `npx vitest run src/lib/assistant/markdown.test.ts`. Expected: PASS.

- [ ] **Step 3: Write the stub app and the failing e2e test**

`e2e/stub-app.mjs`:
```js
import { createHmac, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";

const port = Number(process.argv[2] ?? 3199);
const SECRET = "e2e-signing-secret-0123456789abcdef01";
const REQUEST_ID = "6f1c2a4e-8b3d-4c5e-9f70-1a2b3c4d5e6f";

const send = (res, events) => {
    res.writeHead(200, { "content-type": "application/x-ndjson" });
    for (const e of events) res.write(`${JSON.stringify(e)}\n`);
    res.end();
};

createServer((req, res) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
        const base = ["POST", req.url, req.headers["x-cg-timestamp"], req.headers["x-cg-nonce"], body].join("\n");
        const expected = createHmac("sha256", SECRET).update(base).digest("hex");
        const given = String(req.headers["x-cg-signature"] ?? "");
        if (given.length !== expected.length || !timingSafeEqual(Buffer.from(given), Buffer.from(expected))) {
            res.writeHead(401).end();
            return;
        }
        const call = JSON.parse(body);
        if (call.kind === "confirm") {
            send(res, [{ type: "delta", text: "Thank you — your request is with the team." }, { type: "confirmed", email: "maria@example.com" }, { type: "done" }]);
            return;
        }
        if (/demo/i.test(call.message)) {
            send(res, [
                { type: "delta", text: "Here is your demo request. Please check it." },
                {
                    type: "proposal",
                    request: {
                        requestId: REQUEST_ID,
                        type: "demo",
                        name: "Maria Lopez",
                        email: "maria@example.com",
                        company: "Example Bank",
                        preferredTimes: "Tuesday morning",
                        timezone: "Europe/Athens",
                        message: "Demo for our PMO team",
                    },
                },
                { type: "done" },
            ]);
            return;
        }
        send(res, [
            { type: "delta", text: "Changenius is **one system** for every change. " },
            { type: "delta", text: "See [the app](https://app.cellgenius-ai.com/login) or [this](https://evil.example.com)." },
            { type: "done" },
        ]);
    });
}).listen(port);
```

Replace the `webServer` array in `playwright.config.ts`. Cloudflare publishes always-pass Turnstile test keys; the values below are those test keys, not credentials.
```ts
    webServer: [
        { command: "node e2e/stub-app.mjs 3199", port: 3199, reuseExistingServer: false },
        {
            command: `npx next dev -p ${PORT}`,
            port: PORT,
            reuseExistingServer: false,
            timeout: 120_000,
            env: {
                NEXT_PUBLIC_ASSISTANT_ENABLED: "true",
                NEXT_PUBLIC_TURNSTILE_SITE_KEY: "1x00000000000000000000AA",
                TURNSTILE_SECRET_KEY: "1x0000000000000000000000000000000AA",
                ASSISTANT_COOKIE_SECRET: "e2e-cookie-secret-0123456789abcdef0123",
                IP_HASH_SALT: "e2e-salt-0123456789",
                WEBSITE_ASSISTANT_SECRET: "e2e-signing-secret-0123456789abcdef01",
                APP_ASSISTANT_URL: "http://localhost:3199/api/public/website-assistant",
                SITE_ORIGIN: `http://localhost:${PORT}`,
            },
        },
    ],
```

`e2e/assistant.spec.ts`:
```ts
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    await page.route("**/media/**", (route) => route.fulfill({ status: 204 }));
});

test("answers a question, and links only to our own domains", async ({ page }) => {
    await page.goto("/#assistant");
    await expect(page.getByText("This assistant is AI.", { exact: false })).toBeVisible();
    await page.getByRole("button", { name: "What can Changenius do?" }).click();
    const log = page.getByRole("log", { name: "Conversation" });
    await expect(log.getByText("one system")).toBeVisible({ timeout: 20_000 });
    await expect(log.getByRole("link", { name: "the app" })).toHaveAttribute("href", "https://app.cellgenius-ai.com/login");
    await expect(log.getByRole("link", { name: "this" })).toHaveCount(0);
});

test("prepares a demo request and sends it only on confirm", async ({ page }) => {
    await page.goto("/#assistant");
    await page.getByRole("button", { name: "Book a demo" }).click();
    const card = page.getByRole("region", { name: "Demo request" });
    await expect(card).toBeVisible({ timeout: 20_000 });
    await expect(card.getByText("Maria Lopez")).toBeVisible();
    await expect(page.getByText("The team will reply to maria@example.com", { exact: false })).toHaveCount(0);
    await card.getByRole("button", { name: "Confirm and send" }).click();
    await expect(page.getByText("The team will reply to maria@example.com", { exact: false })).toBeVisible();
});

test("the hero button lands in the assistant input", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Ask the EPMO AI Assistant" }).click();
    await expect(page.locator("#assistant-input")).toBeFocused({ timeout: 3_000 });
});
```

Run: `npx playwright test e2e/assistant.spec.ts --project=desktop`. Expected: FAIL (no assistant section).

- [ ] **Step 4: Write the hooks**

`src/components/assistant/use-turnstile.ts`:
```ts
"use client";

import { useCallback, useEffect, useRef } from "react";

type TurnstileApi = {
    render(el: HTMLElement, options: Record<string, unknown>): string;
    reset(id: string): void;
    remove(id: string): void;
};

declare global {
    interface Window {
        turnstile?: TurnstileApi;
    }
}

const TOKEN_TIMEOUT_MS = 15_000;

export function useTurnstile(siteKey: string) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetId = useRef<string | null>(null);
    const token = useRef<string | null>(null);
    const waiters = useRef<Array<(t: string) => void>>([]);

    const mount = useCallback(() => {
        if (!window.turnstile || !containerRef.current || widgetId.current) return;
        widgetId.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            appearance: "interaction-only",
            callback: (t: string) => {
                token.current = t;
                waiters.current.splice(0).forEach((resolve) => resolve(t));
            },
            "expired-callback": () => {
                token.current = null;
            },
        });
    }, [siteKey]);

    useEffect(() => {
        mount();
        return () => {
            if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
            widgetId.current = null;
        };
    }, [mount]);

    const getToken = useCallback((): Promise<string> => {
        if (token.current) return Promise.resolve(token.current);
        return new Promise<string>((resolve, reject) => {
            const timer = window.setTimeout(() => reject(new Error("turnstile timeout")), TOKEN_TIMEOUT_MS);
            waiters.current.push((t) => {
                window.clearTimeout(timer);
                resolve(t);
            });
        });
    }, []);

    const resetToken = useCallback(() => {
        token.current = null;
        if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
    }, []);

    return { containerRef, mount, getToken, resetToken };
}
```

`src/components/assistant/use-assistant.ts`:
```ts
"use client";

import { useCallback, useRef, useState } from "react";
import { createLineSplitter, parseEventLine } from "@/lib/assistant/ndjson";
import type { AppEvent, FallbackReason, Proposal } from "@/lib/assistant/protocol";

export type ChatMessage = { id: string; role: "user" | "assistant"; text: string };
export type AssistantStatus = "idle" | "verifying" | "streaming";

type Body = { action: "message"; message: string } | { action: "confirm"; requestId: string };

function post(body: object): Promise<Response> {
    return fetch("/api/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
        credentials: "same-origin",
    });
}

async function readEvents(body: ReadableStream<Uint8Array>, onEvent: (event: AppEvent) => void) {
    const reader = body.pipeThrough(new TextDecoderStream()).pipeThrough(createLineSplitter()).getReader();
    for (;;) {
        const { value, done } = await reader.read();
        if (done) return;
        const event = parseEventLine(value);
        if (event) onEvent(event);
    }
}

export function useAssistant(getToken: () => Promise<string>, resetToken: () => void) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [proposal, setProposal] = useState<Proposal | null>(null);
    const [confirmedEmail, setConfirmedEmail] = useState<string | null>(null);
    const [status, setStatus] = useState<AssistantStatus>("idle");
    const [fallback, setFallback] = useState<FallbackReason | null>(null);
    const started = useRef(false);

    const start = useCallback(async () => {
        setStatus("verifying");
        const token = await getToken();
        const res = await post({ action: "start", turnstileToken: token });
        resetToken();
        if (!res.ok) throw new Error(`start ${res.status}`);
        started.current = true;
    }, [getToken, resetToken]);

    const exchange = useCallback(
        async (body: Body, retry: boolean): Promise<void> => {
            if (!started.current) await start();
            setStatus("streaming");
            const res = await post(body);
            if (res.status === 401 && retry) {
                started.current = false;
                return exchange(body, false);
            }
            if (!res.ok || !res.body) {
                setFallback("unavailable");
                return;
            }
            const id = crypto.randomUUID();
            setMessages((m) => [...m, { id, role: "assistant", text: "" }]);
            await readEvents(res.body, (event) => {
                if (event.type === "delta") setMessages((m) => m.map((x) => (x.id === id ? { ...x, text: x.text + event.text } : x)));
                else if (event.type === "proposal") setProposal(event.request);
                else if (event.type === "confirmed") {
                    setProposal(null);
                    setConfirmedEmail(event.email);
                } else if (event.type === "fallback") setFallback(event.reason);
            });
            setMessages((m) => m.filter((x) => !(x.id === id && x.text === "")));
        },
        [start],
    );

    const run = useCallback(
        async (body: Body) => {
            setFallback(null);
            try {
                await exchange(body, true);
            } catch {
                setFallback("unavailable");
            } finally {
                setStatus("idle");
            }
        },
        [exchange],
    );

    const send = useCallback(
        (text: string) => {
            const message = text.trim();
            if (!message || status !== "idle") return;
            setMessages((m) => [...m, { id: crypto.randomUUID(), role: "user", text: message }]);
            void run({ action: "message", message });
        },
        [run, status],
    );

    const confirm = useCallback(
        (requestId: string) => {
            if (status === "idle") void run({ action: "confirm", requestId });
        },
        [run, status],
    );

    const dismissProposal = useCallback(() => setProposal(null), []);

    return { messages, proposal, confirmedEmail, status, fallback, send, confirm, dismissProposal };
}
```

- [ ] **Step 5: Write the components**

`src/components/assistant/AssistantText.tsx`:
```tsx
import { Fragment, useMemo } from "react";
import { parseMarkdown, type Inline } from "@/lib/assistant/markdown";

function Inlines({ items }: { items: Inline[] }) {
    return items.map((item, i) => {
        if (item.kind === "bold") return <strong key={i} className="font-semibold text-fg">{item.text}</strong>;
        if (item.kind === "link")
            return (
                <a key={i} href={item.href} target="_blank" rel="noopener noreferrer" className="text-gold underline underline-offset-2">
                    {item.text}
                </a>
            );
        return <Fragment key={i}>{item.text}</Fragment>;
    });
}

export function AssistantText({ text }: { text: string }) {
    const blocks = useMemo(() => parseMarkdown(text), [text]);
    return (
        <div className="space-y-3">
            {blocks.map((block, i) =>
                block.kind === "p" ? (
                    <p key={i}>
                        <Inlines items={block.inlines} />
                    </p>
                ) : (
                    <ul key={i} className="list-disc space-y-1 pl-5">
                        {block.items.map((item, j) => (
                            <li key={j}>
                                <Inlines items={item} />
                            </li>
                        ))}
                    </ul>
                ),
            )}
        </div>
    );
}
```

`src/components/assistant/RequestCard.tsx`:
```tsx
import type { Proposal } from "@/lib/assistant/protocol";

const TYPE_LABEL: Record<Proposal["type"], string> = {
    demo: "Demo request",
    information: "Information request",
    contact: "Message to the team",
};

export function RequestCard({ proposal, busy, onConfirm, onEdit }: { proposal: Proposal; busy: boolean; onConfirm: () => void; onEdit: () => void }) {
    const rows: Array<[string, string | undefined]> = [
        ["Name", proposal.name],
        ["Work email", proposal.email],
        ["Company", proposal.company],
        ["Role", proposal.role],
        ["Preferred times", proposal.preferredTimes ? `${proposal.preferredTimes}${proposal.timezone ? ` (${proposal.timezone})` : ""}` : undefined],
        ["Message", proposal.message || undefined],
    ];
    return (
        <section aria-label={TYPE_LABEL[proposal.type]} className="rounded-2xl border border-gold/40 bg-ink-0/60 p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-gold">{TYPE_LABEL[proposal.type]}</h3>
            <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[10rem_1fr]">
                {rows
                    .filter(([, value]) => value)
                    .map(([label, value]) => (
                        <div key={label} className="contents">
                            <dt className="text-muted">{label}</dt>
                            <dd className="break-words text-fg">{value}</dd>
                        </div>
                    ))}
            </dl>
            <div className="mt-5 flex flex-wrap gap-3">
                <button
                    type="button"
                    disabled={busy}
                    onClick={onConfirm}
                    className="rounded-full bg-gold px-5 py-2 font-semibold text-ink-0 hover:bg-gold-hi disabled:opacity-50"
                >
                    Confirm and send
                </button>
                <button type="button" onClick={onEdit} className="rounded-full border border-white/20 px-5 py-2 text-fg hover:border-gold hover:text-gold">
                    Edit
                </button>
            </div>
        </section>
    );
}
```

`src/components/assistant/AssistantSection.tsx`:
```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { Bot, Send } from "lucide-react";
import { ASSISTANT, QUICK_STARTS, SITE } from "@/data/content";
import { MAX_MESSAGE, type FallbackReason } from "@/lib/assistant/protocol";
import { cn } from "@/lib/cn";
import { AssistantText } from "./AssistantText";
import { RequestCard } from "./RequestCard";
import { useAssistant } from "./use-assistant";
import { useTurnstile } from "./use-turnstile";

const FALLBACK_TEXT: Record<FallbackReason, string> = {
    limit: `You've reached the message limit for now. Email us at ${SITE.email} and we'll pick it up.`,
    ceiling: `The assistant is unavailable right now — email ${SITE.email}.`,
    unavailable: `The assistant is unavailable right now — email ${SITE.email}.`,
    expired: "This conversation has expired. Send your message again to continue.",
};

export function AssistantSection({ nonce, enabled, siteKey }: { nonce?: string; enabled: boolean; siteKey: string }) {
    return (
        <section id="assistant" aria-labelledby="assistant-title" className="mx-auto max-w-4xl scroll-mt-20 px-4 py-24 sm:px-6">
            <div className="mb-8 flex items-center gap-4">
                <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-peri to-peri-deep text-white shadow-lg shadow-peri/30">
                    <Bot aria-hidden="true" className="size-6" />
                </span>
                <div>
                    <h2 id="assistant-title" className="text-2xl font-bold text-fg sm:text-3xl">
                        Ask the {ASSISTANT.name}
                    </h2>
                    <p className="mt-1 text-muted">{ASSISTANT.tagline}</p>
                </div>
            </div>
            {enabled && siteKey ? (
                <AssistantChat nonce={nonce} siteKey={siteKey} />
            ) : (
                <p className="rounded-2xl border border-white/10 bg-ink-1/70 p-6 text-fg">
                    Questions or a demo? Email{" "}
                    <a href={`mailto:${SITE.email}`} className="text-gold underline underline-offset-2">
                        {SITE.email}
                    </a>
                    .
                </p>
            )}
        </section>
    );
}

function AssistantChat({ nonce, siteKey }: { nonce?: string; siteKey: string }) {
    const turnstile = useTurnstile(siteKey);
    const assistant = useAssistant(turnstile.getToken, turnstile.resetToken);
    const [draft, setDraft] = useState("");
    const input = useRef<HTMLTextAreaElement>(null);
    const end = useRef<HTMLDivElement>(null);
    const busy = assistant.status !== "idle";

    useEffect(() => {
        end.current?.scrollIntoView({ block: "nearest" });
    }, [assistant.messages, assistant.proposal]);

    const submit = (text: string) => {
        assistant.send(text);
        setDraft("");
    };

    return (
        <div className="rounded-3xl border border-white/10 bg-ink-1/70 shadow-2xl backdrop-blur">
            <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" nonce={nonce} onReady={turnstile.mount} />
            <div role="log" aria-live="polite" aria-label="Conversation" className="max-h-[28rem] min-h-48 space-y-4 overflow-y-auto p-6">
                {assistant.messages.length === 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {QUICK_STARTS.map((prompt) => (
                            <button
                                key={prompt}
                                type="button"
                                disabled={busy}
                                onClick={() => submit(prompt)}
                                className="rounded-full border border-peri/40 px-4 py-2 text-sm text-fg hover:border-peri hover:bg-peri/10 disabled:opacity-50"
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>
                ) : null}
                {assistant.messages.map((m) => (
                    <div
                        key={m.id}
                        className={cn(
                            "max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed",
                            m.role === "user" ? "ml-auto bg-peri-deep/30 text-fg" : "bg-ink-2/80 text-fg",
                        )}
                    >
                        {m.role === "assistant" ? <AssistantText text={m.text} /> : m.text}
                    </div>
                ))}
                {busy ? <p className="text-sm text-muted">{assistant.status === "verifying" ? "Checking you're human…" : "Thinking…"}</p> : null}
                {assistant.proposal ? (
                    <RequestCard
                        proposal={assistant.proposal}
                        busy={busy}
                        onConfirm={() => assistant.proposal && assistant.confirm(assistant.proposal.requestId)}
                        onEdit={() => {
                            assistant.dismissProposal();
                            input.current?.focus();
                        }}
                    />
                ) : null}
                {assistant.confirmedEmail ? (
                    <p className="rounded-2xl border border-gold/40 p-4 text-fg">
                        Sent. The team will reply to {assistant.confirmedEmail} within one working day.
                    </p>
                ) : null}
                {assistant.fallback ? <p className="rounded-2xl border border-white/15 p-4 text-fg">{FALLBACK_TEXT[assistant.fallback]}</p> : null}
                <div ref={end} />
            </div>
            <form
                className="border-t border-white/10 p-4"
                onSubmit={(e) => {
                    e.preventDefault();
                    submit(draft);
                }}
            >
                <label htmlFor="assistant-input" className="sr-only">
                    Your message
                </label>
                <div className="flex items-end gap-3">
                    <textarea
                        id="assistant-input"
                        ref={input}
                        rows={2}
                        maxLength={MAX_MESSAGE}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                submit(draft);
                            }
                        }}
                        placeholder="Ask about Changenius, or ask for a demo…"
                        className="min-h-12 flex-1 resize-none rounded-2xl border border-white/10 bg-ink-0/60 px-4 py-3 text-fg placeholder:text-muted focus:border-peri focus:outline-none"
                    />
                    <button
                        type="submit"
                        disabled={busy || !draft.trim()}
                        aria-label="Send message"
                        className="grid size-12 place-items-center rounded-full bg-gold text-ink-0 hover:bg-gold-hi disabled:opacity-40"
                    >
                        <Send aria-hidden="true" className="size-5" />
                    </button>
                </div>
                <div className="mt-3 flex items-start justify-between gap-4 text-xs text-muted">
                    <p>{ASSISTANT.consent}</p>
                    {draft.length > MAX_MESSAGE - 200 ? <span className="tabular-nums">{MAX_MESSAGE - draft.length}</span> : null}
                </div>
                <div ref={turnstile.containerRef} className="mt-2" />
            </form>
        </div>
    );
}
```

Update `src/app/page.tsx` (the final composition):
```tsx
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
```

- [ ] **Step 6: Run everything for this task**

Run: `npx vitest run src/lib/assistant && npx playwright test && npm run lint && npm run typecheck`
Expected: every unit test and every e2e spec (shell, films, hero, assistant) passes on desktop and phone. Turnstile's test key needs internet access; if `challenges.cloudflare.com` is unreachable, the assistant specs fail at "Checking you're human…". Report that, and do not stub it away.

- [ ] **Step 7: Commit**

```bash
git add src/lib/assistant/markdown* src/components/assistant src/app/page.tsx e2e playwright.config.ts
git commit -m "feat: EPMO AI Assistant panel with Turnstile, streaming replies and request confirmation

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: System test pass and handover

**Files:**
- Create: `.env.example`, `docs/sit/2026-11-11-landing-sit.md`
- Modify: `README.md` (create it if missing)

- [ ] **Step 1: Document the configuration**

`.env.example`:
```
# Video store (same value as the app's MANUAL_MEDIA_BASE_URL). Server-only.
MEDIA_BASE_URL=
# The assistant panel stays hidden until the app release with /api/public/website-assistant is live.
NEXT_PUBLIC_ASSISTANT_ENABLED=false
# Cloudflare Turnstile (dashboard > Turnstile > Add site: cellgenius-ai.com)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
# 32+ random bytes each: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ASSISTANT_COOKIE_SECRET=
IP_HASH_SALT=
# Same value in the app's Vercel project.
WEBSITE_ASSISTANT_SECRET=
APP_ASSISTANT_URL=https://app.cellgenius-ai.com/api/public/website-assistant
SITE_ORIGIN=https://cellgenius-ai.com
```

Add a `README.md` section, "Running and configuring", that lists the scripts and points to `.env.example` and the spec.

- [ ] **Step 2: Run the full check set**

```bash
npm run typecheck && npm run lint && npm test && npm run build && npx playwright test
```
Expected: everything is green. Record the counts.

- [ ] **Step 3: Take screenshots and check colour contrast**

Run `npm run dev` and use the browser pane on `http://localhost:3000`:
- Take screenshots at 1440×900 and 390×844 of the hero (mid-word), the assistant (empty, mid-answer, with the request card), the films, the sign-in panel and the demos.
- Check contrast on muted text over the backdrop's brightest frame (`#9aa6bd` on the glow).
- Check keyboard order: skip link → header → hero buttons → assistant → films → sign-in → demos.

The site has a single dark look, so the app's five colour modes do not apply here.

- [ ] **Step 4: Run Lighthouse on a production build**

```bash
npm run build && npx next start -p 3200
```
In a second shell:
```bash
npx -y lighthouse@12 http://localhost:3200 --only-categories=performance,accessibility --form-factor=mobile --output=json --output-path=./test-results/lh.json --chrome-flags="--headless=new" --quiet
node -e "const r=require('./test-results/lh.json');for(const[k,v]of Object.entries(r.categories))console.log(k,Math.round(v.score*100))"
```
Expected: performance ≥ 85 and accessibility ≥ 95. If performance is low, check the backdrop video size and the hero's JavaScript first. Stop the server afterwards.

- [ ] **Step 5: Write the SIT report**

`docs/sit/2026-11-11-landing-sit.md` lists every check run with its result, every finding (even the fixed ones, with how each was fixed), the screenshot locations, the Lighthouse scores, and what was **not** tested: the live app endpoint (Plan B), real video playback from R2 (no `MEDIA_BASE_URL` locally), and production Turnstile keys.

- [ ] **Step 6: Commit, then stop for the owner**

```bash
git add .env.example README.md docs/sit
git commit -m "docs: configuration and SIT report for the landing page

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

**Do not push.** Ask the owner whether to push `revamp/changenius-landing` for a Vercel preview, and list what they must add to the website's Vercel project first: at minimum `MEDIA_BASE_URL`, with `NEXT_PUBLIC_ASSISTANT_ENABLED=false`.
