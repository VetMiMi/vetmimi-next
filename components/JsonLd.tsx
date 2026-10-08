import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { services, type ServiceQuestion } from "@/lib/services";
import {
  dawMiJsonLd,
  homeFaqQuestions,
  jsonLdText,
  practiceJsonLd,
  serviceJsonLd,
} from "@/lib/structured-data";
import dawMiPortrait from "@/assets/daw-mi-portrait.webp";

// Structured data for search engines, read from the same messages the page
// shows. See lib/structured-data.ts.
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdText(data) }}
    />
  );
}

export async function PracticeJsonLd() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations({ locale });
  return (
    <JsonLd
      data={practiceJsonLd(locale, {
        description: t("home.metadata.description"),
        email: t("contact.details.email.value"),
        faq: homeFaqQuestions(t.raw("home.faq.items")),
      })}
    />
  );
}

export async function DawMiJsonLd() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations({ locale, namespace: "common.brand" });
  // The tagline reads "Daw Mi · Art Therapist"; her title is the last part.
  const jobTitle = t("tagline").split("·").at(-1)!.trim();
  return (
    <JsonLd
      data={dawMiJsonLd(locale, { jobTitle, image: dawMiPortrait.src })}
    />
  );
}

export async function ServiceJsonLd({ slug }: { slug: string }) {
  const service = services.find((item) => item.slug === slug);
  if (!service) return null;
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations({
    locale,
    namespace: `services.items.${service.slug}`,
  });
  const questions: ServiceQuestion[] = t.raw("questions");
  return (
    <JsonLd
      data={serviceJsonLd(locale, {
        slug,
        name: t("name"),
        description: t("summary"),
        href: service.href,
        questions,
      })}
    />
  );
}
