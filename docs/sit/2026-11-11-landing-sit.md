# System test report — Changenius landing page

**Date:** 11 Nov 2026 · **Branch:** `revamp/changenius-landing` (worktree `C:/Websites/cellgenius-website`), tested at `72cc755` plus the documentation added with this report · **Not pushed.**

> **Superseded in part (later on 11 Nov 2026):** the planet hero, the header, the hero buttons and the module
> commercials described below are gone. See [Hero swap and page restructure](#hero-swap-and-page-restructure-owner-decisions-11-nov-2026)
> at the end. The screenshots in `2026-11-11-shots/` were all retaken for it.
> Later still, the rotating statement was removed and the show enlarged and re-captioned: see [Hero enlargement](#hero-enlargement-owner-11-nov-2026).

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

> Superseded for the hero shots (`01`, `02`, `03`, `12`, `14`, `15`) by [Hero enlargement](#hero-enlargement-owner-11-nov-2026), which retook them at four sizes; the table below describes the earlier hero.

`docs/sit/2026-11-11-shots/`. Each file name starts with `desktop-` (1440×900) or `phone-` (390×844, Pixel 7). 2.0 MB in all.

| File | Shows | Seen |
|---|---|---|
| `01-hero-mid-word` | Wordmark show, act "born from the top": AGENTIC AI built from the name (14.5 s into the 147.2 s loop) | OK |
| `02-hero-close` | The closure: CHANGE IN US and "The change is in us" (144.5 s) | OK |
| `03-hero-reduced-motion` | Reduced motion: the show's static CHANGENIUS, no backdrop video | OK |
| `04-assistant-empty` | Chips, message box, footnote | OK |
| `05-assistant-answer` | Answer with an own-domain link | OK |
| `06-assistant-request-card` | Demo request card | OK. On phone the card scrolls inside the conversation |
| `07-assistant-sent` | Confirmation line | OK |
| `08-films` | Films section: the 2-minute film first | OK. Poster 404 locally, so the designed title card shows |
| `09-film-viewer` | Viewer dialog | Spinner only: no media locally |
| `10-sign-in` | Sign-in panel, now above the films | OK |
| `11-film-chapters` | The executive demo chapters, after the deeper look, inside the films section (replaces `11-demos`) | OK |
| `12-hero-assistant-off` | Hero with the assistant off (the hero no longer differs: no buttons) | OK |
| `13-assistant-off-section` | The email line in place of the chat | OK |
| `14-hero-hub-cascade` | Act "hub cascade": CHANGE morphing in place (54 s) | OK |
| `15-hero-constellation` | Act "constellation": five orbiting words round CHANGENIUS (139 s) | OK on desktop. On phone the outer script lines touch or cross the screen edge (finding H1) |

## Findings

### New in this test

| # | Finding | Severity | Status |
|---|---|---|---|
| N1 | With the assistant on, phone performance is 75 (target 85), because Turnstile loads with the page. Blocking it gives 91. | **Must fix before switch-on**; not a launch blocker (off = 98) | **Fixed** in the follow-up below: 98 with the assistant on |
| N2 | Hero planet labels (muted on the glow, or crossing the big word) fall to about 2:1 at worst. | Minor. The labels are `aria-hidden` decoration inside the animation, and the same words are in the statement text | **Fixed** in the follow-up below (owner chose: brighten and keep clear) |
| N3 | Labels cross the big word on desktop too, not only on phone. On phone at the close, AGENTIC AI is off screen and AI is half cut at the left edge. | Cosmetic | **Fixed** in the follow-up below |
| N4 | If a film poster fails to load, Chrome shows its broken-image icon in the tile corner. | Minor. Here it happens only because there is no `MEDIA_BASE_URL`. In production it happens only if a poster is missing in R2 | **Fixed** in the follow-up below |
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

## Follow-up fixes (owner decisions, 11 Nov 2026)

Three changes the owner approved after reading this report. Tested on a production build with the assistant **on** (same environment as check 6: Turnstile test keys, app stub on port 3199, server on 3200).

| Finding | Owner decision | What changed |
|---|---|---|
| N2, N3 planet labels | Brighten and keep clear | Labels are a little brighter (`#c8d0de`, between muted and `fg`, not gold) with a soft dark halo (SVG `paint-order: stroke`, ink at 60%, 0.24em). Each frame, a label that would run off the screen slides back inside it, and fades out once its planet has left the screen; a label crossing the big word fades to 25% opacity. Rings, planets, colours, timings and the reduced-motion still are unchanged |
| N1 Turnstile weight | Load it on demand | The Turnstile script is rendered only once the chat panel comes within 100 px of the screen, or the visitor focuses or touches anything in it, whichever is first. A message sent before the token exists still waits for it (30 s limit, error → fallback). The margin is 100 px rather than ~400 px because the panel starts only about 200 px below a phone's first screen, so a wider margin would load Turnstile with the page again |
| N4 broken poster | Hide it | If a poster fails to load, the image is removed and the tile's designed title card shows |

**Lighthouse 12, mobile, production build, assistant on** (5 runs): performance **97, 98, 99, 98, 97 — median 98** (was 75), accessibility **100**. First paint 1.2 s (was 3.6–3.7 s), largest paint 2.2–2.3 s (was 4.6 s), blocking time 52–137 ms. No request to `challenges.cloudflare.com` during the load.

**Planet label contrast** (same pixel method as above; the background under each letter now includes its halo):

| Case | Desktop 1440×900 | Phone 390×844 |
|---|---|---|
| Every label placed by hand on the brightest spot of the glow, word hidden, full opacity | **5.8 worst pixel**, 5.9 median | **8.1 worst pixel**, 8.2 median |
| In motion, 22 samples over about 2½ minutes, labels at full opacity | medians 10.8–12.4; 90% of pixels ≥ 6.7 | medians 9.1–10.5; 90% of pixels ≥ 8.1 |

Before: desktop medians 2.2–7.7, phone 2.0–4.1. One phone sample had a single worst pixel of 2.3 (AGENTIC AI) and one of 4.7 (CHAIN), at a letter edge where a ring or planet sits under the halo; the 90% figure for both is above 8. Labels deliberately dimmed over the word (29 readings) are not counted: they are decoration fading out.

**Checks after the follow-up:** `npm run typecheck` pass; `npm run lint` 0 errors (the same 2 warnings); Vitest **95 passed** (4 new, for the label placement); `npm run build` pass (`/` 24.7 kB, 127 kB First Load JS); Playwright **41 passed, 1 skipped**. New e2e: no Turnstile request until the chat is scrolled into view; a message sent before Turnstile is ready still gets its answer; a poster answering 404 leaves no image in the tile. Screenshots `01`–`03` and `08` (desktop and phone) retaken.

### Known minor items still open (from the reviews)

- Middleware matcher not anchored (`api|media|icon.svg`). It is a guarded file, so changing it needs an owner-approved script.
- Two anonymous-default-export lint warnings.
- With reduced motion, the hidden backdrop video may still download before hydration (`preload="auto"`).
- The rate limiter is per instance (the app's limits are the real ones).
- The e2e stub does not record calls. The Markdown parser is slow on an unclosed `[`. The Playwright servers do not reuse running ones, so ports must be free.
- The Vercel `MEDIA_BASE_URL` warning may print more than once per build.

## Hero swap and page restructure (owner decisions, 11 Nov 2026)

> **Superseded for the hero by [Hero enlargement](#hero-enlargement-owner-11-nov-2026):** the rotating statement described here is removed, and the show is no longer a byte-identical copy of the app's (larger sizes, new captions). The rest of this section still holds.

Tested at the commit that carries this section. Production builds with the assistant **on** (Turnstile test keys, app stub on 3199, server on 3200) and **off** (server on 3201).

**What changed.**

1. **Hero.** The planet visualisation is replaced by the app's login-page wordmark show, copied unchanged from `ppm-app` `origin/master@b3f65f48` (`src/components/brand/changenius-wordmark-show.tsx` and its generated CSS module, byte-identical apart from a one-line provenance comment), with the login's ring-and-spark icon above it, in the login's 448 px column. It runs at **twice the login tempo** (one loop is 147.2 s instead of 294.4 s) through one scoped rule in `globals.css`; the generated CSS is not edited. Pause, scrolling the hero away or hiding the tab pauses the show (`animation-play-state: paused` via `data-paused`), the backdrop video and the statement. The statement above it is now an independent rotator: seven lines, 6 s each. Reduced motion shows the show's own static CHANGENIUS and no backdrop video. The planet code (`OrbitStage`, `NameMorph`, `morph`, `orbit`, `timeline`, their 11 unit tests) is deleted.
2. **Hero buttons removed** ("Ask the EPMO AI Assistant" / "Questions? Email us", "Watch the film", "Sign in"), with their focus logic.
3. **Header removed** (fixed bar, phone menu, nav list, skip link, the `pt-16` offset). The footer keeps the wordmark and the assistant note.
4. **Module commercials removed** (the eight `/manual/<module>/commercial.mp4` films).
5. **One films section:** the 2-minute film, then *A deeper look* (13 chapters), then *The executive demo* (9). Next-chapter behaviour unchanged.
6. **Page order:** hero → assistant → sign-in panel → films → footer.

**Checks.**

| Check | Result |
|---|---|
| `npm run typecheck` | Pass, 0 errors |
| `npm run lint` | 0 errors, the same 2 warnings |
| `npx vitest run` | Pass: 9 files, **83 tests** (planet tests removed; content test now pins the statement list, the chapter order and no module commercials) |
| `npm run build` (on and off) | Pass. `/` 23.5 kB, 126 kB First Load JS |
| `npx playwright test` (desktop, phone, assistant-off) | Pass: **40 passed** (the phone-menu skip is gone with the menu). New: the show is visible with its login label and icon, runs at 147.2 s, pause sets `paused` on the show and holds the statement, play resumes both; reduced motion shows the still wordmark with no video; no header or navigation; section order; films order with 23 tiles |
| CSP, production build, on and off | Pass. **0** "Content Security Policy" / "Refused to" messages. **19/19** scripts carry the nonce. The show's `measure()` injects a `<style>` and sets inline custom properties; `style-src 'unsafe-inline'` allows both, and the measured offsets were present (e.g. `--dx: -52.8px`). The only console errors are the film poster 404 (no `MEDIA_BASE_URL` locally) |
| Overlap at 1440×900, 1280×720, 390×844 | None. Statement 24–228 px / show 398–798 px of a 900 px hero (desktop); 24–226 / 310–710 of 726 (1280×720: 6 px below the fold, empty in most acts); 24–152 / 332–732 of 844 (phone). The pause button sits clear of the show's columns |
| Screenshots | All 30 retaken (two new: `14`, `15`) and looked at; frames chosen by setting the show's animation time |

**Findings.**

| # | Finding | Severity | Status |
|---|---|---|---|
| H1 | On a 390 px phone, in the constellation act (about 24 s of each loop), the small script lines under CHANGE and AGENTIC AI run a few pixels past the screen edge, and the CHANGE and AI script lines touch. The show was designed for the login's 448 px column, which the app only shows on large screens. | Cosmetic | Open at the time; **fixed** in the hero enlargement below |
| H2 | Shrinking the show with `transform: scale()` or CSS `zoom` breaks it: `measure()` reads on-screen distances, which the scale then applies a second time, so travelling letters start about 16% off their source letter (measured: 6 px / 15 px out at 0.8). | Design constraint | No scale is used. The hero is laid out so the show fits unscaled at all three sizes |
| H3 | The copied show re-measures on every window resize, and its measuring step restarts the loop from the beginning. On phones, the address bar showing or hiding fires a resize, so scrolling near the top could restart the show. Same behaviour as on the login page. | Minor | **Fixed** in the website copy (the one deliberate change from the app): a resize re-measures only when the width changes. e2e: a height-only resize leaves the loop running, a width change restarts it |
| H4 | The ring icon kept the login's `role="img"` and name "Changenius", next to the show's own label, so a screen reader heard the name twice in the hero. | Minor | **Fixed**: the icon is decorative (`aria-hidden`), so the name is heard once, from the show |

## Hero enlargement (owner, 11 Nov 2026)

**What changed.**

1. **Rotating statements removed.** `StatementRotator`, `HERO_STATEMENTS`, their test and e2e assertions, and the `statement-in` / `fade-only` CSS are deleted. The hero keeps the sr-only `h1`, the backdrop video and poster, the pause button (it still pauses the show and the video) and reduced motion.
2. **The show is about 1.6× larger and centred** in a 896 px column (was 448 px): CHANGENIUS up to 88 px (was 56), the formed words and the name above them up to 64 px (was 38), the constellation's centre name 48 px (was 30), the orbit words 28 px (was 19), the closure 88 px. Every size is a fluid `clamp()` that shrinks with the screen width. Stage heights and positions grow with it: the stage height comes from bands of the large-viewport height (`100lvh`; see Fix 1 below): 640 px from 920 px up, 600 px from 730, 560 px from 680, otherwise 480 px. No `transform` or `zoom` is used (H2). The two fixed pixel nudges in the keyframes (the guest T, 12 px; one orbit piece, 8 px) became `em`, so they grow with the letters.
3. **Captions are larger and in sentence case**: 19 px on desktop down to 14 px on a phone (orbit captions and the sub-line 17 px down to 12 px), no uppercase, almost no letter-spacing, centred, allowed to wrap (balanced) within a maximum width.
4. **New owner wording** for the five captions, the three hub-cascade lines and the sub-line ("Governed change · Powered by AI · One chain from strategy to benefit"). The closure stays "The change is in us". The show's accessible name covers all five captions and "The change is in us" in two sentences (Fix 1).
5. **The copy now deliberately differs from the app's login show**; both files carry the new provenance note. The app's own copy is unchanged. The 2× tempo override stays.
6. **Re-measure rule widened slightly**: a resize re-measures when the width **or the large-viewport height band** changes (Fix 1). A phone's address bar does not change `100lvh`, so the H3 fix still holds; a desktop window dragged into another band re-measures instead of keeping stale travel vectors.

**Checks.**

| Check | Result |
|---|---|
| `npm run typecheck` | Pass, 0 errors |
| `npm run lint` | 0 errors, the same 2 warnings |
| `npm test` (Vitest) | Pass: 9 files, **83 tests** (the statement test is replaced by a name test) |
| `npm run build` (assistant off) | Pass. `/` 23.3 kB, 126 kB First Load JS |
| `npx playwright test` (desktop, phone, assistant-off) | **48 passed** on the second full run. First full run: 46 passed, 2 failed in `assistant.spec.ts` ("answers a question…", desktop and phone, the reply not arriving within 20 s on a cold dev server); that spec alone then passed 12/12, and the full run after it passed 48/48. New hero tests: no statement, the show alone with its new name; the five captions, sub-line and closure line present with the owner's text, and sentence case, wrapping, ≥ 17 px desktop / ≥ 14 px phone; pause stops the show **and the backdrop video**, play resumes both; nothing off screen and `scrollWidth ≤ innerWidth` at 390 and 360 px in seven frames covering every act; reduced motion |
| Travelling letters (production build, 1440×900, 1280×720, 390×844, 360×740) | At the instant the born-from-top and constellation duplicates appear, each sits exactly on its source letter: worst distance **0.0 px** at all four sizes, so `measure()` still lines them up |
| Layout, production build, 7 frames × 4 sizes | Nothing off screen, no overlap. Show top/bottom: 178–818 of 900 (1440×900), 116–676 of 720 (1280×720), 138–778 of 844 (390×844), 126–686 of 740 (360×740). The pause button sits clear of the show at all four |
| Screenshots | 32 taken from a production build and looked at (below) |

**Screenshots** (`2026-11-11-shots/`): `desktop-` is 1440×900, `laptop-` 1280×720, `phone-` 390×844 (was a Pixel 7 before), `small-phone-` 360×740. For each: `01-hero-mid-word` (AGENTIC AI with its caption, 13.8 s), `02-hero-close` (CHANGE IN US, 144.6 s), `03-hero-reduced-motion`, `12-hero-assistant-off` (the CHANGE beat, 4 s), `14-hero-hub-cascade` (CHANGE morphing in place with its line, 53.6 s), `15-hero-constellation` (138 s), and new: `16-hero-hub-subline` (the sub-line, 56 s) and `17-hero-chain` (the longest caption, 18.8 s). Frames were held by setting a negative `animation-delay` in a throwaway script; the backdrop video was hidden for the shots, so the poster shows.

**Findings.**

| # | Finding | Severity | Status |
|---|---|---|---|
| H1 | Constellation captions running off a 390 px screen (from the hero swap) | Cosmetic | **Fixed**: orbit boxes are now 44% of the stage (at most 330 px) instead of a fixed 230 px, so at 360 and 390 px every caption stays on screen (tested in e2e). On phones the CHAIN caption wraps to four short lines in the constellation, the others to three |
| H5 | Reduced motion was meant to show the sub-line under the still name, but `.stories span { opacity: 0 }` outranked the reduced-motion `.sSub { opacity: 1 }`, so only the name showed. Present in the app's copy too | Minor | **Fixed** in the website copy (`.stories .sSub`); the sub-line now shows under the still CHANGENIUS (`03-hero-reduced-motion`) |
| H6 | The first sub-line layout wrapped onto two lines on desktop | Cosmetic | **Fixed**: wider maximum width; one line on desktop and laptop, two on phones |
| H7 | At 360 px the closure CHANGE IN US first spanned 20–340 px, close to the 16 px gutter | Cosmetic | **Fixed**: the name's fluid size was reduced from 12vw to 11.5vw |
| H8 | `next dev` / `next build` rewrote `tsconfig.json` (reformatting and adding a `.next-sit-wa` include) | Tooling | Reverted, not committed |

**Not verified.** Contrast of the new caption sizes was not re-measured from screen pixels (the colours are the ones measured before; larger text only helps). No real phone, Safari or Firefox; the address-bar behaviour of the height bands rests on `lvh` being defined as the viewport with the toolbar retracted, not on a device. No screen-reader pass of the new accessible name.

### Fix 1 (review, 11 Nov 2026)

| # | Review point | What changed |
|---|---|---|
| F1 | The `max-height: 760px / 600px` steps sat where a phone's address bar toggles, so the height-based re-measure could bring back the scroll restart (H3) | The stage height is now chosen in the component from **bands of the large-viewport height**: a hidden probe of `height: 100lvh` is read, the band table (920 → 640, 730 → 600, 680 → 560, else 480 px) picks the height, and it is set inline as `--show-h`. A resize re-measures only when the width or that band changes. `lvh` is the viewport with the toolbar retracted, so showing or hiding the address bar never changes it. The CSS `max-height` queries remain only for the first paint before the component runs. The bands are wide (190 px in the phone and laptop range) so ordinary window changes stay inside one |
| F2 | e2e for the bands | New, desktop and phone projects, at 390×800: −60 px (to 740) keeps the same show height and the loop keeps running; 700 px crosses into the next band, the show gets shorter and the loop restarts (re-measured). The older test (−60 px from 900 and from the Pixel 7's 839) still passes |
| F3 | Earlier hero sections read as current | One-line "superseded" pointers added to the report note at the top, the first Screenshots section and the Hero swap section |
| F4 | Accessible name, and the e2e duplicating it | The name now covers all five captions plus "The change is in us" (two sentences). The captions, sub-line, closing line and name live in `src/components/brand/changenius-show-copy.ts`; the show and `e2e/hero.spec.ts` both import it |
| F5 | Non-breaking spaces in the sub-line | **Kept, before each "·" only** (the space after is plain): they bind each dot to the phrase before it, so a wrapped line never starts with "·". On 360 and 390 px phones the line breaks after "Powered by AI ·" (`small-phone-16`, `phone-16`) |

**Checks after Fix 1.** Typecheck 0 errors; lint 0 errors (same 2 warnings); Vitest 9 files / 83 tests; `npm run build` passes (`/` 23.6 kB, 126 kB First Load JS; built into an ignored dist folder because another session's dev server was running from this worktree on 3150); `npx playwright test` **52 passed** (dev server on its own dist folder for the same reason). Moving letters still start on their source letter (0.0 px off) at all four sizes. All 32 hero shots retaken from the production build and looked at: the stage is now 600 px at 1440×900 (198–798), 390×844 (158–758) and 360×740 (106–706), 560 px at 1280×720 (116–676); nothing off screen, no overlap; at 360×740 the GENIUS caption ends level with the pause button, about 55 px to its left, without touching it. Next again rewrote `tsconfig.json` during the runs; reverted, not committed.

## Not tested

- **The live app endpoint (Plan B)**: only the local stub of `/api/public/website-assistant` was used. Real answers, cost limits and the app's own rate limits were not exercised.
- **Real email**: no demo request was delivered to info@cellgenius-ai.com. The stub only says it was.
- **Real video and posters from R2**: there is no `MEDIA_BASE_URL` locally, so films and the main poster return 404. Playback, poster contrast (N5) and the broken-image case (N4) need checking on a Vercel preview.
- **Production Turnstile keys**: Cloudflare's always-pass test keys were used. The hostname pin applies only to an https `SITE_ORIGIN`, so it was not exercised end to end.
- **Vercel itself**: build-time variables, the preview toolbar being blocked by the CSP, and https (`upgrade-insecure-requests`, HSTS).
- **Other browsers and real devices**: Chromium only. The phone was an emulated Pixel 7, not Safari/iOS or Firefox. No screen-reader pass.
