import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageEnd } from "@/components/Editorial";
import { ExternalLink } from "@/components/ExternalLink";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";
import { ARTWORKS, HIGHLIGHTS } from "@/lib/portfolio";
import { ArtworkGallery } from "./_components/ArtworkGallery";
import "@/styles/portfolio.css";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/portfolio">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "portfolio.metadata" });
  return pageMetadata(locale, "/portfolio", {
    title: t("title"),
    description: t("description"),
  });
}

export default async function Portfolio({
  params,
}: PageProps<"/[locale]/portfolio">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("portfolio");

  return (
    <div className="ed-page">
      <header className="ed-container ed-header">
        <p className="ed-label">{t("header.label")}</p>
        <h1>{t("header.title")}</h1>
        <p className="ed-lead">{t("header.lead")}</p>
      </header>

      <section
        className="ed-container ed-section pf-highlights-section"
        aria-labelledby="highlights"
      >
        {/* Keeps the outline h1 → h2 → h3; the cards say what this is. */}
        <h2 id="highlights" className="sr-only">
          {t("highlights.label")}
        </h2>
        <div className="pf-highlights">
          {HIGHLIGHTS.map((item) => (
            <article key={item.id} className="pf-highlight">
              <figure className="pf-frame">
                <Image
                  src={item.img}
                  alt={t(`highlights.items.${item.id}.alt`)}
                  sizes="(max-width: 767px) 100vw, 380px"
                  placeholder="blur"
                />
              </figure>
              <p className="pf-when">{t(`highlights.items.${item.id}.when`)}</p>
              <h3>{t(`highlights.items.${item.id}.title`)}</h3>
              <p className="pf-role">{t(`highlights.items.${item.id}.role`)}</p>
              <p>{t(`highlights.items.${item.id}.text`)}</p>
              {item.links.length > 0 && (
                <p className="pf-links">
                  {item.links.map((link) =>
                    link.external ? (
                      <ExternalLink
                        key={link.href}
                        className="ed-link"
                        href={link.href}
                      >
                        {t(`highlights.links.${link.label}`)}
                      </ExternalLink>
                    ) : (
                      <Link
                        key={link.href}
                        className="ed-link"
                        href={link.href}
                      >
                        {t(`highlights.links.${link.label}`)}
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
          <p className="ed-label">{t("artworks.label")}</p>
          <h2 id="artworks">{t("artworks.title")}</h2>
          <p className="pf-hint">{t("artworks.hint")}</p>
          <ArtworkGallery artworks={ARTWORKS} />
        </div>
      </section>

      <PageEnd
        title={t("end.title")}
        text={t("end.text")}
        href="/contact"
        label={t("end.label")}
      />
    </div>
  );
}
