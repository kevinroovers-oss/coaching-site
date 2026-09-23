// Turns the source portrait into the one the site ships.
//
//   node scripts/make-portrait.mjs [source] [out.webp]
//
// The source is a greyscale subject on a flat light backdrop. That backdrop is
// never exactly the colour it has to disappear into, and the difference shows:
// a rectangle a few points brighter than the page reads as a pasted-in photo.
// So the backdrop is measured from the corners and mapped onto the page, which
// carries every tone below it along.
//
// What it is mapped onto is SEAT, not --bg. Two things sit between this file
// and the pixel on screen: the scene's vignette darkens the column the portrait
// stands in, and `.portrait img` lifts the whites with contrast/sepia. Together
// they are worth about twenty points. SEAT is what the page actually measures
// around the portrait, so a backdrop mapped there vanishes.
//
// The result is composited onto that colour rather than shipping an alpha
// channel — smaller, and it sidesteps every encoder that quietly flattens
// transparency to black.

import { chromium } from 'playwright';
import fs from 'node:fs';

const SOURCE = process.argv[2] || 'legacy/portret-2026.webp';
const OUT = process.argv[3] || 'public/img/kevin-roovers.webp';
// --bg in src/styles/base.css is [244, 243, 240]; this is that colour as the
// page renders it where the portrait sits. Re-measure if the scene or the
// filter on `.portrait img` changes.
const SEAT = [224, 223, 220];
const MIME = SOURCE.endsWith('.png') ? 'image/png' : SOURCE.endsWith('.webp') ? 'image/webp' : 'image/jpeg';

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage();
const dataUrl = `data:${MIME};base64,` + fs.readFileSync(SOURCE).toString('base64');

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

  // The backdrop, read from the four corners rather than assumed.
  const corner = (x, y) => {
    const o = (y * c.width + x) * 4;
    return 0.299 * a[o] + 0.587 * a[o + 1] + 0.114 * a[o + 2];
  };
  const m = Math.round(Math.min(c.width, c.height) * 0.02);
  const backdrop = Math.max(
    corner(m, m),
    corner(c.width - m, m),
    corner(m, c.height - m),
    corner(c.width - m, c.height - m),
  );

  // Backdrop → page background, everything below it scaled along. Greyscale
  // first: any colour cast in the source would fight the warm off-white.
  for (let i = 0; i < a.length; i += 4) {
    const grey = 0.299 * a[i] + 0.587 * a[i + 1] + 0.114 * a[i + 2];
    const t = Math.min(1, grey / backdrop);
    a[i] = Math.round(t * BG[0]);
    a[i + 1] = Math.round(t * BG[1]);
    a[i + 2] = Math.round(t * BG[2]);
    a[i + 3] = 255;
  }
  ctx.putImageData(d, 0, 0);

  // Find the subject, so the crop is built around him and not around the canvas.
  let minX = c.width, minY = c.height, maxX = 0, maxY = 0;
  const probe = ctx.getImageData(0, 0, c.width, c.height).data;
  for (let y = 0; y < c.height; y += 2) {
    for (let x = 0; x < c.width; x += 2) {
      const o = (y * c.width + x) * 4;
      if (BG[0] - probe[o] > 18) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  const sw = maxX - minX, sh = maxY - minY;

  // 4:5 around the subject, with a little air above the hair. A head-and-
  // shoulders source is already tight, so the box is driven by the width of
  // the shoulders when that gives the larger frame.
  const ratio = 4 / 5;
  let cw = Math.min(c.width, Math.round(sw * 1.16));
  let ch = Math.round(cw / ratio);
  if (ch > c.height) { ch = c.height; cw = Math.round(ch * ratio); }
  const cx = Math.max(0, Math.min(c.width - cw, Math.round(minX + sw / 2 - cw / 2)));
  const cy = Math.max(0, Math.min(c.height - ch, Math.round(minY - sh * 0.08)));

  const o = document.createElement('canvas');
  o.width = 720;
  o.height = 900;
  const octx = o.getContext('2d');
  octx.fillStyle = `rgb(${BG[0]},${BG[1]},${BG[2]})`;
  octx.fillRect(0, 0, o.width, o.height);
  octx.imageSmoothingQuality = 'high';
  octx.drawImage(c, cx, cy, cw, ch, 0, 0, o.width, o.height);

  return {
    webp: o.toDataURL('image/webp', 0.92),
    size: [o.width, o.height],
    backdrop: Math.round(backdrop),
    crop: [cx, cy, cw, ch],
    subject: [minX, minY, sw, sh],
  };
}, [dataUrl, SEAT]);

fs.mkdirSync(OUT.split('/').slice(0, -1).join('/'), { recursive: true });
fs.writeFileSync(OUT, Buffer.from(out.webp.split(',')[1], 'base64'));
await browser.close();
console.log(
  `Wrote ${OUT} at ${out.size.join('x')} — backdrop ${out.backdrop}, ` +
  `subject ${out.subject.join(',')}, crop ${out.crop.join(',')}. ` +
  `Update portrait.width/height in src/data/content.js if that changed.`,
);
