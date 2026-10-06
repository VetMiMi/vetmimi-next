import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Notice } from "@/components/admin/Notice";
import { getManagedAppointment } from "@/lib/api/manage";
import { todayIn } from "@/lib/zonedTime";
import { AppointmentSummary } from "../_components/AppointmentSummary";
import { LoadProblem } from "../_components/LoadProblem";
import { ManageShell } from "../_components/ManageShell";
import { linkClass } from "../_components/manageClasses";
import { RescheduleRequestForm } from "./_components/RescheduleRequestForm";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/manage/[token]/reschedule">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "manage.meta",
  });
  return {
    title: t("rescheduleTitle"),
    robots: { index: false, follow: false },
    referrer: "no-referrer",
  };
}

// "Ask to reschedule" (#61), behind the same token check as the
// appointment page: a bad link is the same neutral 404.
export default async function ReschedulePage({
  params,
}: PageProps<"/[locale]/manage/[token]/reschedule">) {
  const { locale, token } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("manage");
  const back = `/manage/${token}`;

  const load = await getManagedAppointment(token);
  if (!load.ok) {
    if (load.problem === "not_found") notFound();
    return (
      <ManageShell title={t("page.rescheduleTitle")} back={back}>
        <LoadProblem problem={load.problem} retry={`${back}/reschedule`} />
      </ManageShell>
    );
  }
  const a = load.appointment;

  return (
    <ManageShell title={t("page.rescheduleTitle")} back={back}>
      <AppointmentSummary appointment={a} />
      {a.canRequestReschedule ? (
        <>
          <p className="text-[1rem] leading-[1.7]">{t("reschedule.intro")}</p>
          <RescheduleRequestForm
            token={token}
            appointment={a}
            today={todayIn(a.timezone)}
          />
        </>
      ) : (
        <>
          <Notice tone="info">
            {a.rescheduleRequested
              ? t("notes.rescheduleRequested")
              : t("reschedule.notAllowed")}
          </Notice>
          <Link href="/contact" className={linkClass}>
            {t("actions.contact")}
          </Link>
        </>
      )}
    </ManageShell>
  );
}
