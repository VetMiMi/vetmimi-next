"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/admin/Button";
import { Notice } from "@/components/admin/Notice";
import type { EmailRow, View } from "@/lib/admin/emails";
import { moreEmails } from "../actions";
import { EmailsTable } from "./EmailsTable";

// The list with "Show more": each page is appended; the API gives no
// total, so none is shown.
export function EmailList({
  view,
  first,
  empty,
}: {
  view: View;
  first: { items: EmailRow[]; nextCursor?: string };
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
        const page = await moreEmails(view, cursor);
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
      <EmailsTable rows={rows} empty={empty} />
      {failed && (
        <Notice tone="error">
          The next emails could not be loaded. The list above is unchanged.
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
