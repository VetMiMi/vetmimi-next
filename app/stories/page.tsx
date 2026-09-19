"use client";
import { useState } from "react"
import Link from "next/link";
import { FilterBar, StoryCard } from "@/components/Editorial"
import { STORIES } from "@/lib/data"

const categories = ["All", ...new Set(STORIES.map((story) => story.category))]
export default function Stories() {
  const [category, setCategory] = useState("All")
  const stories = STORIES.filter(
    (story) => category === "All" || story.category === category,
  )
  const [featured, ...rest] = stories
  return (
    <div className="ed-page">
      <header className="ed-container ed-header">
        <p className="ed-label">Stories & insights</p>
        <h1>A little time to read and reflect.</h1>
        <p className="ed-lead">
          Thoughts on art, wellbeing, and creative practice.
        </p>
        <p className="ed-preview-label">
          Preview collection · Final stories are being prepared.
        </p>
      </header>
      <section className="ed-container" aria-label="Stories">
        <FilterBar
          categories={categories}
          active={category}
          onChange={setCategory}
          count={stories.length}
        />
        {featured && (
          <article className="ed-feature">
            <img src={featured.img} alt="" />
            <div>
              <p className="ed-label">{featured.category}</p>
              <h2>
                <Link href={`/stories/${featured.slug}`}>{featured.title}</Link>
              </h2>
              <p>{featured.excerpt}</p>
              <Link className="ed-link" href={`/stories/${featured.slug}`}>
                Read preview →
              </Link>
            </div>
          </article>
        )}
        <div className="ed-story-list">
          {rest.map((story) => (
            <StoryCard key={story.slug} story={story} />
          ))}
        </div>
      </section>
    </div>
  )
}
