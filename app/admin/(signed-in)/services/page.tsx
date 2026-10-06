import type { Metadata } from "next";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/admin/Button";
import { DataTable } from "@/components/admin/DataTable";
import { EmptyState } from "@/components/admin/EmptyState";
import { NoAccess } from "@/components/admin/NoAccess";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { adminCall, requireRole } from "@/lib/admin/session";
import { unwrap } from "@/lib/api/problem";
import { bookingActions, formatNames, serviceName } from "./serviceText";
import { ServiceStateButton } from "./ServiceStateButton";

export const metadata: Metadata = { title: "Services" };

// Services and their scheduling facts (#75). The service pages' wording is
// edited under Content (ADR-008); this is how each one is booked.
export default async function ServicesPage() {
  if (!(await requireRole("booking_admin"))) return <NoAccess />;
  const { items } = await adminCall(async (api) =>
    unwrap(await api.GET("/admin/services")),
  );
  const services = [...items].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <>
      <PageHeader
        title="Services"
        description="How each service is booked: length, buffers and whether visitors can book it now."
        action={
          <Button
            href="/admin/services/new"
            size="page"
            icon={<Plus aria-hidden="true" size={18} />}
          >
            Add service
          </Button>
        }
      />
      <DataTable
        caption="Services"
        rows={services}
        rowHref={(service) => `/admin/services/${service.id}`}
        columns={[
          { key: "name", label: "Name", render: serviceName },
          {
            key: "action",
            label: "Booking",
            render: (service) => bookingActions[service.bookingAction],
          },
          {
            key: "duration",
            label: "Length",
            render: (service) =>
              service.durationMinutes ? `${service.durationMinutes} min` : "—",
          },
          {
            key: "buffers",
            label: "Buffers",
            render: (service) =>
              `${service.bufferBeforeMinutes} / ${service.bufferAfterMinutes} min`,
          },
          {
            key: "formats",
            label: "Formats",
            render: (service) =>
              service.formats.map((f) => formatNames[f]).join(", ") || "—",
          },
          {
            key: "state",
            label: "State",
            render: (service) => (
              <StatusBadge kind="service" status={service.state} />
            ),
          },
          {
            key: "pause",
            label: "Bookings",
            render: (service) => <ServiceStateButton service={service} />,
          },
        ]}
        empty={
          <EmptyState
            title="No services yet."
            text="Add a service so visitors have something to book."
            action={{ label: "Add service", href: "/admin/services/new" }}
          />
        }
      />
    </>
  );
}
