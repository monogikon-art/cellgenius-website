# System test report — five-illustration hero

**Date:** 12 Nov 2026 · **Branch:** `hero/five-illustrations` (worktree `C:/Websites/cellgenius-website`), tested at `8f9ed68` · **Not pushed, not deployed.**
No source code was changed during this test.

## Result in one paragraph

Every automated check passed: typecheck clean, lint 0 errors, 99 unit tests, production build, 56 end-to-end tests. All 30 scene screenshots (5 scenes × a word beat and the closure × 3 sizes), the 3D C close-up and the reduced-motion page were taken and looked at. Nothing is off-frame, overlapping or unreadable in any of them. The production build makes requests only to `localhost`, shows no console errors other than the missing film poster, and pause and play work. On a 4× slowed phone profile the stage holds 60 fps on a 1× screen for the circuit and 48 fps for the particles; at 2× pixel density (a real phone) it falls to 50–58 for the circuit and **33–36 for the particles**, still above the 30 fps floor but with the least headroom of any scene. No defect was found. Six small observations are listed below. Real phones and Safari were not tested.

## Scope

The new hero: a canvas stage that loops five illustrations (golden circuit, particles, rising words, the bank's DNA, orbit). Each shows seven words (CHANGE, AI, AGENTIC AI, CHAIN, SIGN, GAIN, GENIUS) with captions, then a CHANGE IN US closure. Under a larger 3D C with light motion. The pause button, reduced motion and the stage's size bands are in scope. The assistant, films and sign-in panel were not changed and were not re-tested beyond the end-to-end run.

## Environment

Windows laptop, Chromium (Playwright). Dev server `npm run dev -- --port 3150` (with a private dist folder so it could not clobber the build) for the screenshots, using the start override `?scene=<id>&t=<seconds>`; production build served with `npm run start -- --port 3150` for the network, console, pause/play and smoothness checks. Ports 3100, 3101, 3199 and 3150 were free before and after. Every server started was stopped.

## Checks run

| # | Check | Result |
|---|---|---|
| 1 | `npm run typecheck` | Pass, 0 errors |
| 2 | `npm run lint` | Pass: 0 errors, 2 warnings that were already there (anonymous default export in `eslint.config.mjs` and `postcss.config.mjs`) |
| 3 | `npm run test` (Vitest) | Pass: 11 files, **99 tests** |
| 4 | `npm run build` | Pass. Route `/` 29 kB, 131 kB First Load JS (was 23.6 kB / 126 kB before this branch) |
| 5 | `npm run e2e` (desktop and phone projects, assistant-off project) | Pass: **56 passed** in 1.0 min. This includes the loop test, pause and play, the hidden-tab hold, the size bands, nothing off screen at 390 and 360 px, and reduced motion |
| 6 | Screenshots, 30 scene images + 3D C close-up + reduced-motion page | Taken and looked at. See the list below |
| 7 | Production build, console | Only the film poster 404 (`/media/films/changenius-film-2min-v1-poster.jpg`). `MEDIA_BASE_URL` is not set locally, so every `/media/*` file 404s; this is expected here and was the same in the previous report. No other error or warning, no page error |
| 8 | Production build, hosts | Every request, 15 in all, went to `http://localhost:3150`: the page, `/hero/mark-3d.webp`, `/hero/backdrop-poster.webp`, `/hero/backdrop.webm`, the Next static chunks and the film poster. No other host |
| 9 | Pause and play (production build, `data-show-seconds`) | Pass. Running: 6.4 s. After Pause: 6.4 s, still 6.4 s 2.5 s later. After Play: 8.9 s after 2.5 s. The first scene shown is `circuit` |
| 10 | Scene order and loop from orbit back to circuit | Not watched for a full 198 s loop. Confirmed from the unit tests (`sceneAt` order and the loop-from-orbit case) and the e2e loop test, both passing |
| 11 | Smoothness, 390×844, CPU 4× slower, 5 s of frames, production build | See the table below |

## Smoothness (390×844, CPU throttled 4×)

| Scene and moment | Production, 1× pixels | Production, 2× pixels (phone density) | Dev server, 1× (from the build's fix report) |
|---|---|---|---|
| Circuit, early (about 6–11 s) | 60.1 | 58.3 | 60.2 (at 8 s) |
| Circuit, SIGN beat (about 22–27 s) | 60.1 | 50.2 | 60.1 (at 30 s) |
| Particles, early (about 41–47 s) | 47.8 | **33.5** | 46.8 (at 8 s of the scene) |
| Particles, GAIN beat (about 66–71 s) | 48.0 | **35.5** | 49.2 (at 19.4 s of the scene) |
| Helix, t=25 | not measured | not measured | 60.2 |
| Orbit, t=33 | not measured | not measured | 60.1 |
| Rising, t=15 | not measured | not measured | 59.8 |

The dev-server column is from the build's fix report, not from this test, and was measured on the dev server (pixel density not recorded). The production numbers are mine. Production at 1× agrees with dev, so the optimisations hold in the real build. The 2× column is the realistic one for a phone; helix, orbit and rising were not re-measured on the production build or at 2×.

## Findings

### New in this test (none is a defect; nothing was fixed)

| # | Finding | Severity | Status |
|---|---|---|---|
| S1 | **Particles scene has the least smoothness headroom.** At phone pixel density (2×) and a 4× slower CPU it runs 33.5–35.5 fps on the production build, against 48 at 1×. It is above the 30 fps target. A real mid-range phone may be faster or slower than this emulation. | Low | Open, for the owner to judge. If a real phone shows judder, the particle count (4,000 on narrow screens) is the lever |
| S2 | **The DNA strands end in a hard vertical cut** at the left and right of the helix, most visible on the phone (`helix-chain-390x844`): the two strands and the rungs stop at a straight edge rather than fading. The letters C and S sit just inside the cut. | Cosmetic | Open. May be intended |
| S3 | **The 3D C has a faintly ragged left edge** at 2× on a 390 px screen (`circuit-sign-390x844`, zoomed). The close-up at 1440×900 (2×) is soft but clean. The artwork is a 384 px image shown at 72 px, so the unevenness is likely the tilt animation's resampling. | Cosmetic | Open |
| S4 | **Particle letters are less contrasting on a phone** (`particles-gain-390x844`, `particles-closure-390x844`): the dust word is legible but grey over the warm glow, where on desktop it is clearly golden. Contrast was not measured from pixels. | Cosmetic | Open |
| S5 | **At 768×1024 the stage is small for the screen**: captions are about as small as on a phone (by eye, about 12–13 px; not measured) and the stage sits in the middle with open space above and below. Nothing is clipped or overlapping. | Cosmetic | Open |
| S6 | **Tooling.** The end-to-end run starts dev servers that overwrite `.next`, so a `next start` after it fails with "could not find a production build" until `npm run build` is run again. And `next dev` rewrote `tsconfig.json` again (reformatting only). | Tooling | Rebuilt before starting the production server; `tsconfig.json` restored with `git checkout`, not committed |
| S7 | **Dev indicator in the first screenshots.** The first set showed Next's round "N" development badge in the bottom-left. It is not part of the site. | Tooling | Not a finding on the site. The badge was hidden (a one-line style in the capture script) and all 30 images were retaken. The shots in the folder have no badge |

### Found and fixed during the build (kept listed, with the fix)

These come from the build's progress notes and final fix report (commits `0ba428d`, `84f1d85`, `b3c8d94`, `8f9ed68`, after the five-illustration build `ef440bb..4851445`). They were not re-found in this test: the final screenshots show no sign of them.

| # | Finding | How it was fixed |
|---|---|---|
| F1 | Rising words and DNA captions grew up into the word (the two-line helix caption reached 241 px against a word bottom of 245) | Captions anchor to their top edge, placed below the word (`capTop = wy + size/2 + 60/80`; helix `wordY + size*0.36 + 50/64`) |
| F2 | Orbit's gold name faded too late and showed as a gold blur over the white letters when the closure glide started (t=35.8) | The gold name now finishes before the closure glide starts (p 0.20) |
| F3 | Scene stubs left in the registry; unused helpers (`drawRestingName`, `captionY`, `C.muted`) | Stubs removed, registry typed with `satisfies Record<SceneId, Scene>`, dead code deleted |
| F4 | Repeated word-fit, caption measuring and rest-colour code in several scenes | Shared `fitWordSize`, `captionMeasurer` and `restColor` in `kit.ts` |
| F5 | Letter spacing set by the browser measured wrongly on canvas | No `letterSpacing` anywhere; every run measured and drawn glyph by glyph (`runWidth`, `centres`) |
| F6 | Circuit and helix ran at 47–53 fps on the 4× phone profile | The holo effect draws only the word's band. Circuit 47.6 → 60.2, helix 51.4 → 60.2 |
| F7 | The stage height waited for fonts, so the stage jumped | `--show-h` is set before fonts load; only drawing waits |
| F8 | Particle scene built on its first frame (a visible pause) | Each scene is prepared in idle time for the current frame, one per idle callback |
| F9 | Closing caption sat at different distances under the line in different scenes | One offset for all five closures (particles uses the same from its own name layout) |
| F10 | The screen reader label ran on as one sentence; a letter-index test missed the space reset | Label is short sentences; test added for `AGENTIC AI` |
| F11 | No test for a hidden tab | e2e: time stops while the tab is hidden and resumes when shown |
| F12 | Spec out of date on the particles closure, hand-over and sizes | Spec updated |

From the earlier tasks, for the record (all fixed in review): fade ramps, caption fit per frame, narrow caption gap under the word (raised to +80), orbit ghost at the closure, the particle count per width (narrow count 4,000 for 46–55 fps at 4× throttle), and the helix's wide-screen position.

## Not tested

- **Real devices.** No iPhone or Safari, no real Android phone. The phone was an emulated 390×844 Chromium with a 4× CPU slowdown, which is an estimate of a mid-range phone, not a measurement of one.
- **Other browsers.** Chromium only. No Firefox, no Safari.
- **The deployed site** (Vercel): https, the CSP in production, film files and posters from R2 (`MEDIA_BASE_URL` is not set here, so `/media/*` is 404).
- **Contrast** of the new captions and the dust letters was not measured from pixels, only seen.
- **Screenshots from the production build.** The start override exists only in dev, so the shots were taken on the dev server. The production build was checked for network, console, pause/play and smoothness, not frame by frame.
- **Helix, orbit and rising smoothness on the production build or at 2×**, and any scene on a window size other than the ones listed.
- **Screen-reader pass** of the new label.

## Screenshots

`docs/sit/2026-11-12-hero-five-illustrations/`, JPEG quality 82, 1.4 MB in all. Sizes: `1440x900` desktop, `768x1024` tablet, `390x844` phone (2× pixels, so those files are 780×1688). Scenes were held at the stated scene time with the dev start override, after the page had loaded; the backdrop video is not shown (the poster shows). Each file name is `<scene>-<moment>-<size>.jpg`. All were looked at.

| Files | Shows | Seen |
|---|---|---|
| `circuit-sign-*` | Circuit at 23.8 s: the word SIGN sent to the letters of the name over the golden traces, caption "A person signs every decision, on the record" | OK at all three sizes |
| `circuit-closure-*` | Circuit at 37.5 s: CHANGE IN US, "The change is in us" | OK |
| `particles-gain-*` | Particles at 28.4 s: GAIN made of dust, caption "Every gain measured and written back to the strategy" | OK. Dust is greyer on phone (S4) |
| `particles-closure-*` | Particles at 37.5 s: CHANGE IN US in dust | OK |
| `rising-agentic-ai-*` | Rising words at 14.6 s: CHANGENIUS above AGENTIC AI, caption "150 AI agents prepare the work, your people decide" | OK. Caption clear of the word at all sizes |
| `rising-closure-*` | Rising words at 37.5 s: closure | OK |
| `helix-chain-*` | The bank's DNA at 19.2 s: CHAIN above the strand with the letters of CHANGENIUS riding it, caption "One chain covering strategy, planning, delivery and benefits realisation" | OK. Hard cut at the strand ends (S2) |
| `helix-closure-*` | DNA at 37.5 s: closure | OK |
| `orbit-all-seven-*` | Orbit at 34 s: all seven words placed round CHANGENIUS with their captions (4 + 3 on desktop and tablet, 2 + 2 + 2 + 1 on phone) | OK. Nothing clipped |
| `orbit-closure-*` | Orbit at 38 s: closure | OK |
| `c-3d-closeup-1440x900.jpg` | The 3D C and its gold star, 2× pixels, cropped to the C | OK, soft but clean (S3 on phone) |
| `reduced-motion-1440x900.jpg` | Reduced motion: still CHANGENIUS under the C, no animation, pause button present | OK |

## Verdict

**Pass, with observations.** No defect. Everything the build set out to do is in place and the checks agree. Before the owner announces it, someone should look at the particles scene on a real phone (S1), and at the strand ends and the C's edge if they are bothered by them (S2, S3). Real-device and deployed-site checks are still to do.
