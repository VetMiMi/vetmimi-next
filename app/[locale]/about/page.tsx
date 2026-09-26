import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  ChatsCircle,
  PaintBrush,
  Question,
} from "@phosphor-icons/react/dist/ssr";
import { PageEnd } from "@/components/Editorial";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import dawMiPortrait from "@/assets/daw-mi-portrait.webp";
import artImage from "@/assets/image-4.webp";
import hewPhoto from "@/assets/human-experience-week/daw-mi-with-artwork-3.webp";
import { VideoIntro } from "./_components/VideoIntro";

export default async function About({ params }: PageProps<"/[locale]/about">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("about");

  return (
    <div className="ed-page">
      <section className="ed-container ed-section ed-split">
        <div>
          <p className="ed-label">{t("hero.label")}</p>
          <h1>{t("hero.title")}</h1>
          <p className="ed-lead">{t("hero.lead")}</p>
          <p>{t("hero.text")}</p>
          <div className="ed-actions">
            <Link className="ed-button" href="/services">
              {t("hero.cta")}
            </Link>
          </div>
        </div>
        <figure className="ed-portrait ed-portrait-duo">
          <Image
            src={dawMiPortrait}
            alt={t("hero.portraitAlt")}
            sizes="(max-width: 767px) 340px, 410px"
            preload
            fetchPriority="high"
            placeholder="blur"
          />
          <div className="ed-portrait-art">
            <Image
              src={artImage}
              alt={t("hero.artAlt")}
              sizes="160px"
              loading="eager"
            />
          </div>
          <figcaption className="ed-signature">
            {t("hero.signature")}
          </figcaption>
        </figure>
      </section>
      <section className="ed-paper">
        <div className="ed-container ed-section">
          <p className="ed-label">{t("background.label")}</p>
          <h2>{t.rich("background.title", { br: () => <br /> })}</h2>
          <p>{t("background.intro")}</p>
          <div className="ed-split ed-split-wide ed-background-body">
            <figure className="ed-photo-frame">
              <Image
                src={hewPhoto}
                alt={t("background.photoAlt")}
                sizes="(max-width: 767px) 100vw, 460px"
                placeholder="blur"
              />
            </figure>
            <ul className="ed-timeline">
              <li>
                <h3>{t("background.healthcare.title")}</h3>
                <p>{t("background.healthcare.text")}</p>
              </li>
              <li>
                <h3>{t("background.art.title")}</h3>
                <p>{t("background.art.text")}</p>
              </li>
              <li>
                <h3>{t("background.artOfWellness.title")}</h3>
                <p>{t("background.artOfWellness.text")}</p>
                <Link className="ed-link" href="/art-of-wellness">
                  {t("background.artOfWellness.link")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </section>
      <VideoIntro />
      <section className="ed-container ed-section">
        <p className="ed-label">{t("workingTogether.label")}</p>
        <h2>{t("workingTogether.title")}</h2>
        <div className="ed-principles">
          <div>
            <span className="ed-principle-icon" aria-hidden>
              <PaintBrush size={30} weight="duotone" />
            </span>
            <h3>{t("workingTogether.noSkills.title")}</h3>
            <p>{t("workingTogether.noSkills.text")}</p>
          </div>
          <div>
            <span className="ed-principle-icon" aria-hidden>
              <ChatsCircle size={30} weight="duotone" />
            </span>
            <h3>{t("workingTogether.experience.title")}</h3>
            <p>{t("workingTogether.experience.text")}</p>
          </div>
          <div>
            <span className="ed-principle-icon" aria-hidden>
              <Question size={30} weight="duotone" />
            </span>
            <h3>{t("workingTogether.question.title")}</h3>
            <p>{t("workingTogether.question.text")}</p>
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
