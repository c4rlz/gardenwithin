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

Add a folder under `src/content/blog/` named for the URL slug, with an `index.md` and the cover photo beside it:

```md
---
title: "A new note"
slug: a-new-note          # becomes /blog/a-new-note
date: 2026-10-08
description: "One or two sentences for the card and search results."
cover: ./cover.jpg
coverAlt: "What's in the photo"
draft: true               # remove to publish
---

Write here. Images: ![alt text](./another-photo.jpg)
```

Drop in full-size photos; the build resizes and compresses them.

## Where things live

| Path | What |
| --- | --- |
| `src/content/site.ts` | All page copy and links. Edit words here. |
| `src/content/blog/` | Field Notes, one folder per post |
| `src/pages/` | One file per page; `blog/[slug].astro` renders posts |
| `src/styles/global.css` | Palette (from the old Squarespace theme), type, light and dark mode |
| `src/assets/` | Photos used on pages |
| `public/_redirects` | Old Squarespace URLs that moved (post URLs didn't) |
| `scripts/import-squarespace.mjs` | One-off import of posts from the live Squarespace site |

## Deploy

Netlify: connect the repo; `netlify.toml` sets the build command and output folder, and Netlify reads `.nvmrc` for the Node version. The contact form uses Netlify Forms, so it only works on Netlify. Turn on email notifications under Forms in the Netlify dashboard.
