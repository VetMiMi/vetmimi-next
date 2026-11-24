import { Card } from "@/components/admin/Card";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { eventSentence, whenShort } from "@/lib/admin/appointments";
import { emailNames } from "@/lib/admin/emails";
import type { AppointmentDetail } from "@/lib/api/types/appointments";
import { zoneAbbreviation } from "@/lib/zonedTime";
import { EmailActions } from "./EmailActions";
import { cardTitle } from "./Facts";

type Detail = AppointmentDetail;

const when = (instant: string, tz: string) =>
  `${whenShort(instant, tz)} ${zoneAbbreviation(instant, tz)}`;

// What happened, newest first (Booking UX §17: "Material history should
// not silently disappear").
export function HistoryList({ appointment: a }: { appointment: Detail }) {
  const events = [...a.events].sort((x, y) =>
    y.createdAt.localeCompare(x.createdAt),
  );
  return (
    <Card as="section">
      <h2 className={cardTitle}>History</h2>
      <ol className="flex flex-col">
        {events.map((event) => (
          <li
            key={event.id}
            className="border-b border-divider py-3 first:pt-0 last:border-b-0 last:pb-0"
          >
            <p className="text-[0.95rem]">{eventSentence(event, a.timezone)}</p>
            <p className="text-[0.82rem] text-muted">
              {when(event.createdAt, a.timezone)}
            </p>
          </li>
        ))}
      </ol>
    </Card>
  );
}

// The emails about this appointment, and what Daw Mi recorded telling the
// visitor herself.
export function CommunicationsList({
  appointment: a,
}: {
  appointment: Detail;
}) {
  return (
    <Card as="section">
      <h2 className={cardTitle}>Communications</h2>
      {a.communications.length === 0 ? (
        <p className="text-[0.95rem] text-muted">No emails yet.</p>
      ) : (
        <ul className="flex flex-col">
          {a.communications.map((c) => (
            <li
              key={c.id}
              id={`email-${c.id}`}
              className="flex flex-col gap-2 border-b border-divider py-3 first:pt-0 last:border-b-0 last:pb-0"
            >
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                <span className="text-[0.95rem]">
                  {emailNames[c.kind]}
                  <span className="block text-[0.82rem] text-muted">
                    {c.channel === "manual"
                      ? `Told by you: ${c.note}`
                      : c.resendOf
                        ? "Sent again"
                        : null}
                    {(c.channel === "manual" || c.resendOf) && " · "}
                    {when(c.sentAt ?? c.scheduledFor, a.timezone)}
                  </span>
                </span>
                {c.channel === "email" && (
                  <StatusBadge kind="communication" status={c.status} />
                )}
              </div>
              <EmailActions
                appointmentId={a.id}
                email={c}
                name={emailNames[c.kind]}
              />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
