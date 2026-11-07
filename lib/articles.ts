import "server-only";
import { cache } from "react";
import { apiConfigured, apiPath, publicApi } from "@/lib/api/client";
import { ApiError } from "@/lib/api/problem";
import type {
  PublicArticle,
  PublicArticleSummary,
} from "@/lib/api/types/content";
import type { Page } from "@/lib/api/types/shared";
import { storyFromArticle, type StoryItem } from "@/lib/stories";
import type { Locale } from "@/i18n/routing";

export type Article = PublicArticle;

// Published articles come from the API and are cached until the API calls
// POST /api/revalidate (tags "articles" and "article:<slug>"); the sitemap
// reads the same list, so it refreshes with them. Until the API is
// configured, or whenever it fails, the list is empty: these pages never
// error because of the API.

export const listArticles = cache(async (locale: Locale) => {
  if (!apiConfigured()) return [];
  try {
    const { items } = await publicApi({ tags: ["articles"] }).get<
      Page<PublicArticleSummary>
    >("/public/articles", { locale, limit: 100 });
    return items;
  } catch (error) {
    if (!(error instanceof ApiError) || error.status >= 500)
      console.error("stories: article list unavailable", error);
    return [];
  }
});

export const getArticle = cache(
  async (locale: Locale, slug: string): Promise<Article | undefined> => {
    if (!apiConfigured()) return undefined;
    try {
      return await publicApi({ tags: [`article:${slug}`] }).get<Article>(
        apiPath`/public/articles/${slug}`,
        { locale },
      );
    } catch (error) {
      if (!(error instanceof ApiError) || error.status >= 500)
        console.error("stories: article unavailable", error);
      return undefined;
    }
  },
);

// Every story to list, newest first, as the API returns them.
export async function loadStories(locale: Locale): Promise<StoryItem[]> {
  return (await listArticles(locale)).map(storyFromArticle);
}
