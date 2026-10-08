import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { loadStories } from "@/lib/articles";
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

// Refreshed when an article publishes (POST /api/revalidate), and hourly in
// case the API was unreachable the last time the page was built.
export const revalidate = 3600;

// The home page is interactive throughout, so it renders as one client
// component; this server page adds its metadata and the stories preview.
export default async function Home({ params }: PageProps<"/[locale]">) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  return <HomePage stories={await loadStories(locale)} />;
}
