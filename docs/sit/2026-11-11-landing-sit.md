# System test report — Changenius landing page

**Date:** 11 Nov 2026 · **Branch:** `revamp/changenius-landing` (worktree `C:/Websites/cellgenius-website`), tested at `72cc755` plus the documentation added with this report · **Not pushed.**

## Result in one paragraph

Every automated check passed. A production build was tested twice: with the assistant **on** (Turnstile test keys and a stub of the app on port 3199) and **off** (how the site will launch). The Content Security Policy blocked nothing in either build, and every script on the page carries the nonce. The chat answered. Lighthouse on a phone profile scores **98 performance / 100 accessibility with the assistant off**. With the assistant **on**, performance drops to **75**, because Cloudflare Turnstile loads with the page. That has to be fixed before the assistant is switched on, but it does not affect launch. The decorative planet labels in the hero fall below normal text contrast when they pass over the glow or the big word.

## Checks run

| # | Check | Result |
|---|---|---|
| 1 | `npm run typecheck` | Pass, 0 errors |
| 2 | `npm run lint` | Pass: 0 errors, 2 warnings that were already there (anonymous default export in `eslint.config.mjs` and `postcss.config.mjs`) |
| 3 | `npm test` (Vitest) | Pass: 10 files, **91 tests** |
| 4 | `npm run build` (assistant on, then off) | Pass both times. Route `/` is 24 kB, with 126 kB First Load JS |
| 5 | `npx playwright test` (desktop, phone, assistant-off) | Pass: **35 passed, 1 skipped** (the phone-menu test runs on phone only, by design) |
| 6 | CSP, production build, assistant **on**: load `/`, wait for the chat and Turnstile, send the quick-start "What can Changenius do?" | Pass. **0** console messages containing "Content Security Policy" or "Refused to". **21/21** `<script>` tags in the HTML carry the nonce. The chat answered. Other console lines: a 404 for the film poster (no `MEDIA_BASE_URL` locally) and a `postMessage` origin warning from Cloudflare's own Turnstile script |
| 7 | CSP, production build, assistant **off** | Pass. **0** CSP messages, **21/21** scripts carry the nonce. The only console line is the poster 404. `POST /api/assistant` answers **503** `{"error":"unavailable"}` (kill switch) |
| 8 | `upgrade-insecure-requests` on http://localhost | No effect on loading. Chrome treats localhost as secure, so nothing had to be recorded as environmental |
| 9 | Lighthouse 12, mobile, production build | Off: **98 / 100** (3 runs, all the same). On: **75 / 100** (median of 5 runs: 75, 86, 76, 75, 75). On, with Turnstile blocked: **91** (2 runs). See below |
| 10 | Colour contrast (computed from screen pixels, desktop and phone) | Pass everywhere except the hero planet labels (finding N2) and one stress case (N5). See below |
| 11 | Screenshots, desktop 1440×900 and phone 390×844 | 26 taken and looked at. See the list below |
| 12 | Keyboard pass (Tab from page load, desktop) | Pass. Skip link → wordmark → Assistant, Films, Demos → Sign in → the hero's Ask / Watch / Sign in → Pause → 4 quick-starts → message box → 9 film tiles → Sign in to Changenius → 20 demo tiles → footer. Every stop showed a focus ring. Send is skipped while the box is empty, because it is disabled then (intended). The Turnstile widget adds no stop |

## Lighthouse (mobile, simulated throttling, on a laptop shared with other work)

| Build | Performance | Accessibility | First paint | Largest paint | Blocking time |
|---|---|---|---|---|---|
| Assistant off | **98** | 100 | 1.2 s | 2.3 s | 40–90 ms |
| Assistant on | **75** | 100 | 3.6–3.7 s | 4.6 s | 0 ms |
| Assistant on, Turnstile blocked | 91 | — | 2.1 s | 3.2 s | — |

The three audits that cost most with the assistant on:
1. **Largest paint at 4.6 s.** The largest element is the hero backdrop poster (13 kB). 84% of that time is render delay: the main thread is busy rather than waiting on the network.
2. **First paint at 3.7 s.** Cloudflare's Turnstile page (225 kB) and its iframe load straight away with the page, because the chat chunk renders the widget as soon as it arrives.
3. **Smaller items:** preconnect to `challenges.cloudflare.com` (est. 220 ms), the render-blocking stylesheet (est. 300 ms), and 20 kB of unused JavaScript in the shared chunk.

The hero itself is light. Its page chunk is 8.9 kB compressed, and the backdrop video is 157 kB (WebM). It is not what slows the page.

## Colour contrast (WCAG AA: 4.5:1 normal text, 3:1 large text and icons)

