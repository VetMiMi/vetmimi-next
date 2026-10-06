import type { Metadata } from "next";
import Form from "next/form";
import { Button } from "@/components/admin/Button";
import { EmptyState } from "@/components/admin/EmptyState";
import { controlClass, labelClass } from "@/components/admin/Field";
import { NoAccess } from "@/components/admin/NoAccess";
import { PageHeader } from "@/components/admin/PageHeader";
import { Tabs } from "@/components/admin/Tabs";
import {
  listHref,
  listQuery,
  parseFilters,
  toRow,
  views,
} from "@/lib/admin/enquiries";
import { adminCall, requireRole } from "@/lib/admin/session";
import { ApiError, unwrap } from "@/lib/api/problem";
import { EnquiryList } from "./_components/EnquiryList";

export const metadata: Metadata = { title: "Enquiries" };

// Contact enquiries (#77), newest first as the API sends them, New by
// default. Rows never carry the message beyond its first 80 characters.
export default async function EnquiriesPage({
  searchParams,
}: PageProps<"/admin/enquiries">) {
  if (!(await requireRole("booking_admin"))) return <NoAccess />;
  const params = await searchParams;
  const filters = parseFilters(params);

  const page = await adminCall(async (api) =>
    unwrap(
      await api.GET("/admin/contact-enquiries", {
        params: { query: listQuery(filters) },
      }),
    ),
  ).catch((error) => {
    // The API refused this user: the permission message, no data.
    if (error instanceof ApiError && error.status === 403) return null;
    throw error;
  });
  if (!page) return <NoAccess />;

  const empty = filters.q ? (
    <EmptyState
      title="Nothing matches your search."
      action={{
        label: "Clear search",
        href: listHref({ view: filters.view }),
      }}
    />
  ) : filters.view === "new" ? (
    <EmptyState
      title="No new enquiries."
      text="Enquiries sent from the Contact page arrive here and by email."
      shape="petal"
      action={{ label: "View handled", href: listHref({ view: "handled" }) }}
    />
  ) : (
    <EmptyState title="No enquiries here yet." />
  );

  return (
    <>
      <PageHeader
        title="Enquiries"
        description="Messages from the Contact page, newest first, in Sydney time."
      />
      <div className="mb-6">
        <Tabs
          label="Enquiry views"
          active={filters.view}
          items={views.map((view) => ({
            id: view.id,
            label: view.label,
            href: listHref({ ...filters, view: view.id }),
          }))}
        />
      </div>
      <Form action="/admin/enquiries" className="mb-10 max-w-[560px]">
        {filters.view !== "new" && (
          <input type="hidden" name="view" value={filters.view} />
        )}
        <label htmlFor="field-q" className={labelClass}>
          Search by name, email, organisation or reference
        </label>
        <div className="flex gap-3">
          <input
            id="field-q"
            name="q"
            type="search"
            defaultValue={filters.q}
            autoComplete="off"
            enterKeyHint="search"
            className={`${controlClass} min-w-0`}
          />
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </div>
      </Form>

      <EnquiryList
        // A new list for a new view or search: "Show more" starts again.
        key={listHref(filters)}
        params={params}
        first={{ items: page.items.map(toRow), nextCursor: page.nextCursor }}
        empty={empty}
      />
    </>
  );
}
