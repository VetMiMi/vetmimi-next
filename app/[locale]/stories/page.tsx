"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { StoryCard } from "@/components/Editorial";
import { FilterBar } from "@/components/FilterBar";
import { STORIES, type StoryType } from "@/lib/data";
import Image from "next/image";

// Two kinds of post: Stories (real people's lived experience) and Insights
// (Daw Mi's writing on art psychotherapy).
const FILTERS = {
  all: null,
  story: "story",
  insight: "insight",
} as const satisfies Record<string, StoryType | null>;

type Filter = keyof typeof FILTERS;

export default function Stories() {
  const t = useTranslations("stories");
  const [filter, setFilter] = useState<Filter>("all");
  const type = FILTERS[filter];
  const stories = STORIES.filter((story) => !type || story.type === type);
  // The big card is the one post Daw Mi chooses to feature, shown only under All.
  const featured = type ? undefined : stories.find((story) => story.featured);
  const rest = stories.filter((story) => story !== featured);
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
        <p className="ed-preview-label">{t("index.preview")}</p>
      </header>
      <section className="ed-container" aria-label={t("index.sectionLabel")}>
        <FilterBar
          categories={categories}
          active={filter}
          onChange={(value) => setFilter(value as Filter)}
          count={stories.length}
        />
        {featured && (
          <article className="ed-feature">
            <Image
              src={featured.img}
              alt=""
              sizes="(max-width: 768px) 100vw, 50vw"
              preload
            />
            <div>
              <p className="ed-label">
                {t("index.featured", { type: t(`types.${featured.type}`) })}
              </p>
              <h2>
                <Link href={`/stories/${featured.slug}`}>
                  {t(`items.${featured.slug}.title`)}
                </Link>
              </h2>
              <p>{t(`items.${featured.slug}.excerpt`)}</p>
              <Link className="ed-link" href={`/stories/${featured.slug}`}>
                {t("index.readPreview")}
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
