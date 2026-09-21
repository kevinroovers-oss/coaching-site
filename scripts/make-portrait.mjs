// Turns the source portrait into the one the site ships.
//
//   npm i -D playwright && npx playwright install chromium
//   node scripts/make-portrait.mjs [source.png] [out.webp]
//
// The source is a greyscale subject on a saturated orange backdrop, and it
// already carries an alpha channel. Both mark background, and both have to be
// read: keying on colour alone turns every transparent pixel black, because an
// RGB of 0,0,0 has no saturation and looks like ink.
//
// The result is composited onto the page's own background rather than shipping
// an alpha channel — smaller, and it sidesteps every encoder that quietly
// flattens transparency to black.

import { chromium } from 'playwright';
import fs from 'node:fs';

const SOURCE = process.argv[2] || 'legacy/portret.png';
const OUT = process.argv[3] || 'public/img/kevin-roovers.webp';
const BG = [244, 243, 240]; // keep in step with --bg in src/styles/base.css

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage();
const dataUrl = 'data:image/png;base64,' + fs.readFileSync(SOURCE).toString('base64');

const out = await page.evaluate(async ([url, BG]) => {
  const img = new Image();
  img.src = url;
  await img.decode();

  const c = document.createElement('canvas');
  c.width = img.width;
  c.height = img.height;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);
  const d = ctx.getImageData(0, 0, c.width, c.height);
  const a = d.data;

  for (let i = 0; i < a.length; i += 4) {
    const srcA = a[i + 3] / 255;
    const r = a[i], g = a[i + 1], b = a[i + 2];
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    const sat = mx === 0 ? 0 : (mx - mn) / mx;
    // Soft chroma key: opaque below 0.13 saturation, gone above 0.30.
    const key = 1 - Math.min(1, Math.max(0, (sat - 0.13) / 0.17));
    const alpha = key * srcA;
    // Neutralise the orange left in the soft edge before compositing.
    const grey = 0.299 * r + 0.587 * g + 0.114 * b;
    const k = Math.min(1, sat / 0.13);
    a[i] = Math.round((r + (grey - r) * k) * alpha + BG[0] * (1 - alpha));
    a[i + 1] = Math.round((g + (grey - g) * k) * alpha + BG[1] * (1 - alpha));
    a[i + 2] = Math.round((b + (grey - b) * k) * alpha + BG[2] * (1 - alpha));
    a[i + 3] = 255;
  }
  ctx.putImageData(d, 0, 0);

  // Find the subject, so the crop is built around him and not around the canvas.
  let minX = c.width, minY = c.height, maxX = 0, maxY = 0;
  const probe = ctx.getImageData(0, 0, c.width, c.height).data;
  for (let y = 0; y < c.height; y += 2) {
    for (let x = 0; x < c.width; x += 2) {
      const o = (y * c.width + x) * 4;
      if (BG[0] - probe[o] > 18 || BG[1] - probe[o + 1] > 18) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  const sw = maxX - minX, sh = maxY - minY;

  // 4:5 around the subject, with a little air above the hair.
  const ratio = 4 / 5;
  let ch = Math.min(c.height, Math.round(sh * 1.12));
  let cw = Math.round(ch * ratio);
  if (cw > c.width) { cw = c.width; ch = Math.round(cw / ratio); }
  const cx = Math.max(0, Math.min(c.width - cw, Math.round(minX + sw / 2 - cw / 2)));
  const cy = Math.max(0, Math.min(c.height - ch, Math.round(minY - sh * 0.06)));

  const o = document.createElement('canvas');
  o.width = 720;
  o.height = 900;
  const octx = o.getContext('2d');
  octx.fillStyle = `rgb(${BG[0]},${BG[1]},${BG[2]})`;
  octx.fillRect(0, 0, o.width, o.height);
  octx.imageSmoothingQuality = 'high';
  octx.drawImage(c, cx, cy, cw, ch, 0, 0, o.width, o.height);

  return { webp: o.toDataURL('image/webp', 0.92), size: [o.width, o.height] };
}, [dataUrl, BG]);

fs.mkdirSync(OUT.split('/').slice(0, -1).join('/'), { recursive: true });
fs.writeFileSync(OUT, Buffer.from(out.webp.split(',')[1], 'base64'));
await browser.close();
console.log(`Wrote ${OUT} at ${out.size.join('x')} — update portrait.width/height in src/data/content.js if that changed.`);
