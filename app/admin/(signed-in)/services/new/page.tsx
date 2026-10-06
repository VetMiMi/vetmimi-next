import type { Metadata } from "next";
import { Card } from "@/components/admin/Card";
import { NoAccess } from "@/components/admin/NoAccess";
import { PageHeader } from "@/components/admin/PageHeader";
import { requireRole } from "@/lib/admin/session";
import { ServiceForm } from "../ServiceForm";

export const metadata: Metadata = { title: "Add service" };

export default async function NewServicePage() {
  if (!(await requireRole("booking_admin"))) return <NoAccess />;
  return (
    <>
      <PageHeader
        title="Add service"
        breadcrumb={[{ label: "Services", href: "/admin/services" }]}
      />
      <Card className="max-w-[660px]">
        <ServiceForm />
      </Card>
    </>
  );
}
