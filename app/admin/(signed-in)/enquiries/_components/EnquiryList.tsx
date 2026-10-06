"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/admin/Button";
import { Notice } from "@/components/admin/Notice";
import type { EnquiryRow } from "@/lib/admin/enquiries";
import { moreEnquiries } from "../actions";
import { EnquiriesTable } from "./EnquiriesTable";

// The list with "Show more": each page is appended; the API gives no
// total, so none is shown.
export function EnquiryList({
  params,
  first,
  empty,
}: {
  params: Record<string, string | string[] | undefined>;
  first: { items: EnquiryRow[]; nextCursor?: string };
  empty: React.ReactNode;
}) {
  const [rows, setRows] = useState(first.items);
  const [cursor, setCursor] = useState(first.nextCursor);
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();

  function more() {
    if (!cursor || pending) return;
    startTransition(async () => {
      try {
        const page = await moreEnquiries(params, cursor);
        setRows((list) => [...list, ...page.items]);
        setCursor(page.nextCursor);
        setFailed(false);
      } catch {
        setFailed(true);
      }
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <EnquiriesTable rows={rows} empty={empty} />
      {failed && (
        <Notice tone="error">
          The next enquiries could not be loaded. The list above is unchanged.
        </Notice>
      )}
      {cursor && (
        <div>
          <Button variant="secondary" busy={pending} onClick={more}>
            {pending ? "Loading…" : failed ? "Try again" : "Show more"}
          </Button>
        </div>
      )}
    </div>
  );
}
