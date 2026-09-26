import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageEnd } from "@/components/Editorial";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
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

// Text for these lists lives in messages/<locale>/artOfWellness.json, keyed
// by id. Names are proper names, so they stay here in English.
const PROGRAM_PARTS = [
  { id: "participatoryArt", image: groupArtwork },
  { id: "festivalOfMusic", image: festivalOfMusic },
  { id: "staffPhotography", image: staffPhotography },
] as const;

const TEAM = [
  { id: "susanDay", name: "Susan Day OAM", photo: susanDay },
  {
    id: "mimiEieyeh",
    name: "Mimi Eieyeh",
    photo: mimiEieyeh,
    link: "/about",
  },
  { id: "michelleFawcett", name: "Michelle Fawcett", photo: michelleFawcett },
] as const;

export default async function ArtOfWellness({
  params,
}: PageProps<"/[locale]/art-of-wellness">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("artOfWellness");

  return (
    <div className="ed-page">
      <section className="ed-dark">
        <div className="ed-container ed-wellness-hero ed-split">
          <div>
            <p className="ed-label">{t("hero.label")}</p>
            <h1>{t("hero.title")}</h1>
            <p className="ed-lead">{t("hero.lead")}</p>
            <div className="ed-actions">
              <a
                className="ed-button"
                href={PROGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("hero.visit")}
              </a>
              <a
                className="ed-link"
                href={PROGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("hero.support")}
              </a>
            </div>
          </div>
          <figure className="aow-frame aow-hero-frame">
            <Image
              src={artSession}
              alt={t("hero.imageAlt")}
              sizes="(max-width: 767px) 100vw, 480px"
              preload
              placeholder="blur"
            />
          </figure>
        </div>
      </section>

      <section className="ed-container ed-section ed-split ed-split-wide aow-why">
        <div>
          <p className="ed-label">{t("why.label")}</p>
          <h2>{t("why.title")}</h2>
        </div>
        <div>
          <p className="ed-lead">{t("why.lead")}</p>
          <p>{t("why.text")}</p>
          <blockquote className="aow-quote">
            <p>{t("why.quote")}</p>
            <cite>{t("why.cite")}</cite>
          </blockquote>
        </div>
      </section>

      <section className="ed-paper">
        <div className="ed-container ed-section">
          <div className="ed-section-top">
            <div>
              <p className="ed-label">{t("parts.label")}</p>
              <h2>{t("parts.title")}</h2>
            </div>
          </div>
          <div className="aow-parts">
            {PROGRAM_PARTS.map((part) => (
              <article key={part.id}>
                <figure className="aow-frame">
                  <Image
                    src={part.image}
                    alt={t(`parts.items.${part.id}.alt`)}
                    sizes="(max-width: 767px) 100vw, 380px"
                    placeholder="blur"
                  />
                </figure>
                <h3>{t(`parts.items.${part.id}.title`)}</h3>
                <p>{t(`parts.items.${part.id}.text`)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ed-container ed-section">
        <div className="ed-section-top">
          <div>
            <p className="ed-label">{t("team.label")}</p>
            <h2>{t("team.title")}</h2>
          </div>
        </div>
        <div className="aow-team">
          {TEAM.map((person) => (
            <article key={person.id} className="aow-person">
              <Image
                src={person.photo}
                alt={person.name}
                sizes="150px"
                placeholder="blur"
              />
              <h3>{person.name}</h3>
              <p className="aow-role">{t(`team.members.${person.id}.role`)}</p>
              <p>{t(`team.members.${person.id}.bio`)}</p>
              {"link" in person && (
                <Link className="ed-link" href={person.link}>
                  {t("team.members.mimiEieyeh.link")}
                </Link>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="ed-lavender">
        <div className="ed-container ed-section aow-support">
          <p className="ed-label">{t("support.label")}</p>
          <h2>{t("support.title")}</h2>
          <p className="ed-lead">{t("support.lead")}</p>
          <div className="ed-actions">
            <a
              className="ed-button"
              href={PROGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("support.donate")}
            </a>
          </div>
        </div>
      </section>

      <div className="ed-container">
        <p className="aow-credit">
          {t.rich("credit", {
            link: (chunks) => (
              <a href={PROGRAM_URL} target="_blank" rel="noopener noreferrer">
                {chunks}
              </a>
            ),
          })}
        </p>
      </div>

      <PageEnd
        title={t("end.title")}
        text={t("end.text")}
        href="/contact"
        label={t("end.label")}
      />
    </div>
  );
}
