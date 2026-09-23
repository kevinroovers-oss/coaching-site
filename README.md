# kevinroovers.nl

**The site is in Dutch.** This README is not — it sits next to the code, and
the code comments are English. All copy lives in `src/data/content.js`.

A one-page site built around a single idea: **loose parts becoming structure.**

A few hundred abstract elements — thin rods and small faceted nodes — float
freely in the hero. As you scroll they organise themselves into a cluster,
horizontal strata, four separate orbits, a rising helix, a six-node network, a
quiet lattice, and finally one symmetrical ring. Between every formation they
come apart again. The transitions are the point, not the formations.

Vite + vanilla JavaScript, Three.js with custom GLSL, GSAP + ScrollTrigger,
Lenis for smooth scroll. No framework, no 3D models, no textures.

---

## Run it locally

```bash
npm install
npm run dev        # http://localhost:5173
```

```bash
npm run build      # -> dist/
npm run preview    # serves dist/ on http://localhost:4173
```

There is a second page at **`/motion-study.html`**. It is the scene on its own —
no copy, no layout — with the final material, lighting, post chain and easing,
and a label in the corner naming the current formation. It exists to tune the
feel without the site in the way. Scroll it; hold the pointer down for the
heartbeat.

---

## Editing the copy

**All copy lives in `/src/data/content.js`. Nothing is written anywhere else.**
That includes the assistant's system prompt, the accessible names on the two
icon buttons, and the assistant's own error messages — there is no Dutch string
hiding in a JavaScript file.

`vite-plugin-content.js` reads that file and injects it into `index.html` at
build time, so the page ships as real static HTML (good for first paint and for
search) while the copy stays in one place. Edit `content.js`, save, and the dev
server reloads.

Two things the plugin decides, rather than the copy:

- The hero name is split **one word per line** (`Kevin` / `Roovers`). That is a
  line break, not a rewrite — two stacked lines clear the scene on the right and
  give the staggered reveal something to stagger.
- The about heading and the hero line are split at sentence boundaries into
  separate reveal lines.

### The service titles are convictions, not products

Each of the six services leads with a claim about how good organisations work,
not with the name of a deliverable. All six open with the same three words —
*De beste organisaties* — on purpose: the repetition turns the list into a
manifesto and lets the eye read only what changes.

The deliverable is still there; it moved one level down. Each item carries:

| Field | What it is |
| --- | --- |
| `title` | the conviction — what you believe |
| `what` | the deliverable — the *hoe*, which is the part to keep sharpening |
| `proof` | what you actually did |
| `bron` | the books the claim rests on |

`bron` is rendered quietly at the bottom of the overlay. The claims are drawn
from the library in `legacy/boeken.html` — *Powerful*, *Work Rules!*, *Drive*,
*Noise*, *Deep Work*, *Radical Candor*, *It's the Manager*, *Nine Lies About
Work*, *Work Without Jobs*, *The Progress Principle*. Delete the field and the
line disappears.

**Two things this trades away.** The searchable words — *functiehuis*,
*salarishuis* — left the headings, which is where a search engine weighs them
most. They now live in `what`, in prose. To keep them visible to a crawler, the
overlay content is rendered into the page as hidden markup rather than as a JSON
blob, so it is in the DOM and readable without JavaScript. That recovers most of
it, not all. If a ranking on *functiehuis* turns out to matter more than the
positioning, put the word back in one heading.

### Labels that are not in `content.js`

Four short strings had to be invented and are **not** part of the copy. They are
the only ones, and each is there for a reason:

| String | Where | Why |
| --- | --- | --- |
| `01`–`07` | section indicator, principle, step and service numbers | numerals, not words |
| `Geluid` | `aria-label` on the sound toggle | a control needs an accessible name |
| `Sluiten` | `aria-label` on both close buttons | same |
| `Versturen` | `aria-label` on the assistant's send button | same |

The three labels are in `content.ui`, so they are editable like everything else.

---

## Editing the colours

Everything is three values in `/src/styles/base.css`:

```css
:root {
  --bg: #f4f3f0;      /* off-white */
  --ink: #1a1a1a;     /* near-black */
  --accent: #ae460c;  /* deep warm orange */
}
```

