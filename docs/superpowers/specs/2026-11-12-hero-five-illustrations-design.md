# Hero: five illustrations from CHANGENIUS, and a 3D C — design

12 November 2026. Owner-approved in conversation the same day. Replaces the hero show of
`2026-11-11-changenius-landing-design.md` (the single CSS wordmark show) and keeps everything else on
the page as it is.

## What the owner asked for

1. The C symbol bigger and 3D, like the films, with a light motion feeling.
2. The three illustrations built for the CEO film (golden circuit, particle morph, the bank's DNA) added
   beside the two ways the current show already has (rising words and the orbit). Every illustration
   shows all the words, now including SIGN and GAIN, and every one closes on CHANGE IN US.
3. Each illustration plays once; after the last, the show loops back to the first.

## Decisions (owner, 12 Nov 2026)

| Question | Decision |
|---|---|
| Order | 1 Golden circuit → 2 Particles → 3 Rising words → 4 The bank's DNA → 5 Orbit, then back to 1. The circuit opens because it shows the words being drawn straight out of the name, so a visitor understands the idea from the start; the orbit closes because it gathers every word at once. |
| The C | The film's own rendered porcelain-and-gold C, about twice today's size, with light motion: a gentle float, a small 3D tilt, a soft light sweep every few seconds and a glinting spark. Not live 3D. |
| Words, in this order, in every illustration | CHANGE → AI → AGENTIC AI → CHAIN → SIGN → GAIN → GENIUS, then CHANGE IN US. |

## Captions

Sentence case, no closing full stop, as on the live site today.

| Word | Caption |
|---|---|
| CHANGE | Every change in your organisation, governed end to end |
| AI | Powered by artificial intelligence, grounded in your own policies |
| AGENTIC AI | 150 AI agents prepare the work, your people decide |
| CHAIN | One chain covering strategy, planning, delivery and benefits realisation |
| SIGN | A person signs every decision, on the record **(new)** |
| GAIN | Every gain measured and written back to the strategy **(new)** |
| GENIUS | Built-in Genius automation keeps every step moving |
| CHANGE IN US | The change is in us |

"150 AI agents" stays as it is: the app's agent catalogue holds exactly 150.

## The five illustrations

All five are drawn on one canvas stage, so each starts and ends cleanly and the sequence is one
timeline. Each is about 40 seconds: a short arrival of the name, seven word beats of about 4.6 seconds
(the word is traced or formed, rises, its caption holds, it fades), then the CHANGE IN US closure of
about 5 seconds, then the hand-over to the next illustration: there is no overlap; each scene dips to a
quarter brightness at the boundary and the next one rises from the same quarter. The full loop is about
3½ minutes.

Sizes as built, on a 1920 by 1080 stage for computers and a 1080 by 1350 stage for phones, both scaled to
fit: the name is 150 px (computer) and 124 px (phone), and every name or word is shrunk to fit within 92%
of the stage width. The words are 150 to 300 px on a computer and 104 to 220 px on a phone, depending on
the illustration and the word's length (AGENTIC AI is the smallest).

1. **Golden circuit** (from the CEO film). CHANGENIUS sits low on the stage; for each word a gold
   circuit trace runs under the name and visits that word's letters in turn, each letter lights as the
   trace reaches it, beams rise from the lit letters and the word forms above in striped gold with its
   caption. Earlier words' traces stay as faint periwinkle lines. The film's thirteen-chapter route
   map is not used.
2. **Particles** (from the CEO film). Light dust gathers into CHANGENIUS, then bursts and re-forms
   into each word in turn, gold with a share of periwinkle, with the caption beneath. The dust itself
   forms CHANGE IN US at the end; this illustration does not use the shared letter closure below.
3. **Rising words** (today's show, redrawn). The name sits centred; for each word, copies of its
   letters lift out of the name and travel to form the word below, with the caption under it. Same
   colours as today: white letters, the A and I of AI in periwinkle, gold for the selected letters,
   AGENTIC in the cyan-to-pink sheen with the T arriving as a white guest from outside the name. The
   short "words change in place" part of today's show is folded into this one.
4. **The bank's DNA** (from the CEO film). The name's letters ride a slowly turning double helix, gold
   and periwinkle strands with rungs; for each word its letters light gold on the helix, in order, and
   the word rises above in striped gold with its caption. No "bank" text appears on screen.
5. **Orbit** (today's show, redrawn). Each word flies out of the name to its own place around it, with
   its caption, and they accumulate; seven places in a ring instead of today's five. Then the name turns
   gold.

**The closure, shared by four (all but Particles, whose dust forms it):** the name's letters move to spell CHANGE IN US (CHANGE in white,
IN US in gold, the N and I swapping places as today), with "The change is in us" beneath, then the next
illustration begins.

Letters come only from CHANGENIUS. SIGN and GAIN use its letters; AGENTIC needs a T the name does not
have, which arrives as a white guest letter in every illustration.

## The 3D C

- Source: the film's Blender render of the mark (frame 284 of `exec-film/blender/mark-close` in the
  ppm-app Remotion project), which has a transparent background. Cropped to the C and spark and saved
  as a transparent WebP at twice its display size (one file, no video).
- Size: about 96 px on a computer and 72 px on a phone (today 56–80 px).
- Light motion, in CSS: a float of a few pixels over about 6 seconds, a tilt of a few degrees in 3D
  over about 9 seconds, a soft light sweep across the C every few seconds (masked to its shape), and a
  slow glint on the spark.
- It stays decorative (hidden from screen readers), as today.

## Behaviour

- The pause button pauses the show and the C's motion together.
- The show stops drawing while the hero is out of view or the tab is hidden, and resumes where it was.
- A visitor whose device asks for less motion sees the still name and the still C; no illustration
  plays.
- The stage keeps the hero's current height bands. On a narrow screen the illustrations use a
  narrower layout so the name and words stay readable; phones get fewer particles.
- Screen readers get one label describing the show (the hidden page title and a label naming all eight
  words and captions), as today.
- Nothing new is loaded from another site; the page's security rules do not change.

## How it is checked

- Tests for the timeline (which illustration and which word play at a given moment, the loop back to
  the first), the letter mapping for every word (including the T guest), and that pausing, a hidden tab
  and less motion stop the drawing.
- The hero's browser test updated: the stage is present, the label names all eight words, the pause
  button works.
- Screenshots of each illustration at phone, tablet and computer sizes, compared side by side with
  today's show for rising words and the orbit.
- A smoothness check on a slowed-down phone profile, particles included.
- Built locally and shown to the owner; deployed to production only on the owner's yes.
