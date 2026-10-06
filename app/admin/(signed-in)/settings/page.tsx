import type { Metadata } from "next";
import { NoAccess } from "@/components/admin/NoAccess";
import { PageHeader } from "@/components/admin/PageHeader";
import { canUse } from "@/lib/admin/roles";
import { adminCall, requireRole } from "@/lib/admin/session";
import { unwrap } from "@/lib/api/problem";
import { PublicBookingSwitch } from "./PublicBookingSwitch";
import { SettingsSection } from "./SettingsSection";

export const metadata: Metadata = { title: "Settings" };

// Booking settings (#76). Every value is a row with a provisional default
// (data-model.md), shown as such until Daw Mi confirms it. Practice keys
// belong to the site administrator, so only that role sees them.
export default async function SettingsPage() {
  const user = await requireRole("booking_admin");
  if (!user) return <NoAccess />;
  const settings = await adminCall(async (api) =>
    unwrap(await api.GET("/admin/settings")),
  );
  const siteAdmin = canUse(user.roles, ["site_admin"]);
  const timezones = [
    settings.timezone,
    ...Intl.supportedValuesOf("timeZone").filter(
      (z) => z !== settings.timezone,
    ),
  ];

  return (
    <>
      <PageHeader
        title="Settings"
        description="Booking rules and wording. Each section saves on its own."
      />
      <div className="flex flex-col gap-8">
        <PublicBookingSwitch enabled={settings.publicBookingEnabled} />
        <SettingsSection id="rules" values={settings} />
        <SettingsSection id="cancellation" values={settings} />
        <SettingsSection id="sessions" values={settings} />
        <SettingsSection id="payment" values={settings} />
        {siteAdmin && (
          <SettingsSection
            id="practice"
            values={settings}
            timezones={timezones}
          />
        )}
      </div>
    </>
  );
}
