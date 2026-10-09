# The Garden Within

The website for [gardenwithin.ca](https://gardenwithin.ca): field notes on living in rhythm with my inner seasons, plus tools and a way to work with me. Moved off Squarespace in 2026.

Built with [Astro](https://astro.build) and plain CSS. No client-side JavaScript.

## Run it

Needs Node 22.12+; developed on Node 26 (`nvm use` picks it up from `.nvmrc`).

```sh
npm install
npm run dev       # http://localhost:4321
npm run build     # type-check, then build to dist/
npm run preview   # serve the built site
```

## Write a Field Note

Posts are edited in [Pages CMS](https://app.pagescms.org): sign in with GitHub, open this repo, then **Field Notes → Add an entry**. Saving commits to `main` and Netlify rebuilds the site in a minute or two. Tick **Draft** to save without publishing.

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

Full-size photos are fine; the build resizes and compresses them.

## Where things live

| Path | What |
| --- | --- |
| `src/content/site.ts` | All page copy and links. Edit words here. |
| `src/content/blog/` | Field Notes, one Markdown file per post (filename = URL) |
| `src/assets/blog/` | Field Notes photos (Pages CMS uploads land here) |
| `.pages.yml` | Pages CMS editor setup |
| `src/pages/` | One file per page; `blog/[slug].astro` renders posts |
| `src/styles/global.css` | Palette (from the old Squarespace theme), type, light and dark mode |
| `src/assets/` | Photos used on pages |
| `public/_redirects` | Old Squarespace URLs that moved (post URLs didn't) |

## Deploy

Netlify: connect the repo; `netlify.toml` sets the build command and output folder, and Netlify reads `.nvmrc` for the Node version. The contact form uses Netlify Forms, so it only works on Netlify. Turn on email notifications under Forms in the Netlify dashboard.