Method: each text element was made transparent, the area under it was screenshotted, and the text colour was compared with the background pixels: the worst pixel, the 90th percentile and the median. Hero labels were sampled 24 times over about 30 seconds of animation, so they were measured against many backdrop frames, the glow and the morphing word.

| Where | Text | Contrast |
|---|---|---|
| Plain page background | muted `#9aa6bd` (tile durations, card labels, footnotes) | 7.2–8.0 |
| Assistant | tagline (muted, 16 px) | 6.18 |
| Assistant | footnote (muted, 12 px) | 7.24 |
| Assistant | quick-start chips, answers, card values (`fg`) | 13.9–17 |
| Assistant | "the app" link (gold) | 7.5 |
| Assistant | "DEMO REQUEST" (peri, 14 px) | 6.37 desktop; 5.83 median on phone (4.31 at one edge pixel only) |
| Assistant | Send button while disabled | 1.6. Disabled controls are exempt |
| Hero | Pause icon (muted, 3:1 needed) | 7.9 |
| Hero | planet labels (muted, 13–24 px, decorative) | **Desktop medians: 7.7 (AGENTIC AI), 6.0 (CHAIN), 4.7 (GENIUS), 3.9 (AI), 2.2 (CHANGE). Phone medians: 2.0–4.1.** They are low when a label sits over the warm glow or crosses the big word |
| Film tile | duration over the fallback gradient | 8.0 |
| Film tile, stress test: poster replaced by pure white | duration (muted, 12 px) | 5.8 desktop. **3.9 worst / 4.7 median on phone** |
| Demo tiles (no poster by design) | titles / durations | 17 / 8.0 |

Three demo-tile readings at the very top of the screen came out as 1.0 because the fixed header was covering them. That is a flaw in how they were measured, not a contrast problem.

## Screenshots

`docs/sit/2026-11-11-shots/`. Each file name starts with `desktop-` (1440×900) or `phone-` (390×844, Pixel 7). 1.9 MB in all.

| File | Shows | Seen |
|---|---|---|
| `01-hero-mid-word` | "AGENTIC AI" while it morphs | OK. The CHANGE planet and its label cross the word (N3) |
| `02-hero-close` | "CHANGE IN US" | OK. On phone, two labels are cut off at the left edge (N3) |
| `03-hero-reduced-motion` | Still frame, all planets | OK |
| `04-assistant-empty` | Chips, message box, footnote | OK |
| `05-assistant-answer` | Answer with an own-domain link | OK. The link to another domain is shown as plain text |
| `06-assistant-request-card` | Demo request card | OK. On phone the card scrolls inside the conversation |
| `07-assistant-sent` | Confirmation line | OK |
| `08-films` | Film section | Poster missing locally, so the broken-image icon shows top-left (N4) |
| `09-film-viewer` | Viewer dialog | Spinner only: no media locally |
| `10-sign-in` | Sign-in panel | OK |
| `11-demos` | Demo chapters | OK |
| `12-hero-assistant-off` | Hero with the assistant off: "Questions? Email us" | OK. The phone frame was caught while the name blurs in, which is the intro animation |
| `13-assistant-off-section` | The email line in place of the chat; header says "Contact" | OK |

## Findings

### New in this test

| # | Finding | Severity | Status |
|---|---|---|---|
| N1 | With the assistant on, phone performance is 75 (target 85), because Turnstile loads with the page. Blocking it gives 91. | **Must fix before switch-on**; not a launch blocker (off = 98) | Open. Fix: load the Turnstile script only when the visitor reaches or starts using the assistant, and add a preconnect. This changes when a token is ready, so it needs its own change and tests rather than a quick edit here |
| N2 | Hero planet labels (muted on the glow, or crossing the big word) fall to about 2:1 at worst. | Minor. The labels are `aria-hidden` decoration inside the animation, and the same words are in the statement text | Open, needs an owner decision: leave as is, brighten them to `fg`, or give them a dark text shadow |
| N3 | Labels cross the big word on desktop too, not only on phone. On phone at the close, AGENTIC AI is off screen and AI is half cut at the left edge. | Cosmetic | Open |
| N4 | If a film poster fails to load, Chrome shows its broken-image icon in the tile corner. | Minor. Here it happens only because there is no `MEDIA_BASE_URL`. In production it happens only if a poster is missing in R2 | Open. Could hide the image when it fails to load |
| N5 | The film duration over a very bright poster on phone measures 3.9–4.7:1. | Minor. Depends on the real poster, which was not available | Open. Check against the real poster on the Vercel preview |
| N6 | Lighthouse's unscored rule "label-content-name-mismatch" flags the tiles. Their name is "Play X, 1:53" while the visible text is "X 1:53". | Minor (weight 0, accessibility score stays 100) | Open |
| N7 | Right after the film viewer closed on phone, one screenshot showed the page a few pixels lower under the header. A fresh capture 1.5 s later was normal. | Observation | Not reproduced. Replaced with the clean shot |

