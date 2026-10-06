"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/admin/Button";
import { DataTable } from "@/components/admin/DataTable";
import { Notice } from "@/components/admin/Notice";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { kindNames, whenShort } from "@/lib/admin/posts";
import { morePosts } from "../actions";
import type { PostRow } from "../rows";
import { ChannelBadges } from "./ChannelBadge";

// Posts, newest first, with "Show more": each page is appended; the API
// gives no total, so none is shown.
export function PostList({
  params,
  first,
  empty,
}: {
  params: Record<string, string | string[] | undefined>;
  first: { items: PostRow[]; nextCursor?: string };
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
        const page = await morePosts(params, cursor);
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
      <DataTable
        caption="Posts"
        rows={rows}
        rowHref={(row) => `/admin/posts/${row.id}`}
        empty={empty}
        columns={[
          { key: "title", label: "Title", render: (row) => row.title },
          {
            key: "status",
            label: "Status",
            render: (row) => (
              <StatusBadge
                kind="post"
                status={row.status}
                detail={
                  row.status === "scheduled" && row.scheduledAt
                    ? whenShort(row.scheduledAt)
                    : undefined
                }
              />
            ),
          },
          { key: "kind", label: "Kind", render: (row) => kindNames[row.kind] },
          {
            key: "channels",
            label: "Channels",
            render: (row) => <ChannelBadges channels={row.channels} />,
          },
          {
            key: "updated",
            label: "Updated",
            render: (row) => (
              <span className="whitespace-nowrap">
                {whenShort(row.updatedAt)}
              </span>
            ),
          },
        ]}
      />
      {failed && (
        <Notice tone="error">
          The next posts could not be loaded. The list above is unchanged.
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
