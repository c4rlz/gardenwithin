// Checks that stop a broken Field Note from going live. Each returns problems in plain words;
// scripts/check-posts.mjs and scripts/check-links.mjs print them and fail the build.

import { REF_PREFIX, photoRefs } from './photos.mjs';

const SITE = /^https?:\/\/(www\.)?gardenwithin\.ca(?=\/|$)/;

/**
 * Before the build: every photo a post uses is in src/assets/blog (drafts too, since the build loads
 * them), and published posts have writing in them. `posts` is [{ file, text }]; `photoExists(name)`
 * says whether src/assets/blog/<name> is there.
 */
export function findPostProblems(posts, photoExists) {
  const problems = [];
  for (const { file, text } of posts) {
    const [, frontmatter = '', body = text] = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/) ?? [];
    for (const ref of photoRefs(text)) {
      const name = ref.slice(REF_PREFIX.length);
      if (!photoExists(name)) problems.push(`${file} uses the photo ${name}, which isn’t in src/assets/blog`);
    }
    const draft = /^draft:\s*true\s*$/m.test(frontmatter);
    if (!draft && body.trim() === '') problems.push(`${file} is published but has no writing in it`);
  }
  return problems;
}

/**
 * After the build: every link and image on the site that points at the site itself leads somewhere.
 * `pages` is [{ file, html }] with paths relative to dist/; `fileExists(path)` checks dist/;
 * `redirects` are the old addresses in public/_redirects.
 */
export function findLinkProblems(pages, fileExists, redirects = []) {
  const problems = new Set();
  for (const { file, html } of pages) {
    for (const [, url] of html.matchAll(/(?:href|src)="([^"]*)"/g)) {
      const local = SITE.test(url) ? url.replace(SITE, '') || '/' : url;
      const target = local.split(/[?#]/)[0];
      if (!target.startsWith('/') || target.startsWith('//')) continue; // another site, mailto:, #section…
      if (resolves(target, fileExists) || redirects.includes(target)) continue;
      problems.add(`${pageAddress(file)} links to ${target}, which doesn’t exist`);
    }
  }
  return [...problems];
}

// Pages build to <name>.html and are served without the extension (see astro.config.mjs).
function resolves(target, fileExists) {
  const file = decodeURI(target).replace(/^\/|\/$/g, '');
  if (file === '') return fileExists('index.html');
  return fileExists(file) || fileExists(`${file}.html`) || fileExists(`${file}/index.html`);
}

function pageAddress(file) {
  return '/' + file.replace(/(^|\/)index\.html$/, '').replace(/\.html$/, '');
}
