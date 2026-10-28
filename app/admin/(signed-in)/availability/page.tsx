import type { Metadata } from "next";
import { Card } from "@/components/admin/Card";
import { NoAccess } from "@/components/admin/NoAccess";
import { PageHeader } from "@/components/admin/PageHeader";
import { calendarDays, weekFromRules } from "@/lib/admin/availability";
import { adminCall, requireRole } from "@/lib/admin/session";
import type { Settings } from "@/lib/api/types/admin";
import type { AppointmentList } from "@/lib/api/types/appointments";
import type {
  AvailabilityBlock,
  AvailabilityList,
  AvailabilityOverride,
  AvailabilityRule,
  Service,
} from "@/lib/api/types/booking";
import type { Page } from "@/lib/api/types/shared";
import { addDays, lastDayOfMonth } from "@/lib/time";
import { todayIn, zoneLabel, zonedDayStart } from "@/lib/zonedTime";
import { ClientPreview } from "./ClientPreview";
import { DaysCalendar } from "./DaysCalendar";

export const metadata: Metadata = { title: "Availability" };

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

function Section({
  title,
  text,
  children,
}: {
  title: string;
  text: string;
  children: React.ReactNode;
}) {
  return (
    <Card as="section" className="mb-8">
      <h2 className="text-[1.35rem]">{title}</h2>
      <p className="mt-2 mb-6 max-w-[60ch] text-[0.95rem] text-muted">{text}</p>
      {children}
    </Card>
  );
}

// Weekly hours, the dates that differ from them, and what clients see as a
// result, on one page (#180).
export default async function AvailabilityPage({
  searchParams,
}: PageProps<"/admin/availability">) {
  if (!(await requireRole("booking_admin"))) return <NoAccess />;
  const settings = await adminCall((api) =>
    api.get<Settings>("/admin/settings"),
  );
  const { timezone } = settings;
  const today = todayIn(timezone);
  const asked = (await searchParams).month;
  const month =
    typeof asked === "string" && MONTH.test(asked) && asked > today.slice(0, 7)
      ? asked
      : today.slice(0, 7);
  const first = `${month}-01`;
  const last = lastDayOfMonth(month);

  const [rules, overrides, blocks, appointments, services] = await adminCall(
    (api) =>
      Promise.all([
        api.get<AvailabilityList<AvailabilityRule>>(
          "/admin/availability/rules",
        ),
        api.get<AvailabilityList<AvailabilityOverride>>(
          "/admin/availability/overrides",
          { from: first, to: last },
        ),
        api.get<AvailabilityList<AvailabilityBlock>>(
          "/admin/availability/blocks",
          { from: first, to: last },
        ),
        api.get<AppointmentList>("/admin/appointments", {
          view: "all",
          status: ["pending", "confirmed"],
          from: zonedDayStart(first, timezone),
          to: zonedDayStart(addDays(last, 1), timezone),
          limit: 100,
        }),
        api.get<Page<Service>>("/admin/services"),
      ]),
  );

  const week = weekFromRules(rules.items);
  const days = calendarDays(month, {
    timeZone: timezone,
    today,
    week,
    overrides: overrides.items,
    blocks: blocks.items,
    appointments: appointments.items,
  });
  const bookable = services.items
    .filter(
      (s) =>
        (s.bookingAction === "book" || s.bookingAction === "request") &&
        s.state !== "archived",
    )
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((s) => ({
      id: s.id,
      name: s.name.en ?? s.slug,
      paused: s.state === "paused",
    }));

  return (
    <>
      <PageHeader
        title="Availability"
        description={`When clients can book you. Times are ${zoneLabel(timezone)}.`}
      />
      <Section
        title="Your hours"
        text="Choose a date to set your hours for that date or for that weekday every week, or to take time off."
      >
        <DaysCalendar
          key={month}
          month={month}
          today={today}
          timezone={timezone}
          days={days}
          week={week}
        />
      </Section>
      <Section
        title="What clients see"
        text="The times a client can choose on the booking page, after your hours, days off, appointments and booking rules."
      >
        {bookable.length > 0 ? (
          <ClientPreview
            services={bookable}
            today={today}
            timezone={timezone}
            settings={{
              publicBookingEnabled: settings.publicBookingEnabled,
              maxAdvanceDays: settings.maxAdvanceDays,
              minNoticeHours: settings.minNoticeHours,
            }}
            days={days}
          />
        ) : (
          <p className="text-[0.95rem] text-muted">
            There is no bookable service yet. Add one in Services to see its
            times here.
          </p>
        )}
      </Section>
    </>
  );
}
