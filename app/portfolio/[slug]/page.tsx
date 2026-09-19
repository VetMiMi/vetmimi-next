"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { MissingEntry, PageEnd, WorkCard } from "@/components/Editorial"
import { PORTFOLIO } from "@/lib/data"

export default function PortfolioDetail() {
  const { slug } = useParams<{ slug: string }>();
  const item = PORTFOLIO.find((work) => work.slug === slug)
  if (!item) return <MissingEntry kind="artwork" href="/portfolio" />
  const details = [
    ["Year", item.year],
    ["Medium", item.medium],
    ["Context", item.context],
    ["Role", item.role],
  ].filter(([, value]) => value && !value.includes("["))
  const related = PORTFOLIO.filter((work) => work.slug !== slug).slice(0, 3)
  return (
    <div className="ed-page">
      <div className="ed-container">
        <nav className="ed-breadcrumb" aria-label="Breadcrumb">
          <Link href="/portfolio">Portfolio</Link>
          <span aria-hidden="true">/</span>
          <span>{item.title}</span>
        </nav>
        <section className="ed-piece">
          <figure className="ed-piece-art">
            <img src={item.img} alt={item.title} />
          </figure>
          <div>
            <p className="ed-label">{item.category}</p>
            <h1>{item.title}</h1>
            <p className="ed-lead">{item.summary}</p>
            <dl className="ed-metadata">
              {details.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <Link className="ed-link" href="/contact">
              Ask about this work →
            </Link>
          </div>
        </section>
        <section aria-label="More work">
          <div className="ed-section-top">
            <h2>Keep exploring.</h2>
            <Link className="ed-link" href="/portfolio">
              All work →
            </Link>
          </div>
          <div className="ed-gallery">
            {related.map((work) => (
              <WorkCard key={work.slug} item={work} />
            ))}
          </div>
        </section>
      </div>
      <PageEnd
        title="Art is one way to begin."
        text="Discover how creativity is part of Daw Mi’s work with individuals and groups."
        href="/services"
        label="Explore services"
      />
    </div>
  )
}
