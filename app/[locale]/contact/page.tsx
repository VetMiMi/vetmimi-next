import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";
import { apiConfigured } from "@/lib/api/client";
import { issueFormToken } from "@/lib/spam";
import type { ServiceSlug } from "@/lib/services";
import { ContactForm } from "./_components/ContactForm";
import type { EnquiryId } from "./_components/enquiry";

// Enquiry-only services link here as /contact?service=<slug>; the form then
// names the service and starts on the matching enquiry type.
const SERVICE_ENQUIRY: Partial<Record<ServiceSlug, EnquiryId>> = {
  "group-art-wellbeing": "workshop",
  "workshops-programs": "workshop",
};

const container =
  "mx-auto w-[min(1120px,calc(100%-48px))] max-[640px]:w-[calc(100%-40px)]";
const eyebrow = "mb-4 text-[0.72rem] tracking-[0.14em] text-label uppercase";
const choice =
  "flex flex-col gap-1.5 rounded-(--radius-choice) border border-[#e2d8d2] bg-raised px-[26px] py-6 text-ink transition-[border-color,translate,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-rose hover:shadow-card-hover focus-visible:-translate-y-0.5 focus-visible:border-rose focus-visible:shadow-card-hover";
const choiceTitle = "font-display text-[1.35rem] font-normal";
const choiceText = "text-[0.92rem] leading-[1.6] text-muted";
const choiceCta = "mt-2 text-[0.88rem] font-semibold text-indigo not-italic";
const detailLabel =
  "mb-1 text-[0.75rem] font-semibold tracking-[0.1em] uppercase";
const detailValue = "text-[0.95rem] leading-[1.6] text-ink/72";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/contact">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "contact.metadata" });
  return pageMetadata(locale, "/contact", {
    title: t("title"),
    description: t("description"),
  });
}

export default async function Contact({
  params,
  searchParams,
}: PageProps<"/[locale]/contact">) {
  const { locale } = await params;
  const { service: slug } = await searchParams;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("contact");
  const tServices = await getTranslations("services");
  const known = typeof slug === "string" && slug in SERVICE_ENQUIRY;
  const service = known
    ? {
        slug: slug as ServiceSlug,
        name: tServices(`items.${slug as ServiceSlug}.name`),
        type: SERVICE_ENQUIRY[slug as ServiceSlug]!,
      }
    : null;

  return (
    <div className="min-h-dvh bg-canvas text-ink">
      <section
        className={`${container} pt-18 pb-12 max-[640px]:pt-11 max-[640px]:pb-8`}
      >
        <p className={eyebrow}>{t("hero.eyebrow")}</p>
        <h1 className="mb-8 text-[clamp(2.6rem,5vw,4.2rem)]">
          {t("hero.title")}
        </h1>
        <div className="grid grid-cols-2 gap-5 max-[640px]:grid-cols-1">
          <Link href="/book" className={choice}>
            <strong className={choiceTitle}>{t("hero.book.title")}</strong>
            <span className={choiceText}>{t("hero.book.text")}</span>
            <em className={choiceCta}>{t("hero.book.cta")}</em>
          </Link>
          <a href="#enquiry" className={choice}>
            <strong className={choiceTitle}>{t("hero.enquiry.title")}</strong>
            <span className={choiceText}>{t("hero.enquiry.text")}</span>
            <em className={choiceCta}>{t("hero.enquiry.cta")}</em>
          </a>
        </div>
      </section>

      <section
        id="enquiry"
        className={`${container} grid scroll-mt-24 grid-cols-[minmax(0,7fr)_minmax(0,4fr)] items-start gap-[clamp(28px,4vw,56px)] pb-28 max-[900px]:grid-cols-1 max-[640px]:pb-18`}
      >
        <div className="rounded-(--radius-card) border border-card-border bg-raised p-[clamp(24px,4vw,44px)]">
          {apiConfigured() ? (
            <ContactForm
              formToken={issueFormToken("contact")}
              service={service}
            />
          ) : (
            <p className="leading-[1.7]">
              {t.rich("form.notConnected", {
                email: (chunks) => (
                  <a
                    href={`mailto:${t("details.email.value")}`}
                    className="text-label underline"
                  >
                    {chunks}
                  </a>
                ),
              })}
            </p>
          )}
        </div>

        <aside
          className="sticky top-26 rounded-(--radius-card) bg-[#f3e8e6] p-[clamp(24px,3vw,36px)] max-[900px]:static"
          aria-label={t("details.title")}
        >
          <p className={eyebrow}>{t("details.title")}</p>
          <dl className="flex flex-col gap-[22px]">
            <div>
              <dt className={detailLabel}>{t("details.email.label")}</dt>
              <dd className={detailValue}>{t("details.email.value")}</dd>
            </div>
            <div>
              <dt className={detailLabel}>{t("details.location.label")}</dt>
              <dd className={detailValue}>{t("details.location.value")}</dd>
            </div>
            <div>
              <dt className={detailLabel}>{t("details.responseTime.label")}</dt>
              <dd className={detailValue}>{t("details.responseTime.value")}</dd>
            </div>
          </dl>
          <hr className="mt-7 mb-5 border-ink/10" />
          <p className="text-[0.9rem] leading-[1.7] text-ink/72">
            {t.rich("details.bookingNote", {
              link: (chunks) => (
                <Link
                  href="/book"
                  className="text-label underline underline-offset-2"
                >
                  {chunks}
                </Link>
              ),
            })}
          </p>
        </aside>
      </section>
    </div>
  );
}
