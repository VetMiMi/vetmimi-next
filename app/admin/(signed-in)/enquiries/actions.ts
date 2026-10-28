"use server";

import { listQuery, parseFilters, toRow } from "@/lib/admin/enquiries";
import { mutate } from "@/lib/admin/mutation";
import { adminCall } from "@/lib/admin/session";
import { apiPath } from "@/lib/api/client";
import type { ContactEnquiry } from "@/lib/api/types/contact";
import type { Page } from "@/lib/api/types/shared";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// "Show more" (#77): the next page for the same view and search, as rows
// that carry no email and no message.
export async function moreEnquiries(
  params: Record<string, string | string[] | undefined>,
  cursor: string,
) {
  const page = await adminCall((api) =>
    api.get<Page<ContactEnquiry>>(
      "/admin/contact-enquiries",
      listQuery(parseFilters(params), cursor),
    ),
  );
  return { items: page.items.map(toRow), nextCursor: page.nextCursor };
}

// Not destructive, so no dialog (Booking UX §30).
export async function markHandled(id: string) {
  if (!UUID.test(id)) throw new Error("Bad enquiry id");
  return mutate(
    `/admin/enquiries/${id}`,
    (api) =>
      api.post<ContactEnquiry>(
        apiPath`/admin/contact-enquiries/${id}/mark-handled`,
      ),
    { failure: "The enquiry was not marked as handled. It is still New." },
  );
}
