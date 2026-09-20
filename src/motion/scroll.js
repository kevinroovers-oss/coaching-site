import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TIMELINE } from '../scene/formations.js';

// Scroll is the only input that drives the scene. Lenis smooths the wheel;
// the scene then damps that again on its own (see Scene.update), so the
// formations always arrive a beat after the page does.

const SECTIONS = ['hero', 'about', 'principles', 'services', 'credentials', 'contact'];

// Which element each formation belongs to. Anchors are resolved at runtime, so
// the timeline follows the real layout instead of hard-coded percentages —
// change a section's height and the formations still land in the right place.
const ANCHORS = {
  drift: { sel: '#hero', align: 'top' },
  cluster: { sel: '#about', align: 'center' },
  strata: { sel: '[data-principle="0"]', align: 'center' },
  orbits: { sel: '[data-principle="1"]', align: 'center' },
  spiral: { sel: '[data-principle="2"]', align: 'center' },
  network: { sel: '#services', align: 'center' },
  lattice: { sel: '#credentials', align: 'center' },
  ring: { sel: '#contact', align: 'center' },
};

export function computeTimeline() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (max <= 0) return;
  for (const entry of TIMELINE) {
    const a = ANCHORS[entry.key];
    const el = a && document.querySelector(a.sel);
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    const y = a.align === 'center' ? top + rect.height / 2 - window.innerHeight / 2 : top;
    entry.at = Math.min(0.995, Math.max(0, y / max));
  }
  TIMELINE[0].at = 0;
  // Keep the sequence strictly increasing even on very short viewports.
  for (let i = 1; i < TIMELINE.length; i++) {
    TIMELINE[i].at = Math.max(TIMELINE[i].at, TIMELINE[i - 1].at + 0.005);
  }
}

export function initScroll({ reducedMotion, onScroll }) {
  gsap.registerPlugin(ScrollTrigger);

  let lenis = null;
  if (!reducedMotion) {
    lenis = new Lenis({
      lerp: 0.085,        // heavy: the page has mass
      wheelMultiplier: 0.9,
      touchMultiplier: 1.4,
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  const state = { progress: 0, section: 0 };

  function read() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    state.progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;

    // The active section is whichever one owns the middle of the viewport.
    const mid = window.scrollY + window.innerHeight / 2;
    let idx = 0;
    for (let i = 0; i < SECTIONS.length; i++) {
      const el = document.getElementById(SECTIONS[i]);
      if (!el) continue;
      const top = el.getBoundingClientRect().top + window.scrollY;
      if (mid >= top) idx = i;
    }
    state.section = idx;
    onScroll?.(state.progress, state.section);
  }

  window.addEventListener('scroll', read, { passive: true });
  window.addEventListener('resize', () => {
    computeTimeline();
    read();
  });

  computeTimeline();
  read();

  return { lenis, state, read };
}
