import { describe, expect, test } from 'vitest';
import { firstSentence } from '../src/lib/excerpt';

describe('firstSentence (description for posts without one)', () => {
  test('takes the first sentence of the first paragraph', () => {
    expect(firstSentence('Grief is a teacher. It asks a lot.\n\nMore later.')).toBe('Grief is a teacher.');
  });

  test('ends at a question mark or exclamation mark too', () => {
    expect(firstSentence('What does rest look like? I am learning.')).toBe('What does rest look like?');
    expect(firstSentence('Spring is here! The garden wakes.')).toBe('Spring is here!');
  });

  test('skips photos and headings before the writing starts', () => {
    const body = '![Ferns](../../assets/blog/a.jpg)\n\n## A heading\n\nThe first real words. Then more.';
    expect(firstSentence(body)).toBe('The first real words.');
  });

  test('keeps link text and drops Markdown formatting', () => {
    expect(firstSentence('I read [a *lovely* book](https://example.com) on **rest**. Then slept.')).toBe(
      'I read a lovely book on rest.',
    );
  });

  test('shortens a long paragraph with no sentence ending at a word break', () => {
    const words = Array.from({ length: 60 }, (_, i) => `word${i}`).join(' ');
    const result = firstSentence(words);
    expect(result.length).toBeLessThanOrEqual(161);
    expect(result.endsWith('…')).toBe(true);
    expect(words.startsWith(result.slice(0, -1))).toBe(true);
    expect(result.slice(0, -1)).not.toMatch(/\s$/);
  });

  test('is empty when there is no writing', () => {
    expect(firstSentence('')).toBe('');
    expect(firstSentence('![Only a photo](../../assets/blog/a.jpg)')).toBe('');
  });
});
