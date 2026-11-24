"use server";

import { listQuery, parseView, toRow } from "@/lib/admin/emails";
import { adminCall } from "@/lib/admin/session";
import type { CommunicationListItem } from "@/lib/api/types/appointments";
import type { Page } from "@/lib/api/types/shared";

// "Show more": the next page of the same tab, as rows that carry no address.
export async function moreEmails(view: string, cursor: string) {
  const page = await adminCall((api) =>
    api.get<Page<CommunicationListItem>>(
      "/admin/communications",
      listQuery(parseView({ view }), cursor),
    ),
  );
  return { items: page.items.map(toRow), nextCursor: page.nextCursor };
}
