## Project

bzlab — a "build in public" research site on Astro 7 + AstroPaper v6. Deployed to
GitHub Pages at a **subpath**: `https://beckzhou712.github.io/bzlab/`.

Authoring happens in Obsidian against `src/content/`; publishing is `git push`.

## Invariants worth knowing before editing

**Column = directory, never frontmatter.** A post's column is the first path
segment under `src/content/posts/`, resolved by `getColumnSlug` in
`src/utils/getColumns.ts`, which reuses `getPostPathSegments` from
`getPostPaths.ts`. The column and the URL must come from the same computation —
don't add a `column:` schema field, it can drift from where the file lives.

**`site` and `base` are split on purpose.** `astro-paper.config.ts` holds the
origin alone (`https://beckzhou712.github.io`); `/bzlab` lives in `base` in
`astro.config.ts`. `Astro.url.pathname` already carries `base`, so putting the
subpath in both doubles it in canonical URLs, feeds, and the sitemap. Feeds pass
`getSiteRoot(config.site.url)` for the channel `<link>` so it points at the site
rather than the bare domain; item links stay root-absolute and resolve unchanged.

**Column pages read oldest-first; feeds newest-first.** Deliberate — a column is
a narrative you start at the beginning, a feed is a queue of what you haven't
seen. Don't unify them.

**The kitchen sink uses a future date, not `draft: true`.** `postFilter.ts` drops
drafts in dev too, so `draft` would hide `src/content/posts/kitchen-sink.md` from
its own purpose. `!draft && (DEV || published)` renders it in dev only.

**Attachments follow two rules, not one.** Images go in
`src/content/attachments/` and are linked relatively — Astro's asset pipeline
hashes them and infers `width`/`height`. Everything else (csv, pdf) goes in
`public/attachments/<column>/<post-slug>/` and is linked absolutely under
`/bzlab/...`, because the pipeline only rewrites images; a relative link to a
non-image is emitted verbatim and 404s. Same trap for post-to-post links.
`src/content/attachments/` is the Obsidian vault's attachment folder, which is
why it sits inside `src/content/` and not in `public/`.

**Markdown tables are wrapped by `rehypeTableWrapper`.** The theme ships
`ResponsiveTable.astro` but nothing references it — it's for MDX authors to reach
for by hand. Plain `.md` tables would push the page sideways on mobile without
the plugin.

## Development

```bash
nvm use && npm run dev   # then open http://localhost:4321/bzlab/ — the prefix matters
npm run build            # astro check + build + pagefind index
```

Node is pinned in `.nvmrc`; CI reads the same file so local and deploy builds
can't drift.

## Specs

Change proposals and specs live in `openspec/`. See `openspec/changes/` for
in-flight work.

## Documentation

- [Astro routing](https://docs.astro.build/en/guides/routing/)
- [Content collections](https://docs.astro.build/en/guides/content-collections/)
- [Styling and Tailwind](https://docs.astro.build/en/guides/styling/)
