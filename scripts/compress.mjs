#!/usr/bin/env node
// Gets photos ready to upload in Pages CMS: turns them all into JPEG (HEIC, PNG, WebP…), rotates them upright, shrinks them to
// MAX_EDGE px on the long side, compresses them and strips their metadata (including where they were taken).
// Originals are never touched; the copies go in a folder of your choosing (./compressed by default).
//
//   npm run compress -- ~/Downloads/IMG_5118.HEIC ~/Desktop/walk-photos
//   garden-compress *.heic -o ready --quality 75     (after `npm link`, works from any folder)

import { mkdir, mkdtemp, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { parseArgs, promisify } from 'node:util';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';

// Same as scripts/tidy-photos.mjs, so it leaves these alone after upload.
const MAX_EDGE = 2400;
const QUALITY = 82;
const PHOTO = new Set(['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif', '.avif', '.tif', '.tiff']);
const HEIC = new Set(['.heic', '.heif']);
const CREAM = { r: 246, g: 242, b: 233 }; // --bg in src/styles/global.css, behind any transparent areas

const usage = `Usage: garden-compress <photos or folders…> [options]

  -o, --out <dir>        where the copies go (default: ./compressed)
  -m, --max <px>         longest side in pixels (default: ${MAX_EDGE})
  -q, --quality <1-100>  JPEG quality (default: ${QUALITY})
  -h, --help`;

const { values: opts, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    out: { type: 'string', short: 'o', default: 'compressed' },
    max: { type: 'string', short: 'm', default: String(MAX_EDGE) },
    quality: { type: 'string', short: 'q', default: String(QUALITY) },
    help: { type: 'boolean', short: 'h' },
  },
});

if (opts.help || positionals.length === 0) {
  console.log(usage);
  process.exit(opts.help ? 0 : 1);
}

const maxEdge = Number(opts.max);
const quality = Number(opts.quality);
if (!(maxEdge > 0) || !(quality >= 1 && quality <= 100)) {
  console.error(`--max must be a positive number and --quality 1–100\n\n${usage}`);
  process.exit(1);
}

// `npm run compress` runs from the repo root; INIT_CWD is the folder you ran it from.
const cwd = process.env.INIT_CWD ?? process.cwd();
const outDir = path.resolve(cwd, opts.out);

async function collect(target) {
  const info = await stat(target).catch(() => null);
  if (!info) return console.warn(`! ${target} not found`), [];
  if (!info.isDirectory()) return [target];
  const names = await readdir(target);
  return names.filter((n) => PHOTO.has(path.extname(n).toLowerCase())).map((n) => path.join(target, n));
}

const files = (await Promise.all(positionals.map((p) => collect(path.resolve(cwd, p))))).flat();
if (files.length === 0) {
  console.error('No photos found.');
  process.exit(1);
}

// sharp can't read iPhone HEIC (HEVC), so macOS's built-in sips converts it first, at full quality.
const run = promisify(execFile);
const scratch = await mkdtemp(path.join(tmpdir(), 'garden-compress-'));
async function readable(file) {
  if (!HEIC.has(path.extname(file).toLowerCase())) return file;
  if (process.platform !== 'darwin') throw new Error('HEIC needs macOS (sips) to convert');
  const jpeg = path.join(scratch, `${path.basename(file)}.jpg`);
  await run('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '100', file, '--out', jpeg]);
  return jpeg;
}

// "IMG 5118 (1).HEIC" → "img-5118-1"
const tidyName = (file) =>
  path.parse(file).name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'photo';

// Two photos that tidy to the same name (IMG_1.HEIC, IMG_1.jpg) get -2, -3… rather than overwriting each other.
const written = new Set();
function uniqueTarget(name, ext) {
  let target = path.join(outDir, name + ext);
  for (let n = 2; written.has(target); n++) target = path.join(outDir, `${name}-${n}${ext}`);
  written.add(target);
  return target;
}

const mb = (bytes) => (bytes < 1e6 ? `${Math.round(bytes / 1e3)} KB` : `${(bytes / 1e6).toFixed(1)} MB`);
await mkdir(outDir, { recursive: true });
let before = 0;
let after = 0;
let failed = 0;

for (const file of files) {
  try {
    const source = await readable(file);
    const output = await sharp(source)
      .rotate()
      .resize({ width: maxEdge, height: maxEdge, fit: 'inside', withoutEnlargement: true })
      .flatten({ background: CREAM }) // JPEG has no transparency
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();
    const target = uniqueTarget(tidyName(file), '.jpg');
    await writeFile(target, output);
    const size = (await stat(file)).size;
    before += size;
    after += output.length;
    console.log(`${path.basename(file)} → ${path.relative(cwd, target)}  ${mb(size)} → ${mb(output.length)}`);
  } catch (err) {
    failed++;
    console.warn(`! ${path.basename(file)}: ${err.message}`);
  }
}

await rm(scratch, { recursive: true, force: true });
const done = files.length - failed;
if (done) console.log(`\n${done} photo${done === 1 ? '' : 's'}: ${mb(before)} → ${mb(after)}, ready in ${path.relative(cwd, outDir) || '.'}/`);
process.exit(failed ? 1 : 0);
