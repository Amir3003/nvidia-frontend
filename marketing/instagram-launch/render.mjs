// Renders the launch posts to 1080x1350 PNGs for Instagram carousels and 1080x1080 for TikTok (png/tiktok),
// plus grid-preview.png showing how the three covers sit in a profile row.
// Usage: node marketing/instagram-launch/render.mjs [@instagram] [@tiktok]
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(dir, 'png');
const handle = process.argv[2] || '@joinqadamhub';
const tiktokHandle = process.argv[3] || '@qadamhub';
const POSTS = ['post-1', 'post-2', 'post-3'];

await fs.mkdir(out, { recursive: true });
// Falls back to the system Edge when Playwright's own Chromium is not installed.
const browser = await chromium.launch().catch(() => chromium.launch({ channel: 'msedge' }));
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });

for (const post of POSTS) {
  await page.goto(pathToFileURL(path.join(dir, `${post}.html`)).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate((h) => document.querySelectorAll('.handle').forEach((el) => { el.textContent = h; }), handle);
  const slides = await page.locator('section.slide').count();
  for (let i = 1; i <= slides; i++) {
    const file = path.join(out, `${post}-slide-${i}.png`);
    await page.locator(`#s${i}`).screenshot({ path: file });
  }
  // Same slides in 9:16 for TikTok photo mode.
  await page.evaluate((h) => {
    document.body.classList.add('tiktok');
    document.querySelectorAll('.handle').forEach((el) => { el.textContent = h; });
  }, tiktokHandle);
  await fs.mkdir(path.join(out, 'tiktok'), { recursive: true });
  for (let i = 1; i <= slides; i++) {
    await page.locator(`#s${i}`).screenshot({ path: path.join(out, 'tiktok', `${post}-slide-${i}.png`) });
  }
  console.log(`${post}: ${slides} slides`);
}

// Publish post-3 first and post-1 last: Instagram shows the newest post first,
// so the row then reads post-1, post-2, post-3. The grid crops covers to 3:4.
const covers = POSTS.map((p) => pathToFileURL(path.join(out, `${p}-slide-1.png`)).href);
await page.setViewportSize({ width: 1080, height: 480 });
await page.setContent(`<body style="margin:0;background:#fff;display:flex;gap:4px">${covers
  .map((src) => `<div style="width:357px;height:476px;overflow:hidden"><img src="${src}" style="width:357px;height:446px;object-fit:cover;transform:scale(1.067);transform-origin:center top"></div>`)
  .join('')}</body>`);
await page.screenshot({ path: path.join(out, 'grid-preview.png') });
console.log('grid-preview.png');
await browser.close();
