# cellgenius-ai.com

The Changenius landing page: a hero playing the app's CHANGENIUS wordmark show, the EPMO AI Assistant (a chat relayed to the
Changenius app), a sign-in panel, and the films (the 2-minute film, then the demo chapters). Next.js 15, React 19,
Tailwind CSS 4.

The design and its reasons are in
[`docs/superpowers/specs/2026-11-11-changenius-landing-design.md`](docs/superpowers/specs/2026-11-11-changenius-landing-design.md).
The last system test is in [`docs/sit/2026-11-11-landing-sit.md`](docs/sit/2026-11-11-landing-sit.md).

## Running and configuring

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Local server on http://localhost:3000 |
| `npm run build` | Production build |
| `npm run start` | Serves the production build |
| `npm run typecheck` | TypeScript, no output files |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (Vitest) |
| `npm run e2e` | Browser tests (Playwright). Starts its own servers on ports 3100, 3101 and 3199 (a stub of the app), so those ports must be free |

### Settings

Every setting is listed, with a note, in [`.env.example`](.env.example); the spec's section 6
says which project each belongs to. Copy it to `.env.local` for local work. Without
`MEDIA_BASE_URL` the page still runs, but the films and their posters do not load.

Things that are easy to get wrong:

- **`MEDIA_BASE_URL` is read at build time**, not when a page is served (it becomes the `/media`
  rewrite). In Vercel, set it for **both Production and Preview**, or every film on that
  deployment returns 404. A Vercel build without it prints a warning.
- **Every `NEXT_PUBLIC_*` value is fixed at build time.** Switching the assistant on or off
  (`NEXT_PUBLIC_ASSISTANT_ENABLED`), or changing the Turnstile site key, needs a **redeploy**;
  changing the value in Vercel alone does nothing to the running site.
- **The assistant needs the app first.** Leave `NEXT_PUBLIC_ASSISTANT_ENABLED=false` until the app
  release with `/api/public/website-assistant` is live and its secrets are set (Plan B in the
  spec). With it off, the page offers the email address instead and `/api/assistant` answers 503.
- **Vercel previews show a blocked script in the console.** Vercel injects its preview toolbar
  script, which the page's Content Security Policy refuses. That is expected; do not loosen the
  policy for it.
