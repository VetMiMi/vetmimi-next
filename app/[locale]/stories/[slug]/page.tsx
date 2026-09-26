import { notFound } from "next/navigation";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { StoryCard } from "@/components/Editorial";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { STORIES, type StorySlug } from "@/lib/data";
import Image from "next/image";

// Prerender one static page per entry at build time;
// any other slug is a 404 without rendering anything.
export const dynamicParams = false;

export function generateStaticParams() {
  return STORIES.map((item) => ({ slug: item.slug }));
}

export default async function StoryDetail({
  params,
}: PageProps<"/[locale]/stories/[slug]">) {
  const { locale, slug } = await params;
  setRequestLocale(locale as Locale);
  const story = STORIES.find((item) => item.slug === slug);
  if (!story) notFound();
  const t = await getTranslations("stories");
  // Optional per-story text: only some stories have a subtitle or a body yet.
  const { stories } = await getMessages();
  const subtitles: Partial<Record<StorySlug, string>> = stories.subtitles;
  const bodies: Partial<Record<StorySlug, string[]>> = stories.bodies;
  const excerpt = t(`items.${story.slug}.excerpt`);
  const typeLabel = t(`types.${story.type}`);
  const paragraphs = bodies[story.slug] ?? [excerpt];
  return (
    <div className="ed-page">
      <nav
        className="ed-container ed-breadcrumb"
        aria-label={t("detail.breadcrumbLabel")}
      >
        <Link href="/stories">{t("detail.breadcrumbStories")}</Link>
        <span aria-hidden="true">/</span>
        <span>{typeLabel}</span>
      </nav>
      <article className="ed-reading">
        <header className="ed-article-header">
          <p className="ed-label">{typeLabel}</p>
          <h1>{t(`items.${story.slug}.title`)}</h1>
          <p className="ed-lead">{subtitles[story.slug] || excerpt}</p>
          <p className="ed-preview-label">{t("detail.preview")}</p>
        </header>
        <Image
          className="ed-article-image"
          src={story.img}
          alt={t("detail.imageAlt")}
          sizes="(max-width: 1168px) 100vw, 1120px"
        />
        <div className="ed-article-body">
          {paragraphs.map((text, index) => (
            <p key={index}>{text}</p>
          ))}
        </div>
      </article>
      <section className="ed-container">
        <div className="ed-section-top">
          <h2>{t("detail.moreTitle")}</h2>
          <Link className="ed-link" href="/stories">
            {t("detail.allStories")}
          </Link>
        </div>
        <div className="ed-story-list">
          {STORIES.filter((item) => item.slug !== slug)
            .slice(0, 2)
            .map((item) => (
              <StoryCard key={item.slug} story={item} />
            ))}
        </div>
      </section>
    </div>
  );
}
