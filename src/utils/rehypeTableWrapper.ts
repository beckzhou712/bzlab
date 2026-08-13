/**
 * Wraps every markdown `<table>` in a horizontally scrollable container.
 *
 * The theme ships `ResponsiveTable.astro` for this, but nothing references it —
 * it exists for authors to reach for by hand inside MDX. Plain `.md` tables get
 * no wrapper, so a table wider than the viewport pushes the whole page sideways
 * on mobile. This applies the same treatment automatically, for every table, in
 * both `.md` and `.mdx`.
 *
 * Written as a manual tree walk rather than pulling in `unist-util-visit`:
 * it's only present as a transitive dependency here, and this is ten lines.
 */

type HastNode = {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

const WRAPPER_CLASS = "table-wrapper";

function isWrapper(node: HastNode): boolean {
  const className = node.properties?.className;
  return Array.isArray(className) && className.includes(WRAPPER_CLASS);
}

function wrapTables(node: HastNode): void {
  if (!node.children?.length) return;

  node.children = node.children.map(child => {
    wrapTables(child);

    if (child.type !== "element" || child.tagName !== "table") return child;

    // Already wrapped (e.g. an MDX author used ResponsiveTable) — leave it be.
    if (isWrapper(node)) return child;

    return {
      type: "element",
      tagName: "div",
      properties: { className: [WRAPPER_CLASS] },
      children: [child],
    };
  });
}

export function rehypeTableWrapper() {
  return (tree: HastNode) => wrapTables(tree);
}
