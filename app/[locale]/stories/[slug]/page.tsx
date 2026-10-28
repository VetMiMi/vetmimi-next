import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import Markdown from "react-markdown";
import { ed, StoryCard, StoryImage } from "@/components/Editorial";
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
    <div className={ed.page}>
      <nav
        className={`${ed.container} flex flex-wrap gap-3 pt-7 text-[0.82rem] text-muted`}
        aria-label={t("detail.breadcrumbLabel")}
      >
        <Link className="underline underline-offset-4" href="/stories">
          {t("detail.breadcrumbStories")}
        </Link>
        <span aria-hidden="true">/</span>
        <span>{typeLabel}</span>
      </nav>
      {/* Title and picture use the full site width (lined up with the
          breadcrumb and "More to explore"); only the paragraphs stay at a
          comfortable reading width. */}
      <article className={ed.container}>
        {jsonLd && <JsonLd data={jsonLd} />}
        {article ? (
          <PublishedArticle article={article} typeLabel={typeLabel} />
        ) : (
          story && <WrittenStory story={story} typeLabel={typeLabel} />
        )}
      </article>
      <section className={ed.container}>
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-5">
          <h2 className={ed.h2}>{t("detail.moreTitle")}</h2>
          <Link className={ed.link} href="/stories">
            {t("detail.allStories")}
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-8 pb-16 max-lg:grid-cols-1">
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

// Every story is Daw Mi's; her name links to About, where answer engines
// and readers can check who she is.
async function Byline() {
  const t = await getTranslations("common.brand");
  return (
    <p className={ed.text}>
      <Link className={ed.link} href="/about" rel="author">
        {t("tagline")}
      </Link>
    </p>
  );
}

const ARTICLE_IMAGE_SIZES = "(max-width: 1168px) 100vw, 1120px";

const articleTitle =
  "mb-6 max-w-[26ch] text-[clamp(2.5rem,5vw,4.5rem)] tracking-[-0.03em] leading-[1.08]";
const articleImage =
  "mb-10 block max-h-[520px] w-full rounded-2xl object-cover object-[center_30%]";
// A published article's Markdown: headings, lists, quotes and links in the
// same reading rhythm as the paragraphs.
const markdownBody =
  "max-w-[760px] pb-12 [&_:is(p,ul,ol,blockquote)]:mb-[1.4em] [&_:is(p,ul,ol)]:text-[1.1rem] [&_:is(p,ul,ol)]:leading-[1.9] [&_p]:text-muted [&_:is(ul,ol)]:pl-[1.4em] [&_ul]:list-disc [&_ol]:list-decimal [&_blockquote]:border-l-2 [&_blockquote]:border-rose [&_blockquote]:pl-[1.2em] [&_blockquote]:italic [&_h1]:mb-6 [&_h1]:max-w-[18ch] [&_h1]:text-[clamp(2.5rem,5vw,4.5rem)] [&_h1]:tracking-[-0.03em] [&_h1]:leading-[1.08] [&_h2]:mt-[1.6em] [&_h2]:mb-[0.6em] [&_h2]:text-[clamp(1.5rem,2.4vw,1.9rem)] [&_h2]:tracking-[-0.02em] [&_h2]:leading-[1.16] [&_h3]:mt-[1.4em] [&_h3]:mb-[0.5em] [&_h3]:text-[1.3rem] [&_h3]:leading-[1.25] [&_a]:text-indigo [&_a]:underline [&_a]:underline-offset-4 [&_hr]:my-[2.4em] [&_hr]:border-[#d8cdca]";

function PublishedArticle({
  article,
  typeLabel,
}: {
  article: Article;
  typeLabel: string;
}) {
  return (
    <>
      <header className="pt-11 pb-8">
        <p className={ed.label}>{typeLabel}</p>
        <h1 className={articleTitle}>{article.title}</h1>
        <p className={ed.lead}>{article.excerpt}</p>
        <Byline />
      </header>
      {article.coverImage && (
        <StoryImage
          className={articleImage}
          image={article.coverImage}
          alt={article.coverImage.alt}
          sizes={ARTICLE_IMAGE_SIZES}
          eager
        />
      )}
      {/* No raw HTML and no inline images, as the portal's preview shows. */}
      <div className={markdownBody}>
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
      <header className="pt-11 pb-8">
        <p className={ed.label}>{typeLabel}</p>
        <h1 className={articleTitle}>{t(`items.${story.slug}.title`)}</h1>
        <p className={ed.lead}>{subtitles[story.slug] || excerpt}</p>
        <Byline />
        <p className="mb-5 text-[0.75rem] leading-[1.8] text-caption">
          {t("detail.preview")}
        </p>
      </header>
      <StoryImage
        className={articleImage}
        image={story.img}
        alt={t("detail.imageAlt")}
        sizes={ARTICLE_IMAGE_SIZES}
        eager
      />
      <div className="max-w-[760px] pb-12">
        {paragraphs.map((text, index) => (
          <p
            key={index}
            className="mb-[1.4em] text-[1.1rem] leading-[1.9] text-muted"
          >
            {text}
          </p>
        ))}
      </div>
    </>
  );
}
