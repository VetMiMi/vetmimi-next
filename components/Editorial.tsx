"use client";
import Link from "next/link";
import type { PortfolioItem, Story } from "@/lib/data"
import "@/styles/editorial.css"
import Image from "next/image";

export function WorkCard({ item }: { item: PortfolioItem }) {
  return (
    <Link className="ed-work" href={`/portfolio/${item.slug}`}>
      <div className="ed-work-image">
        <Image
  src={item.img}
  alt={item.title}
  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
/>
      </div>
      <div className="ed-work-caption">
        <div>
          <p className="ed-label">{item.category}</p>
          <h3>{item.title}</h3>
        </div>
        <span aria-hidden="true">↗</span>
      </div>
    </Link>
  )
}

export function StoryCard({ story }: { story: Story }) {
  return (
    <article className="ed-story">
      <Image
  src={story.img}
  alt=""
  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
/>
      <div>
        <p className="ed-label">{story.category}</p>
        <h3>
          <Link href={`/stories/${story.slug}`}>{story.title}</Link>
        </h3>
        <p>{story.excerpt}</p>
        <Link
          className="ed-link"
          href={`/stories/${story.slug}`}
          aria-label={`Read ${story.title}`}
        >
          Read story →
        </Link>
      </div>
    </article>
  )
}

export function PageEnd({
  title,
  text,
  href,
  label,
}: {
  title: string;
  text: string;
  href: string;
  label: string;
}) {
  return (
    <section className="ed-container ed-end">
      <div>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
      <Link className="ed-button" href={href}>
        {label} <span aria-hidden="true">↗</span>
      </Link>
    </section>
  )
}

export function MissingEntry({
  kind,
  href,
}: {
  kind: string;
  href: string;
}) {
  return (
    <div className="ed-page">
      <section className="ed-container ed-section">
        <p className="ed-label">Not found</p>
        <h1>We couldn’t find this {kind}.</h1>
        <Link className="ed-link" href={href}>
          Back to {kind === "story" ? "stories" : "portfolio"} →
        </Link>
      </section>
    </div>
  )
}

export function FilterBar({
  categories,
  active,
  onChange,
  count,
}: {
  categories: string[]
  active: string
  onChange: (value: string) => void
  count: number
}) {
  return (
    <div className="ed-filter-bar">
      <div role="group" aria-label="Filter by category" className="ed-filters">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            aria-pressed={active === category}
            onClick={() => onChange(category)}
          >
            {category}
          </button>
        ))}
      </div>
      <p className="ed-count" role="status">
        {count} {count === 1 ? "item" : "items"}
      </p>
    </div>
  )
}
