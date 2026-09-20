// No spinner. The scene is already assembling behind this; all that shows is a
// number and a hairline in the corner, and it leaves as soon as it is honest
// to do so.
export function initPreloader({ minDuration = 700 } = {}) {
  const root = document.getElementById('preloader');
  const count = document.getElementById('preloaderCount');
  const rule = document.getElementById('preloaderRule');
  const start = performance.now();

  let real = 0;     // what has actually finished, 0..1
  let shown = 0;    // what the number says, eased toward `real`
  let done = false;
  let resolveReady;
  const ready = new Promise((r) => (resolveReady = r));

  const set = (v) => { real = Math.max(real, v); };

  // Real signals, not a fake timer: fonts decoded, first frame drawn, window
  // load. Each one moves the number.
  document.fonts?.ready.then(() => set(0.55));
  window.addEventListener('load', () => set(0.85));

  // Frame-rate independent: on a slow first frame the number must not crawl.
  function update(dt = 1 / 60) {
    const elapsed = performance.now() - start;
    const floor = Math.min(1, elapsed / minDuration) * 0.92;
    const target = Math.max(real, floor);
    shown += (target - shown) * (1 - Math.exp(-7 * dt));
    const pct = Math.min(100, Math.round(shown * 100));
    count.textContent = String(pct);
    rule.style.width = `${pct}%`;
    if (!done && real >= 1 && shown >= 0.985) {
      done = true;
      count.textContent = '100';
      rule.style.width = '100%';
      root.classList.add('is-done');
      resolveReady();
    }
  }

  return {
    update,
    firstFrame: () => set(0.75),
    complete: () => set(1),
    ready,
  };
}
