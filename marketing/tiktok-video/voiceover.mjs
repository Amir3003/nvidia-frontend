// Builds voiceover.wav from voiceover.json with Piper (local neural TTS):
// each line is synthesized, trimmed of silence, placed at its start time,
// checked against its scene window, then mixed and loudness-normalized.
// Usage: PIPER_PYTHON=... PIPER_VOICES=... FFMPEG=... node marketing/tiktok-video/voiceover.mjs
import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const { voice, lengthScale, lines } = JSON.parse(await fs.readFile(path.join(dir, 'voiceover.json'), 'utf8'));
const python = process.env.PIPER_PYTHON || 'python';
const voices = process.env.PIPER_VOICES || path.join(dir, 'voices');
const ffmpeg = process.env.FFMPEG || 'ffmpeg';
const work = path.join(dir, 'vo-work');
await fs.rm(work, { recursive: true, force: true });
await fs.mkdir(work);

function run(cmd, args, input) {
  const r = spawnSync(cmd, args, { input, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`${path.basename(cmd)} failed: ${r.stderr.slice(-400)}`);
  return r.stderr;
}

function seconds(file) {
  const info = run(ffmpeg, ['-hide_banner', '-i', file, '-f', 'null', '-']);
  const m = [...info.matchAll(/time=(\d+):(\d+):([\d.]+)/g)].at(-1);
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
}

const trimmed = [];
for (const [i, line] of lines.entries()) {
  const raw = path.join(work, `raw${i}.wav`);
  const out = path.join(work, `line${i}.wav`);
  run(python, ['-m', 'piper', '-m', path.join(voices, `${voice}.onnx`), '--length-scale', String(lengthScale), '-f', raw], line.text);
  run(ffmpeg, ['-y', '-i', raw, '-af',
    'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse', out]);
  const length = seconds(out);
  const ends = line.start + length;
  const next = lines[i + 1]?.start ?? Infinity;
  const ok = ends <= line.end + 0.05 && ends <= next;
  console.log(`${ok ? 'ok  ' : 'LONG'} ${line.start.toFixed(2)}s +${length.toFixed(2)}s  "${line.text}"`);
  if (!ok) throw new Error(`Line ${i + 1} runs past its scene; shorten the text or move its start`);
  trimmed.push({ file: out, start: line.start });
}

const inputs = trimmed.flatMap((t) => ['-i', t.file]);
const delays = trimmed.map((t, i) => `[${i}:a]adelay=${Math.round(t.start * 1000)}:all=1[a${i}]`).join(';');
const mix = `${trimmed.map((_, i) => `[a${i}]`).join('')}amix=inputs=${trimmed.length}:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[out]`;
run(ffmpeg, ['-y', ...inputs, '-filter_complex', `${delays};${mix}`, '-map', '[out]', '-ar', '44100', '-ac', '2', path.join(dir, 'voiceover.wav')]);
await fs.rm(work, { recursive: true, force: true });
console.log('Saved voiceover.wav');
