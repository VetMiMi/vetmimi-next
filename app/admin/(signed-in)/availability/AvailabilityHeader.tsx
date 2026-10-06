import { PageHeader } from "@/components/admin/PageHeader";
import { Tabs } from "@/components/admin/Tabs";
import { zoneLabel } from "@/lib/zonedTime";

const tabs = [
  { id: "weekly", label: "Weekly hours", href: "/admin/availability" },
  {
    id: "overrides",
    label: "Overrides",
    href: "/admin/availability/overrides",
  },
  { id: "blocks", label: "Blocked time", href: "/admin/availability/blocks" },
];

// The three availability screens share a title, the practice zone (from
// the API's list, so a changed timezone shows at once) and the tabs.
export function AvailabilityHeader({
  timezone,
  active,
  action,
}: {
  timezone: string;
  active: (typeof tabs)[number]["id"];
  action?: React.ReactNode;
}) {
  return (
    <>
      <PageHeader
        title="Availability"
        description={`When visitors can book. Times are ${zoneLabel(timezone)}.`}
        action={action}
      />
      <div className="mb-8">
        <Tabs label="Availability" items={tabs} active={active} />
      </div>
    </>
  );
}
