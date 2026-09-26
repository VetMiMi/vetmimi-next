"use client";
import { useState } from "react";
import Link from "next/link";
import { StoryCard } from "@/components/Editorial";
import { FilterBar } from "@/components/FilterBar";
import { STORIES, STORY_TYPE_LABEL, type StoryType } from "@/lib/data";
import Image from "next/image";

// Two kinds of post: Stories (real people's lived experience) and Insights
// (Daw Mi's writing on art psychotherapy).
const FILTERS: Record<string, StoryType | null> = {
  All: null,
  Stories: "story",
  Insights: "insight",
};

export default function Stories() {
  const [filter, setFilter] = useState("All");
  const type = FILTERS[filter];
  const stories = STORIES.filter((story) => !type || story.type === type);
  // The big card is the one post Daw Mi chooses to feature, shown only under All.
  const featured = type ? undefined : stories.find((story) => story.featured);
  const rest = stories.filter((story) => story !== featured);
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
          categories={Object.keys(FILTERS)}
          active={filter}
          onChange={setFilter}
          count={stories.length}
        />
        {featured && (
          <article className="ed-feature">
            <Image
              src={featured.img}
              alt=""
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div>
              <p className="ed-label">
                Featured · {STORY_TYPE_LABEL[featured.type]}
              </p>
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
        {stories.length === 0 && (
          <p className="ed-empty">
            Stories from the people Daw Mi works with are being prepared and
            will appear here soon.
          </p>
        )}
        <div className="ed-story-list">
          {rest.map((story) => (
            <StoryCard key={story.slug} story={story} />
          ))}
        </div>
      </section>
    </div>
  );
}
