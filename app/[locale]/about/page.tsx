import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  ChatsCircle,
  PaintBrush,
  Question,
} from "@phosphor-icons/react/dist/ssr";
import { ed, PageEnd } from "@/components/Editorial";
import { DawMiJsonLd } from "@/components/JsonLd";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";
import dawMiPortrait from "@/assets/daw-mi-portrait.webp";
import artImage from "@/assets/image-4.webp";
import hewPhoto from "@/assets/human-experience-week/daw-mi-with-artwork-3.webp";
import { VideoIntro } from "./_components/VideoIntro";

// A timeline entry, its dot drawn on the line.
const timelineItem =
  "relative border-l border-[#cdb6b6] pb-8 pl-7 before:absolute before:top-2 before:-left-[5px] before:size-[9px] before:rounded-full before:bg-[#a66a78] last:pb-0";

const principle = "border-t border-[#d6cbd8] pt-[22px]";
const principleIcon =
  "mb-[18px] grid size-14 place-items-center rounded-full bg-[#eee4e2] text-rose";
// Paragraphs that end their block, so they have no bottom margin.
const blockText = "leading-[1.8] text-muted";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/about">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "about.metadata" });
  return pageMetadata(locale, "/about", {
    title: t("title"),
    description: t("description"),
  });
}

export default async function About({ params }: PageProps<"/[locale]/about">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("about");

  return (
    <div className={ed.page}>
      <DawMiJsonLd />
      <section className={`${ed.container} ${ed.section} ${ed.split}`}>
        <div>
          <p className={ed.label}>{t("hero.label")}</p>
          <h1 className={ed.h1}>{t("hero.title")}</h1>
          <p className={ed.lead}>{t("hero.lead")}</p>
          <p className={ed.text}>{t("hero.text")}</p>
          <div className={ed.actions}>
            <Link className={ed.button} href="/services">
              {t("hero.cta")}
            </Link>
          </div>
        </div>
        {/* Daw Mi's photo in the arch, with one of her paintings pinned to
            the corner like a collage and a handwritten signature. */}
        <figure className="relative mb-9 max-w-[410px] justify-self-end rounded-[48%_48%_20px_20px] bg-[#eee4e2] p-3.5 max-md:max-w-[340px] max-md:justify-self-center">
          <Image
            className="block aspect-[4/5] w-full rounded-[48%_48%_12px_12px] object-cover object-[center_30%]"
            src={dawMiPortrait}
            alt={t("hero.portraitAlt")}
            sizes="(max-width: 767px) 340px, 410px"
            preload
            fetchPriority="high"
            placeholder="blur"
          />
          <div className="absolute -bottom-7 -left-[34px] w-[38%] -rotate-5 rounded-[48%_48%_10px_10px] bg-canvas p-2 shadow-lifted max-md:-left-1.5 max-md:w-[34%]">
            <Image
              className="block aspect-[3/4] h-auto w-full rounded-[48%_48%_6px_6px] object-cover object-[center_20%]"
              src={artImage}
              alt={t("hero.artAlt")}
              sizes="160px"
              loading="eager"
            />
          </div>
          <figcaption className="absolute right-[18px] -bottom-10 -rotate-6 font-script text-[2.1rem] leading-none text-rose">
            {t("hero.signature")}
          </figcaption>
        </figure>
      </section>
      <section className="bg-paper">
        <div className={`${ed.container} ${ed.section}`}>
          <p className={ed.label}>{t("background.label")}</p>
          <h2 className={ed.h2}>
            {t.rich("background.title", { br: () => <br /> })}
          </h2>
          <p className={ed.text}>{t("background.intro")}</p>
          <div className="mt-10 grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)] items-stretch gap-[clamp(32px,6vw,80px)] max-md:grid-cols-1">
            {/* A tilted print with a white border and a rose card peeking out
                behind. It stretches to the timeline's height so both columns
                line up. */}
            <figure className="relative flex before:absolute before:inset-0 before:rotate-3 before:rounded-[6px] before:bg-rose/22">
              <Image
                className="relative block h-full min-h-[280px] w-full -rotate-2 rounded-[6px] bg-white object-cover object-left p-2.5 shadow-lifted"
                src={hewPhoto}
                alt={t("background.photoAlt")}
                sizes="(max-width: 767px) 100vw, 460px"
                placeholder="blur"
              />
            </figure>
            <ul>
              <li className={timelineItem}>
                <h3 className={ed.h3}>{t("background.healthcare.title")}</h3>
                <p className={blockText}>{t("background.healthcare.text")}</p>
              </li>
              <li className={timelineItem}>
                <h3 className={ed.h3}>{t("background.training.title")}</h3>
                <p className={blockText}>{t("background.training.text")}</p>
              </li>
              <li className={timelineItem}>
                <h3 className={ed.h3}>{t("background.art.title")}</h3>
                <p className={blockText}>{t("background.art.text")}</p>
              </li>
              <li className={timelineItem}>
                <h3 className={ed.h3}>{t("background.artOfWellness.title")}</h3>
                <p className={blockText}>
                  {t("background.artOfWellness.text")}
                </p>
                <Link className={ed.link} href="/art-of-wellness">
                  {t("background.artOfWellness.link")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </section>
      <VideoIntro />
      <section className={`${ed.container} ${ed.section}`}>
        <p className={ed.label}>{t("workingTogether.label")}</p>
        <h2 className={ed.h2}>{t("workingTogether.title")}</h2>
        <div className="mt-9 grid grid-cols-3 gap-[30px] max-md:grid-cols-1">
          <div className={principle}>
            <span className={principleIcon} aria-hidden>
              <PaintBrush size={30} weight="duotone" />
            </span>
            <h3 className={ed.h3}>{t("workingTogether.noSkills.title")}</h3>
            <p className={blockText}>{t("workingTogether.noSkills.text")}</p>
          </div>
          <div className={principle}>
            <span className={principleIcon} aria-hidden>
              <ChatsCircle size={30} weight="duotone" />
            </span>
            <h3 className={ed.h3}>{t("workingTogether.experience.title")}</h3>
            <p className={blockText}>{t("workingTogether.experience.text")}</p>
          </div>
          <div className={principle}>
            <span className={principleIcon} aria-hidden>
              <Question size={30} weight="duotone" />
            </span>
            <h3 className={ed.h3}>{t("workingTogether.question.title")}</h3>
            <p className={blockText}>{t("workingTogether.question.text")}</p>
          </div>
        </div>
      </section>
      <PageEnd
        title={t("end.title")}
        text={t("end.text")}
        href="/services"
        label={t("end.label")}
      />
    </div>
  );
}
