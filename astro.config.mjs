import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://gardenwithin.ca',
  integrations: [sitemap()],
  // Build /blog as blog.html (not blog/index.html) so Netlify serves /blog directly
  // instead of redirecting to /blog/, and post URLs match the old Squarespace ones.
  trailingSlash: 'never',
  build: { format: 'file' },
});
