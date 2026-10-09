import { getCollection } from 'astro:content';

/** Published Field Notes, newest first. */
export async function getPosts() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function formatDate(date: Date) {
  return date.toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

/** Field Notes cards per page on /blog. */
export const PAGE_SIZE = 12;

/** Page 1 lives at /blog; later pages at /blog/page/<n>. */
export function blogPageUrl(n: number) {
  return n === 1 ? '/blog' : `/blog/page/${n}`;
}

/** One page of the Field Notes list, plus where it sits among the rest. */
export async function getPostPage(current: number) {
  const posts = await getPosts();
  const last = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  return { posts: posts.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE), current, last };
}
