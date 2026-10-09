// Tidies Field Notes photos after they're added in Pages CMS (runs in .github/workflows/tidy-photos.yml):
//   1. Names each post's photos after the post: <slug>.jpg for the cover, then <slug>-2.jpg, <slug>-3.jpg…
//      for photos in the post body, in order, and updates the post to match.
//   2. Shrinks originals larger than MAX_EDGE px on the long side. Already-shrunk photos are left alone,
//      so running it again changes nothing.
// The site build makes its own small, compressed copies for visitors; this keeps the stored originals sane.
// Run locally with: npm run photos

import { readdir, readFile, rename, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const POSTS = 'src/content/blog';
const PHOTOS = 'src/assets/blog';
const REF_PREFIX = '../../assets/blog/'; // how posts refer to photos (see .pages.yml)
const MAX_EDGE = 2400;
const RESIZABLE = new Set(['.jpg', '.jpeg', '.png', '.webp']);

// Photo references in a post, in order: the cover first, then body images (Markdown or HTML).
function photoRefs(markdown) {
  const refs = [];
  const escaped = REF_PREFIX.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
  const cover = markdown.match(new RegExp(`^cover:\\s*["']?(${escaped}[^"'\\s]+)`, 'm'));
  if (cover) refs.push(cover[1]);
  const body = new RegExp(`(?:\\]\\(|src=["'])(${escaped}[^)"'\\s]+)`, 'g');
  for (const [, ref] of markdown.matchAll(body)) if (!refs.includes(ref)) refs.push(ref);
  return refs;
}

const posts = (await readdir(POSTS)).filter((f) => f.endsWith('.md'));
const contents = new Map(await Promise.all(posts.map(async (f) => [f, await readFile(path.join(POSTS, f), 'utf8')])));

// A photo used by more than one post keeps its name rather than being claimed by one of them.
const usage = new Map();
for (const text of contents.values()) for (const ref of photoRefs(text)) usage.set(ref, (usage.get(ref) ?? 0) + 1);

const changes = [];

for (const [file, original] of contents) {
  const slug = file.replace(/\.md$/, '');
  let text = original;
  photoRefs(original).forEach((ref, i) => {
    const current = ref.slice(REF_PREFIX.length);
    const ext = path.extname(current).toLowerCase();
    const wanted = `${slug}${i === 0 ? '' : `-${i + 1}`}${ext}`;
    if (current === wanted || usage.get(ref) > 1) return;
    if (!existsSync(path.join(PHOTOS, current))) return console.warn(`! ${file}: ${current} is missing`);
    if (existsSync(path.join(PHOTOS, wanted))) return console.warn(`! ${file}: ${wanted} already exists, keeping ${current}`);
    changes.push([current, wanted]);
    text = text.split(REF_PREFIX + current).join(REF_PREFIX + wanted);
  });
  if (text !== original) await writeFile(path.join(POSTS, file), text);
}

for (const [from, to] of changes) {
  await rename(path.join(PHOTOS, from), path.join(PHOTOS, to));
  console.log(`renamed ${from} → ${to}`);
}

for (const name of await readdir(PHOTOS)) {
  if (!RESIZABLE.has(path.extname(name).toLowerCase())) continue;
  const file = path.join(PHOTOS, name);
  const { width = 0, height = 0, orientation } = await sharp(file).metadata();
  const longEdge = Math.max(width, height);
  if (longEdge <= MAX_EDGE) continue;
  const before = (await stat(file)).size;
  const image = sharp(file).rotate().resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside' });
  const ext = path.extname(name).toLowerCase();
  const output =
    ext === '.png' ? image.png({ compressionLevel: 9 }) : ext === '.webp' ? image.webp({ quality: 82 }) : image.jpeg({ quality: 82, mozjpeg: true });
  await writeFile(file, await output.toBuffer());
  const after = (await stat(file)).size;
  console.log(`resized ${name}: ${longEdge}px → ${MAX_EDGE}px, ${(before / 1e6).toFixed(1)} MB → ${(after / 1e6).toFixed(1)} MB${orientation > 1 ? ' (rotated upright)' : ''}`);
}
