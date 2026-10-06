import type { Metadata } from "next";
import { Card } from "@/components/admin/Card";
import { EmptyState } from "@/components/admin/EmptyState";
import { NoAccess } from "@/components/admin/NoAccess";
import { PageHeader } from "@/components/admin/PageHeader";
import { adminCall, requireRole } from "@/lib/admin/session";
import { unwrap } from "@/lib/api/problem";
import { todayIn } from "@/lib/zonedTime";
import { ManualAppointmentForm } from "./ManualAppointmentForm";

export const metadata: Metadata = { title: "New appointment" };

// An appointment taken by phone or email (#78), under the same records and
// conflict rules as a website booking.
export default async function NewAppointmentPage() {
  if (!(await requireRole("booking_admin"))) return <NoAccess />;
  const [services, settings] = await adminCall((api) =>
    Promise.all([
      api.GET("/admin/services").then(unwrap),
      api.GET("/admin/settings").then(unwrap),
    ]),
  );
  // Only services visitors book or request; a paused one is shown but
  // cannot be chosen, because the API refuses it.
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
      formats: s.formats,
      durationMinutes: s.durationMinutes,
      paused: s.state === "paused",
    }));

  return (
    <>
      <PageHeader
        title="New appointment"
        description="For a booking made by phone or email. Only free times are offered."
        breadcrumb={[{ label: "Appointments", href: "/admin/appointments" }]}
      />
      {bookable.some((s) => !s.paused) ? (
        <Card className="max-w-[660px]">
          <ManualAppointmentForm
            services={bookable}
            timezone={settings.timezone}
            today={todayIn(settings.timezone)}
          />
        </Card>
      ) : (
        <EmptyState
          title="No bookable services."
          text="Resume or add a service first."
          action={{ label: "Open Services", href: "/admin/services" }}
        />
      )}
    </>
  );
}
