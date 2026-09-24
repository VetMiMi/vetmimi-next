import Image from "next/image";
import Link from "next/link";
import { PageEnd, WorkCard } from "@/components/Editorial"
import { PORTFOLIO } from "@/lib/data"
import artImage from "@/imports/image-7.png";


export default function ArtOfWellness() {
  return (
    <div className="ed-page">
      <section className="ed-dark">
        <div className="ed-container ed-wellness-hero ed-split">
          <div>
            <p className="ed-label">Art of Wellness</p>
            <h1>A place for creativity in healthcare.</h1>
            <p className="ed-lead">
              Art of Wellness brings art into a healthcare setting. Daw Mi is a
              co-founder of the initiative at Royal North Shore Hospital in
              Sydney.
            </p>
            <p>
              It is another part of her work connecting care, creativity, and
              human experience.
            </p>
            <Link className="ed-link" href="/contact">
              Ask about the initiative →
            </Link>
          </div>
          <figure className="ed-wellness-art">
            <Image
  src={artImage}
  alt="Expressive artwork with a golden face against deep indigo"
  sizes="(max-width: 768px) 100vw, 50vw"
/>
          </figure>
        </div>
      </section>
      <section className="ed-container ed-section ed-split ed-split-wide">
        <div>
          <p className="ed-label">The idea</p>
          <h2>Making room for more than words.</h2>
        </div>
        <div>
          <p className="ed-lead">
            Art offers a way to pause, explore materials, and express something
            in a different form.
          </p>
          <p>
            In a healthcare space, creative activities can offer a change of
            focus. The experience is about taking part, rather than making a
            perfect picture.
          </p>
          <p>
            For information about the initiative, participation, or
            collaboration, get in touch with Daw Mi.
          </p>
        </div>
      </section>
      <section className="ed-lavender">
        <div className="ed-container ed-section">
          <p className="ed-label">Explore the right path</p>
          <h2>What would you like to know?</h2>
          <div className="ed-principles">
            <div>
              <h3>About the initiative</h3>
              <p>Ask about Art of Wellness and its work in healthcare.</p>
              <Link className="ed-link" href="/contact">
                Contact Daw Mi →
              </Link>
            </div>
            <div>
              <h3>A workshop for your group</h3>
              <p>
                Explore a creative experience for your organisation or
                community.
              </p>
              <Link className="ed-link" href="/services/workshops-programs">
                Explore workshops →
              </Link>
            </div>
            <div>
              <h3>Support for yourself</h3>
              <p>
                Learn about individual art therapy and what a session involves.
              </p>
              <Link className="ed-link" href="/services/individual-art-therapy">
                Explore individual sessions →
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section className="ed-container ed-section">
        <div className="ed-section-top">
          <div>
            <p className="ed-label">Daw Mi’s creative practice</p>
            <h2>From the portfolio.</h2>
          </div>
          <Link className="ed-link" href="/portfolio">
            View all work →
          </Link>
        </div>
        <div className="ed-gallery">
          {PORTFOLIO.slice(0, 3).map((item) => (
            <WorkCard key={item.slug} item={item} />
          ))}
        </div>
      </section>
      <PageEnd
        title="Have a question about Art of Wellness?"
        text="Get in touch to learn more or discuss a possible collaboration."
        href="/contact"
        label="Start a conversation"
      />
    </div>
  )
}
