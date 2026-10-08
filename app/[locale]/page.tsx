import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";
import { HomePage } from "./_components/HomePage";

// The layout's title template does not apply to the page of its own
// segment, so the home title names the site itself.
export async function generateMetadata({
  params,
}: PageProps<"/[locale]">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "home.metadata" });
  return pageMetadata(locale, "/", {
    title: t("title"),
    description: t("description"),
  });
}

// The home page is interactive throughout, so it renders as one client
// component; this server page adds only its metadata.
export default async function Home({ params }: PageProps<"/[locale]">) {
  setRequestLocale((await params).locale as Locale);
  return <HomePage />;
}
