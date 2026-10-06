import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  clockWithZone,
  formatNames,
  whenShort,
} from "@/lib/admin/appointments";
import type { components } from "@/lib/api/schema";
import { formatDay, zonedParts } from "@/lib/zonedTime";

type Summary = components["schemas"]["AppointmentSummary"];

// Appointment rows for the list (#65): a table from 768px, cards below.
// Name only: email and phone stay on the detail page (Booking UX §28).
// Rendered by the server page and by "Show more" in the browser alike.
export function AppointmentsTable({
  caption,
  rows,
  timezone,
  now,
  empty,
}: {
  caption: string;
  rows: Summary[];
  timezone: string;
  // An ISO instant, so server and browser agree on what is past.
  now: string;
  empty: React.ReactNode;
}) {
  return (
    <DataTable
      caption={caption}
      rows={rows}
      rowHref={(row) => `/admin/appointments/${row.id}`}
      empty={empty}
      columns={[
        {
          key: "when",
          label: "Date & time",
          render: (row) => {
            const { date } = zonedParts(row.startsAt, timezone);
            return `${formatDay(date)}, ${clockWithZone(row.startsAt, timezone)}`;
          },
        },
        { key: "visitor", label: "Visitor", render: (row) => row.visitorName },
        {
          key: "service",
          label: "Service",
          render: (row) => row.service.name.en ?? row.service.slug,
        },
        {
          key: "format",
          label: "Format",
          render: (row) => formatNames[row.format],
        },
        {
          key: "status",
          label: "Status",
          render: (row) => (
            <div className="flex flex-col items-start gap-1">
              <StatusBadge kind="appointment" status={row.status} />
              {row.status === "pending" && row.holdExpiresAt && (
                <span className="text-[0.82rem] text-muted">
                  Hold expires {whenShort(row.holdExpiresAt, timezone)}
                </span>
              )}
              {row.status === "confirmed" && row.endsAt < now && (
                <span className="text-[0.82rem] font-semibold text-gold-text">
                  Needs completion
                </span>
              )}
            </div>
          ),
        },
        {
          key: "requested",
          label: "Requested",
          render: (row) => formatDay(zonedParts(row.createdAt, timezone).date),
        },
      ]}
    />
  );
}
