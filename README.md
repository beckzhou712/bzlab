# bzlab

Beck Zhou's research notebook, in public. Live at
**https://beckzhou712.github.io/bzlab/**

Built on [AstroPaper](https://github.com/satnaing/astro-paper) (MIT) with a
column layer added on top.

---

## Writing a post

1. Create a `.md` file inside the column's folder: `src/content/posts/<column>/`
2. Fill in the frontmatter (see below)
3. Commit and push to `main`

That's the whole publishing pipeline. GitHub Actions builds and deploys on push;
there is no separate publish step.

### Frontmatter

```yaml
---
title: "Post title"
author: Beck Zhou
pubDatetime: 2026-08-12T10:00:00-04:00
description: "One or two sentences. Shows up in listings, feeds, and previews."
tags:
  - vida
---
```

`title`, `pubDatetime` and `description` are required — the build fails without
them, which is deliberate: a broken post never reaches the live site.

Optional: `modDatetime`, `featured: true`, `draft: true`, `canonicalURL`,
`ogImage`.

### Columns

**A post's column is the folder it lives in.** There is no `column:` frontmatter
field — moving a post between columns means dragging the file, and the column
can never disagree with the URL.

```
src/content/posts/
├── vida/                    → column "vida", at /columns/vida/
│   └── why-vida.md          → /posts/vida/why-vida
└── some-post.md             → no column; still in the site-wide list and feed
```

A column exists as soon as its folder holds one publishable post. To give it a
title and description, add `src/content/columns/<slug>.md`:

```yaml
---
title: VIDA
description: What this thread is about.
order: 1
---
```

That file is optional — without it the column renders under its folder name, so
you can start writing before deciding what to call it.

Column pages list posts **oldest first**, so a column reads forward like the
research actually happened. Feeds stay newest-first, which is what feed readers
expect.

### Attachments

Papers, datasets and figures go in:

```
public/attachments/<column>/<post-slug>/
```

and are linked as plain markdown links:

```markdown
[Paper draft](/bzlab/attachments/vida/first-results/paper-draft.pdf)
```

Files under `public/` bypass Astro's asset pipeline, so PDFs and CSVs download
byte-for-byte. Note the `/bzlab` prefix — the site is deployed at a subpath.

### Feeds

- Everything: `/bzlab/rss.xml`
- One column: `/bzlab/columns/<slug>/rss.xml`

Per-column feeds let people follow one research thread without subscribing to
the rest. They're advertised in each column page's `<head>`, so feed readers
find them automatically.

---

## Writing in Obsidian

**The vault already exists** — it is `src/content/`. Open Obsidian → "Open folder
as vault" → pick that folder. Folders under `posts/` show up as columns in the
sidebar, so assigning a column is dragging a note.

Settings are pre-seeded in `src/content/.obsidian/app.json` and tracked in git,
so a second machine gets the same vault. Three of them are load-bearing:

| Setting | Value | Why |
| --- | --- | --- |
| Use `[[Wikilinks]]` | **Off** | Astro cannot resolve `![[image.png]]`; every embed would silently break |
| New link format | **Relative path to file** | Absolute vault paths don't match the deployed URLs |
| Attachment folder | **`attachments`** | Puts pasted images where Astro can find them |

### Two kinds of attachment

**Images: just paste them.** A screenshot pasted into a note lands in
`src/content/attachments/`, and Astro's asset pipeline picks it up from the
relative link Obsidian writes — content-hashed filename, `width`/`height` filled
in so the page doesn't shift while loading, and `loading="lazy"`. Obsidian's
default `Pasted image 20260813....png` name with its spaces resolves correctly;
so does the `../../` depth of a post inside a column folder. Both are verified.

**Everything else: Finder.** The pipeline only rewrites images. A relative link
to a `.csv` or `.pdf` is emitted literally and 404s in production. Those go in
`public/attachments/<column>/<post-slug>/` and are linked absolutely:

```markdown
[sample-data.csv](/bzlab/attachments/kitchen-sink/sample-data.csv)
```

**Linking between posts** follows the same rule as non-image files — Astro does
not rewrite `[x](./other-post.md)`. Cross-link with the deployed path instead:
`[x](/bzlab/posts/vida/why-vida/)`.

To publish, commit and push. The [Obsidian Git](https://github.com/Vinzent03/obsidian-git)
plugin can do that on a timer if you'd rather not touch a terminal.

### Post template

`src/content/posts/_template.md` is excluded from the build (files starting with
`_` are ignored by the content loader). Copy it when starting a post, or point
Obsidian's "Templates" plugin at it.

---

## Local development

```bash
nvm use && npm install && npm run dev
```

Then open **http://localhost:4321/bzlab/** — the `/bzlab` prefix matters, the
bare root will 404.

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Type-check, build, and index for search |
| `npm run preview` | Serve the production build locally |

Node version is pinned in `.nvmrc` and CI reads the same file, so local and
deploy builds can't drift.

### The kitchen sink page

`src/content/posts/kitchen-sink.md` renders every markdown element the site
supports. It's dated far in the future, which makes it visible in `npm run dev`
and invisible in production — `draft: true` would hide it from you too.

Check it after any theme or dependency upgrade. It's where broken styling shows
up before a real post hits it.

---

## Deploying

Push to `main`. `.github/workflows/deploy.yml` runs `astro check`, builds, and
publishes to GitHub Pages.

If the build fails — most often invalid frontmatter — the deploy is skipped and
the previously published site stays up.

**Repo settings required once:** Settings → Pages → Source = **GitHub Actions**.
