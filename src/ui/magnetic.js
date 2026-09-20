import { damp } from '../motion/easing.js';

// Links and buttons lean toward the cursor as it approaches. The pull is small
// and the return is slow — it should read as attention, not as a toy.
export function initMagnetic(selector = '.magnetic, .service-card, .sound', radius = 90) {
  if (window.matchMedia('(hover: none)').matches) return { update: () => {} };
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return { update: () => {} };

  const items = [...document.querySelectorAll(selector)].map((el) => ({
    el,
    x: 0, y: 0, tx: 0, ty: 0,
  }));
  let mx = -9999;
  let my = -9999;

  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    mx = e.clientX;
    my = e.clientY;
  });

  return {
    update(dt) {
      for (const it of items) {
        const r = it.el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > window.innerHeight + 200) continue;
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = mx - cx;
        const dy = my - cy;
        // Use the element's own box as part of the field, so wide links pull
        // along their whole length instead of only at the centre.
        const near = Math.hypot(Math.max(0, Math.abs(dx) - r.width / 2), Math.max(0, Math.abs(dy) - r.height / 2));
        const f = near < radius ? 1 - near / radius : 0;
        it.tx = dx * 0.24 * f;
        it.ty = dy * 0.3 * f;
        it.x = damp(it.x, it.tx, 9, dt);
        it.y = damp(it.y, it.ty, 9, dt);
        if (Math.abs(it.x) < 0.02 && Math.abs(it.y) < 0.02) {
          it.el.style.transform = '';
        } else {
          it.el.style.transform = `translate3d(${it.x.toFixed(2)}px, ${it.y.toFixed(2)}px, 0)`;
        }
      }
    },
  };
}
