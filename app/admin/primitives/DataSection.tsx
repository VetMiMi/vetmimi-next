import { DataTable, type Column } from "@/components/admin/DataTable";
import { EmptyState } from "@/components/admin/EmptyState";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Tabs } from "@/components/admin/Tabs";
import type { components } from "@/lib/api/schema";
import { Group, State } from "./FormSection";

// Made-up people (AGENTS.md Secrets).
type Row = {
  id: string;
  name: string;
  service: string;
  when: string;
  status: components["schemas"]["AppointmentStatus"];
};

const rows: Row[] = [
  {
    id: "a1",
    name: "Aung Aung",
    service: "Individual art therapy",
    when: "Tue 13 Oct, 10:00 am",
    status: "pending",
  },
  {
    id: "a2",
    name: "Hnin Wai Phyo Thandar Kyaw Zin Mar Lwin Oo Khaing Nwe Ni Aye",
    service: "Online art therapy session",
    when: "Wed 14 Oct, 2:00 pm",
    status: "confirmed",
  },
  {
    id: "a3",
    name: "Sam Taylor",
    service: "Family art session",
    when: "Fri 16 Oct, 11:30 am",
    status: "cancelled_by_client",
  },
];

const columns: Column<Row>[] = [
  { key: "name", label: "Visitor", render: (row) => row.name },
  { key: "service", label: "Service", render: (row) => row.service },
  { key: "when", label: "When", render: (row) => row.when },
  {
    key: "status",
    label: "Status",
    render: (row) => <StatusBadge kind="appointment" status={row.status} />,
  },
];

const tabs = [
  { id: "pending", label: "Pending", href: "/admin/primitives", count: 1 },
  {
    id: "upcoming",
    label: "Upcoming",
    href: "/admin/primitives?tab=upcoming",
    count: 2,
  },
  { id: "past", label: "Past", href: "/admin/primitives?tab=past" },
  { id: "all", label: "All", href: "/admin/primitives?tab=all", count: 3 },
];

export function DataSection() {
  const href = (row: Row) => `/admin/appointments/${row.id}`;
  return (
    <Group id="data" title="Tables, cards and tabs">
      <div className="flex flex-col gap-10">
        <State name="Tabs: Pending current, with counts">
          <Tabs label="Appointment filters" items={tabs} active="pending" />
        </State>
        <State name="DataTable: a table from 768px, cards below">
          <DataTable
            caption="Pending appointment requests"
            columns={columns}
            rows={rows}
            rowHref={href}
            empty={null}
          />
        </State>
        <State name="DataTable: no rows">
          <DataTable
            caption="Cancelled appointments"
            columns={columns}
            rows={[]}
            rowHref={href}
            empty={
              <EmptyState
                headingLevel={3}
                title="No cancelled appointments."
                text="Appointments that are cancelled will be listed here."
              />
            }
          />
        </State>
      </div>
    </Group>
  );
}