The accent is deliberately a touch darker than a typical warm orange. `#C2510F`
only reaches **4.23:1** against the off-white, which fails AA at the 11px sizes
the accent is actually used at. `#AE460C` reaches **5.1:1**.

The scene reads the same three colours, but from JavaScript — change them in
**two** places:

- `src/styles/base.css` — the `:root` tokens above
- `src/scene/Elements.js` — the `uBase`, `uBg` and `uAccent` uniforms

The glass reflects a **fourth set of colours** that the CSS knows nothing about:
`ENV` in `src/scene/Elements.js`. Those four are what make the scene colourful,
so that is the place to go if you want a different mood.

and, if you change the accent, also in `public/favicon.svg` and
`scripts/make-og.mjs`. Then regenerate the share image (below).

---

## How scroll drives the scene

```
window.scroll
   -> Lenis (lerp 0.085)               smooths the wheel
   -> progress 0..1 over the page
   -> Scene.smoothProgress             damped again, lambda 3.4
   -> Elements.apply(progress)         blends formation A into formation B
   -> Scene camera                     damped hardest, lambda 1.9 — arrives last
```

The double damping is what makes scrolling feel heavy: the page, the swarm and
the camera all move at different speeds and never line up exactly.

The formations are anchored to **real elements**, not to hard-coded scroll
percentages (`src/motion/scroll.js`). Each formation names a selector, and its
position on the timeline is recomputed from that element's actual offset on load
and on resize — so changing a section's height, or the copy inside it, keeps
everything landing in the right place.

### The formations

| # | Formation | Section | What it is |
| --- | --- | --- | --- |
| 1 | `drift` | Hero | A loose shell. No order yet, but a silhouette. |
| 2 | `cluster` | About | A woven sphere; rods tangent to the surface. |
| 3 | `strata` | Principle 1 — *Eerst structuur* | Five level horizontal layers. The most architectural one. |
| 4 | `orbits` | Principle 2 — *Leiders die het zelf kunnen* | Four separate centres, each with its own rings. No middle any more. |
| 5 | `spiral` | Principle 3 — *Begin bij wat werkt* | One helix growing outward and upward from a dense core. |
| 6 | `steps` | Hoe ik het met je opbouw | Five flat treads climbing left to right. The one formation you can count. |
| 7 | `network` | Wat ik voor je bouw | Six hubs, one per service, wired by members along ten edges. |
| 8 | `lattice` | Opleiding en certificering | Four quiet upright rows — one per credential. Deliberately does not compete with the list. |
| 9 | `ring` | Contact | One symmetrical circle. The camera pulls back and stops. |

Formations live in `/src/scene/formations.js` and are plain functions — no
Three.js in that file, so they stay easy to read and to retune. Camera and
staging per formation are the `VIEWS` table at the top of `/src/scene/Scene.js`.

---

## The assistant

A chat panel that answers questions about the work. It is grounded in
`src/data/content.js` — the same file the page is built from — so there is one
source of truth for what it is allowed to say.

- **Backend:** `api/chat.js`, a Vercel Edge Function. The API key lives there
  and never reaches the browser.
- **Model:** `claude-opus-5`, streamed, adaptive thinking at `low` effort. A
  website Q&A does not repay deep reasoning, and low effort keeps the first
  token quick.
- **Caching:** the system prompt is long and never changes, so it is marked
  cacheable. After the first question in a five-minute window the input costs
  roughly a tenth.
- **Grounding:** it answers only from the reference, never invents numbers,
  clients, prices or availability, and points at the email address for anything
  it does not know. It answers in Dutch by default and addresses the visitor as
  *je*; write to it in another language and it replies in that one. Two to four
  sentences, plain prose.
- **Frontend:** `src/ui/assistant.js`. Same dialog family as the service
  overlay, focus-trapped, Escape to close.

### Switching it on

It needs one environment variable in the Vercel project:

```
ANTHROPIC_API_KEY = sk-ant-...
```

Get one at console.anthropic.com. **Without it the endpoint returns 503 and the
panel says the assistant is offline** — it never fails silently, and the rest of
the site is unaffected. On a preview with no backend at all (a static file
server, or before the first deploy) the panel says so and gives the email
address instead.

