import { requireRole } from "@/lib/admin/session";
import { EmptyState } from "./EmptyState";
import { navItem } from "./nav";
import { NoAccess } from "./NoAccess";
import { PageHeader } from "./PageHeader";

// Stands in for a section whose page is not built yet, so the navigation
// never leads to a 404. Each area's issue replaces its page.
export async function ComingSoon({ href }: { href: string }) {
  const { label, roles } = navItem(href);
  if (!(await requireRole(...roles))) return <NoAccess />;
  return (
    <>
      <PageHeader title={label} />
      <EmptyState
        title="Coming soon."
        text={`${label} will be managed here. This page is still being built.`}
        shape="oval"
        action={{ label: "Go to the dashboard", href: "/admin" }}
      />
    </>
  );
}
