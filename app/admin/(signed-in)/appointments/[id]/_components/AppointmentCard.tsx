import { Card } from "@/components/admin/Card";
import {
  clockWithZone,
  formatNames,
  longDay,
  whenShort,
} from "@/lib/admin/appointments";
import type { components } from "@/lib/api/schema";
import { formatClock, zoneAbbreviation, zonedParts } from "@/lib/zonedTime";
import { Facts, cardTitle } from "./Facts";

type Detail = components["schemas"]["AppointmentDetail"];

// The booking facts (Booking UX §12), every time in the practice timezone
// with its zone named.
export function AppointmentCard({ appointment: a }: { appointment: Detail }) {
  const tz = a.timezone;
  const withZone = (instant: string) =>
    `${whenShort(instant, tz)} ${zoneAbbreviation(instant, tz)}`;
  const items: [string, React.ReactNode][] = [
    ["Date", longDay(zonedParts(a.startsAt, tz).date)],
    [
      "Time",
      `${formatClock(zonedParts(a.startsAt, tz).time)} to ${clockWithZone(a.endsAt, tz)}`,
    ],
    ["Duration", `${a.durationMinutes} minutes`],
    ["Format", formatNames[a.format]],
    ["Source", a.source === "manual" ? "Added by hand" : "Website"],
    ["Email language", a.locale === "my" ? "Burmese" : "English"],
    ["Requested", withZone(a.createdAt)],
    ["Last changed", withZone(a.updatedAt)],
  ];
  if (a.status === "pending" && a.holdExpiresAt)
    items.push(["Hold expires", withZone(a.holdExpiresAt)]);
  if (a.lateCancellation)
    items.push(["Late cancellation", "Yes, inside the notice period"]);

  return (
    <Card as="section">
      <h2 className={cardTitle}>Appointment</h2>
      <Facts items={items} />
    </Card>
  );
}
