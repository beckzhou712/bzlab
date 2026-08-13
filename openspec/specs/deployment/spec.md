# deployment Specification

## Purpose
TBD - created by archiving change launch-bzlab. Update Purpose after archive.
## Requirements
### Requirement: Subpath-correct site configuration

The site SHALL be configured for deployment at `https://beckzhou712.github.io/bzlab/`. Every internal link, asset reference, and feed URL MUST resolve correctly under that `/bzlab` prefix.

#### Scenario: Internal navigation
- **WHEN** a reader clicks any nav link, post link, or tag link on the deployed site
- **THEN** the target resolves under `/bzlab/` and does not 404

#### Scenario: Assets and search
- **WHEN** the deployed site loads styles, fonts, images, and the pagefind search index
- **THEN** all requests resolve under `/bzlab/` with no 404s in the browser console

### Requirement: Reproducible build toolchain

The repository SHALL pin its Node version so the build behaves identically on the author's machine and in CI.

#### Scenario: CI matches local
- **WHEN** CI reads `.nvmrc` to select its Node version
- **THEN** it uses the same major version the author develops against
- **AND** `package-lock.json` is committed so dependency versions are identical

### Requirement: Automated publish on push

The system SHALL build and deploy to GitHub Pages automatically when commits land on `main`, so that publishing a post is nothing more than a git push.

#### Scenario: Author publishes a post
- **WHEN** the author commits a new markdown file and pushes to `main`
- **THEN** GitHub Actions builds the site and deploys it to GitHub Pages
- **AND** the post is live without any further manual step

#### Scenario: Build failure blocks deploy
- **WHEN** the build fails, for example because a post's frontmatter violates the content schema
- **THEN** the workflow fails and the previously deployed site remains untouched

