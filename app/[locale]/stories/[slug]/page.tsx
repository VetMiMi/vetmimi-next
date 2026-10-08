import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import Markdown from "react-markdown";
import { StoryCard, StoryImage } from "@/components/Editorial";
import { JsonLd } from "@/components/JsonLd";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getArticle, loadStories, type Article } from "@/lib/articles";
import { pageMetadata } from "@/lib/seo";
import { STORIES, type Story, type StorySlug } from "@/lib/data";
import { storyFromArticle } from "@/lib/stories";
import { storyJsonLd } from "@/lib/structured-data";

// The written stories are prerendered at build time; a published article
// renders on its first visit and is then cached like them. Refreshed when an
// article publishes (POST /api/revalidate), and hourly in case the API was
// unreachable the last time the page was built.
export const revalidate = 3600;

export function generateStaticParams() {
  return STORIES.map((item) => ({ slug: item.slug }));
}

// A published article brings its own SEO text and cover; a written story
// uses its title and excerpt, and the site's default image.
export async function generateMetadata({
  params,
}: PageProps<"/[locale]/stories/[slug]">): Promise<Metadata> {
  const { locale: requested, slug } = await params;
  const locale = requested as Locale;
  const pathname = `/stories/${slug}`;
  const article = await getArticle(locale, slug);
  if (article) {
    const page = pageMetadata(locale, pathname, {
      title: article.seoTitle,
      description: article.seoDescription,
    });
    const cover = article.coverImage;
    const image = cover?.sizes[0];
    return {
      ...page,
      openGraph: {
        ...page.openGraph,
        type: "article",
        publishedTime: article.publishedAt,
        images:
          cover && image
            ? [
                {
                  url: image.url,
                  width: image.width,
                  height: Math.round(
                    (image.width * cover.height) / cover.width,
                  ),
                  alt: cover.alt || undefined,
                },
              ]
            : undefined,
      },
    };
  }
  const story = STORIES.find((item) => item.slug === slug);
  if (!story) return {};
  const t = await getTranslations({
    locale,
    namespace: `stories.items.${story.slug}`,
  });
  const page = pageMetadata(locale, pathname, {
    title: t("title"),
    description: t("excerpt"),
  });
  return {
    ...page,
    openGraph: { ...page.openGraph, type: "article", authors: [story.author] },
  };
}

export default async function StoryDetail({
  params,
}: PageProps<"/[locale]/stories/[slug]">) {
  const { locale, slug } = await params;
  setRequestLocale(locale as Locale);
  const [article, items, t] = await Promise.all([
    getArticle(locale as Locale, slug),
    loadStories(locale as Locale),
    getTranslations("stories"),
  ]);
  const story = STORIES.find((item) => item.slug === slug);
  const kind = article ? storyFromArticle(article).kind : story?.type;
  if (!kind) notFound();
  const typeLabel = t(`types.${kind}`);
  const jsonLd = article
    ? storyJsonLd(locale as Locale, {
        slug,
        headline: article.title,
        description: article.excerpt,
        datePublished: article.publishedAt,
        image: article.coverImage?.sizes[0]?.url,
      })
    : story &&
      storyJsonLd(locale as Locale, {
        slug,
        headline: t(`items.${story.slug}.title`),
        description: t(`items.${story.slug}.excerpt`),
        image: story.img.src,
      });
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
        {jsonLd && <JsonLd data={jsonLd} />}
        {article ? (
          <PublishedArticle article={article} typeLabel={typeLabel} />
        ) : (
          story && <WrittenStory story={story} typeLabel={typeLabel} />
        )}
      </article>
      <section className="ed-container">
        <div className="ed-section-top">
          <h2>{t("detail.moreTitle")}</h2>
          <Link className="ed-link" href="/stories">
            {t("detail.allStories")}
          </Link>
        </div>
        <div className="ed-story-list">
          {items
            .filter((item) => item.slug !== slug)
            .slice(0, 2)
            .map((item) => (
              <StoryCard key={item.slug} story={item} />
            ))}
        </div>
      </section>
    </div>
  );
}

const ARTICLE_IMAGE_SIZES = "(max-width: 1168px) 100vw, 1120px";

function PublishedArticle({
  article,
  typeLabel,
}: {
  article: Article;
  typeLabel: string;
}) {
  return (
    <>
      <header className="ed-article-header">
        <p className="ed-label">{typeLabel}</p>
        <h1>{article.title}</h1>
        <p className="ed-lead">{article.excerpt}</p>
      </header>
      {article.coverImage && (
        <StoryImage
          className="ed-article-image"
          image={article.coverImage}
          alt={article.coverImage.alt}
          sizes={ARTICLE_IMAGE_SIZES}
          eager
        />
      )}
      {/* No raw HTML and no inline images, as the portal's preview shows. */}
      <div className="ed-article-body">
        <Markdown skipHtml disallowedElements={["img"]} unwrapDisallowed>
          {article.body}
        </Markdown>
      </div>
    </>
  );
}

async function WrittenStory({
  story,
  typeLabel,
}: {
  story: Story;
  typeLabel: string;
}) {
  const t = await getTranslations("stories");
  // Optional per-story text: only some stories have a subtitle or a body yet.
  const { stories } = await getMessages();
  const subtitles: Partial<Record<StorySlug, string>> = stories.subtitles;
  const bodies: Partial<Record<StorySlug, string[]>> = stories.bodies;
  const excerpt = t(`items.${story.slug}.excerpt`);
  const paragraphs = bodies[story.slug] ?? [excerpt];
  return (
    <>
      <header className="ed-article-header">
        <p className="ed-label">{typeLabel}</p>
        <h1>{t(`items.${story.slug}.title`)}</h1>
        <p className="ed-lead">{subtitles[story.slug] || excerpt}</p>
        <p className="ed-preview-label">{t("detail.preview")}</p>
      </header>
      <StoryImage
        className="ed-article-image"
        image={story.img}
        alt={t("detail.imageAlt")}
        sizes={ARTICLE_IMAGE_SIZES}
        eager
      />
      <div className="ed-article-body">
        {paragraphs.map((text, index) => (
          <p key={index}>{text}</p>
        ))}
      </div>
    </>
  );
}
