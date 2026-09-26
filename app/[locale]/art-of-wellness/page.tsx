import Image from "next/image";
import Link from "next/link";
import { PageEnd } from "@/components/Editorial";
import "@/styles/art-of-wellness.css";
import artSession from "@/assets/art-of-wellness/art-session.webp";
import festivalOfMusic from "@/assets/art-of-wellness/festival-of-music.webp";
import groupArtwork from "@/assets/art-of-wellness/group-artwork.webp";
import staffPhotography from "@/assets/art-of-wellness/staff-photography.webp";
import susanDay from "@/assets/art-of-wellness/team/susan-day.webp";
import mimiEieyeh from "@/assets/art-of-wellness/team/mimi-eieyeh.webp";
import michelleFawcett from "@/assets/art-of-wellness/team/michelle-fawcett.webp";

// All program facts on this page come from NORTH Foundation's page.
const PROGRAM_URL =
  "https://northfoundation.org.au/projects/the-art-of-wellness/";

const PROGRAM_PARTS = [
  {
    title: "Participatory art",
    text: "Led by volunteers, including a trained art therapist, these sessions invite patients, carers and staff to pause, create and express themselves.",
    image: groupArtwork,
    alt: "A large, colourful group drawing of flowers made during an Art of Wellness session",
  },
  {
    title: "Festival of Music",
    text: "Since 2016, five days of live music each December, from staff, schools, choirs and community performers in the hospital’s main atrium.",
    image: festivalOfMusic,
    alt: "A staff choir in Santa hats performing in the hospital atrium",
  },
  {
    title: "Staff photography",
    text: "An annual competition. In 2025, 25 photographs were chosen from 76 entries, framed and hung in Ambulatory Care.",
    image: staffPhotography,
    alt: "A framed staff photograph of a red waratah and a bird, hanging in the hospital",
  },
];

const TEAM = [
  {
    name: "Susan Day OAM",
    role: "Coordinator, Arts & Culture",
    bio: "Has led the RNSH Festival of Music since 2016, after 30 years in stroke services. Awarded an OAM in 2022 for service to the community.",
    photo: susanDay,
  },
  {
    name: "Mimi Eieyeh",
    role: "Mental Health Nurse (CNS) / Art Therapist · Co-founder",
    bio: "Known to VetMiMi visitors as Daw Mi. A mental health nurse for 17 years and an art therapist since 2023.",
    photo: mimiEieyeh,
    link: { href: "/about", label: "About Daw Mi →" },
  },
  {
    name: "Michelle Fawcett",
    role: "Volunteer Coordinator",
    bio: "Supports the volunteers at Royal North Shore and Ryde Hospitals, and sits on the RNSH Arts and Culture Committee.",
    photo: michelleFawcett,
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
              A NORTH Foundation program at Royal North Shore Hospital in
              Sydney, bringing comfort, connection and healing to patients,
              carers and staff through art and music.
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
          <figure className="aow-frame aow-hero-frame">
            <Image
              src={artSession}
              alt="Artworks from a session: a sunflower, a tree and the word Hope, with coloured pencils"
              sizes="(max-width: 767px) 100vw, 480px"
              preload
              placeholder="blur"
            />
          </figure>
        </div>
      </section>

      <section className="ed-container ed-section ed-split ed-split-wide aow-why">
        <div>
          <p className="ed-label">Why it matters</p>
          <h2>Moments of calm, expression and joy.</h2>
        </div>
        <div>
          <p className="ed-lead">
            A hospital can be a confronting place. For patients and families
            facing illness, treatment or long stays, the arts offer a welcome
            pause.
          </p>
          <p>
            Music can lift spirits. Making art can create connection and a
            meaningful outlet during difficult times.
          </p>
          <blockquote className="aow-quote">
            <p>
              “To bring support to patients, carers and staff through the
              inclusion of the arts.”
            </p>
            <cite>The Art of Wellness mission, NORTH Foundation</cite>
          </blockquote>
        </div>
      </section>

      <section className="ed-paper">
        <div className="ed-container ed-section">
          <div className="ed-section-top">
            <div>
              <p className="ed-label">Inside the program</p>
              <h2>Three ways the arts show up.</h2>
            </div>
          </div>
          <div className="aow-parts">
            {PROGRAM_PARTS.map((part) => (
              <article key={part.title}>
                <figure className="aow-frame">
                  <Image
                    src={part.image}
                    alt={part.alt}
                    sizes="(max-width: 767px) 100vw, 380px"
                    placeholder="blur"
                  />
                </figure>
                <h3>{part.title}</h3>
                <p>{part.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ed-container ed-section">
        <div className="ed-section-top">
          <div>
            <p className="ed-label">The team</p>
            <h2>Meet The Art of Wellness team.</h2>
          </div>
        </div>
        <div className="aow-team">
          {TEAM.map((person) => (
            <article key={person.name} className="aow-person">
              <Image
                src={person.photo}
                alt={person.name}
                sizes="150px"
                placeholder="blur"
              />
              <h3>{person.name}</h3>
              <p className="aow-role">{person.role}</p>
              <p>{person.bio}</p>
              {person.link && (
                <Link className="ed-link" href={person.link.href}>
                  {person.link.label}
                </Link>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="ed-lavender">
        <div className="ed-container ed-section aow-support">
          <p className="ed-label">Support the program</p>
          <h2>Help bring the arts into more wards.</h2>
          <p className="ed-lead">
            The Art of Wellness is funded by donations through NORTH Foundation.
            Your support helps the program reach patients in hospital wards who
            cannot come to it.
          </p>
          <div className="ed-actions">
            <a
              className="ed-button"
              href={PROGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Donate to The Art of Wellness ↗
            </a>
          </div>
        </div>
      </section>

      <div className="ed-container">
        <p className="aow-credit">
          Program information and photos courtesy of{" "}
          <a href={PROGRAM_URL} target="_blank" rel="noopener noreferrer">
            NORTH Foundation
          </a>
          . The Art of Wellness is a NORTH Foundation program; VetMiMi is Daw
          Mi’s independent practice.
        </p>
      </div>

      <PageEnd
        title="Have a question about Art of Wellness?"
        text="Get in touch to learn more or discuss a possible collaboration."
        href="/contact"
        label="Start a conversation"
      />
    </div>
  );
}
