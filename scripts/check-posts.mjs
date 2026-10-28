// Runs before the build (npm run build): stops the site updating when a Field Note uses a photo
// that isn't there or is published with no writing. See scripts/lib/checks.mjs.

import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { findPostProblems } from './lib/checks.mjs';

const POSTS = 'src/content/blog';
const PHOTOS = 'src/assets/blog';

const files = (await readdir(POSTS)).filter((f) => f.endsWith('.md'));
const posts = await Promise.all(files.map(async (file) => ({ file, text: await readFile(path.join(POSTS, file), 'utf8') })));
const problems = findPostProblems(posts, (name) => existsSync(path.join(PHOTOS, name)));

if (problems.length) {
  console.error(`\nField Notes problems, so the site wasn't updated:\n${problems.map((p) => `  • ${p}`).join('\n')}\n`);
  process.exit(1);
}
console.log(`✓ ${posts.length} Field Notes checked`);
