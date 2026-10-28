// Runs after the build (npm run build): stops the site updating when a page links to a page or
// file on the site that doesn't exist. See scripts/lib/checks.mjs.

import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { findLinkProblems } from './lib/checks.mjs';

const DIST = 'dist';

const files = (await readdir(DIST, { recursive: true })).filter((f) => f.endsWith('.html'));
const pages = await Promise.all(files.map(async (file) => ({ file, html: await readFile(path.join(DIST, file), 'utf8') })));
const redirects = (await readFile('public/_redirects', 'utf8'))
  .split('\n')
  .filter((line) => line.startsWith('/'))
  .map((line) => line.split(/\s+/)[0]);
const problems = findLinkProblems(pages, (file) => existsSync(path.join(DIST, file)), redirects);

if (problems.length) {
  console.error(`\nBroken links, so the site wasn't updated:\n${problems.map((p) => `  • ${p}`).join('\n')}\n`);
  process.exit(1);
}
console.log(`✓ Links on ${pages.length} pages checked`);
