import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { Scene } from './scene/Scene.js';
import { registerEases } from './motion/easing.js';
import { initScroll, computeTimeline } from './motion/scroll.js';
import { initReveals, playHero } from './motion/reveal.js';
import { initCursor } from './ui/cursor.js';
import { initMagnetic } from './ui/magnetic.js';
import { initIndicator } from './ui/indicator.js';
import { initPreloader } from './ui/preloader.js';
import { initOverlay } from './ui/overlay.js';
import { initAssistant } from './ui/assistant.js';
import { createAudio, initSoundToggle } from './audio/ambient.js';

import './styles/base.css';
import './styles/typography.css';
import './styles/sections.css';
import './styles/ui.css';

gsap.registerPlugin(ScrollTrigger);
registerEases(gsap);

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
// Narrow or touch devices get fewer elements and no pointer effects. Everything
// else — the formations, the transitions, the material — is identical.
const quality = isTouch || window.innerWidth < 720 ? 'low' : 'high';

const preloader = initPreloader();
const audio = createAudio();
initSoundToggle(audio);

// Glass preset: 'quiet', 'liquid' or 'prism'. See GLASS_PRESETS in
// src/scene/Elements.js for what each dial does. ?glass=prism in the URL
// overrides it, which makes comparing them a refresh rather than a rebuild.
const glass = new URLSearchParams(location.search).get('glass') || 'quiet';

const scene = new Scene(document.getElementById('scene'), {
  reducedMotion,
  isTouch,
  quality,
  glass,
  onFormation: () => audio.tick(),
});

const cursor = initCursor();
const magnetic = initMagnetic();
const indicator = initIndicator();

// --- scroll --------------------------------------------------------------
const scroll = initScroll({
  reducedMotion,
  onScroll: (progress, section) => {
    scene.setProgress(progress);
    indicator.set(progress, section);
  },
});

// --- services <-> scene --------------------------------------------------
// Hovering a card lights the matching hub in the network and steps the rest
// back. This is the link that has to feel real, so it runs through the same
// damping as everything else in the scene rather than through a CSS class.
const serviceList = document.querySelector('.services');
const cards = [...document.querySelectorAll('.service-card')];

const overlay = initOverlay({
  onOpen: (i) => {
    scene.setHighlight(i);
    // Lenis owns the scroll position; body overflow alone would not hold it.
    scroll.lenis?.stop();
  },
  onClose: () => {
    scene.setHighlight(null);
    scroll.lenis?.start();
  },
});

cards.forEach((card, i) => {
  const enter = () => {
    if (overlay.isOpen()) return;
    scene.setHighlight(i);
    serviceList?.classList.add('is-hovering');
  };
  const leave = () => {
    if (overlay.isOpen()) return;
    scene.setHighlight(null);
    serviceList?.classList.remove('is-hovering');
  };
  card.addEventListener('pointerenter', enter);
  card.addEventListener('pointerleave', leave);
  card.addEventListener('focus', enter);
  card.addEventListener('blur', leave);
  card.addEventListener('click', () => overlay.open(i));
});

// --- assistant -----------------------------------------------------------
// Shares the scroll lock with the service overlay: whichever is open, Lenis
// stops, because it owns the scroll position and body overflow alone won't
// hold it.
const assistant = initAssistant({
  onOpen: () => scroll.lenis?.stop(),
  onClose: () => scroll.lenis?.start(),
});

// --- easter egg ----------------------------------------------------------
// Press and hold anywhere on the hero — or hold the H key — and every element
// breathes to a heartbeat at about 62 bpm. Release and it settles.
(function heartbeat() {
  if (reducedMotion) return;
  const hero = document.getElementById('hero');
  let timer = null;
  const start = () => {
    clearTimeout(timer);
    timer = setTimeout(() => scene.setPulse(true), 320);
  };
  const stop = () => {
    clearTimeout(timer);
    scene.setPulse(false);
  };
  hero.addEventListener('pointerdown', start);
  window.addEventListener('pointerup', stop);
  window.addEventListener('pointercancel', stop);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'h' && !e.repeat && !overlay.isOpen() && !assistant.isOpen()) scene.setPulse(true);
  });
  window.addEventListener('keyup', (e) => {
    if (e.key === 'h') scene.setPulse(false);
  });
})();

initReveals({ reducedMotion });

window.addEventListener('pointermove', (e) => {
  if (e.pointerType !== 'mouse') return;
  scene.setMouse(
    (e.clientX / window.innerWidth) * 2 - 1,
    -((e.clientY / window.innerHeight) * 2 - 1)
  );
});

window.addEventListener('resize', () => {
  scene.resize();
  ScrollTrigger.refresh();
});

// --- the loop ------------------------------------------------------------
// One ticker for everything, so the scene, the cursor and the magnets all see
// the same frame time and can never drift apart.
let started = false;
gsap.ticker.add((time, deltaMS) => {
  const dt = Math.min(0.05, deltaMS / 1000);
  preloader.update();
  scene.update(dt);
  if (scene.shouldRender(dt)) scene.render();
  cursor.update(dt);
  magnetic.update(dt);
  if (!started) {
    started = true;
    preloader.firstFrame();
  }
});

// The scene is already running while this resolves; the preloader is only the
// number in the corner.
Promise.all([
  document.fonts ? document.fonts.ready : Promise.resolve(),
  new Promise((r) => (document.readyState === 'complete' ? r() : window.addEventListener('load', r))),
]).then(() => {
  computeTimeline();
  ScrollTrigger.refresh();
  preloader.complete();
});

preloader.ready.then(() => {
  playHero({ reducedMotion });
});

// Exposed for headless capture while tuning; harmless in production.
window.__site = {
  scene,
  assistant,
  seek: (p) => {
    scene.setProgress(p);
    scene.smoothProgress = p;
  },
};
