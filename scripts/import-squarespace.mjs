// One-off import of the Field Notes from the live Squarespace site.
// Re-runnable until the domain switches over: overwrites src/content/blog/<slug>/.
//
//   node scripts/import-squarespace.mjs
//
// Each post becomes src/content/blog/<slug>/index.md with its images beside it,
// keeping the Squarespace slug so /blog/<slug> URLs don't change.

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import TurndownService from 'turndown';

const SITE = 'https://gardenwithin.ca';
const OUT = path.resolve('src/content/blog');

const turndown = new TurndownService({ headingStyle: 'atx', hr: '---', bulletListMarker: '-' });
// Squarespace wraps body images in <figure>/<noscript> with lazy data-src; keep just the image.
turndown.remove(['noscript', 'script', 'style']);

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} fetching ${url}`);
  return res.json();
}

// The CDN serves WebP whatever the extension unless asked for the original format.
async function download(url, dest) {
  const type = /\.png$/i.test(dest) ? 'image/png' : 'image/jpeg';
  const res = await fetch(`${url}?format=original`, { headers: { Accept: type } });
  if (!res.ok) throw new Error(`${res.status} fetching ${url}`);
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
}

function fileNameFromUrl(url) {
  return decodeURIComponent(new URL(url).pathname.split('/').pop()).replace(/[^\w.-]+/g, '-').toLowerCase();
}

function toDate(ms) {
  return new Date(ms).toLocaleDateString('en-CA', { timeZone: 'America/Vancouver' });
}

function htmlToText(html) {
  return turndown.turndown(html).replace(/[*_#>\\]/g, '').replace(/\s+/g, ' ').trim();
}

function yamlString(s) {
  return JSON.stringify(s);
}

const { items } = await fetchJson(`${SITE}/blog?format=json`);

for (const post of items) {
  const dir = path.join(OUT, post.urlId);
  await mkdir(dir, { recursive: true });

  // Inline images: swap the CDN URL for a local file Astro can optimise.
  let body = post.body;
  const inlineImages = [...body.matchAll(/<img[^>]*data-src="([^"]+)"[^>]*>/g)];
  for (const [tag, src] of inlineImages) {
    const name = fileNameFromUrl(src);
    await download(src, path.join(dir, name));
    const alt = tag.match(/alt="([^"]*)"/)?.[1] ?? '';
    body = body.replace(tag, `<img src="./${name}" alt="${alt}">`);
  }

  const coverName = `cover${path.extname(fileNameFromUrl(post.assetUrl)) || '.jpg'}`;
  await download(post.assetUrl, path.join(dir, coverName));

  const frontmatter = [
    '---',
    `title: ${yamlString(post.title)}`,
    `slug: ${post.urlId}`,
    `date: ${toDate(post.publishOn)}`,
    `description: ${yamlString(htmlToText(post.excerpt))}`,
    `cover: ./${coverName}`,
    `coverAlt: ""`,
    '---',
  ].join('\n');

  const markdown = turndown
    .turndown(body)
    .replace(/^[\s\u00a0]+$/gm, '') // Squarespace's empty spacer paragraphs
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  await writeFile(path.join(dir, 'index.md'), `${frontmatter}\n\n${markdown}\n`);
  console.log(`✓ ${post.urlId} (${inlineImages.length} inline image${inlineImages.length === 1 ? '' : 's'})`);
}
