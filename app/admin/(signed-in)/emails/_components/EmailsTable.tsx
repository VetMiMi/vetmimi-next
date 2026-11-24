import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { whenShort } from "@/lib/admin/appointments";
import { PRACTICE_TIMEZONE, type EmailRow } from "@/lib/admin/emails";
import { zoneAbbreviation } from "@/lib/zonedTime";

const when = (instant: string) =>
  `${whenShort(instant, PRACTICE_TIMEZONE)} ${zoneAbbreviation(instant, PRACTICE_TIMEZONE)}`;

// Email rows: a table from 768px, cards below. A row says who an email went
// to, never the address.
export function EmailsTable({
  rows,
  empty,
}: {
  rows: EmailRow[];
  empty: React.ReactNode;
}) {
  return (
    <DataTable
      caption="Emails"
      rows={rows}
      rowHref={(row) => row.href}
      empty={empty}
      columns={[
        {
          key: "appointment",
          label: "Appointment",
          render: (row) => row.reference,
        },
        { key: "when", label: "Date & time", render: (row) => when(row.at) },
        {
          key: "email",
          label: "Email",
          render: (row) => (
            <>
              {row.name}
              {row.resent && (
                <span className="block text-[0.82rem] text-muted">
                  Sent again
                </span>
              )}
            </>
          ),
        },
        { key: "to", label: "To", render: (row) => row.to },
        {
          key: "status",
          label: "Status",
          render: (row) => (
            <StatusBadge kind="communication" status={row.status} />
          ),
        },
      ]}
    />
  );
}
