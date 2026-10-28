import { describe, expect, test } from 'vitest';
import { photoRefs, renamePostPhotos } from '../scripts/lib/photos.mjs';

const P = '../../assets/blog/';

describe('photoRefs', () => {
  test('lists the cover first, then photos in the writing, once each', () => {
    const text = `---\ncover: "${P}c.jpg"\n---\n\n![a](${P}a.jpg)\n<img src="${P}b.png">\n![again](${P}a.jpg)\n`;
    expect(photoRefs(text)).toEqual([`${P}c.jpg`, `${P}a.jpg`, `${P}b.png`]);
  });

  test('is empty for a post with no photos', () => {
    expect(photoRefs('---\ntitle: "x"\n---\n\nWords.')).toEqual([]);
  });
});

describe('renamePostPhotos', () => {
  const all = () => true;
  const only = (...names: string[]) => (name: string) => names.includes(name);

  test('names the cover after the post and the rest -2, -3…, and updates the post', () => {
    const text = `---\ncover: ${P}IMG_1.jpg\n---\n\n![a](${P}IMG_2.JPG)\n![b](${P}IMG_3.jpeg)\n`;
    const { text: out, renames } = renamePostPhotos('grief.md', text, { exists: only('IMG_1.jpg', 'IMG_2.JPG', 'IMG_3.jpeg') });
    expect(renames).toEqual([
      ['IMG_1.jpg', 'grief.jpg'],
      ['IMG_2.JPG', 'grief-2.jpg'],
      ['IMG_3.jpeg', 'grief-3.jpeg'],
    ]);
    expect(out).toBe(`---\ncover: ${P}grief.jpg\n---\n\n![a](${P}grief-2.jpg)\n![b](${P}grief-3.jpeg)\n`);
  });

  test('changes nothing when photos are already named', () => {
    const text = `---\ncover: ${P}grief.jpg\n---\n\n![a](${P}grief-2.jpg)\n`;
    expect(renamePostPhotos('grief.md', text, { exists: all })).toEqual({ text, renames: [], warnings: [] });
  });

  test('leaves a photo shared with another post alone', () => {
    const text = `---\ncover: ${P}shared.jpg\n---\n`;
    const usage = new Map([[`${P}shared.jpg`, 2]]);
    expect(renamePostPhotos('grief.md', text, { exists: all, usage }).renames).toEqual([]);
  });

  test('warns instead of renaming a missing photo', () => {
    const text = `---\ncover: ${P}gone.jpg\n---\n`;
    const result = renamePostPhotos('grief.md', text, { exists: only() });
    expect(result.renames).toEqual([]);
    expect(result.text).toBe(text);
    expect(result.warnings).toEqual(['grief.md: gone.jpg is missing']);
  });

  test('keeps the old name when the new one is taken', () => {
    const text = `---\ncover: ${P}IMG_1.jpg\n---\n`;
    const result = renamePostPhotos('grief.md', text, { exists: only('IMG_1.jpg', 'grief.jpg') });
    expect(result.renames).toEqual([]);
    expect(result.warnings).toEqual(['grief.md: grief.jpg already exists, keeping IMG_1.jpg']);
  });

  test('does not touch a different photo whose name contains this one', () => {
    const text = `---\ncover: ${P}a.jpg\n---\n\n![x](${P}a.jpg.bak.jpg)\n`;
    const { text: out } = renamePostPhotos('post.md', text, { exists: only('a.jpg', 'a.jpg.bak.jpg') });
    expect(out).toContain(`${P}post-2.jpg`);
    expect(out).toContain(`cover: ${P}post.jpg`);
  });
});
