"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { StoryCard, StoryImage } from "@/components/Editorial";
import { FilterBar } from "@/components/FilterBar";
import type { StoryItem, StoryKind } from "@/lib/stories";

// Two kinds of post: Stories (real people's lived experience) and Insights
// (Daw Mi's writing on art psychotherapy). Announcements show under All.
const FILTERS = {
  all: null,
  story: "story",
  insight: "insight",
} as const satisfies Record<string, StoryKind | null>;

type Filter = keyof typeof FILTERS;

export function StoriesIndex({ items }: { items: StoryItem[] }) {
  const t = useTranslations("stories");
  const tEditorial = useTranslations("common.editorial");
  const [filter, setFilter] = useState<Filter>("all");
  const type = FILTERS[filter];
  const stories = items.filter((story) => !type || story.kind === type);
  // The big card, shown only under All: the newest published article, or
  // until there is one, the written story Daw Mi chose to feature.
  const featured = type
    ? undefined
    : (stories.find((story) => story.fromApi) ??
      stories.find((story) => story.featured));
  const rest = stories.filter((story) => story !== featured);
  // Written stories are layout previews; published articles are final.
  const preview = items.some((story) => !story.fromApi);
  const categories = (Object.keys(FILTERS) as Filter[]).map((value) => ({
    value,
    label: t(`filters.${value}`),
  }));
  return (
    <div className="ed-page">
      <header className="ed-container ed-header">
        <p className="ed-label">{t("index.label")}</p>
        <h1>{t("index.title")}</h1>
        <p className="ed-lead">{t("index.lead")}</p>
        {preview && <p className="ed-preview-label">{t("index.preview")}</p>}
      </header>
      <section className="ed-container" aria-label={t("index.sectionLabel")}>
        <FilterBar
          categories={categories}
          active={filter}
          onChange={(value) => setFilter(value as Filter)}
          count={stories.length}
        />
        {featured && (
          <article
            className={
              featured.image ? "ed-feature" : "ed-feature ed-feature-text"
            }
          >
            {featured.image && (
              <StoryImage
                image={featured.image}
                alt=""
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            )}
            <div>
              <p className="ed-label">
                {t("index.featured", { type: t(`types.${featured.kind}`) })}
              </p>
              <h2>
                <Link href={`/stories/${featured.slug}`}>{featured.title}</Link>
              </h2>
              <p>{featured.excerpt}</p>
              <Link className="ed-link" href={`/stories/${featured.slug}`}>
                {featured.fromApi
                  ? tEditorial("readStory")
                  : t("index.readPreview")}
              </Link>
            </div>
          </article>
        )}
        {stories.length === 0 && <p className="ed-empty">{t("index.empty")}</p>}
        <div className="ed-story-list">
          {rest.map((story) => (
            <StoryCard key={story.slug} story={story} />
          ))}
        </div>
      </section>
    </div>
  );
}
