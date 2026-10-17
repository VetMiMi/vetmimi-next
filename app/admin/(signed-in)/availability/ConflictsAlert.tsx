import { useEffect, useRef } from "react";
import { WarningCircle } from "@phosphor-icons/react";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatClock, formatDay, zonedParts } from "@/lib/zonedTime";
import type { Conflict } from "./actions";

// Appointments inside time being taken off. Nothing is cancelled
// automatically, so this stays on the page until Daw Mi has seen it; a
// toast that fades would hide it (brief §7 Toasts).
export function ConflictsAlert({
  conflicts,
  timezone,
  message,
  children,
}: {
  conflicts: Conflict[];
  timezone: string;
  message: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => ref.current?.focus(), []);

  return (
    <div className="flex flex-col gap-5">
      <div
        ref={ref}
        role="alert"
        tabIndex={-1}
        className="flex items-start gap-2 rounded-notice border border-ochre bg-ochre/12 px-5 py-4 text-[0.92rem] leading-[1.65] text-ink"
      >
        <WarningCircle
          aria-hidden="true"
          size={20}
          className="mt-[3px] shrink-0"
        />
        <p>{message}</p>
      </div>
      <DataTable
        caption="Appointments in that time"
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
            label: "Client",
            render: (row) => row.visitorName,
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
      <div className="flex flex-wrap gap-3">{children}</div>
    </div>
  );
}
