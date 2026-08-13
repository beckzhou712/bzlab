import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    // Origin only — the `/bzlab` subpath is set as `base` in astro.config.ts.
    // Putting it in both would double the segment in canonical URLs and feeds.
    url: "https://beckzhou712.github.io",
    title: "bzlab",
    description:
      "Beck Zhou's research notebook, in public. Each column follows one project from first idea to result — including the parts that did not work.",
    author: "Beck Zhou",
    profile: "https://github.com/beckzhou712",
    lang: "en",
    timezone: "America/New_York",
    dir: "ltr",
  },
  posts: {
    perPage: 8,
    perIndex: 4,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: true,
    showArchives: true,
    showBackButton: true,
    editPost: {
      enabled: true,
      url: "https://github.com/beckzhou712/bzlab/edit/main/",
    },
    search: "pagefind",
  },
  socials: [
    { name: "github", url: "https://github.com/beckzhou712" },
    { name: "mail", url: "mailto:sz4984@nyu.edu" },
  ],
  shareLinks: [
    { name: "x", url: "https://x.com/intent/post?url=" },
    { name: "telegram", url: "https://t.me/share/url?url=" },
    { name: "mail", url: "mailto:?subject=See%20this%20post&body=" },
  ],
});
