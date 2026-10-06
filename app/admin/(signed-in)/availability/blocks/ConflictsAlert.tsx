import { useEffect, useRef } from "react";
import { WarningCircle } from "@phosphor-icons/react";
import { Button } from "@/components/admin/Button";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatClock, formatDay, zonedParts } from "@/lib/zonedTime";
import type { Conflict } from "../actions";

// The block is saved, but appointments sit inside it. Nothing is cancelled
// automatically, so this stays on the page until Daw Mi has seen it; a
// toast that fades would hide it (brief §7 Toasts).
export function ConflictsAlert({
  conflicts,
  timezone,
}: {
  conflicts: Conflict[];
  timezone: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => ref.current?.focus(), []);
  const count = conflicts.length;

  return (
    <div className="flex flex-col gap-6">
      <div
        ref={ref}
        role="alert"
        tabIndex={-1}
        className="flex items-start gap-2 rounded-notice border border-ochre bg-ochre/12 px-6 py-5 text-[0.92rem] leading-[1.65] text-ink"
      >
        <WarningCircle
          aria-hidden="true"
          size={20}
          className="mt-[3px] shrink-0"
        />
        <p>
          Blocked. {count}{" "}
          {count === 1 ? "appointment falls" : "appointments fall"} inside this
          time and {count === 1 ? "was" : "were"} not changed. Open each one to
          reschedule or cancel it.
        </p>
      </div>
      <DataTable
        caption="Appointments inside the blocked time"
        rows={conflicts}
        rowHref={(row) => `/admin/appointments/${row.id}`}
        columns={[
          {
            key: "when",
            label: "When",
            render: (row) => {
              const start = zonedParts(row.startsAt, timezone);
              return `${formatDay(start.date)}, ${formatClock(start.time)}`;
            },
          },
          {
            key: "visitor",
            label: "Visitor",
            render: (row) => row.visitorName,
          },
          {
            key: "service",
            label: "Service",
            render: (row) => row.service.name.en ?? row.service.slug,
          },
          {
            key: "status",
            label: "Status",
            render: (row) => (
              <StatusBadge kind="appointment" status={row.status} />
            ),
          },
        ]}
        empty={null}
      />
      <div>
        <Button href="/admin/availability/blocks" variant="secondary">
          Back to blocked time
        </Button>
      </div>
    </div>
  );
}
