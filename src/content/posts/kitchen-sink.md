---
title: "Kitchen sink — every markdown element, rendered"
author: Beck Zhou
pubDatetime: 2099-01-01T00:00:00Z
description: "A styling test page exercising every markdown element this site can render. Dated far in the future so it shows up in dev and never publishes."
tags:
  - meta
---

**This page never publishes.** `postFilter.ts` drops drafts even in dev, so the
`draft` flag would hide it from me too. A far-future `pubDatetime` does what I
actually want: `!draft && (DEV || published)` renders it under `npm run dev` and
excludes it from the production build and both feeds. Check this page after any
theme or dependency change — it's where broken styling shows up before a real
post hits it.

## Table of contents

## Headings

### Third level

#### Fourth level

##### Fifth level

## Text and inline elements

Regular paragraph text with **bold**, _italic_, ***both***, ~~strikethrough~~,
`inline code`, and a [link to a post](/bzlab/columns/vida/). Here is a footnote
reference[^1] to check where footnote markers land.

A long unbroken URL, which is where mobile layouts usually break:
https://beckzhou712.github.io/bzlab/columns/vida/some-extremely-long-post-slug-that-will-not-wrap-on-its-own

[^1]: The footnote body. If footnotes render as literal `[^1]` text instead of a
    linked marker, GFM is not enabled in the markdown processor.

---

## Lists

- First item
- Second item
  - Nested one level
    - Nested two levels
- Third item

1. Ordered first
2. Ordered second
   1. Nested ordered
   2. Another
3. Ordered third

- [ ] Unchecked task
- [x] Checked task

## Blockquote

> A blockquote, which should be visually distinct from body text.
>
> With a second paragraph, and a nested quote:
>
> > The nested level.

## Callouts

> [!NOTE]
> Rendered by `rehype-callouts`. If this shows up as a plain blockquote with a
> literal `[!NOTE]` inside, the plugin is not running.

> [!WARNING]
> A second callout type, to check that each variant has its own styling.

## Code

Inline `const x = 1` inside a sentence.

```ts
// A typed block, to check syntax highlighting and the filename header.
export function getColumnSlug(filePath: string | undefined): string | null {
  return getPostPathSegments(filePath)[0] ?? null;
}
```

```python
# A second language, to confirm highlighting is not TypeScript-only.
def score(runs: list[float]) -> float:
    return sum(runs) / len(runs)
```

```
A plain fenced block with no language set.
Indentation   should   be   preserved   exactly.
```

A line that is deliberately far too long to fit, so I can see whether code blocks
scroll horizontally inside their own container or force the whole page to scroll:

```bash
npm run build && npx serve dist --single --listen 4321 && echo "this command is long on purpose to test horizontal overflow behaviour in code blocks"
```

## Table

| Run | Setting            | Score | Notes                        |
| --- | ------------------ | ----: | ---------------------------- |
| 1   | baseline           | 0.412 | first pass, nothing tuned    |
| 2   | + reweighting      | 0.437 | helped less than expected    |
| 3   | + reweighting + aug | 0.401 | regression                   |

A table wide enough to overflow on mobile:

| Column A | Column B | Column C | Column D | Column E | Column F | Column G |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| value    | value    | value    | value    | value    | value    | value    |

## Image

Absolute, straight out of `public/` — unprocessed, no dimensions inferred:

![Sample figure](/bzlab/attachments/kitchen-sink/sample-figure.svg)

Relative, the way Obsidian writes a pasted screenshot. The filename deliberately
contains spaces, because that is Obsidian's default paste name and the URL
encoding is the part most likely to break. This one should come out of the build
with a hashed filename and `width`/`height` attributes:

![Pasted screenshot](../attachments/Pasted%20image%2020260813010101.svg)

## Attachments

Non-image attachments live under `public/attachments/<column>/<post-slug>/` and
are linked absolutely. Files under `public/` skip Astro's asset pipeline, so a
PDF or CSV downloads byte-for-byte — and unlike images, a *relative* link to one
would be emitted verbatim and 404:

- [sample-data.csv](/bzlab/attachments/kitchen-sink/sample-data.csv)

## Checklist when reviewing this page

- Light mode and dark mode
- 375px width and desktop width
- No horizontal scroll on the page body — only inside code blocks and tables
- Footnote marker links down and back
- Callouts styled, not literal
- Both images render, and the relative one has `width`/`height` in the HTML
