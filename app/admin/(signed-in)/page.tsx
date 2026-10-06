import type { Metadata } from "next";
import { EmptyState } from "@/components/admin/EmptyState";
import { PageHeader } from "@/components/admin/PageHeader";
import { requireUser } from "@/lib/admin/session";

export const metadata: Metadata = { title: "Dashboard" };

// Placeholder until the booking dashboard (#64) replaces the body for
// booking roles.
export default async function DashboardPage() {
  const user = await requireUser();
  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`Hello, ${user.displayName}.`}
      />
      <EmptyState
        title="Nothing needs your attention yet."
        text="Appointments and content will appear here as they are added."
        shape="petal"
      />
    </>
  );
}
