# columns Specification

## Purpose
TBD - created by archiving change launch-bzlab. Update Purpose after archive.
## Requirements
### Requirement: Column membership is derived from directory position

A post's column SHALL be determined by the first path segment beneath `src/content/posts/`. The system MUST NOT read column membership from post frontmatter, so that a column can never disagree with where the file actually lives.

#### Scenario: Post inside a column directory
- **WHEN** a post file exists at `src/content/posts/vida/first-results.md`
- **THEN** the post belongs to the column with slug `vida`
- **AND** it is reachable at `/bzlab/posts/vida/first-results`

#### Scenario: Post at the top level
- **WHEN** a post file exists at `src/content/posts/hello.md` with no intervening directory
- **THEN** the post belongs to no column
- **AND** it still appears in the site-wide post list and site-wide feed

#### Scenario: Post nested more than one level deep
- **WHEN** a post file exists at `src/content/posts/vida/appendix/notes.md`
- **THEN** its column is `vida`, taken from the first segment only

#### Scenario: Author moves a post between columns
- **WHEN** the author drags `first-results.md` from `posts/vida/` into `posts/other/` in Obsidian
- **THEN** after a rebuild the post appears under column `other` and no longer under `vida`
- **AND** no frontmatter edit is required

### Requirement: Column metadata resolves with fallback

The system SHALL read per-column display metadata from a `columns` content collection keyed by column slug. When no metadata file exists for a slug that posts reference, the system MUST still render that column using the slug as its title rather than failing the build.

#### Scenario: Metadata file present
- **WHEN** `src/content/columns/vida.md` declares `title: VIDA` and a description
- **THEN** `/columns/` and `/columns/vida/` display that title and description

#### Scenario: Metadata file absent
- **WHEN** posts exist under `posts/scratch/` but `src/content/columns/scratch.md` does not exist
- **THEN** the build succeeds
- **AND** the column renders with title `scratch` and no description

#### Scenario: Metadata file with no posts
- **WHEN** `src/content/columns/planned.md` exists but no post lives under `posts/planned/`
- **THEN** the column is omitted from `/columns/` rather than shown empty

### Requirement: Columns are browsable

The system SHALL provide an index of all non-empty columns and a page per column listing that column's posts.

#### Scenario: Column index
- **WHEN** a reader visits `/columns/`
- **THEN** every non-empty column is listed with its title, description, and post count

#### Scenario: Column detail ordering
- **WHEN** a reader visits `/columns/vida/`
- **THEN** that column's posts are listed oldest first, so the research thread reads forward in time
- **AND** drafts are excluded

#### Scenario: Unknown column
- **WHEN** a reader visits `/columns/does-not-exist/`
- **THEN** the site returns its 404 page

### Requirement: Posts carry attachments

A post SHALL be able to publish companion files — papers, datasets, figures — that readers download unmodified. Attachments MUST live under `public/attachments/<column>/<post-slug>/` so they bypass Astro's asset pipeline and are served byte-for-byte.

#### Scenario: Reader downloads a paper draft
- **WHEN** a post links `attachments/vida/first-results/paper-draft.pdf` and the reader clicks it
- **THEN** the PDF downloads unaltered from `/bzlab/attachments/vida/first-results/paper-draft.pdf`

#### Scenario: Dataset is not processed as an image
- **WHEN** a `.csv` or `.pdf` attachment is added
- **THEN** the build does not attempt to optimize, hash, or transform it

