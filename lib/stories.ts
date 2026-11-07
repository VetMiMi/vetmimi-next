import type {
  PostKind,
  PublicArticleSummary,
  PublicImage,
} from "./api/types/content.ts";

export type { PublicImage };

export type ArticleSummary = PublicArticleSummary;

// The site's word for each kind of post: a True Story is shown as a Story.
export type StoryKind = "story" | "insight" | "announcement";

const KINDS: Record<PostKind, StoryKind> = {
  true_story: "story",
  insight: "insight",
  announcement: "announcement",
};

// One entry of the Stories & insights list: a published article.
export type StoryItem = {
  slug: string;
  kind: StoryKind;
  title: string;
  excerpt: string;
  image?: PublicImage;
};

export function storyFromArticle(article: ArticleSummary): StoryItem {
  return {
    slug: article.slug,
    kind: KINDS[article.kind],
    title: article.title,
    excerpt: article.excerpt,
    image: article.coverImage,
  };
}
