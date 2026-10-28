# The Garden Within

The website for [gardenwithin.ca](https://gardenwithin.ca): field notes on living in rhythm with my inner seasons, plus tools and a way to work with me. Moved off Squarespace in 2026.

Built with [Astro](https://astro.build) and plain CSS. The only JavaScript is a few lines that fade photos in as they load, and the contact form sending in the background; page transitions use the browser's built-in view transitions.

## Run it

Needs Node 22.12+; developed on Node 26 (`nvm use` picks it up from `.nvmrc`).

```sh
npm install
npm run dev       # http://localhost:4321
npm run build     # check posts, type-check, build to dist/, then check links
npm run preview   # serve the built site
npm test          # tests for the post checks, description fallback and photo tidy-up
```

## Write a Field Note

Posts are edited in [Pages CMS](https://app.pagescms.org): sign in with GitHub, open this repo, then **Field Notes → Add an entry**. Saving commits to `main` and Cloudflare rebuilds the site in a minute or two. Tick **Draft** to save without publishing. Cover photo and description can be left empty: a post without a cover uses the ferns from the home page, and one without a description uses its first sentence.

If a save would break the site, it doesn't go live (the site stays as it was) and GitHub emails you what's wrong, e.g. "grief.md uses the photo x.jpg, which isn't in src/assets/blog" or "/blog/grief links to /blog/greif, which doesn't exist". Fix it in Pages CMS and save again. The checks: every photo a post uses exists, published posts have writing in them, and every link to a page on the site leads somewhere (`scripts/check-posts.mjs`, `scripts/check-links.mjs`).

The title sets the URL when a post is created ("My new note" → `/blog/my-new-note`); changing the title later keeps the URL. The editor's fields and folders are defined in `.pages.yml`.

Posts are plain Markdown, so editing the files directly works too:

```md
---
title: "A new note"
date: 2026-10-08
description: "One or two sentences for the card and search results."
cover: ../../assets/blog/a-new-note.jpg
coverAlt: "What's in the photo"
draft: true
---

Write here. Images: ![alt text](../../assets/blog/another-photo.jpg)
```

Full-size photos are fine. After each save, a GitHub Action (`.github/workflows/tidy-photos.yml`) names a post's photos after it (`my-new-note.jpg` for the cover, then `my-new-note-2.jpg`… for photos in the post), updates the post to match, and shrinks originals to 2400px on the long side. If Pages CMS then says the post changed, reload it. To run the same tidy-up locally: `npm run photos`. The build makes the small compressed copies visitors actually download.

To get photos ready before uploading (HEIC, PNG, WebP… → JPEG, upright, 2400px, compressed, location data stripped): `npm run compress -- ~/Downloads/IMG_5118.HEIC ~/Desktop/some-folder`. Copies land in `./compressed`; originals aren't touched. Options: `-o <dir>`, `-m <px>`, `-q <quality>`. Run `npm link` once in this folder to use it from anywhere as `garden-compress`.

Every post ends with the handwritten "Xo, C" automatically; no need to add it.

## Where things live

| Path | What |
| --- | --- |
| `src/content/site.ts` | All page copy and links. Edit words here. |
| `src/content/blog/` | Field Notes, one Markdown file per post (filename = URL) |
| `src/assets/blog/` | Field Notes photos (Pages CMS uploads land here) |
| `.pages.yml` | Pages CMS editor setup |
| `src/pages/` | One file per page; `blog/[slug].astro` renders posts, `blog/page/[page].astro` the list pages after the first |
| `src/lib/posts.ts` | Post helpers: sorting, Field Notes per page (`PAGE_SIZE`), card photo sizes |
| `src/styles/global.css` | Palette and fonts (from the old Squarespace theme), buttons, photo fade-in, page transitions |
| `src/assets/` | Photos used on pages |
| `public/_redirects` | Old Squarespace URLs that moved (post URLs didn't) |
| `wrangler.jsonc` | Cloudflare hosting setup |

## Deploy

Hosted on [Cloudflare Workers](https://developers.cloudflare.com/workers/static-assets/) (free plan) at [gardenwithin.ca](https://gardenwithin.ca). Every push to `main` rebuilds and publishes the site; the Worker's **Deployments** tab in the Cloudflare dashboard has build logs and rollback.

The Worker (**Workers & Pages → gardenwithin**) is connected to this GitHub repo with build command `npm run build` and deploy command `npx wrangler deploy`. `wrangler.jsonc` points it at `dist/`; the build reads `.nvmrc` for the Node version (or set a `NODE_VERSION` build variable). Pages build as `blog.html`-style files so URLs have no trailing slash, matching the old Squarespace ones.

The contact form posts to [Web3Forms](https://web3forms.com), which emails each message; its access key is `contact.formKey` in `src/content/site.ts`.
