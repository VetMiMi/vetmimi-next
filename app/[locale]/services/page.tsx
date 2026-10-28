import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";
import { services } from "@/lib/services";
import type { ServiceStep } from "@/lib/services";
import Image, { type StaticImageData } from "next/image";
import individualArt from "@/assets/services/individual.webp";
import groupArt from "@/assets/services/group.webp";
import workshopsArt from "@/assets/services/workshops.webp";
import {
  TONE,
  button,
  closing,
  container,
  eyebrow,
  heading,
  intro,
  text,
  textLink,
} from "@/components/ServiceDetail";

const SERVICE_ART: Record<string, StaticImageData> = {
  "individual-art-therapy": individualArt,
  "group-art-wellbeing": groupArt,
  "workshops-programs": workshopsArt,
};

const compare = "flex flex-col gap-2 border-t border-[#dcd2cf] pt-5";
const compareLink = "text-[0.88rem] text-indigo";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/services">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "services.metadata" });
  return pageMetadata(locale, "/services", {
    title: t("title"),
    description: t("description"),
  });
}

export default async function Services({
  params,
}: PageProps<"/[locale]/services">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("services");

  return (
    <div className={`bg-canvas text-ink ${TONE.rose}`}>
      <div className={container}>
        <header className="pt-16 pb-9 max-md:pt-10">
          <p className={eyebrow}>{t("index.eyebrow")}</p>
          <h1 className="mb-6 max-w-[19ch] text-[clamp(2.3rem,4.4vw,3.7rem)] tracking-[-0.025em]">
            {t("index.title")}
          </h1>
          <p className={intro}>{t("index.intro")}</p>
        </header>
        <section
          className="flex flex-col gap-22 pt-5 pb-24 max-lg:gap-16 max-md:gap-14 max-md:pb-14"
          aria-label={t("index.listLabel")}
        >
          {services.map((service) => {
            const name = t(`items.${service.slug}.name`);
            const steps: ServiceStep[] = t.raw(`items.${service.slug}.steps`);
            return (
              <article
                key={service.slug}
                className={`group grid grid-cols-2 items-center gap-[clamp(40px,6vw,88px)] max-md:grid-cols-1 max-md:gap-6 ${TONE[service.tone]}`}
              >
                <div className="relative aspect-4/3 overflow-hidden rounded-(--radius-card) bg-(--tint) group-even:order-2 max-md:group-even:order-0">
                  {/* The artwork files carry their own empty margin. */}
                  <Image
                    src={SERVICE_ART[service.slug]}
                    alt=""
                    sizes="(max-width: 767px) 80vw, 36vw"
                    className="absolute inset-0 h-full w-full scale-[1.12] object-contain"
                  />
                </div>
                <div>
                  <p className={eyebrow}>
                    {t(`items.${service.slug}.audience`)}
                  </p>
                  <h2 className="mb-[18px] text-[clamp(1.8rem,2.8vw,2.5rem)] tracking-[-0.018em] [&:not(:lang(my))]:leading-[1.16]!">
                    {name}
                  </h2>
                  <p className="max-w-[44ch] text-[1.04rem] leading-[1.75] text-muted">
                    {t(`items.${service.slug}.summary`)}
                  </p>
                  <div className="mt-7 max-w-[44ch] border-t border-[#e2d8d2] pt-[22px]">
                    <p className="mb-3 text-[0.72rem] leading-[1.75] font-semibold tracking-[0.12em] text-caption uppercase">
                      {t("index.howItWorks")}
                    </p>
                    <ol className="flex list-none flex-col gap-2">
                      {steps.map((step, index) => (
                        <li
                          key={step.title}
                          className="flex items-baseline gap-3 text-[0.96rem] text-ink"
                        >
                          <span className="min-w-[1ch] font-display text-[0.95rem] text-(--accent)">
                            {index + 1}
                          </span>
                          {step.title}
                        </li>
                      ))}
                    </ol>
                  </div>
                  <Link
                    className={`${textLink} mt-[30px] inline-block font-semibold`}
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
        <section className="pb-16">
          <p className={eyebrow}>{t("index.compare.eyebrow")}</p>
          <h2 className={heading}>{t("index.compare.title")}</h2>
          <div className="grid grid-cols-3 gap-6 max-md:grid-cols-1">
            <Link href="/services/individual-art-therapy" className={compare}>
              <strong className="font-semibold">
                {t("index.compare.individual.quote")}
              </strong>
              <span className={compareLink}>
                {t("index.compare.individual.link")}
              </span>
            </Link>
            <Link href="/services/group-art-wellbeing" className={compare}>
              <strong className="font-semibold">
                {t("index.compare.group.quote")}
              </strong>
              <span className={compareLink}>
                {t("index.compare.group.link")}
              </span>
            </Link>
            <Link href="/services/workshops-programs" className={compare}>
              <strong className="font-semibold">
                {t("index.compare.workshops.quote")}
              </strong>
              <span className={compareLink}>
                {t("index.compare.workshops.link")}
              </span>
            </Link>
          </div>
        </section>
        <section className="pb-11">
          <div className={closing}>
            <div>
              <p className={`${eyebrow} max-w-[54ch]`}>
                {t("index.closing.eyebrow")}
              </p>
              <h2 className={heading}>{t("index.closing.title")}</h2>
              <p className={`${text} max-w-[54ch]`}>
                {t("index.closing.text")}
              </p>
            </div>
            <Link className={`${button} shrink-0`} href="/contact">
              {t("index.closing.button")} <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
