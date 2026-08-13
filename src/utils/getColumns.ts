import { getCollection, type CollectionEntry } from "astro:content";
import { getPostPathSegments } from "./getPostPaths";
import { getSortedPosts } from "./getSortedPosts";

export type Column = {
  slug: string;
  title: string;
  description?: string;
  order: number;
  /** Publishable posts in this column, newest first. */
  posts: CollectionEntry<"posts">[];
};

/**
 * A post's column is the first directory segment beneath `src/content/posts/`.
 * Posts at the top level belong to no column.
 *
 * Derived from the filesystem rather than frontmatter on purpose: assigning a
 * column is moving the file, so the column can never disagree with the URL the
 * post is served at.
 */
export function getColumnSlug(filePath: string | undefined): string | null {
  return getPostPathSegments(filePath)[0] ?? null;
}

/**
 * Every column that has at least one publishable post, ordered by the optional
 * `order` field and then by title. Columns without a metadata file fall back to
 * their slug; metadata files without posts are omitted rather than shown empty.
 */
export async function getColumns(): Promise<Column[]> {
  const [allPosts, meta] = await Promise.all([
    getCollection("posts"),
    getCollection("columns"),
  ]);

  const metaBySlug = new Map(meta.map(entry => [entry.id, entry.data]));

  // getSortedPosts applies postFilter (drafts, scheduled) and sorts newest first.
  const postsBySlug = new Map<string, CollectionEntry<"posts">[]>();
  for (const post of getSortedPosts(allPosts)) {
    const slug = getColumnSlug(post.filePath);
    if (!slug) continue;
    const bucket = postsBySlug.get(slug);
    if (bucket) bucket.push(post);
    else postsBySlug.set(slug, [post]);
  }

  return [...postsBySlug.entries()]
    .map(([slug, posts]) => {
      const data = metaBySlug.get(slug);
      return {
        slug,
        title: data?.title ?? slug,
        description: data?.description,
        order: data?.order ?? Number.MAX_SAFE_INTEGER,
        posts,
      };
    })
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}
