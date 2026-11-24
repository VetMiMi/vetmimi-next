import type { Metadata } from "next";
import { PauseCircle } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/admin/Button";
import { Card } from "@/components/admin/Card";
import { EmptyState } from "@/components/admin/EmptyState";
import { PageHeader } from "@/components/admin/PageHeader";
import { listHref } from "@/lib/admin/appointments";
import { canUse } from "@/lib/admin/roles";
import { adminCall, requireUser } from "@/lib/admin/session";
import type { Settings } from "@/lib/api/types/admin";
import type {
  AppointmentSummary,
  BookingDashboard,
} from "@/lib/api/types/appointments";
import type {
  AvailabilityList,
  AvailabilityRule,
} from "@/lib/api/types/booking";
import { todayIn, zoneLabel } from "@/lib/zonedTime";
import { AppointmentsTable } from "../appointments/_components/AppointmentsTable";
import { AttentionList } from "./_components/AttentionList";

export const metadata: Metadata = { title: "Dashboard" };

// Counts and lists change with every request and decision.
export const dynamic = "force-dynamic";

const ROWS = 10;

function Section({
  id,
  title,
  viewAll,
  children,
}: {
  id: string;
  title: string;
  viewAll?: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={`${id}-title`}>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-6">
        <h2 id={`${id}-title`} className="text-[1.35rem]">
          {title}
        </h2>
        {viewAll && (
          <Button href={viewAll} variant="quiet">
            View all<span className="sr-only"> {title.toLowerCase()}</span>
          </Button>
        )}
      </div>
      {children}
    </section>
  );
}

// Content editors land here too: they get a pointer to Posts, no booking data.
export default async function DashboardPage() {
  const user = await requireUser();
  if (!canUse(user.roles, ["booking_admin"])) {
    return (
      <>
        <PageHeader
          title="Dashboard"
          description={`Hello, ${user.displayName}.`}
        />
        <EmptyState
          title="Your work is in Posts."
          text="Write, review and schedule posts there. Appointments are only shown to accounts that manage bookings."
          shape="oval"
          action={{ label: "Go to Posts", href: "/admin/posts" }}
        />
      </>
    );
  }

  const [dashboard, settings, rules] = await adminCall((api) =>
    Promise.all([
      api.get<BookingDashboard>("/admin/dashboard"),
      api.get<Settings>("/admin/settings"),
      api.get<AvailabilityList<AvailabilityRule>>("/admin/availability/rules"),
    ]),
  );
  const { timezone, counts } = dashboard;
  const today = todayIn(timezone);
  const now = new Date().toISOString();
  const table = (
    caption: string,
    rows: AppointmentSummary[],
    empty: React.ReactNode,
  ) => (
    <AppointmentsTable
      caption={caption}
      rows={rows.slice(0, ROWS)}
      timezone={timezone}
      now={now}
      empty={empty}
    />
  );
  const tiles = [
    ["Pending", counts.pending],
    ["Confirmed", counts.confirmed],
    ["Today", counts.today],
    ["This week", counts.thisWeek],
  ] as const;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`Hello, ${user.displayName}. Times are ${zoneLabel(timezone)}.`}
      />
      <div className="flex flex-col gap-10">
        {settings.publicBookingEnabled === false && (
          <div className="flex flex-col items-start gap-x-6 gap-y-2 rounded-notice border border-card-border bg-paper px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-2 text-[0.95rem]">
              <PauseCircle
                aria-hidden="true"
                size={20}
                className="mt-[3px] shrink-0 text-gold-text"
              />
              Public booking is paused. Visitors cannot request appointments.
            </p>
            <Button href="/admin/settings" variant="quiet">
              Go to Settings
            </Button>
          </div>
        )}

        <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {tiles.map(([label, value]) => (
            <div
              key={label}
              className="rounded-card border border-card-border bg-raised px-5 py-4"
            >
              <dt className="text-[0.88rem] text-muted">{label}</dt>
              <dd className="mt-1 text-[clamp(1.6rem,2.4vw,2rem)] leading-tight font-semibold tabular-nums">
                {value}
              </dd>
            </div>
          ))}
        </dl>

        <Section id="attention" title="Attention required">
          <AttentionList dashboard={dashboard} today={today} />
        </Section>

        <Section
          id="pending"
          title="Pending requests"
          viewAll={
            dashboard.pending.length > 0
              ? listHref({ view: "pending", status: [] })
              : undefined
          }
        >
          {table(
            "Pending requests",
            dashboard.pending,
            <EmptyState
              title="No pending requests."
              headingLevel={3}
              action={{
                label: "View upcoming appointments",
                href: "/admin/appointments",
              }}
            />,
          )}
        </Section>

        <Section
          id="today"
          title="Today"
          viewAll={
            dashboard.today.length > 0
              ? listHref({
                  view: "all",
                  status: ["pending", "confirmed"],
                  from: today,
                  to: today,
                })
              : undefined
          }
        >
          {table(
            "Today's appointments",
            dashboard.today,
            <EmptyState title="Nothing booked today." headingLevel={3} />,
          )}
        </Section>

        <Section
          id="upcoming"
          title="Upcoming"
          viewAll={
            dashboard.upcoming.length > 0
              ? listHref({ view: "upcoming", status: [] })
              : undefined
          }
        >
          {table(
            "Upcoming appointments",
            dashboard.upcoming,
            <EmptyState
              title="No upcoming appointments."
              text="Check that availability is open so visitors can book."
              headingLevel={3}
              action={{
                label:
                  rules.items.length === 0
                    ? "Add weekly hours"
                    : "Preview availability",
                href: "/admin/availability",
              }}
            />,
          )}
        </Section>

        <Card as="section" className="flex flex-col items-start gap-3">
          <h2 className="text-[1.35rem]">Availability</h2>
          <p className="max-w-[56ch] text-[0.95rem] text-muted">
            Your weekly hours, days off and blocked time, and the times visitors
            can choose.
          </p>
          <Button href="/admin/availability" variant="secondary">
            Open availability
          </Button>
        </Card>
      </div>
    </>
  );
}