### What it costs, and what to watch

Every conversation is billed to that key. Opus 5 is $5 per million input tokens
and $25 per million output; the system prompt is roughly 1,500 tokens, cached
after the first hit, and answers are capped at 800 tokens. A typical exchange is
fractions of a cent, but **there is no spend cap in this code** — set a monthly
budget limit on the API key in the Anthropic console before you point a domain
at this.

Rate limiting is deliberately thin: a per-isolate counter that slows a casual
flood and nothing more. Before any real traffic, add rate limiting on the
`/api/chat` route in Vercel's firewall settings. Input is capped at 1,000
characters per message and 20 messages per conversation, server-side.

---

## Findability

The site is in Dutch, which is the part that actually matters: your clients are
Dutch companies and they search in Dutch. The rest supports that.

- The `<title>` is `meta.pageTitle`, not the bare name — that is the line a
  stranger reads in a search result, and it carries the two words people
  actually type: *functiehuis* and *salarishuis*. Since the service headings
  now lead with convictions, the title is where those words still sit in a
  heading position.
- `meta.subjects` lists the subject terms in the vocabulary clients use —
  functiehuis, salarishuis, salarisbandbreedtes, loopbaanpaden, EU-richtlijn
  loontransparantie, interim HR. They are plain vaktermen, not keyword
  stuffing: each one describes work that is on the page.
- JSON-LD in the head describes a `Person`, a `ProfessionalService` with its
  offer catalogue and `inLanguage: nl`, and a `HowTo` built from the five
  steps. All generated from `content.js`; none of it hand-maintained.
- `<html lang="nl">`, `robots.txt` and a generated `sitemap.xml` carrying the
  canonical URL. The motion study is excluded and carries `noindex`.
- The copy ships as real static HTML, so there is nothing for a crawler to
  execute.

What none of this does is get you ranked. Structured data tells a search engine
what the page is; it does not tell it the page deserves to be first. That comes
from other sites linking to yours and from people searching your name and
clicking. If this matters commercially, the next thing worth doing is not more
markup — it is getting the URL onto your LinkedIn profile, your email signature,
and anywhere else that already has your name on it.

---

## Folder structure

```
src/
  data/content.js          all copy
  scene/
    Scene.js               renderer, camera, staging, loop
    Elements.js            the swarm: two InstancedMeshes, formation blending
    formations.js          where every element wants to be, per section
    post.js                bloom / grain / vignette, hand-rolled
    shaders/*.glsl         element material, ground pool, post passes
  motion/
    easing.js              the one easing vocabulary + frame-rate-safe damping
    scroll.js              Lenis, the progress signal, timeline anchoring
    reveal.js              staggered line reveals
  ui/
    preloader.js  cursor.js  magnetic.js  indicator.js  overlay.js
    assistant.js           the chat panel
  audio/ambient.js         Web Audio bed + tick, no files
  styles/                  base (tokens), typography, sections, ui
api/chat.js                the assistant's backend (Vercel Edge Function)
scripts/                   one-off asset generators (share image, portrait)
legacy/                    the previous Dutch one-pager, moved aside untouched
```

---

## Details worth knowing

**Materials — the glass.** No standard Three.js material anywhere. The elements
are glass, built from five things in one `ShaderMaterial`:

1. **Refraction.** A screen-space lookup into a backdrop buffer, displaced along
   the surface normal.
2. **Dispersion.** Each colour channel is displaced by a different amount, which
   is where a coloured edge comes from.
3. **Reflection.** A small procedural studio — warm above, cool below, one amber
   key, one teal fill — sampled by the reflection vector.
4. **Specular.** One tight bright highlight. This is what says "hard surface".
5. **Absorption.** Light crossing near the silhouette travels further through
   the glass and comes out darker.

Point 3 is where the colour lives, and it is the one that is easy to get wrong.
Two things that were tried and thrown away: giving each element its own hue
turns the swarm into confetti, and putting colour only on the rim is invisible
on a rod four pixels wide. Reflecting a shared environment fixes both — elements
pointing different ways catch different parts of it, the way real glass does,
and the palette is then four editable colours rather than noise. Point 5 matters
more than it sounds: without it a lone element on the off-white simply vanishes.

