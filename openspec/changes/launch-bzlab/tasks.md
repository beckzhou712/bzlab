## 1. Site identity and deploy target

- [x] 1.1 Set `base: "/bzlab"` in `astro.config.ts`; verify `npm run build` emits `dist/bzlab/` or base-prefixed links in `dist/index.html`
- [x] 1.2 Rewrite `astro-paper.config.ts` with Beck's site URL, title, description, author, timezone, socials, and the `editPost` URL pointing at the bzlab repo
- [x] 1.3 Add `.nvmrc` pinning Node 24; verify `nvm use` in the repo selects it
- [x] 1.4 Replace the theme's `README.md` with a bzlab README covering the write→push workflow
- [x] 1.5 Remove theme-vendor files not wanted in a personal repo (`AstroPaper-lighthouse-score.svg`, `Dockerfile`, `compose.yaml`, `.dockerignore`, `cz.yaml`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, upstream `.github/`)

## 2. Column content model

- [x] 2.1 Add a `columns` collection to `src/content.config.ts` (`src/content/columns/*.md`, schema: title, description, order, optional status)
- [x] 2.2 Create `src/utils/getColumns.ts`: derive a post's column slug from its `filePath` first segment, group posts by column, and resolve metadata with slug fallback
- [x] 2.3 Verify with a temporary script or `astro check` that a top-level post yields no column and a nested post yields its first segment only

## 3. Column routes

- [x] 3.1 Build `/columns/` index listing non-empty columns with title, description, post count; verify at `localhost:4321/bzlab/columns/`
- [x] 3.2 Build `/columns/[column]/` detail page listing that column's non-draft posts oldest-first; verify order at `localhost:4321/bzlab/columns/vida/`
- [x] 3.3 Add the per-column RSS `<link rel="alternate">` tag to the column detail page; verify it appears in page source
- [x] 3.4 Verify `/bzlab/columns/does-not-exist/` returns the 404 page
- [x] 3.5 Add a "Columns" entry to the site header nav

## 4. Two-tier syndication

- [x] 4.1 Confirm the existing `/rss.xml` excludes drafts and covers all columns
- [x] 4.2 Add `src/pages/columns/[column]/rss.xml.ts` generating one feed per non-empty column
- [x] 4.3 Read how the theme composes `config.site.url` into both `astro.config` `site` and RSS before choosing whether `url` carries the `/bzlab` suffix; the two must not both contribute the prefix
- [x] 4.4 Verify built feeds: every `<link>` is absolute, contains exactly one `/bzlab` segment, and a `/bzlab/bzlab` grep across `dist/` returns 0
- [x] 4.5 Extend the same URL check to `dist/sitemap*.xml`, a built post's canonical `<link>`, and its OG image URL
- [x] 4.6 Verify a VIDA post appears in `/columns/vida/rss.xml` and a non-VIDA post does not

## 5. Content seed

- [x] 5.1 Delete the theme's demo posts under `src/content/posts/` and its demo `about.md` body
- [x] 5.2 Write `src/content/columns/vida.md` with VIDA's title and description
- [x] 5.3 Write a first VIDA post so the column is non-empty and the pipeline is exercised end to end
- [x] 5.4 Write `src/content/posts/kitchen-sink.md` exercising headings, tables, code blocks, blockquotes, callouts, nested lists, footnotes, images, and long URLs. It must be dev-visible but never published: `postFilter.ts` drops `draft: true` in dev too, so use a far-future `pubDatetime` with no draft flag instead — `!draft && (DEV || published)` renders it in dev and excludes it from the production build
- [x] 5.5 Verify the kitchen sink renders in `npm run dev`, then confirm it is absent from `dist/` and from both feeds after `npm run build`
- [x] 5.6 Check kitchen-sink rendering in light and dark mode at 375px and desktop width
- [x] 5.7 Rewrite `src/content/pages/about.md` as the landing page for people arriving from Beck's resume
- [x] 5.8 Establish the attachment convention: create `public/attachments/vida/<post-slug>/` and link a file from the seed post with a plain markdown link, confirming `public/` bypasses Astro's asset pipeline so PDFs and CSVs download unprocessed

## 6. Publish pipeline

- [x] 6.1 Add `.github/workflows/deploy.yml` building with the `.nvmrc` Node version and deploying to GitHub Pages on push to `main`
- [x] 6.2 `git init`, commit everything with no AI attribution in the message, and confirm `git log` is clean
- [ ] 6.3 **USER ACTION** — `gh` is a dead x86_64 binary and `~/.ssh/id_ed25519` is rejected by GitHub (`Permission denied (publickey)`), so neither repo creation nor push can be automated. Beck must: create the `bzlab` repo on github.com, register the SSH public key (or supply an HTTPS token), then set Pages source to "GitHub Actions" in repo settings
- [ ] 6.4 Push to `main` and confirm the Actions workflow succeeds
- [ ] 6.5 Load the deployed site and confirm no 404s in the console, search returns results, and both feed tiers fetch

## 7. Authoring setup

- [x] 7.1 Document the Obsidian vault setup in the README: vault root, folder-per-column mapping, required frontmatter, and where attachments go
- [x] 7.2 Document the two required Obsidian settings — **Use [[Wikilinks]] OFF** and link format set to relative — since Astro cannot resolve `![[image.png]]` and every embed would silently break
- [x] 7.3 Add an Obsidian post template file so new posts start with valid frontmatter

## 8. Final verification

- [x] 8.1 Run `npm run build` clean, then `npm run preview` and walk every route: `/`, `/posts/`, `/columns/`, `/columns/vida/`, a post page, `/tags/`, `/search`, `/rss.xml`, `/columns/vida/rss.xml`
