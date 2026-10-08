import { PageHeader } from "@/components/admin/PageHeader";
import { Tabs } from "@/components/admin/Tabs";

const tabs = [
  { id: "booking", label: "Booking", href: "/admin/settings" },
  {
    id: "connections",
    label: "Connections",
    href: "/admin/settings/connections",
  },
];

const descriptions = {
  booking: "Booking rules and wording. Each section saves on its own.",
  connections:
    "The accounts the publishing portal posts to. Without a connection, posts to that platform use Copy & open.",
};

// The settings screens share a title and, for the site administrator (the
// only role with connections), the tabs between them.
export function SettingsHeader({
  active,
  withTabs,
}: {
  active: (typeof tabs)[number]["id"] & keyof typeof descriptions;
  withTabs: boolean;
}) {
  return (
    <>
      <PageHeader title="Settings" description={descriptions[active]} />
      {withTabs && (
        <div className="mb-8">
          <Tabs label="Settings" items={tabs} active={active} />
        </div>
      )}
    </>
  );
}
