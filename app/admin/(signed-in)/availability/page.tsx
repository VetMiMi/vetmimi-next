import type { Metadata } from "next";
import { NoAccess } from "@/components/admin/NoAccess";
import { adminCall, requireRole } from "@/lib/admin/session";
import { unwrap } from "@/lib/api/problem";
import { AvailabilityHeader } from "./AvailabilityHeader";
import { WeeklySchedule } from "./WeeklySchedule";

export const metadata: Metadata = { title: "Availability" };

// Weekly hours (#71): wall-clock periods per weekday, so a timezone change
// in settings reinterprets them rather than moving them.
export default async function AvailabilityPage() {
  if (!(await requireRole("booking_admin"))) return <NoAccess />;
  const { timezone, items } = await adminCall(async (api) =>
    unwrap(await api.GET("/admin/availability/rules")),
  );
  return (
    <>
      <AvailabilityHeader timezone={timezone} active="weekly" />
      <WeeklySchedule rules={items} />
    </>
  );
}