### Found and fixed earlier (task reviews and the whole-branch fix wave)

| Where | Finding | How it was fixed |
|---|---|---|
| Task 3 | Scripts did not get the CSP nonce | The layout renders per request, so the nonce reaches every script. This test confirmed 21/21 scripts in both builds |
| Task 4 | Phone menu missing; footer read a duplicate to screen readers; eyebrow too bright | Phone menu added, the duplicate removed, the eyebrow made muted |
| Task 5 | Focus lost on chapter change; dialog did not scroll; e2e too weak | Focus moves to the new chapter, the dialog scrolls, stronger e2e |
| Task 7 | Phone still frame lacked planets; motion showed before hydration; the media stub blocked the Inter font | Planets added to the phone still, no motion before hydration, the stub narrowed |
| Task 8 | Assistant route hardening | 32 KiB line cap, https-only app URL, LRU rate limiter, strict request schema, env never throws, strict Origin |
| Task 9 | The stream could end without a reply; unbounded body; redirects followed | Always ends with fallback + done, bounded body, no redirects, `maxDuration` set |
| Task 10 | Drafts lost; panel visible when off; gold overused | Drafts kept, hidden when off, list after intro, gold only on actions |
| Fix wave A | With the assistant off, the hero, header and footer still promised an assistant | They say "Questions? Email us" / "Contact", and the footer AI note is removed when off (e2e) |
| Fix wave B | Chat and zod in the page bundle | Chat loads on demand, zod kept out of the browser: 155 → 126 kB First Load JS |
| Fix wave C | Route timing could exceed the Vercel plan | `maxDuration` 60, app headers 25 s, whole reply 55 s (tests) |
| Fix wave D | No kill switch; unread upstream bodies left open | 503 when off (confirmed here), bodies cancelled on 429, non-200, 3xx and non-NDJSON |
| Fix wave E | Turnstile hostname not checked | Hostname pinned to `SITE_ORIGIN` when it is https |
| Fix wave F | `MEDIA_BASE_URL` is build-time, which was easy to miss | Warning on Vercel builds without it. Documented in the README with this report. `/pricing` → `/` (308) |
| Fix wave G | Metadata | Canonical, Open Graph and Twitter card tags; why-comment on `await headers()` |
| Fix wave H | `OrbitStage` id regex `/[^w-]/g` | `/[^\w-]/g` |
| Fix wave I | Focus rings relied on browser defaults | Gold or peri `focus-visible` rings. The keyboard pass here saw a ring at every stop |
| Fix wave J | Auto-advance at the end of a film lost focus | `onEnded` keeps focus on the new video (e2e) |
| Fix wave K | The phone keyboard popped up after a quick-start or Confirm | Focus goes to the conversation or confirmation line instead (e2e) |
| Fix wave L | `.gitignore` gaps; stale comment in `icon.svg` | Fixed |

### Known minor items still open (from the reviews)

- Middleware matcher not anchored (`api|media|icon.svg`). It is a guarded file, so changing it needs an owner-approved script.
- Two anonymous-default-export lint warnings.
- The phone menu's navigation label is the same as the desktop one ("Sections"). The Escape path in the phone menu is not tested.
- With reduced motion, the hidden backdrop video may still download before hydration (`preload="auto"`).
- No e2e that Pause stops the motion cycle.
- The rate limiter is per instance (the app's limits are the real ones).
- The e2e stub does not record calls. The Markdown parser is slow on an unclosed `[`. The Playwright servers do not reuse running ones, so ports must be free.
- With the assistant on, the hero button focuses the message box. If it is clicked in the first ~0.6 s, before the chat chunk arrives, nothing gets focus.
- The Vercel `MEDIA_BASE_URL` warning may print more than once per build.

## Not tested

- **The live app endpoint (Plan B)**: only the local stub of `/api/public/website-assistant` was used. Real answers, cost limits and the app's own rate limits were not exercised.
- **Real email**: no demo request was delivered to info@cellgenius-ai.com. The stub only says it was.
- **Real video and posters from R2**: there is no `MEDIA_BASE_URL` locally, so films and the main poster return 404. Playback, poster contrast (N5) and the broken-image case (N4) need checking on a Vercel preview.
- **Production Turnstile keys**: Cloudflare's always-pass test keys were used. The hostname pin applies only to an https `SITE_ORIGIN`, so it was not exercised end to end.
- **Vercel itself**: build-time variables, the preview toolbar being blocked by the CSP, and https (`upgrade-insecure-requests`, HSTS).
- **Other browsers and real devices**: Chromium only. The phone was an emulated Pixel 7, not Safari/iOS or Firefox. No screen-reader pass.
