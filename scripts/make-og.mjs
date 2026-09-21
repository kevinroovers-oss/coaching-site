// Regenerates /public/og-image.jpg and /public/apple-touch-icon.png from the
// live site, so the share card is the actual hero rather than a mock-up of it.
//
//   npm run build && npm run preview          (in one terminal)
//   npm i -D playwright && npx playwright install chromium
//   node scripts/make-og.mjs [http://localhost:4173]
//
// Re-run it after changing the accent, the copy, or the hero staging.

import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:4173';
const browser = await chromium.launch({
  // Set CHROMIUM_PATH if you want to use a Chromium you already have.
  executablePath: process.env.CHROMIUM_PATH || undefined,
});

const og = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await og.goto(url, { waitUntil: 'networkidle' });
// Give the scene time to settle into the opening formation.
await og.waitForTimeout(4000);
await og.evaluate(() => {
  // The share card is the scene and the name. Nothing else belongs on it.
  for (const sel of ['.indicator', '.sound', '.scroll-hint', '.preloader', '.cursor', '.ask-open']) {
    document.querySelector(sel)?.remove();
  }
});
await og.waitForTimeout(1200);
await og.screenshot({ path: 'public/og-image.jpg', type: 'jpeg', quality: 90 });

const icon = await browser.newPage({ viewport: { width: 180, height: 180 }, deviceScaleFactor: 1 });
await icon.setContent(`<style>
  html, body { margin: 0; background: #F4F3F0; }
  .d { width: 180px; height: 180px; display: grid; place-items: center; }
  .d i { width: 64px; height: 64px; border-radius: 50%; background: #AE460C; display: block; }
</style><div class="d"><i></i></div>`);
await icon.screenshot({ path: 'public/apple-touch-icon.png' });

await browser.close();
console.log('Wrote public/og-image.jpg and public/apple-touch-icon.png');
