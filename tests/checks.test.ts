import { describe, expect, test } from 'vitest';
import { findLinkProblems, findPostProblems } from '../scripts/lib/checks.mjs';

const post = (frontmatter: string, body = 'Some writing.') => `---\n${frontmatter}\n---\n\n${body}\n`;
const photos = (...names: string[]) => (name: string) => names.includes(name);

describe('findPostProblems (runs before the build)', () => {
  test('a published post with its photos and writing is fine', () => {
    const text = post('title: "Grief"\ncover: ../../assets/blog/grief.jpg', 'Words.\n\n![x](../../assets/blog/grief-2.jpg)');
    expect(findPostProblems([{ file: 'grief.md', text }], photos('grief.jpg', 'grief-2.jpg'))).toEqual([]);
  });

  test('a post with no cover is fine (it gets the default one)', () => {
    expect(findPostProblems([{ file: 'a.md', text: post('title: "A"') }], photos())).toEqual([]);
  });

  test('names a missing cover photo', () => {
    const text = post('title: "Grief"\ncover: ../../assets/blog/gone.jpg');
    expect(findPostProblems([{ file: 'grief.md', text }], photos())).toEqual([
      'grief.md uses the photo gone.jpg, which isn’t in src/assets/blog',
    ]);
  });

  test('names a missing photo in the writing', () => {
    const text = post('title: "Grief"', 'Words.\n\n<img src="../../assets/blog/gone.png" alt="">');
    expect(findPostProblems([{ file: 'grief.md', text }], photos())).toEqual([
      'grief.md uses the photo gone.png, which isn’t in src/assets/blog',
    ]);
  });

  test('checks photos in drafts too, since the build loads drafts', () => {
    const text = post('title: "Soon"\ndraft: true', '![x](../../assets/blog/gone.jpg)');
    expect(findPostProblems([{ file: 'soon.md', text }], photos())).toHaveLength(1);
  });

  test('flags a published post with no writing', () => {
    expect(findPostProblems([{ file: 'empty.md', text: post('title: "Empty"', '  ') }], photos())).toEqual([
      'empty.md is published but has no writing in it',
    ]);
  });

  test('lets a draft have no writing yet', () => {
    expect(findPostProblems([{ file: 'soon.md', text: post('title: "Soon"\ndraft: true', '') }], photos())).toEqual([]);
  });
});

describe('findLinkProblems (runs on the built site)', () => {
  const site = new Set(['index.html', 'blog.html', 'blog/grief.html', 'rss.xml', '_astro/a.jpg']);
  const exists = (file: string) => site.has(file);
  const page = (file: string, html: string) => ({ file, html });

  test('links to pages, files and the home page are fine', () => {
    const html = '<a href="/">x</a><a href="/blog">x</a><a href="/blog/grief#end">x</a><a href="/rss.xml">x</a><img src="/_astro/a.jpg">';
    expect(findLinkProblems([page('index.html', html)], exists)).toEqual([]);
  });

  test('ignores other websites and email links', () => {
    const html = '<a href="https://instagram.com/x">x</a><a href="mailto:a@b.c">x</a><a href="//cdn.example.com/x">x</a>';
    expect(findLinkProblems([page('index.html', html)], exists)).toEqual([]);
  });

  test('names a link to a Field Note that doesn’t exist, and the page it’s on', () => {
    const html = '<a href="/blog/greif">x</a>';
    expect(findLinkProblems([page('blog/grief.html', html)], exists)).toEqual([
      '/blog/grief links to /blog/greif, which doesn’t exist',
    ]);
  });

  test('checks full links to this site too', () => {
    const html = '<a href="https://gardenwithin.ca/blog/nope">x</a><a href="https://www.gardenwithin.ca/blog">x</a>';
    expect(findLinkProblems([page('index.html', html)], exists)).toEqual(['/ links to /blog/nope, which doesn’t exist']);
  });

  test('accepts old addresses that redirect', () => {
    const html = '<a href="/home">x</a>';
    expect(findLinkProblems([page('index.html', html)], exists, ['/home'])).toEqual([]);
  });

  test('reports each broken link once per page', () => {
    const html = '<a href="/nope">x</a><a href="/nope">x</a>';
    expect(findLinkProblems([page('blog.html', html)], exists)).toEqual(['/blog links to /nope, which doesn’t exist']);
  });
});
