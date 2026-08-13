const base = import.meta.env.BASE_URL.replace(/\/+$/, "");
const baseRoot = base === "" ? "/" : `${base}/`;

/**
 * The site's absolute root, including the configured `base`.
 * e.g. `https://beckzhou712.github.io/bzlab/`
 *
 * Feeds need this for the channel-level `<link>`: `config.site.url` is the
 * origin alone, so using it directly points readers at the domain root rather
 * than at the site. Item links stay correct either way — they are
 * root-absolute and already carry `base`.
 */
export function getSiteRoot(siteUrl: string): string {
  return new URL(baseRoot, siteUrl).href;
}

/**
 * Normalise a URL that points at a *file* rather than a directory.
 *
 * `getRelativeLocaleUrl` treats every path as a directory and appends a
 * trailing slash, which turns `/bzlab/rss.xml` into `/bzlab/rss.xml/`. On a
 * static host that path does not exist, so an advertised feed 404s for anyone
 * who follows it. Feed endpoints must go through this.
 */
export function asFileUrl(pathname: string): string {
  return pathname.replace(/\/+$/, "");
}

/**
 * Strip a locale prefix from a root-relative pathname.
 * e.g. with locale "en": "/en/posts/foo" → "/posts/foo", "/en" → "/"
 * Paths that don't start with the locale prefix are returned unchanged.
 */
export function stripLocale(pathname: string, locale: string): string {
  const prefix = `/${locale}`;
  if (pathname === prefix) return "/";
  if (pathname.startsWith(`${prefix}/`)) return pathname.slice(prefix.length);
  return pathname;
}

/**
 * Strip the configured Astro `base` prefix from an absolute pathname.
 * Returns a root-relative pathname.
 */
export function stripBase(pathname: string): string {
  if (base === "") {
    return pathname;
  }
  if (pathname === base) {
    return "/";
  }
  if (pathname.startsWith(baseRoot)) {
    const stripped = pathname.slice(base.length);
    return stripped === "" ? "/" : stripped;
  }
  return pathname;
}

/**
 * Prefix an asset/file path with the configured Astro `base`.
 * Does not force a trailing slash for empty paths.
 */
export function getAssetPath(path: string): string {
  // Strip leading slash to avoid double-slash when concatenating with baseRoot
  const normalizedPath = path.replace(/^\/+/, "");

  if (!normalizedPath) {
    return base === "" ? "/" : base;
  }
  return baseRoot + normalizedPath;
}
