import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Field Notes. Each post lives in src/content/blog/<slug>/index.md with its images beside it.
// `slug` is set explicitly so URLs match the old Squarespace ones (/blog/<slug>).
const blog = defineCollection({
  loader: glob({ pattern: '**/index.md', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      slug: z.string(),
      date: z.coerce.date(),
      description: z.string(),
      cover: image(),
      coverAlt: z.string().default(''),
      draft: z.boolean().default(false),
    }),
});

export const collections = { blog };
