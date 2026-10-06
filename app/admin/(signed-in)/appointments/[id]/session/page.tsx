import type { Metadata } from "next";
import { Button } from "@/components/admin/Button";
import { NoAccess } from "@/components/admin/NoAccess";
import { Notice } from "@/components/admin/Notice";
import { PageHeader } from "@/components/admin/PageHeader";
import { whenLong } from "@/lib/admin/appointments";
import { requireRole } from "@/lib/admin/session";
import { clock, firstName, videoPanelState } from "@/lib/admin/videoSession";
import { loadAppointment } from "../loadAppointment";
import { PractitionerSession } from "./_components/PractitionerSession";

export const metadata: Metadata = { title: "Video session" };

// Daw Mi's call view (#83). It lives in the admin shell, but once she joins
// the stage covers the whole screen, the shell included, as the visitor's
// does (brief §9: the same stage serves both); its corner link leads back.
export default async function VideoSessionPage({
  params,
}: PageProps<"/admin/appointments/[id]/session">) {
  if (!(await requireRole("booking_admin"))) return <NoAccess />;
  const { id } = await params;
  const a = await loadAppointment(id);
  if (!a) return <NoAccess />;

  const detail = `/admin/appointments/${id}`;
  const room = a.videoRoom;
  const state = videoPanelState(a, new Date().toISOString());
  const closedText =
    !room || state === "can_start"
      ? null
      : state === "before_window"
        ? `The session opens at ${clock(room.opensAt, a.timezone)}.`
        : state === "ended" && room.endedAt
          ? `This session ended at ${clock(room.endedAt, a.timezone)}.`
          : "The session window has closed.";

  return (
    <>
      <PageHeader
        title="Video session"
        description={`${a.reference} · ${a.service.name.en ?? a.service.slug}`}
        breadcrumb={[
          { label: "Appointments", href: "/admin/appointments" },
          { label: a.reference, href: detail },
        ]}
      />
      {room ? (
        <PractitionerSession
          id={id}
          version={a.version}
          visitor={firstName(a.visitorName)}
          when={whenLong(a.startsAt, a.timezone)}
          closedText={closedText}
          canComplete={a.allowedActions.includes("complete")}
        />
      ) : (
        <div className="flex max-w-[660px] flex-col items-start gap-6">
          <Notice tone="info">
            This appointment has no VetMiMi video room, so there is no session
            to start here.
          </Notice>
          <Button href={detail} variant="secondary">
            Back to appointment
          </Button>
        </div>
      )}
    </>
  );
}
