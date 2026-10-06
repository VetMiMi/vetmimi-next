import type { Metadata } from "next";
import { Card } from "@/components/admin/Card";
import { NoAccess } from "@/components/admin/NoAccess";
import { Notice } from "@/components/admin/Notice";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { failedNotifications, whenShort } from "@/lib/admin/appointments";
import { requireRole } from "@/lib/admin/session";
import { zoneAbbreviation } from "@/lib/zonedTime";
import { ActionPanel } from "./_components/ActionPanel";
import { AppointmentCard } from "./_components/AppointmentCard";
import { cardTitle } from "./_components/Facts";
import { CommunicationsList, HistoryList } from "./_components/HistoryList";
import { PrivateNote } from "./_components/PrivateNote";
import { VisitorCard } from "./_components/VisitorCard";
import { loadAppointment } from "./loadAppointment";

export const metadata: Metadata = { title: "Appointment" };

// One appointment (#67) in the contact layout: the record on the left, what
// Daw Mi can do on the right, one column below 900px.
export default async function AppointmentPage({
  params,
  searchParams,
}: PageProps<"/admin/appointments/[id]">) {
  if (!(await requireRole("booking_admin"))) return <NoAccess />;
  const { id } = await params;
  const { notice } = await searchParams;
  const a = await loadAppointment(id);
  if (!a) return <NoAccess />;

  const serviceName = a.service.name.en ?? a.service.slug;
  const failures = failedNotifications(a.communications);
  const room = a.videoRoom;

  return (
    <>
      <PageHeader
        title={a.reference}
        description={serviceName}
        breadcrumb={[{ label: "Appointments", href: "/admin/appointments" }]}
      />
      <div className="-mt-4 mb-8">
        <StatusBadge kind="appointment" status={a.status} />
      </div>

      {(notice === "cannot-move" || failures.length > 0) && (
        <div className="mb-8 flex flex-col gap-3">
          {notice === "cannot-move" && (
            <Notice tone="info">
              This appointment can no longer be moved.
            </Notice>
          )}
          {/* A partial failure stays until dealt with, never a toast. */}
          {failures.map((sentence) => (
            <Notice key={sentence} tone="error">
              {sentence} The status was not changed. Contact the visitor
              directly if they need to know.
            </Notice>
          ))}
        </div>
      )}

      <div className="grid items-start gap-[clamp(28px,4vw,56px)] min-[900px]:grid-cols-[minmax(0,7fr)_minmax(0,4fr)]">
        <div className="flex flex-col gap-6">
          <AppointmentCard appointment={a} />
          <VisitorCard appointment={a} />
          <HistoryList appointment={a} />
          <CommunicationsList appointment={a} />
        </div>

        <aside
          aria-label="Actions"
          className="flex flex-col gap-6 min-[900px]:sticky min-[900px]:top-[104px]"
        >
          <Card as="section">
            <h2 className={cardTitle}>Actions</h2>
            <ActionPanel
              appointment={a}
              serviceName={serviceName}
              now={new Date().toISOString()}
            />
          </Card>
          <Card as="section">
            <PrivateNote id={a.id} version={a.version} note={a.adminNote} />
          </Card>
          <Card as="section">
            <h2 className={cardTitle}>Video session</h2>
            {room ? (
              <div className="flex flex-col items-start gap-2 text-[0.95rem]">
                <StatusBadge kind="room" status={room.state} />
                <p className="text-muted">
                  Opens {whenShort(room.opensAt, a.timezone)}{" "}
                  {zoneAbbreviation(room.opensAt, a.timezone)}
                </p>
              </div>
            ) : a.meetingLink ? (
              <a
                href={a.meetingLink}
                className="text-[0.95rem] break-all underline underline-offset-4 hover:text-indigo"
              >
                {a.meetingLink}
              </a>
            ) : (
              <p className="text-[0.95rem] text-muted">
                {a.format === "online"
                  ? "The video room is set up when the appointment is confirmed."
                  : "In person: no video session."}
              </p>
            )}
          </Card>
        </aside>
      </div>
    </>
  );
}
