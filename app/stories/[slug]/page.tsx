import Link from "next/link";
import { notFound } from "next/navigation";
import { StoryCard } from "@/components/Editorial"
import { STORIES } from "@/lib/data"
import Image from "next/image";

// Prerender one static page per entry at build time;
// any other slug is a 404 without rendering anything.
export const dynamicParams = false

export function generateStaticParams() {
  return STORIES.map((item) => ({ slug: item.slug }))
}

export default async function StoryDetail({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const story = STORIES.find((item) => item.slug === slug)
  if (!story) notFound()
  const paragraphs = (story.body || "")
    .split("\n\n")
    .filter(
      (text) =>
        text.trim() && !text.includes("[") && !text.includes("Reading width"),
    )
  return (
    <div className="ed-page">
      <nav className="ed-container ed-breadcrumb" aria-label="Breadcrumb">
        <Link href="/stories">Stories & insights</Link>
        <span aria-hidden="true">/</span>
        <span>{story.category}</span>
      </nav>
      <article className="ed-reading">
        <header className="ed-article-header">
          <p className="ed-label">{story.category}</p>
          <h1>{story.title}</h1>
          <p className="ed-lead">{story.subtitle || story.excerpt}</p>
          <p className="ed-preview-label">
            Story preview · Not yet a final published article
          </p>
        </header>
        <Image
  className="ed-article-image"
  src={story.img}
  alt="Artwork accompanying this reflection"
  sizes="(max-width: 768px) 100vw, 760px"
/>
        <div className="ed-article-body">
          {(paragraphs.length ? paragraphs : [story.excerpt]).map(
            (text, index) => (
              <p key={index}>{text}</p>
            ),
          )}
        </div>
      </article>
      <section className="ed-container">
        <div className="ed-section-top">
          <h2>More to explore.</h2>
          <Link className="ed-link" href="/stories">
            All stories →
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
  )
}
