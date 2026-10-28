"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ed, StoryCard, StoryImage } from "@/components/Editorial";
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
    <div className={ed.page}>
      <header className={`${ed.container} pt-[clamp(44px,6vw,80px)] pb-10`}>
        <p className={ed.label}>{t("index.label")}</p>
        <h1 className={ed.h1}>{t("index.title")}</h1>
        <p className={`${ed.lead} last:mb-0`}>{t("index.lead")}</p>
        {preview && (
          <p className="text-[0.75rem] leading-[1.8] text-caption">
            {t("index.preview")}
          </p>
        )}
      </header>
      <section className={ed.container} aria-label={t("index.sectionLabel")}>
        <FilterBar
          categories={categories}
          active={filter}
          onChange={(value) => setFilter(value as Filter)}
          count={stories.length}
        />
        {featured && (
          <article
            className={`mb-10 grid items-stretch overflow-hidden rounded-card bg-[#eeeaf2] ${featured.image ? "grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] max-md:grid-cols-1" : "grid-cols-1"}`}
          >
            {featured.image && (
              // Fills the card's height without its own tall shape stretching
              // the card.
              <StoryImage
                className="block aspect-auto h-auto min-h-[340px] w-full object-cover object-[center_30%] contain-size max-md:h-[230px]"
                image={featured.image}
                alt=""
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            )}
            <div className="self-center p-[clamp(24px,4vw,48px)]">
              <p className={ed.label}>
                {t("index.featured", { type: t(`types.${featured.kind}`) })}
              </p>
              <h2 className={ed.h2}>
                <Link href={`/stories/${featured.slug}`}>{featured.title}</Link>
              </h2>
              <p className={ed.text}>{featured.excerpt}</p>
              <Link className={ed.link} href={`/stories/${featured.slug}`}>
                {featured.fromApi
                  ? tEditorial("readStory")
                  : t("index.readPreview")}
              </Link>
            </div>
          </article>
        )}
        {stories.length === 0 && <p className={ed.text}>{t("index.empty")}</p>}
        <div className="grid grid-cols-2 gap-8 pb-16 max-lg:grid-cols-1">
          {rest.map((story) => (
            <StoryCard key={story.slug} story={story} />
          ))}
        </div>
      </section>
    </div>
  );
}
