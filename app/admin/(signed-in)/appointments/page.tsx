import type { Metadata } from "next";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/admin/Button";
import { EmptyState } from "@/components/admin/EmptyState";
import { NoAccess } from "@/components/admin/NoAccess";
import { PageHeader } from "@/components/admin/PageHeader";
import { Tabs } from "@/components/admin/Tabs";
import {
  hasFilters,
  listHref,
  listQuery,
  parseFilters,
  views,
} from "@/lib/admin/appointments";
import { adminCall, requireRole } from "@/lib/admin/session";
import { unwrap } from "@/lib/api/problem";
import { todayIn } from "@/lib/zonedTime";
import { AppointmentList } from "./_components/AppointmentList";
import { AppointmentsTable } from "./_components/AppointmentsTable";
import { AttentionPanel } from "./_components/AttentionPanel";
import { Filters } from "./_components/Filters";

export const metadata: Metadata = { title: "Appointments" };

// The appointments list (#65). With no dashboard yet, the default view
// leads with what needs Daw Mi: attention items, then pending requests,
// then today and what is coming up.
export default async function AppointmentsPage({
  searchParams,
}: PageProps<"/admin/appointments">) {
  if (!(await requireRole("booking_admin"))) return <NoAccess />;
  const params = await searchParams;
  const filters = parseFilters(params);
  const leading = filters.view === "upcoming" && !hasFilters(filters);

  const [dashboard, services] = await adminCall((api) =>
    Promise.all([
      api.GET("/admin/dashboard").then(unwrap),
      api.GET("/admin/services").then(unwrap),
    ]),
  );
  const { timezone } = dashboard;
  const list = await adminCall(async (api) =>
    unwrap(
      await api.GET("/admin/appointments", {
        params: { query: listQuery(filters, timezone) },
      }),
    ),
  );
  const now = new Date().toISOString();
  const pending = dashboard.pending;

  const empty = hasFilters(filters) ? (
    <EmptyState
      title="No appointments match these filters."
      action={{
        label: "Clear filters",
        href: listHref({ view: filters.view, status: [] }),
      }}
    />
  ) : filters.view === "upcoming" ? (
    <EmptyState
      title="No upcoming appointments."
      text="Check that availability is open so visitors can book."
      shape="petal"
      action={{ label: "Preview availability", href: "/admin/availability" }}
    />
  ) : (
    <EmptyState title="No appointments here yet." />
  );

  return (
    <>
      <PageHeader
        title="Appointments"
        description="Requests to answer, today's sessions and everything booked, in Sydney time."
        action={
          <Button
            href="/admin/appointments/new"
            size="page"
            icon={<Plus aria-hidden="true" size={18} />}
          >
            New appointment
          </Button>
        }
      />
      <div className="mb-6">
        <Tabs
          label="Appointment views"
          active={filters.view}
          items={views.map((view) => ({
            id: view.id,
            label: view.label,
            href: listHref({ ...filters, view: view.id }),
            count: view.id === "pending" ? dashboard.counts.pending : undefined,
          }))}
        />
      </div>
      <Filters
        filters={filters}
        services={services.items.map((s) => ({
          value: s.id,
          label: s.name.en ?? s.slug,
        }))}
      />

      {leading && (
        <>
          <AttentionPanel
            items={dashboard.attentionRequired}
            timezone={timezone}
          />
          {pending.length > 0 && (
            <section aria-labelledby="pending-title" className="mb-10">
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-6">
                <h2 id="pending-title" className="text-[1.35rem]">
                  Pending requests ({dashboard.counts.pending})
                </h2>
                {dashboard.counts.pending > pending.length && (
                  <Button
                    href={listHref({ view: "pending", status: [] })}
                    variant="quiet"
                  >
                    View all pending
                  </Button>
                )}
              </div>
              <AppointmentsTable
                caption="Pending requests"
                rows={pending}
                timezone={timezone}
                now={now}
                empty={null}
              />
            </section>
          )}
        </>
      )}

      <AppointmentList
        // A new list for new filters: "Show more" starts again.
        key={listHref(filters)}
        params={params}
        timezone={timezone}
        today={todayIn(timezone)}
        now={now}
        first={list}
        split={leading}
        empty={empty}
      />
    </>
  );
}
