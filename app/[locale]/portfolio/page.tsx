import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ed, PageEnd } from "@/components/Editorial";
import { ExternalLink } from "@/components/ExternalLink";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";
import { ARTWORKS, HIGHLIGHTS } from "@/lib/portfolio";
import { ArtworkGallery } from "./_components/ArtworkGallery";

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
    <div className={ed.page}>
      <header className={`${ed.container} pt-[clamp(44px,6vw,80px)] pb-10`}>
        <p className={ed.label}>{t("header.label")}</p>
        <h1 className={ed.h1}>{t("header.title")}</h1>
        <p className="max-w-[56ch] text-[1.08rem] leading-[1.8] text-muted">
          {t("header.lead")}
        </p>
      </header>

      {/* The cards follow the page header directly, with no heading of
          their own. */}
      <section
        className={`${ed.container} pb-[clamp(44px,6vw,80px)]`}
        aria-labelledby="highlights"
      >
        {/* Keeps the outline h1 → h2 → h3; the cards say what this is. */}
        <h2 id="highlights" className="sr-only">
          {t("highlights.label")}
        </h2>
        <div className="mt-2 grid grid-cols-3 gap-[clamp(28px,4vw,48px)] max-lg:grid-cols-2 max-md:grid-cols-1">
          {HIGHLIGHTS.map((item) => (
            <article key={item.id}>
              {/* The same soft mat frame as About and Art of Wellness. */}
              <figure className="mb-[1.4rem] rounded-card bg-[#eee4e2] p-3">
                <Image
                  className="block aspect-[4/3] h-auto w-full rounded-xl object-cover"
                  src={item.img}
                  alt={t(`highlights.items.${item.id}.alt`)}
                  sizes="(max-width: 767px) 100vw, 380px"
                  placeholder="blur"
                />
              </figure>
              <p className={`${ed.text} font-script text-[1.1rem]`}>
                {t(`highlights.items.${item.id}.when`)}
              </p>
              <h3 className="text-[1.35rem] leading-[1.25]">
                {t(`highlights.items.${item.id}.title`)}
              </h3>
              <p
                className={`${ed.text} text-[0.8rem] tracking-[0.06em] uppercase`}
              >
                {t(`highlights.items.${item.id}.role`)}
              </p>
              <p className={ed.text}>{t(`highlights.items.${item.id}.text`)}</p>
              {item.links.length > 0 && (
                <p className={`${ed.text} flex flex-wrap gap-x-5 gap-y-2`}>
                  {item.links.map((link) =>
                    link.external ? (
                      <ExternalLink
                        key={link.href}
                        className={ed.link}
                        href={link.href}
                      >
                        {t(`highlights.links.${link.label}`)}
                      </ExternalLink>
                    ) : (
                      <Link
                        key={link.href}
                        className={ed.link}
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

      <section className="bg-paper" aria-labelledby="artworks">
        <div className={`${ed.container} ${ed.section}`}>
          <p className={ed.label}>{t("artworks.label")}</p>
          <h2 id="artworks" className={ed.h2}>
            {t("artworks.title")}
          </h2>
          <p className={`${ed.text} text-[0.9rem]`}>{t("artworks.hint")}</p>
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
