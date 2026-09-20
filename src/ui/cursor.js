import { damp } from '../motion/easing.js';

// A single dot. It grows and takes the accent over anything interactive, and
// it is the same shape as the favicon and the service marks.
export function initCursor() {
  const el = document.getElementById('cursor');
  if (!el || window.matchMedia('(hover: none)').matches) return { update: () => {} };

  let tx = window.innerWidth / 2;
  let ty = window.innerHeight / 2;
  let x = tx;
  let y = ty;
  let on = false;

  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    tx = e.clientX;
    ty = e.clientY;
    if (!on) {
      on = true;
      x = tx;
      y = ty;
      el.classList.add('is-on');
    }
  });
  window.addEventListener('pointerleave', () => {
    on = false;
    el.classList.remove('is-on');
  });

  // Delegated, so cards and links added later still work.
  const interactive = 'a, button, [role="button"], input, summary';
  document.addEventListener('pointerover', (e) => {
    if (e.target.closest?.(interactive)) el.classList.add('is-active');
  });
  document.addEventListener('pointerout', (e) => {
    if (e.target.closest?.(interactive)) el.classList.remove('is-active');
  });

  return {
    update(dt) {
      // Fast enough to feel attached, slow enough to feel like it has weight.
      x = damp(x, tx, 26, dt);
      y = damp(y, ty, 26, dt);
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    },
  };
}
