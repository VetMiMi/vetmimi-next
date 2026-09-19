"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { MissingEntry, StoryCard } from "@/components/Editorial"
import { STORIES } from "@/lib/data"

export default function StoryDetail() {
  const{ slug } = useParams<{ slug: string }>();
  const story = STORIES.find((item) => item.slug === slug)
  if (!story) return <MissingEntry kind="story" href="/stories" />
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
        <img
          className="ed-article-image"
          src={story.img}
          alt="Artwork accompanying this reflection"
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
