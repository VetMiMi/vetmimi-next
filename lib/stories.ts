import type { StaticImageData } from "next/image";
import type { components } from "./api/schema.ts";

type PostKind = components["schemas"]["PostKind"];
export type PublicImage = components["schemas"]["PublicImage"];
export type ArticleSummary = components["schemas"]["PublicArticleSummary"];

// The site's word for each kind of post: a True Story is shown as a Story.
export type StoryKind = "story" | "insight" | "announcement";

const KINDS: Record<PostKind, StoryKind> = {
  true_story: "story",
  insight: "insight",
  announcement: "announcement",
};

// One entry of the Stories & insights list, from the API or from the
// stories still written in messages/<locale>/stories.json.
export type StoryItem = {
  slug: string;
  kind: StoryKind;
  title: string;
  excerpt: string;
  image?: StaticImageData | PublicImage;
  featured?: boolean;
  fromApi: boolean;
};

export function storyFromArticle(article: ArticleSummary): StoryItem {
  return {
    slug: article.slug,
    kind: KINDS[article.kind],
    title: article.title,
    excerpt: article.excerpt,
    image: article.coverImage,
    fromApi: true,
  };
}

// Published articles first, newest first, then every story written in the
// messages that has not been published from the portal yet, so nothing
// disappears before the one-off import. A slug in both comes from the API.
export function mergeStories<T extends { slug: string }>(
  articles: (T & { publishedAt: string })[],
  stories: T[],
): T[] {
  const published = new Set(articles.map((article) => article.slug));
  const newestFirst = [...articles].sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
  );
  return [
    ...newestFirst,
    ...stories.filter((story) => !published.has(story.slug)),
  ];
}
