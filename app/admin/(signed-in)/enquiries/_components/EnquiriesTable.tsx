import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { whenShort } from "@/lib/admin/appointments";
import { PRACTICE_TIMEZONE, type EnquiryRow } from "@/lib/admin/enquiries";
import { zoneAbbreviation } from "@/lib/zonedTime";

const received = (instant: string) =>
  `${whenShort(instant, PRACTICE_TIMEZONE)} ${zoneAbbreviation(instant, PRACTICE_TIMEZONE)}`;

// Enquiry rows (#77): a table from 768px, cards below. The subject, or the
// message's first 80 characters, is all of the text a row shows.
export function EnquiriesTable({
  rows,
  empty,
}: {
  rows: EnquiryRow[];
  empty: React.ReactNode;
}) {
  return (
    <DataTable
      caption="Contact enquiries"
      rows={rows}
      rowHref={(row) => `/admin/enquiries/${row.id}`}
      empty={empty}
      columns={[
        {
          key: "received",
          label: "Received",
          render: (row) => received(row.createdAt),
        },
        { key: "name", label: "Name", render: (row) => row.name },
        { key: "type", label: "Type", render: (row) => row.type },
        {
          key: "subject",
          label: "Subject",
          render: (row) => (
            <>
              {row.subject}
              {row.service && (
                <span className="block text-[0.82rem] text-muted">
                  {row.service}
                </span>
              )}
            </>
          ),
        },
        {
          key: "status",
          label: "Status",
          render: (row) => <StatusBadge kind="enquiry" status={row.status} />,
        },
      ]}
    />
  );
}
