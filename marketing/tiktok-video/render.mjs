// Renders video.html to qadam-hub-tiktok.mp4 (1080x1920, 30 fps, silent track).
// Usage: FFMPEG=/path/to/ffmpeg node marketing/tiktok-video/render.mjs [seconds...]
// With seconds given, saves only those frames as PNG previews instead of a video.
import { chromium } from 'playwright';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const FPS = 30;
const DURATION = 21.5;
const previews = process.argv.slice(2).map(Number).filter((n) => !Number.isNaN(n));

const browser = await chromium.launch().catch(() => chromium.launch({ channel: 'msedge' }));
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
await page.goto(pathToFileURL(path.join(dir, 'video.html')).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

const seek = (ms) => page.evaluate((t) => {
  for (const a of document.getAnimations()) { a.pause(); a.currentTime = t; }
}, ms);

if (previews.length) {
  for (const s of previews) {
    await seek(s * 1000);
    await page.screenshot({ path: path.join(dir, `preview-${s}s.png`) });
    console.log(`preview-${s}s.png`);
  }
  await browser.close();
  process.exit(0);
}

const frames = path.join(dir, 'frames');
await fs.rm(frames, { recursive: true, force: true });
await fs.mkdir(frames);
const total = Math.round(DURATION * FPS);
for (let i = 0; i < total; i++) {
  await seek((i * 1000) / FPS);
  await page.screenshot({ path: path.join(frames, `f${String(i).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 95 });
  if (i % 90 === 0) console.log(`frame ${i}/${total}`);
}
await browser.close();

const ffmpeg = process.env.FFMPEG || 'ffmpeg';
const out = path.join(dir, 'qadam-hub-tiktok.mp4');
// Voiceover from voiceover.mjs; it is required, a silent video is never shipped.
const voice = path.join(dir, 'voiceover.wav');
await fs.access(voice).catch(() => { throw new Error('voiceover.wav missing: run voiceover.mjs first'); });
const result = spawnSync(ffmpeg, [
  '-y', '-framerate', String(FPS), '-i', path.join(frames, 'f%04d.jpg'),
  '-i', voice, '-af', `apad=whole_dur=${DURATION}`,
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p',
  '-c:a', 'aac', '-shortest', '-movflags', '+faststart', out,
], { stdio: 'inherit' });
if (result.status !== 0) throw new Error('ffmpeg failed');
await fs.rm(frames, { recursive: true, force: true });
console.log(`Saved ${path.relative(process.cwd(), out)}`);
