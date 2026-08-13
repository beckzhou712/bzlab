## Why

The AstroPaper theme ships as a flat blog: a single stream of posts differentiated only by tags. bzlab needs a second, narrative axis — a **column** is one long-running research thread, and reading it top to bottom should tell the story of one project from first idea to result. That narrative is the entire point of building in public; a flat reverse-chronological feed destroys it. Nothing can be published until this structure and the deploy path exist.

## What Changes

- Introduce **columns** as a first-class content axis, derived from a post's directory (`src/content/posts/<column>/`) rather than a frontmatter field, so assigning a column in Obsidian is just dragging a file into a folder.
- Add a `columns` content collection carrying per-column display metadata (title, description, status, order), with graceful fallback to the directory slug when no metadata file exists.
- Add routes: `/columns/` (index of all columns) and `/columns/<column>/` (that column's posts, chronologically ascending — oldest first, because a research thread reads forward).
- Extend RSS to **two tiers**: the existing site-wide `/rss.xml`, plus `/columns/<column>/rss.xml` so readers can follow one research thread without subscribing to everything.
- Configure the site for its real deployment target: `base: "/bzlab"`, `site: https://beckzhou712.github.io/bzlab/`, Beck's identity and socials, and Node pinned via `.nvmrc`.
- Add a GitHub Actions workflow that builds and deploys to GitHub Pages on push to `main`.
- Replace the theme's demo content with a VIDA column seed and one unpublished "kitchen sink" draft exercising every markdown element, so styling gaps surface before real posts hit them.

## Capabilities

### New Capabilities
- `columns`: how a post is assigned to a column, how column metadata is resolved, and how columns are browsed.
- `syndication`: the two-tier RSS contract — what each feed contains and how items are ordered and linked.
- `deployment`: how the site is built and published, including subpath-correct URLs.

### Modified Capabilities
_None — this is a greenfield project with no existing specs._

## Impact

- **Content model**: `src/content.config.ts` gains a `columns` collection; the `posts` schema is unchanged (no `column` field by design).
- **Routing**: new `src/pages/columns/**`; existing `/posts/**` routes are untouched.
- **Utilities**: a new column resolver alongside `getPostPaths.ts`, reusing `getSortedPosts` and locale/base helpers rather than reimplementing them.
- **Config**: `astro.config.ts` (`base`), `astro-paper.config.ts` (identity, URL), new `.nvmrc` and `.github/workflows/deploy.yml`.
- **Content**: theme demo posts removed; `src/content/posts/vida/` seeded.
- **Non-goals**: giscus comments, KaTeX, and custom OG images are deliberately deferred — the theme already ships dynamic OG images and documents the other two, and giscus requires the GitHub repo to exist with Discussions enabled. No browser-based CMS. No custom visual design; AstroPaper's typography stands as-is.
