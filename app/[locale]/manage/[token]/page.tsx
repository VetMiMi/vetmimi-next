import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getManagedAppointment } from "@/lib/api/manage";
import { LoadProblem } from "./_components/LoadProblem";
import { ManageShell } from "./_components/ManageShell";
import { ManageView } from "./_components/ManageView";

// Never in search results, and the token never leaves in a Referer header
// (next.config.ts sends the same as HTTP headers). The title names no one.
export async function generateMetadata({
  params,
}: PageProps<"/[locale]/manage/[token]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "manage.meta",
  });
  return {
    title: t("title"),
    robots: { index: false, follow: false },
    referrer: "no-referrer",
  };
}

// The page the API's emails link to: SITE_URL/manage/<token>, and
// SITE_URL/my/manage/<token> in Burmese (#59). Read fresh on every visit.
export default async function ManagePage({
  params,
}: PageProps<"/[locale]/manage/[token]">) {
  const { locale, token } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("manage.page");

  const load = await getManagedAppointment(token);
  if (!load.ok) {
    if (load.problem === "not_found") notFound();
    return (
      <ManageShell title={t("title")}>
        <LoadProblem problem={load.problem} retry={`/manage/${token}`} />
      </ManageShell>
    );
  }

  return (
    <ManageShell title={t("title")}>
      <ManageView
        token={token}
        initial={load.appointment}
        now={new Date().toISOString()}
      />
    </ManageShell>
  );
}
