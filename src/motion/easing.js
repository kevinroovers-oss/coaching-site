// One easing vocabulary for the whole site. Nothing animates outside these.
// Never bounce, never elastic, never linear.

import { CustomEase } from 'gsap/CustomEase';

// The house curve: fast departure, long settle. cubic-bezier(0.16, 1, 0.3, 1)
export const EASE = 'expoOut';

// Registered GSAP eases (see registerEases below).
export const E = {
  // Default for text, UI, micro-interaction.
  out: 'kr-out',
  // Slower sibling for camera moves and formation transitions.
  camera: 'kr-camera',
  // Symmetric variant for things that leave and come back (overlay).
  inOut: 'kr-inout',
};

export function registerEases(gsap) {
  gsap.registerPlugin(CustomEase);
  CustomEase.create('kr-out', '0.16, 1, 0.3, 1');
  CustomEase.create('kr-camera', '0.22, 1, 0.24, 1');
  CustomEase.create('kr-inout', '0.65, 0, 0.2, 1');
}

// Durations, in seconds. Slowness is a quality signal here.
export const D = {
  micro: 0.28, // 200-400ms band: hover, cursor, toggle
  microSlow: 0.4,
  reveal: 1.1, // a single text line coming up
  stagger: 0.075, // between lines
  section: 1.5, // 1200-1800ms band: formation transitions
  camera: 2.2, // camera is always the slowest thing on screen
};

// Frame-rate independent damping. `lambda` is "how much is left after 1s".
// Higher lambda = snappier. Used for everything scroll- and mouse-driven so
// the scene follows input softly instead of being locked to it.
export function damp(current, target, lambda, dt) {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}

export function clamp(v, a = 0, b = 1) {
  return v < a ? a : v > b ? b : v;
}

// Maps v from [a,b] to [0,1], clamped.
export function range(v, a, b) {
  return clamp((v - a) / (b - a));
}

// Hermite smoothstep, for weighting formation blends.
export function smoothstep(v) {
  const t = clamp(v);
  return t * t * (3 - 2 * t);
}
