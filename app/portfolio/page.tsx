"use client";
import { useState } from "react"
import { FilterBar, PageEnd, WorkCard } from "@/components/Editorial"
import { PORTFOLIO } from "@/lib/data"

const categories = ["All", ...new Set(PORTFOLIO.map((item) => item.category))]
export default function Portfolio() {
  const [category, setCategory] = useState("All")
  const items = PORTFOLIO.filter(
    (item) => category === "All" || item.category === category,
  )
  return (
    <div className="ed-page">
      <header className="ed-container ed-header">
        <p className="ed-label">Portfolio</p>
        <h1>Colour, feeling, and things taking shape.</h1>
        <p className="ed-lead">
          A selection of artwork and creative projects. Open a piece to see the
          full image and read about it.
        </p>
      </header>
      <section className="ed-container" aria-label="Selected work">
        <FilterBar
          categories={categories}
          active={category}
          onChange={setCategory}
          count={items.length}
        />
        <div className="ed-gallery">
          {items.map((item) => (
            <WorkCard key={item.slug} item={item} />
          ))}
        </div>
      </section>
      <PageEnd
        title="Interested in a piece or a collaboration?"
        text="Ask Daw Mi about the work or share what you have in mind."
        href="/contact"
        label="Get in touch"
      />
    </div>
  )
}
