// How Field Notes refer to their photos, shared by tidy-photos.mjs and the pre-build checks.

export const REF_PREFIX = '../../assets/blog/'; // how posts refer to photos (see .pages.yml)

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
// A reference ends at a quote, a closing bracket, whitespace or the end of the text.
const END = `(?=["')\\s]|$)`;

/** Photo references in a post, in order: the cover first, then body images (Markdown or HTML). */
export function photoRefs(markdown) {
  const refs = [];
  const prefix = escape(REF_PREFIX);
  const cover = markdown.match(new RegExp(`^cover:\\s*["']?(${prefix}[^"'\\s]+)`, 'm'));
  if (cover) refs.push(cover[1]);
  const body = new RegExp(`(?:\\]\\(|src=["'])(${prefix}[^)"'\\s]+)`, 'g');
  for (const [, ref] of markdown.matchAll(body)) if (!refs.includes(ref)) refs.push(ref);
  return refs;
}

/**
 * Names a post's photos after it: <slug>.jpg for the cover, then <slug>-2.jpg, <slug>-3.jpg… in order.
 * `exists(name)` says whether src/assets/blog/<name> is there; `usage` counts how many posts use each
 * reference, and a photo used by more than one post keeps its name. Returns the updated post text,
 * the [from, to] renames to make on disk, and warnings for photos it had to leave alone.
 */
export function renamePostPhotos(file, text, { exists, usage = new Map() }) {
  const slug = file.replace(/\.md$/, '');
  const renames = [];
  const warnings = [];
  photoRefs(text).forEach((ref, i) => {
    const current = ref.slice(REF_PREFIX.length);
    const wanted = `${slug}${i === 0 ? '' : `-${i + 1}`}${extension(current)}`;
    if (current === wanted || usage.get(ref) > 1) return;
    if (!exists(current)) return warnings.push(`${file}: ${current} is missing`);
    if (exists(wanted)) return warnings.push(`${file}: ${wanted} already exists, keeping ${current}`);
    renames.push([current, wanted]);
  });
  if (renames.length === 0) return { text, renames, warnings };
  // One pass, matching whole references only, so a.jpg never rewrites part of a.jpg.bak.jpg.
  const to = new Map(renames);
  const pattern = new RegExp(`${escape(REF_PREFIX)}(${renames.map(([from]) => escape(from)).join('|')})${END}`, 'g');
  return { text: text.replace(pattern, (_, from) => REF_PREFIX + to.get(from)), renames, warnings };
}

function extension(name) {
  const dot = name.lastIndexOf('.');
  return dot === -1 ? '' : name.slice(dot).toLowerCase();
}
