import Image from "next/image";
import Link from "next/link";
import { PageEnd, WorkCard } from "@/components/Editorial";
import { PORTFOLIO } from "@/lib/data";
import dawMiPortrait from "@/assets/daw-mi-portrait.webp";
import artSession from "@/assets/art-of-wellness/art-session.webp";
import festivalOfMusic from "@/assets/art-of-wellness/festival-of-music.webp";
import groupArtwork from "@/assets/art-of-wellness/group-artwork.webp";
import staffPhotography from "@/assets/art-of-wellness/staff-photography.webp";

const PROGRAM_URL =
  "https://northfoundation.org.au/projects/the-art-of-wellness/";

const PROGRAM_PARTS = [
  {
    title: "Participatory art",
    text: "Creative sessions where patients, carers and staff can slow down, make something and reflect, supported by an art therapist.",
    image: artSession,
    alt: "Artworks from a session: a sunflower, a tree and the word Hope, with coloured pencils",
  },
  {
    title: "Festival of Music",
    text: "Each December, staff, schools, choirs and community volunteers perform live in the hospital’s main atrium.",
    image: festivalOfMusic,
    alt: "A staff choir in Santa hats performing in the hospital atrium",
  },
  {
    title: "Staff photography",
    text: "An annual competition whose selected photographs are framed and hung around the hospital.",
    image: staffPhotography,
    alt: "A framed staff photograph of a red waratah and a bird, hanging in the hospital",
    position: "70% center",
  },
];

export default function ArtOfWellness() {
  return (
    <div className="ed-page">
      <section className="ed-dark">
        <div className="ed-container ed-wellness-hero ed-split">
          <div>
            <p className="ed-label">The Art of Wellness</p>
            <h1>A place for creativity in healthcare.</h1>
            <p className="ed-lead">
              The Art of Wellness is a NORTH Foundation program at Royal North
              Shore Hospital in Sydney, bringing music, art and photography to
              patients, carers and staff.
            </p>
            <p>
              Daw Mi is a co-founder of the program. It is another part of her
              work connecting care, creativity, and human experience.
            </p>
            <div className="ed-actions">
              <a
                className="ed-button"
                href={PROGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit the program ↗
              </a>
              <Link className="ed-link" href="/contact">
                Ask Daw Mi about it →
              </Link>
            </div>
          </div>
          <figure className="ed-wellness-art">
            <Image
              src={groupArtwork}
              alt="A large, colourful group drawing of flowers made during an Art of Wellness session"
              sizes="(max-width: 768px) 100vw, 50vw"
              placeholder="blur"
            />
          </figure>
        </div>
      </section>
      <section className="ed-container ed-section">
        <div className="ed-section-top">
          <div>
            <p className="ed-label">Inside the program</p>
            <h2>Three ways the arts show up.</h2>
          </div>
        </div>
        <div className="ed-program">
          {PROGRAM_PARTS.map((part) => (
            <article key={part.title} className="ed-program-card">
              <figure>
                <Image
                  src={part.image}
                  alt={part.alt}
                  sizes="(max-width: 767px) 100vw, 33vw"
                  style={
                    part.position
                      ? { objectPosition: part.position }
                      : undefined
                  }
                />
              </figure>
              <h3>{part.title}</h3>
              <p>{part.text}</p>
            </article>
          ))}
        </div>
        <p className="ed-credit">
          Program photos courtesy of NORTH Foundation.
        </p>
      </section>
      <section className="ed-paper">
        <div className="ed-container ed-section ed-founder">
          <figure className="ed-founder-photo">
            <Image
              src={dawMiPortrait}
              alt="Daw Mi, co-founder of The Art of Wellness"
              sizes="(max-width: 767px) 220px, 260px"
            />
          </figure>
          <div>
            <p className="ed-label">Co-founder</p>
            <h2>Daw Mi</h2>
            <p className="ed-lead">
              A certified art psychotherapist and transformative artist, Daw Mi
              co-founded The Art of Wellness at Royal North Shore Hospital, and
              brings art therapy to its participatory art sessions.
            </p>
            <Link className="ed-link" href="/about">
              About Daw Mi →
            </Link>
          </div>
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
          <div className="ed-support">
            <p>
              The Art of Wellness is funded by donations through NORTH
              Foundation, the charity partner of Northern Sydney Local Health
              District.
            </p>
            <a
              className="ed-link"
              href={PROGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Support the program ↗
            </a>
          </div>
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
  );
}
