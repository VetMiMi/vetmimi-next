import { setRequestLocale } from "next-intl/server";
import ServiceDetail from "@/components/ServiceDetail";
import type { Locale } from "@/i18n/routing";
import { services } from "@/lib/services";

// One route for every service; URLs are unchanged.
export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export default async function ServicePage({
  params,
}: PageProps<"/[locale]/services/[slug]">) {
  const { locale, slug } = await params;
  setRequestLocale(locale as Locale);
  return <ServiceDetail slug={slug} />;
}
