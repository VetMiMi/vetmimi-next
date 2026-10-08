import type { MetadataRoute } from "next";
import { pageAlternates } from "./seo.ts";

// Every public page that is not built from a list. Private pages (admin,
// manage and session links) and the old /portfolio/<slug> redirects stay out.
const PAGES = [
  "/",
  "/about",
  "/services",
  "/art-of-wellness",
  "/portfolio",
  "/stories",
  "/contact",
  "/book",
  "/privacy",
  "/disclaimer",
  "/booking-policy",
];

export type SitemapArticle = { slug: string; publishedAt: string };

function entry(pathname: string, lastModified?: string) {
  const { canonical, languages } = pageAlternates("en", pathname);
  return {
    url: canonical,
    ...(lastModified && { lastModified }),
    alternates: { languages: { en: languages.en, my: languages.my } },
  };
}

// One entry per English URL, with its Burmese twin as an alternate. Only
// published articles carry a date: the written pages have no truthful one.
// An article that reuses a written story's slug replaces it, as on the page.
export function buildSitemap({
  services,
  stories,
  articles,
}: {
  services: string[];
  stories: string[];
  articles: SitemapArticle[];
}): MetadataRoute.Sitemap {
  const published = new Set(articles.map((article) => article.slug));
  return [
    ...PAGES.map((pathname) => entry(pathname)),
    ...services.map((slug) => entry(`/services/${slug}`)),
    ...stories
      .filter((slug) => !published.has(slug))
      .map((slug) => entry(`/stories/${slug}`)),
    ...articles.map((article) =>
      entry(`/stories/${article.slug}`, article.publishedAt),
    ),
  ];
}
