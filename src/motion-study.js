// Phase 2 of the build: the scene on its own, with the final material,
// lighting, post chain and easing, so the feel can be judged before any copy
// or layout exists. Not part of the site; kept in the repo as a tuning rig.

import Lenis from 'lenis';
import { Scene } from './scene/Scene.js';
import './styles/base.css';
import './styles/study.css';

const canvas = document.getElementById('scene');
const label = document.getElementById('studyLabel');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = window.matchMedia('(hover: none)').matches;

const scene = new Scene(canvas, {
  reducedMotion: reduced,
  isTouch,
  quality: isTouch ? 'low' : 'high',
  glass: new URLSearchParams(location.search).get('glass') || 'quiet',
  onFormation: (key) => { label.textContent = key; },
});

const lenis = reduced ? null : new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });

function progress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max > 0 ? window.scrollY / max : 0;
}

window.addEventListener('resize', () => scene.resize());
window.addEventListener('pointermove', (e) => {
  scene.setMouse((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
});
window.addEventListener('pointerdown', () => scene.setPulse(true));
window.addEventListener('pointerup', () => scene.setPulse(false));
window.addEventListener('pointercancel', () => scene.setPulse(false));

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  lenis?.raf(now);
  scene.setProgress(progress());
  scene.update(dt);
  if (scene.shouldRender(dt)) scene.render();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Exposed for headless screenshotting during tuning.
window.__study = { scene, seek: (p) => { scene.setProgress(p); scene.smoothProgress = p; } };
