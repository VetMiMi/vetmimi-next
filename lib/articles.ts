import "server-only";
import { cache } from "react";
import { getTranslations } from "next-intl/server";
import { apiConfigured, publicApi } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";
import { STORIES } from "@/lib/data";
import { mergeStories, storyFromArticle, type StoryItem } from "@/lib/stories";
import type { Locale } from "@/i18n/routing";

export type Article = components["schemas"]["PublicArticle"];

// Published articles come from the API and are cached until the API calls
// POST /api/revalidate (tags "articles" and "article:<slug>"); the sitemap
// reads the same list, so it refreshes with them. Until the API is
// configured, or whenever it fails, the stories in the messages still show:
// these pages never error because of the API.

export const listArticles = cache(async (locale: Locale) => {
  if (!apiConfigured()) return [];
  try {
    const { data } = await publicApi({ tags: ["articles"] }).GET(
      "/public/articles",
      { params: { query: { locale, limit: 100 } } },
    );
    return data?.items ?? [];
  } catch (error) {
    console.error("stories: article list unavailable", error);
    return [];
  }
});

export const getArticle = cache(
  async (locale: Locale, slug: string): Promise<Article | undefined> => {
    if (!apiConfigured()) return undefined;
    try {
      const { data } = await publicApi({ tags: [`article:${slug}`] }).GET(
        "/public/articles/{slug}",
        { params: { path: { slug }, query: { locale } } },
      );
      return data;
    } catch (error) {
      console.error("stories: article unavailable", error);
      return undefined;
    }
  },
);

// Every story to list, published articles first.
export async function loadStories(locale: Locale): Promise<StoryItem[]> {
  const [articles, t] = await Promise.all([
    listArticles(locale),
    getTranslations({ locale, namespace: "stories" }),
  ]);
  const written: StoryItem[] = STORIES.map((story) => ({
    slug: story.slug,
    kind: story.type,
    title: t(`items.${story.slug}.title`),
    excerpt: t(`items.${story.slug}.excerpt`),
    category: t(`items.${story.slug}.category`),
    image: story.img,
    featured: story.featured,
    fromApi: false,
  }));
  const published = articles.map((article) => ({
    ...storyFromArticle(article),
    publishedAt: article.publishedAt,
  }));
  return mergeStories(published, written);
}
