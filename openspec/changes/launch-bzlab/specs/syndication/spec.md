## ADDED Requirements

### Requirement: Site-wide feed

The system SHALL publish a feed at `/rss.xml` containing every published post across all columns, newest first.

#### Scenario: Reader subscribes to everything
- **WHEN** a reader subscribes to `/bzlab/rss.xml`
- **THEN** they receive new posts from every column and from posts with no column

#### Scenario: Drafts excluded
- **WHEN** a post has `draft: true` in its frontmatter
- **THEN** it does not appear in any feed

### Requirement: Per-column feed

The system SHALL publish a feed at `/columns/<column>/rss.xml` for each non-empty column, containing only that column's published posts, newest first.

#### Scenario: Reader follows one research thread
- **WHEN** a reader subscribes to `/bzlab/columns/vida/rss.xml`
- **THEN** they receive only VIDA posts
- **AND** posts from other columns never appear in that feed

#### Scenario: Feed identity
- **WHEN** a per-column feed is generated
- **THEN** its channel title identifies both the site and the column
- **AND** its channel description is the column's own description when one exists

#### Scenario: Feed discoverability
- **WHEN** a reader loads `/columns/vida/`
- **THEN** the page advertises that column's feed via a `<link rel="alternate" type="application/rss+xml">` tag, so feed readers can auto-detect it

### Requirement: Feed links are absolute and subpath-correct

Every item link in every feed MUST be an absolute URL that includes the configured Astro `base`, because feed readers resolve links outside the site's own routing context.

#### Scenario: Item link under a subpath deployment
- **WHEN** the site is deployed at `https://beckzhou712.github.io/bzlab/` and a post lives at `posts/vida/first-results`
- **THEN** its feed item link is exactly `https://beckzhou712.github.io/bzlab/posts/vida/first-results`
- **AND** the link contains neither a doubled nor a missing `/bzlab` segment
