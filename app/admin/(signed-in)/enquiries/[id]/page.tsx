import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card } from "@/components/admin/Card";
import { NoAccess } from "@/components/admin/NoAccess";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { whenLong } from "@/lib/admin/appointments";
import {
  enquiryTypes,
  localeNames,
  PRACTICE_TIMEZONE,
  replyHref,
} from "@/lib/admin/enquiries";
import { adminCall, requireRole } from "@/lib/admin/session";
import { ApiError, unwrap } from "@/lib/api/problem";
import { zoneAbbreviation } from "@/lib/zonedTime";
import { MarkHandledButton } from "./MarkHandledButton";

export const metadata: Metadata = { title: "Enquiry" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const when = (instant: string) =>
  `${whenLong(instant, PRACTICE_TIMEZONE)} ${zoneAbbreviation(instant, PRACTICE_TIMEZONE)}`;

const linkClass =
  "underline underline-offset-4 break-all transition-colors duration-150 hover:text-indigo motion-reduce:transition-none";

// One enquiry (#77), the page Daw Mi's "new enquiry" email links to: who
// wrote, about what, the message as written, and Mark as handled.
export default async function EnquiryPage({
  params,
}: PageProps<"/admin/enquiries/[id]">) {
  if (!(await requireRole("booking_admin"))) return <NoAccess />;
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const e = await adminCall(async (api) =>
    unwrap(
      await api.GET("/admin/contact-enquiries/{enquiryId}", {
        params: { path: { enquiryId: id } },
      }),
    ),
  ).catch((error) => {
    if (error instanceof ApiError && error.status === 404) notFound();
    if (error instanceof ApiError && error.status === 403) return null;
    throw error;
  });
  if (!e) return <NoAccess />;

  const facts = [
    { label: "Received", value: when(e.createdAt) },
    { label: "Name", value: e.name },
    {
      label: "Email",
      value: (
        <a href={replyHref(e)} className={linkClass}>
          {e.email}
        </a>
      ),
    },
    ...(e.organisation
      ? [{ label: "Organisation", value: e.organisation }]
      : []),
    { label: "Type", value: enquiryTypes[e.enquiryType] },
    ...(e.service
      ? [
          {
            label: "Service",
            value: (
              <a href={`/services/${e.service.slug}`} className={linkClass}>
                {e.service.name.en ?? e.service.slug}
              </a>
            ),
          },
        ]
      : []),
    { label: "Language", value: localeNames[e.locale] },
    // The public form cannot be sent without the acknowledgement, so it
    // was given when the enquiry arrived.
    { label: "Privacy", value: `Acknowledged ${when(e.createdAt)}` },
  ];

  return (
    <>
      <PageHeader
        title={e.reference}
        description={e.subject?.trim() || enquiryTypes[e.enquiryType]}
        breadcrumb={[{ label: "Enquiries", href: "/admin/enquiries" }]}
      />
      <div className="-mt-4 mb-8">
        <StatusBadge kind="enquiry" status={e.status} />
      </div>

      <div className="flex max-w-[760px] flex-col gap-6">
        <Card as="section">
          <h2 className="mb-4 text-[1.35rem]">Message</h2>
          <blockquote className="rounded-notice bg-paper px-6 py-5 text-[0.98rem] leading-[1.7] break-words whitespace-pre-line">
            {e.message}
          </blockquote>
          <div className="mt-6">
            {e.status === "handled" ? (
              <p className="text-[0.95rem] text-muted">
                Handled on {when(e.handledAt ?? e.createdAt)}.
              </p>
            ) : (
              <MarkHandledButton id={e.id} />
            )}
          </div>
        </Card>

        <Card as="section">
          <h2 className="mb-2 text-[1.35rem]">Details</h2>
          <dl className="text-[0.95rem]">
            {facts.map((fact) => (
              <div
                key={fact.label}
                className="grid grid-cols-[120px_minmax(0,1fr)] gap-4 border-b border-divider py-3 last:border-b-0 last:pb-0"
              >
                <dt className="text-muted">{fact.label}</dt>
                <dd className="break-words">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>
    </>
  );
}
