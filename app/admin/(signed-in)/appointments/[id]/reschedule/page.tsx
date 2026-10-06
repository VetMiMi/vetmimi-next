import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { NoAccess } from "@/components/admin/NoAccess";
import { PageHeader } from "@/components/admin/PageHeader";
import { requireRole } from "@/lib/admin/session";
import { todayIn } from "@/lib/zonedTime";
import { loadAppointment } from "../loadAppointment";
import { RescheduleForm } from "./RescheduleForm";

export const metadata: Metadata = { title: "Reschedule appointment" };

// Move an appointment to another free time (#69). A finished or cancelled
// appointment cannot move, so its address leads back to the detail page.
export default async function ReschedulePage({
  params,
}: PageProps<"/admin/appointments/[id]/reschedule">) {
  if (!(await requireRole("booking_admin"))) return <NoAccess />;
  const { id } = await params;
  const a = await loadAppointment(id);
  if (!a) return <NoAccess />;
  if (!a.allowedActions.includes("reschedule"))
    redirect(`/admin/appointments/${id}?notice=cannot-move`);

  return (
    <>
      <PageHeader
        title="Reschedule"
        description={`${a.reference} · ${a.service.name.en ?? a.service.slug} · ${a.visitorName}`}
        breadcrumb={[
          { label: "Appointments", href: "/admin/appointments" },
          { label: a.reference, href: `/admin/appointments/${id}` },
        ]}
      />
      <RescheduleForm appointment={a} today={todayIn(a.timezone)} />
    </>
  );
}
