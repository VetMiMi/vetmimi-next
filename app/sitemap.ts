import type { MetadataRoute } from "next";
import { listArticles } from "@/lib/articles";
import { STORIES } from "@/lib/data";
import { services } from "@/lib/services";
import { buildSitemap } from "@/lib/sitemap";

// Refreshed with the stories pages when an article publishes (the article
// list is tagged "articles"), and hourly in case the API was unreachable.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Every article has an English version: the API falls back to it.
  const articles = await listArticles("en");
  return buildSitemap({
    services: services.map((service) => service.slug),
    stories: STORIES.map((story) => story.slug),
    articles,
  });
}
