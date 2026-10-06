import { Card } from "@/components/admin/Card";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { eventSentence, whenShort } from "@/lib/admin/appointments";
import type { components } from "@/lib/api/schema";
import { zoneAbbreviation } from "@/lib/zonedTime";
import { cardTitle } from "./Facts";

type Detail = components["schemas"]["AppointmentDetail"];
type Kind = components["schemas"]["CommunicationKind"];

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

const kinds: Record<Kind, string> = {
  request_received: "Request received",
  booking_confirmed: "Booking confirmed",
  request_declined: "Request declined",
  rescheduled: "New time",
  cancelled: "Cancellation",
  reminder: "Reminder",
  request_expired: "Request expired",
  practitioner_new_request: "To Daw Mi: new request",
  practitioner_new_booking: "To Daw Mi: new booking",
  practitioner_client_cancelled: "To Daw Mi: visitor cancelled",
  practitioner_reschedule_requested: "To Daw Mi: reschedule request",
  practitioner_new_enquiry: "To Daw Mi: new enquiry",
};

// The emails about this appointment. Resend and "Mark as communicated"
// arrive with #70.
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
              className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-divider py-3 first:pt-0 last:border-b-0 last:pb-0"
            >
              <span className="text-[0.95rem]">
                {kinds[c.kind]}
                <span className="block text-[0.82rem] text-muted">
                  {when(c.sentAt ?? c.scheduledFor, a.timezone)}
                </span>
              </span>
              <StatusBadge kind="communication" status={c.status} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
