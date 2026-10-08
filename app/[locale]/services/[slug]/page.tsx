import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import ServiceDetail from "@/components/ServiceDetail";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";
import { services } from "@/lib/services";

// One route for every service; URLs are unchanged.
export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/services/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const service = services.find((item) => item.slug === slug);
  if (!service) return {};
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: `services.items.${service.slug}`,
  });
  return pageMetadata(locale as Locale, `/services/${slug}`, {
    title: t("name"),
    description: t("summary"),
  });
}

export default async function ServicePage({
  params,
}: PageProps<"/[locale]/services/[slug]">) {
  const { locale, slug } = await params;
  setRequestLocale(locale as Locale);
  return <ServiceDetail slug={slug} />;
}
