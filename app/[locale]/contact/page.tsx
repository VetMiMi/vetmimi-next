import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { issueFormToken } from "@/lib/spam";
import type { ServiceSlug } from "@/lib/services";
import { ContactForm } from "./_components/ContactForm";
import type { EnquiryId } from "./_components/enquiry";
import "@/styles/contact.css";

// Enquiry-only services link here as /contact?service=<slug>; the form then
// names the service and starts on the matching enquiry type.
const SERVICE_ENQUIRY: Partial<Record<ServiceSlug, EnquiryId>> = {
  "group-art-wellbeing": "workshop",
  "workshops-programs": "workshop",
};

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
    <div className="contact-page">
      {/* ── Hero: which page do I need? ─────────────────── */}
      <section className="contact-container contact-hero">
        <p className="contact-eyebrow">{t("hero.eyebrow")}</p>
        <h1>{t("hero.title")}</h1>
        <div className="contact-choices">
          <Link href="/book" className="contact-choice">
            <strong>{t("hero.book.title")}</strong>
            <span>{t("hero.book.text")}</span>
            <em>{t("hero.book.cta")}</em>
          </Link>
          <a href="#enquiry" className="contact-choice">
            <strong>{t("hero.enquiry.title")}</strong>
            <span>{t("hero.enquiry.text")}</span>
            <em>{t("hero.enquiry.cta")}</em>
          </a>
        </div>
      </section>

      {/* ── Form + details ──────────────────────────────── */}
      <section id="enquiry" className="contact-container contact-main">
        <div className="contact-card">
          <ContactForm
            formToken={issueFormToken("contact")}
            service={service}
          />
        </div>

        <aside className="contact-details" aria-label={t("details.title")}>
          <p className="contact-eyebrow">{t("details.title")}</p>
          <dl>
            <div>
              <dt>{t("details.email.label")}</dt>
              <dd>{t("details.email.value")}</dd>
            </div>
            <div>
              <dt>{t("details.location.label")}</dt>
              <dd>{t("details.location.value")}</dd>
            </div>
            <div>
              <dt>{t("details.responseTime.label")}</dt>
              <dd>{t("details.responseTime.value")}</dd>
            </div>
          </dl>
          <hr />
          <p className="contact-details-note">
            {t.rich("details.bookingNote", {
              link: (chunks) => <Link href="/book">{chunks}</Link>,
            })}
          </p>
        </aside>
      </section>
    </div>
  );
}
