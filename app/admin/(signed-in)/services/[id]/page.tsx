import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card } from "@/components/admin/Card";
import { NoAccess } from "@/components/admin/NoAccess";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { adminCall, requireRole } from "@/lib/admin/session";
import { ApiError, unwrap } from "@/lib/api/problem";
import { ServiceForm } from "../ServiceForm";
import { serviceName } from "../serviceText";
import { ServiceStateButton } from "../ServiceStateButton";

export const metadata: Metadata = { title: "Change service" };

export default async function ServicePage({
  params,
}: PageProps<"/admin/services/[id]">) {
  if (!(await requireRole("booking_admin"))) return <NoAccess />;
  const { id } = await params;
  const service = await adminCall(async (api) =>
    unwrap(
      await api.GET("/admin/services/{serviceId}", {
        params: { path: { serviceId: id } },
      }),
    ),
  ).catch((error) => {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  });

  return (
    <>
      <PageHeader
        title={serviceName(service)}
        breadcrumb={[{ label: "Services", href: "/admin/services" }]}
      />
      <div className="mb-8 flex flex-wrap items-center gap-x-5 gap-y-3">
        <StatusBadge kind="service" status={service.state} />
        <ServiceStateButton service={service} />
      </div>
      <Card className="max-w-[660px]">
        <ServiceForm service={service} />
      </Card>
    </>
  );
}