The **backdrop buffer** is the swarm drawn once more at an eighth resolution
with a cheap flat material, then blurred twice. Dense parts of a formation come
out foggy and solid; a lone element stays almost clear. It costs two extra draw
calls and two very small blurs.

**The glass dials** are `GLASS_PRESETS` at the top of `src/scene/Elements.js`,
and the palette is `ENV` just above them.

| Preset | What it is |
| --- | --- |
| `quiet` | **The default.** Smoked glass: the mass still reads near-black and the colour lives in the glints. It keeps the silhouette that made the hero work. |
| `liquid` | Clearly glass, clearly coloured, still a calm object. More colour, less weight. |
| `prism` | Full spectrum. Bright and playful, and a long way from "calm and precise". |

Switch permanently by changing the fallback in `src/main.js`, or compare them
without rebuilding by adding `?glass=prism` to the URL. `/motion-study.html`
takes the same parameter.

**Lighting and shadow.** There are no lights in the scene — the key and fill are
directions in a shader, not `DirectionalLight`s. A shadow map over a
few hundred scattered rods gives you a field of little dashes that reads as
dirt, so the contact shadow is one soft elliptical pool on an invisible floor
(`ground.frag.glsl`) that follows the swarm and fades out as formations tighten.

**Post.** Hand-rolled instead of `EffectComposer`: a saturation-keyed brightpass
(a luminance threshold would bloom the off-white background, not the accent),
two blur passes at quarter resolution, then a composite with a light vignette
and fine grain that doubles as dithering. Four small passes, and it keeps about
30 kB of addons out of the bundle.

**Easter egg.** Press and hold anywhere on the hero — or hold the **H** key —
and every element breathes to a heartbeat at about 62 bpm, lub-dub, expanding
from the centre. Release and it settles. Nothing tells you it is there.

**Sound.** Off by default; the toggle is bottom-right. On, it generates a quiet
tonal bed on a perfect fifth (C3 / G3 / C4, heavily lowpassed, each voice on its
own slow drift) plus a short tick when a formation completes. Generated entirely
with the Web Audio API — no audio files.

**Services ↔ scene.** Hovering or focusing a service card lights the matching hub
in the network, keeps the members on its edges at full ink, and steps everything
else back. The relationship shows as contrast, not colour — tinting the members
part-way to orange over a grey base only made them muddy.

**Mobile.** The same scene, the same formations, the same transitions — restaged,
not stripped. The swarm moves to the top of the viewport instead of to the
right, scaled per formation to fit a portrait frame, and each text column
carries a soft field of background with it so a long list stays readable while
it scrolls through. Element count drops from 300 to 140 and pointer effects are
off. The one genuine difference: on a wide screen the closing ring frames the
contact details; a portrait frame cannot contain a block that tall, so there the
ring sits above them.

**Reduced motion.** With `prefers-reduced-motion: reduce` the page shows a static
formation per section, no scroll-driven animation, no drift, no parallax, no
heartbeat. The renderer stops running a loop entirely and only redraws when
something actually changed.

**Accessibility.** Heading hierarchy is `h1` → `h2` → `h3` throughout. Service
cards are real buttons, reachable and operable by keyboard, and the overlay is an
`aria-modal` dialog that traps focus and returns it on close. Focus rings are the
accent. All body and secondary text clears **4.5:1** against the background;
`--ink-62` is the lightest ink used for text, and anything quieter is only used
for rules and marks. The section indicator is `aria-hidden`: it has no
interactive children and only restates where you are on a page you are already
scrolling, so a `nav` landmark would have been a lie.

---

## Performance

Measured on the built output (`npm run build`), served by `vite preview`, in
headless Chromium at 1440×900.

**Transferred, gzipped**

| | gzip |
| --- | --- |
| `three` | 117.5 kB |
| `gsap` + ScrollTrigger | 45.5 kB |
| scene + shaders + Lenis | 18.1 kB |
| site code (incl. the chat panel) | 5.3 kB |
| **JavaScript total** | **185.3 kB** |
| CSS | 4.7 kB |
| HTML | 4.6 kB |
| Inter (latin subset, woff2) | 71.2 kB |
| Portrait (webp, lazy) | 98.7 kB |

