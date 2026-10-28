const MAX_LENGTH = 160;

/** The first sentence of a post's writing, as plain text: the description for posts that don't have one. */
export function firstSentence(markdown: string) {
  const paragraph = markdown
    .split(/\n\s*\n/)
    .map(plainText)
    .find((p) => p !== '');
  if (!paragraph) return '';
  const sentence = paragraph.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? paragraph;
  if (sentence.length <= MAX_LENGTH) return sentence;
  return sentence.slice(0, MAX_LENGTH).replace(/\s+\S*$/, '') + '…';
}

function plainText(block: string) {
  if (/^\s*#/.test(block)) return ''; // headings aren't the writing
  return block
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // photos
    .replace(/<[^>]+>/g, '') // HTML, e.g. <img>
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links keep their text
    .replace(/[*_`]+/g, '') // emphasis and code marks
    .replace(/\s+/g, ' ')
    .trim();
}
