import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ed, PageEnd } from "@/components/Editorial";
import { ExternalLink } from "@/components/ExternalLink";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";
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

// Photos sit whole in the same soft mat frame as the About page.
const frame = "rounded-card bg-[#eee4e2] p-3";
const frameImage = "block h-auto w-full rounded-xl";
const grid3 = "grid grid-cols-3 gap-[clamp(28px,4vw,48px)] max-md:grid-cols-1";
const h3 = "text-[1.35rem] [&:not(:lang(my))]:leading-[1.25]!";
const sectionTop = "mb-8 flex flex-wrap items-baseline justify-between gap-5";

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

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/art-of-wellness">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({
    locale,
    namespace: "artOfWellness.metadata",
  });
  return pageMetadata(locale, "/art-of-wellness", {
    title: t("title"),
    description: t("description"),
  });
}

export default async function ArtOfWellness({
  params,
}: PageProps<"/[locale]/art-of-wellness">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("artOfWellness");

  return (
    <div className={ed.page}>
      <section className="relative overflow-hidden bg-stage text-canvas">
        <div className={`${ed.container} ${ed.split} py-16`}>
          <div>
            <p className="mb-3.5 text-[0.7rem] leading-[1.6] font-bold tracking-[0.12em] text-[#dcc99b] uppercase">
              {t("hero.label")}
            </p>
            <h1 className={ed.h1}>{t("hero.title")}</h1>
            <p className="mb-5 max-w-[56ch] text-[1.08rem] leading-[1.8] text-[#e3dfe8]">
              {t("hero.lead")}
            </p>
            <div className={ed.actions}>
              <ExternalLink className={ed.button} href={PROGRAM_URL}>
                {t("hero.visit")}
              </ExternalLink>
              <ExternalLink
                className="text-[0.9rem] font-semibold text-canvas underline underline-offset-5"
                href={PROGRAM_URL}
              >
                {t("hero.support")}
              </ExternalLink>
            </div>
          </div>
          <figure
            className={`${frame} w-full max-w-[520px] justify-self-end shadow-[0_24px_48px_rgba(18,14,26,0.35)] max-md:justify-self-center`}
          >
            <Image
              className={frameImage}
              src={artSession}
              alt={t("hero.imageAlt")}
              sizes="(max-width: 767px) 100vw, 480px"
              preload
              placeholder="blur"
            />
          </figure>
        </div>
      </section>

      {/* The heading is centred against the taller text column, with the
          program's mission as a quote. */}
      <section
        className={`${ed.container} ${ed.section} grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)] items-center gap-[clamp(32px,6vw,80px)] max-md:grid-cols-1`}
      >
        <div>
          <p className={ed.label}>{t("why.label")}</p>
          <h2 className={ed.h2}>{t("why.title")}</h2>
        </div>
        <div>
          <p className={ed.lead}>{t("why.lead")}</p>
          <p className={ed.text}>{t("why.text")}</p>
          <blockquote className="mt-8 border-l-2 border-rose pl-[1.4rem]">
            <p className="mb-[0.6rem] font-display text-[clamp(1.25rem,2.2vw,1.6rem)] leading-[1.45] text-ink italic">
              {t("why.quote")}
            </p>
            <cite className="text-[0.85rem] text-caption not-italic">
              {t("why.cite")}
            </cite>
          </blockquote>
        </div>
      </section>

      <section className="bg-paper">
        <div className={`${ed.container} ${ed.section}`}>
          <div className={sectionTop}>
            <div>
              <p className={ed.label}>{t("parts.label")}</p>
              <h2 className={ed.h2}>{t("parts.title")}</h2>
            </div>
          </div>
          <div className={grid3}>
            {PROGRAM_PARTS.map((part) => (
              <article key={part.id}>
                <figure className={`${frame} mb-[1.3rem]`}>
                  <Image
                    className={`${frameImage} aspect-[31/20] object-cover`}
                    src={part.image}
                    alt={t(`parts.items.${part.id}.alt`)}
                    sizes="(max-width: 767px) 100vw, 380px"
                    placeholder="blur"
                  />
                </figure>
                <h3 className={`${h3} mb-[0.4rem]`}>
                  {t(`parts.items.${part.id}.title`)}
                </h3>
                <p className="leading-[1.8] text-muted">
                  {t(`parts.items.${part.id}.text`)}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`${ed.container} ${ed.section}`}>
        <div className={sectionTop}>
          <div>
            <p className={ed.label}>{t("team.label")}</p>
            <h2 className={ed.h2}>{t("team.title")}</h2>
          </div>
        </div>
        <div className={grid3}>
          {TEAM.map((person) => (
            <article key={person.id}>
              <Image
                className="mb-[1.2rem] block size-[150px] rounded-full bg-[#eee4e2] object-cover p-2"
                src={person.photo}
                alt={person.name}
                sizes="150px"
                placeholder="blur"
              />
              <h3 className={h3}>{person.name}</h3>
              <p
                className={`${ed.text} text-[0.8rem] tracking-[0.06em] uppercase`}
              >
                {t(`team.members.${person.id}.role`)}
              </p>
              <p className="mb-[0.8rem] leading-[1.8] text-muted">
                {t(`team.members.${person.id}.bio`)}
              </p>
              {"link" in person && (
                <Link className={ed.link} href={person.link}>
                  {t("team.members.mimiEieyeh.link")}
                </Link>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#eeeaf2]">
        <div
          className={`${ed.container} ${ed.section} max-w-[640px] text-center`}
        >
          <p className={ed.label}>{t("support.label")}</p>
          <h2 className={ed.h2}>{t("support.title")}</h2>
          <p className={ed.lead}>{t("support.lead")}</p>
          <div className={`${ed.actions} justify-center`}>
            <ExternalLink className={ed.button} href={PROGRAM_URL}>
              {t("support.donate")}
            </ExternalLink>
          </div>
        </div>
      </section>

      <div className={ed.container}>
        <p className="mb-5 py-8 text-center text-[0.8rem] leading-[1.8] text-muted">
          {t.rich("credit", {
            link: (chunks) => (
              <ExternalLink href={PROGRAM_URL}>{chunks}</ExternalLink>
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
