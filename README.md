# kevinroovers.nl

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

### Labels that are not in `content.js`

Four short strings had to be invented and are **not** part of the copy. They are
the only ones, and each is there for a reason:

| String | Where | Why |
| --- | --- | --- |
| `01`–`06` | section indicator, principle and service numbers | numerals, not words |
| `Sound` | `aria-label` on the sound toggle | a control needs an accessible name |
| `Close` | `aria-label` on the overlay close button | same |
| `Section` | *(removed)* | the indicator is now `aria-hidden` — see below |

Say the word if you want any of them changed or removed.

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
| 3 | `strata` | Principle 1 — *Structure first* | Five level horizontal layers. The most architectural one. |
| 4 | `orbits` | Principle 2 — *Leaders who do it themselves* | Four separate centres, each with its own rings. No middle any more. |
| 5 | `spiral` | Principle 3 — *Start with what works* | One helix growing outward and upward from a dense core. |
| 6 | `network` | Services | Six hubs, one per service, wired by members along ten edges. |
| 7 | `lattice` | Credentials | Four quiet upright rows. Deliberately does not compete with the list. |
| 8 | `ring` | Contact | One symmetrical circle. The camera pulls back and stops. |

Formations live in `/src/scene/formations.js` and are plain functions — no
Three.js in that file, so they stay easy to read and to retune. Camera and
staging per formation are the `VIEWS` table at the top of `/src/scene/Scene.js`.

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
  audio/ambient.js         Web Audio bed + tick, no files
  styles/                  base (tokens), typography, sections, ui
legacy/                    the previous Dutch one-pager, moved aside untouched
```

---

## Details worth knowing

**Materials.** No standard Three.js material anywhere. Elements use one
`ShaderMaterial` with a wrapped two-light studio term, a fresnel rim, and a slow
noise gradient. The rim is kept small on purpose: a rod is mostly edge-on to the
camera, so an unshaped fresnel washes the whole thing pale.

**Lighting and shadow.** There are no lights in the scene. A shadow map over a
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
| scene + shaders + Lenis | 16.8 kB |
| site code | 4.0 kB |
| **JavaScript total** | **183.8 kB** |
| CSS | 3.8 kB |
| HTML | 3.5 kB |
| Inter (latin subset, woff2) | 71.2 kB |

Budget was 300 kB of JavaScript gzipped. **183.8 kB.**

**Loading** — 8 requests, 260.6 kB encoded in total. First contentful paint
**144 ms**, DOMContentLoaded **221 ms**, load **222 ms**. These are local-server
numbers with no network latency: treat them as the floor, not as a field
measurement. Budget was < 1.5 s first paint. The font is self-hosted and
preloaded, so there is no third-party connection before first paint.

**Per frame** — the site's own JavaScript (formation blending, damping, and
writing 300 instance matrices) costs **0.30 ms median, 0.40 ms p95, 1.5 ms max**
out of a 16.7 ms budget, over 240 frames. The swarm is 2 draw calls, the ground
is 1, and post is 4 — 7 in total.

**What is not measured here.** This container has no GPU; Chromium runs on
SwiftShader, so a frame rate measured here would be meaningless. The 60 fps
claim on a recent MacBook is **not verified** — the JavaScript budget above is,
and the GPU work is small (7 draws, 300 instances, quarter-resolution bloom,
no shadow map), but please check it on your own machine and tell me what you
see. If it needs headroom, the first dial is `count` in `src/scene/Scene.js`.

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
