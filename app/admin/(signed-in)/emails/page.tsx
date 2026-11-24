import type { Metadata } from "next";
import { EmptyState } from "@/components/admin/EmptyState";
import { NoAccess } from "@/components/admin/NoAccess";
import { PageHeader } from "@/components/admin/PageHeader";
import { Tabs } from "@/components/admin/Tabs";
import {
  listHref,
  listQuery,
  parseView,
  toRow,
  views,
} from "@/lib/admin/emails";
import { adminCall, requireRole } from "@/lib/admin/session";
import { ApiError } from "@/lib/api/problem";
import type { CommunicationListItem } from "@/lib/api/types/appointments";
import type { Page } from "@/lib/api/types/shared";
import { EmailList } from "./_components/EmailList";

export const metadata: Metadata = { title: "Emails" };

// Every email about an appointment in one list, so Daw Mi can see what went
// out and what failed without opening each booking.
export default async function EmailsPage({
  searchParams,
}: PageProps<"/admin/emails">) {
  if (!(await requireRole("booking_admin"))) return <NoAccess />;
  const view = parseView(await searchParams);

  const page = await adminCall((api) =>
    api.get<Page<CommunicationListItem>>(
      "/admin/communications",
      listQuery(view),
    ),
  ).catch((error) => {
    // The API refused this user: the permission message, no data.
    if (error instanceof ApiError && error.status === 403) return null;
    throw error;
  });
  if (!page) return <NoAccess />;

  const title = views.find((v) => v.id === view)!.empty;
  const empty =
    view === "all" ? (
      <EmptyState
        title={title}
        text="Emails about appointments appear here as they are sent."
        shape="petal"
      />
    ) : (
      <EmptyState
        title={title}
        action={{ label: "View all emails", href: listHref("all") }}
      />
    );

  return (
    <>
      <PageHeader
        title="Emails"
        description="Every email about an appointment, latest first, in Sydney time."
      />
      <div className="mb-8">
        <Tabs
          label="Email views"
          active={view}
          items={views.map((v) => ({
            id: v.id,
            label: v.label,
            href: listHref(v.id),
          }))}
        />
      </div>

      <EmailList
        // A new list for a new tab: "Show more" starts again.
        key={view}
        view={view}
        first={{ items: page.items.map(toRow), nextCursor: page.nextCursor }}
        empty={empty}
      />
    </>
  );
}
