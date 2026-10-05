import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { services } from "@/lib/services";
import type { ServiceStep } from "@/lib/services";
import "@/styles/services.css";
import Image, { type StaticImageData } from "next/image";
import individualArt from "@/assets/services/individual.webp";
import groupArt from "@/assets/services/group.webp";
import workshopsArt from "@/assets/services/workshops.webp";

const SERVICE_ART: Record<string, StaticImageData> = {
  "individual-art-therapy": individualArt,
  "group-art-wellbeing": groupArt,
  "workshops-programs": workshopsArt,
};

export default async function Services({
  params,
}: PageProps<"/[locale]/services">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("services");

  return (
    <div className="service-pages">
      <div className="service-container">
        <header className="services-intro">
          <p className="service-eyebrow">{t("index.eyebrow")}</p>
          <h1>{t("index.title")}</h1>
          <p className="service-intro">{t("index.intro")}</p>
        </header>
        <section className="services-rows" aria-label={t("index.listLabel")}>
          {services.map((service, index) => {
            const name = t(`items.${service.slug}.name`);
            const steps: ServiceStep[] = t.raw(`items.${service.slug}.steps`);
            return (
              <article
                key={service.slug}
                className={`service-row service-tone-${service.tone}`}
              >
                <div className="service-row-media">
                  <Image
                    src={SERVICE_ART[service.slug]}
                    alt=""
                    sizes="(max-width: 767px) 80vw, 36vw"
                    // The first artwork is the largest thing on screen at load.
                    preload={index === 0}
                  />
                </div>
                <div className="service-row-body">
                  <p className="service-eyebrow">
                    {t(`items.${service.slug}.audience`)}
                  </p>
                  <h2>{name}</h2>
                  <p>{t(`items.${service.slug}.summary`)}</p>
                  <div className="service-row-steps">
                    <p className="service-row-steps-label">
                      {t("index.howItWorks")}
                    </p>
                    <ol>
                      {steps.map((step) => (
                        <li key={step.title}>{step.title}</li>
                      ))}
                    </ol>
                  </div>
                  <Link
                    className="service-text-link"
                    href={`/services/${service.slug}`}
                    aria-label={t("index.exploreLabel", { name })}
                  >
                    {t("index.explore")}
                  </Link>
                </div>
              </article>
            );
          })}
        </section>
        <section className="service-compare">
          <p className="service-eyebrow">{t("index.compare.eyebrow")}</p>
          <h2>{t("index.compare.title")}</h2>
          <div className="service-compare-list">
            <Link href="/services/individual-art-therapy">
              <strong>{t("index.compare.individual.quote")}</strong>
              <span>{t("index.compare.individual.link")}</span>
            </Link>
            <Link href="/services/group-art-wellbeing">
              <strong>{t("index.compare.group.quote")}</strong>
              <span>{t("index.compare.group.link")}</span>
            </Link>
            <Link href="/services/workshops-programs">
              <strong>{t("index.compare.workshops.quote")}</strong>
              <span>{t("index.compare.workshops.link")}</span>
            </Link>
          </div>
        </section>
        <section className="service-closing-wrap">
          <div className="service-closing">
            <div>
              <p className="service-eyebrow">{t("index.closing.eyebrow")}</p>
              <h2>{t("index.closing.title")}</h2>
              <p>{t("index.closing.text")}</p>
            </div>
            <Link className="service-button" href="/contact">
              {t("index.closing.button")} <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
