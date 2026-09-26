import Image from "next/image";
import Link from "next/link";
import { PageEnd } from "@/components/Editorial";
import { ARTWORKS, HIGHLIGHTS } from "@/lib/portfolio";
import { ArtworkGallery } from "./_components/ArtworkGallery";
import "@/styles/portfolio.css";

export default function Portfolio() {
  return (
    <div className="ed-page">
      <header className="ed-container ed-header">
        <p className="ed-label">Portfolio</p>
        <h1>Her work.</h1>
        <p className="ed-lead">What Daw Mi has made, and where.</p>
      </header>

      <section className="ed-container ed-section" aria-labelledby="highlights">
        <p className="ed-label">Highlights</p>
        <h2 id="highlights">Where her work has shown up.</h2>
        <div className="pf-highlights">
          {HIGHLIGHTS.map((item) => (
            <article key={item.title} className="pf-highlight">
              <figure className="pf-frame">
                <Image
                  src={item.img.src}
                  alt={item.img.alt}
                  sizes="(max-width: 767px) 100vw, 380px"
                  placeholder="blur"
                />
              </figure>
              <p className="pf-when">{item.when}</p>
              <h3>{item.title}</h3>
              <p className="pf-role">{item.role}</p>
              <p>{item.text}</p>
              {item.links.length > 0 && (
                <p className="pf-links">
                  {item.links.map((link) =>
                    link.external ? (
                      <a
                        key={link.href}
                        className="ed-link"
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        key={link.href}
                        className="ed-link"
                        href={link.href}
                      >
                        {link.label}
                      </Link>
                    ),
                  )}
                </p>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="ed-paper" aria-labelledby="artworks">
        <div className="ed-container ed-section">
          <p className="ed-label">Selected artworks</p>
          <h2 id="artworks">From her studio.</h2>
          <p className="pf-hint">Tap a piece to see it larger.</p>
          <ArtworkGallery artworks={ARTWORKS} />
        </div>
      </section>

      <PageEnd
        title="Planning something for your team or community?"
        text="Ask Daw Mi about workshops, programs and collaborations."
        href="/contact"
        label="Get in touch"
      />
    </div>
  );
}