Budget was 300 kB of JavaScript gzipped. **185.3 kB.** The Anthropic SDK is not
in this — it only exists in the Edge Function, which Vercel bundles separately
and the browser never downloads.

**Loading** — 9 requests, 362.8 kB encoded in total (the portrait is most of
that, and it is lazy-loaded below the fold). First contentful paint **140–200 ms**
across runs, load **220 ms–1.4 s** depending on how the software renderer in
this container behaves on the first frame. These are local-server
numbers with no network latency: treat them as the floor, not as a field
measurement. Budget was < 1.5 s first paint. The font is self-hosted and
preloaded, so there is no third-party connection before first paint.

**Per frame** — the site's own JavaScript (formation blending, damping, and
writing 300 instance matrices) costs **0.20 ms median, 0.40 ms p95** out of a
16.7 ms budget, over 240 frames. The glass added nothing measurable to that: its
cost is entirely GPU-side. Draw calls are now 11 — the swarm twice (2 + 2), the
ground once, two blurs for the backdrop, and four for bloom and composite.

**What is not measured here.** This container has no GPU; Chromium runs on
SwiftShader, so a frame rate measured here would be meaningless. The 60 fps
claim on a recent MacBook is **not verified** — the JavaScript budget above is,
and the GPU work is small (11 draws, 300 instances, an eighth-resolution
backdrop, quarter-resolution bloom, no shadow map), but please check it on your
own machine and tell me what you see. If it needs headroom, the first dial is
`count` in `src/scene/Scene.js`, and the second is `refraction: 0` in the glass
preset, which skips nothing but makes the backdrop buffer irrelevant.

---

## The portrait

`public/img/kevin-roovers.webp` is generated from `legacy/portret-2026.webp` by
`scripts/make-portrait.mjs`. The source is a greyscale subject on a flat light
backdrop, and that backdrop is never exactly this page's off-white. The
difference shows: a portrait sitting in a column of `#F4F3F0` with its own grey
rectangle around it reads as a pasted-in photo.

So the script measures the backdrop from the four corners rather than assuming
it, then maps that value onto the page background and carries every tone below
it along. The subject is converted to pure grey first — a colour cast in the
source fights the warm off-white — and the result is composited onto the
background instead of shipping an alpha channel, which sidesteps every encoder
that quietly flattens transparency to black.

The crop is built around the subject, not around the canvas: the script finds
the ink, frames 4:5 around it with a little air above the hair, and resizes to
720x900.

```bash
npm i -D playwright && npx playwright install chromium
node scripts/make-portrait.mjs
```

If you swap the source photo, re-run it and update `portrait.width` /
`portrait.height` in `content.js`. The `--bg` value is duplicated at the top of
the script — keep the two in step.

---

## Regenerating the share image

`public/og-image.jpg` and `public/apple-touch-icon.png` are generated from the
live site, so the share card is the actual hero.

```bash
npm run build && npm run preview     # in one terminal
npm i -D playwright && npx playwright install chromium
node scripts/make-og.mjs             # in another
```

Re-run it after changing the accent, the hero copy, or the hero staging.

---

## Deploying to Vercel

No configuration file is needed — Vercel detects Vite.

```bash
npm i -g vercel
vercel          # preview
vercel --prod   # production
```

Or connect the repository at vercel.com and accept the defaults:

- Framework preset: **Vite**
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

`api/chat.js` is picked up automatically — no configuration needed. **Set
`ANTHROPIC_API_KEY` in Settings → Environment Variables** or the assistant will
report itself offline.

Then point `kevinroovers.nl` at the project in **Settings → Domains**, and set
the real domain in `meta.url` in `src/data/content.js` so the canonical link and
the Open Graph image URL are absolute.

`/motion-study.html` is built too and carries `noindex`. Delete
`motion-study.html` and `src/motion-study.js`, and drop the extra `input` entry
from `vite.config.js`, if you would rather it never ships.

---

## The previous site

The old Dutch one-pager and the book-summaries app now live in `legacy/`,
untouched. Nothing links to them. Delete the folder, or move the files back, as
you prefer.
