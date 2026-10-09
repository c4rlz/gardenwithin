import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Field Notes, edited in Pages CMS (.pages.yml). Each post is src/content/blog/<slug>.md and its
// filename is its URL (/blog/<slug>), matching the old Squarespace slugs. Images live in src/assets/blog/.
const blog = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      description: z.string(),
      cover: image(),
      coverAlt: z.string().default(''),
      draft: z.boolean().default(false),
    }),
});

export const collections = { blog };
