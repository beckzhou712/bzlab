## Context

AstroPaper v6.1.0 models content as a single flat `posts` collection. Its routing utility `getPostPaths.ts` already derives URL segments from a post's directory position (`posts/vida/foo.md` → `/posts/vida/foo`), so the directory hierarchy is *already* load-bearing for URLs — it simply has no semantic meaning attached to it yet. This change attaches meaning to the first segment.

The author writes in Obsidian against the repo's content directory and publishes by pushing. That workflow is the dominant constraint on the content model: anything requiring a remembered frontmatter field will eventually be forgotten or typo'd.

## Goals / Non-Goals

**Goals:**
- A second navigational axis (column) that carries narrative, orthogonal to tags.
- Zero authoring ceremony: dropping a file in a folder is the entire act of classification.
- Per-column subscription, so followers of one thread aren't spammed by another.
- A deploy path where publishing is `git push` and nothing else.

**Non-Goals:**
- Comments (giscus), math rendering (KaTeX), custom OG images — deferred to a follow-up change. The theme already ships dynamic OG images; giscus needs the repo to exist with Discussions enabled first.
- Any browser-based CMS or auth.
- Visual redesign. AstroPaper's typography is accepted as-is.
- Multi-column membership for a single post. One post, one column.

## Decisions

**Column = directory, not frontmatter.**
Considered a `column: vida` zod field. Rejected: it duplicates information the filesystem already encodes, and the two can drift — a post physically in `posts/vida/` but tagged `column: other` would render at a `/posts/vida/…` URL while claiming to belong elsewhere, and nothing would catch it. Deriving from the directory makes that state unrepresentable. It also means moving a post between columns is a drag in Obsidian rather than a drag plus an edit. Cost: a post cannot belong to a column while living outside its folder — accepted, since that capability isn't wanted.

**Column metadata lives in a separate `columns` collection, and is optional.**
Considered a `_column.md` sentinel inside each post directory (the theme's glob already excludes `_`-prefixed files). Rejected as too clever — it hides metadata inside the writing surface Obsidian shows the author. A sibling `src/content/columns/<slug>.md` keeps it out of the way. Crucially, resolution *falls back to the slug*: a new column comes into existence the moment a folder has a post in it, and the author can add metadata later. This preserves the "just start writing" property — the build never fails because prose arrived before bookkeeping.

**Column detail pages list oldest-first; feeds stay newest-first.**
These serve different readers and must not be unified. Someone landing on `/columns/vida/` is starting a story and wants chapter one; someone in a feed reader wants what they haven't seen yet. Reverse-chronological on the column page would defeat the narrative that justifies columns existing at all.

**Reuse `getPostUrl` and `getSortedPosts` rather than reimplementing.**
Subpath + locale handling is already correct in these helpers. For feeds, the item link must additionally be absolutized against `config.site.url` — `getPostUrl` returns a root-relative path that already contains `base`, so naive `site + link` concatenation would double the `/bzlab` segment. Resolve with `new URL(link, site)` semantics and assert against it in verification.

## Risks / Trade-offs

- **Doubled or missing `/bzlab` in feed links** → the single most likely defect. Mitigated by an explicit verification task that greps built feed XML for `/bzlab/bzlab` and for links missing the prefix.
- **Pagefind search breaking under a subpath** → the theme's build script copies the pagefind index into `public/`. Verify search returns results on a `preview` server serving from `/bzlab/`, not just that the build passes.
- **A column folder created with no metadata renders a bare slug as its title** → intended, not a bug, but it will look unfinished if forgotten. Mitigated by seeding `columns/vida.md` up front so the pattern is visible.
- **Deleting the theme's demo posts removes its own documentation** (giscus, LaTeX, config how-tos) → those docs are recoverable from the upstream repo, and stale vendor content in a personal site is worse. Keep the files' upstream URLs in the follow-up change notes.

## Migration Plan

Greenfield; no migration. Rollback is `git revert` — GitHub Pages redeploys the previous commit's build.

## Open Questions

- Whether `/columns/` should eventually replace the theme's `/posts/` index as the site's primary browse surface. Deferred until there is more than one column and the flat list actually feels wrong.
