import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { loadStories } from "@/lib/articles";
import { StoriesIndex } from "./_components/StoriesIndex";

// Refreshed when an article publishes (POST /api/revalidate), and hourly in
// case the API was unreachable the last time the page was built.
export const revalidate = 3600;

export default async function Stories({
  params,
}: PageProps<"/[locale]/stories">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  return <StoriesIndex items={await loadStories(locale as Locale)} />;
}
