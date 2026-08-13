import rss from "@astrojs/rss";
import type { APIRoute, GetStaticPaths } from "astro";
import { getPostUrl } from "@/utils/getPostPaths";
import { getColumns, type Column } from "@/utils/getColumns";
import { getSiteRoot } from "@/utils/withBase";
import config from "@/config";

export const getStaticPaths = (async () => {
  const columns = await getColumns();
  return columns.map(column => ({
    params: { column: column.slug },
    props: { column },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) => {
  const { column } = props as { column: Column };

  return rss({
    title: `${config.site.title} — ${column.title}`,
    description: column.description ?? config.site.description,
    // Site root including `base`, so the channel <link> points at the site
    // rather than the bare domain. Item links from `getPostUrl` are
    // root-absolute and already carry `base`, so they resolve unchanged.
    site: getSiteRoot(config.site.url),
    // column.posts is already filtered (no drafts) and newest-first, which is
    // what feed readers want — unlike the column page, which reads forward.
    items: column.posts.map(({ data, id, filePath }) => ({
      link: getPostUrl(id, filePath, config.site.lang),
      title: data.title,
      description: data.description,
      pubDate: new Date(data.modDatetime ?? data.pubDatetime),
    })),
  });
};
