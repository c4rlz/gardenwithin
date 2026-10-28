import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Field Notes, edited in Pages CMS (.pages.yml). Each post is src/content/blog/<slug>.md and its
// filename is its URL (/blog/<slug>), matching the old Squarespace slugs. Images live in src/assets/blog/.
// Cover and description can be left empty (handy for drafts); getPosts() in src/lib/posts.ts fills them in.
const emptyToUndefined = (value: unknown) => (value === '' || value === null ? undefined : value);

const blog = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      description: z.preprocess(emptyToUndefined, z.string().optional()),
      cover: z.preprocess(emptyToUndefined, image().optional()),
      coverAlt: z.string().default(''),
      draft: z.boolean().default(false),
    }),
});

export const collections = { blog };
