"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/admin/Button";
import { Notice } from "@/components/admin/Notice";
import { RadioCards } from "@/components/admin/RadioCards";
import { useToast } from "@/components/admin/Toast";
import type { MetaConnection } from "@/lib/admin/connections";
import { chooseMetaPage } from "./actions";

type Page = NonNullable<MetaConnection["pages"]>[number];

// After Facebook Login with more than one Page: the one to post to, with
// the Instagram account linked to it.
export function MetaPagePicker({ pages }: { pages: Page[] }) {
  const [pageId, setPageId] = useState(pages[0]?.id);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!pageId) return;
    startTransition(async () => {
      const outcome = await chooseMetaPage(pageId);
      if (outcome.ok) {
        setError(undefined);
        toast(
          outcome.data.instagramUsername
            ? "Facebook and Instagram connected"
            : "Facebook connected",
        );
      } else setError(outcome.message);
    });
  }

  if (pages.length === 0)
    return (
      <Notice tone="info">
        Facebook did not share any Pages. Connect again and tick your Page when
        Facebook asks which ones to share.
      </Notice>
    );

  return (
    <form onSubmit={submit} className="flex flex-col items-start gap-5">
      {error && (
        <div className="w-full">
          <Notice tone="error">{error}</Notice>
        </div>
      )}
      <div className="w-full">
        <RadioCards
          label="Facebook Page"
          name="pageId"
          value={pageId}
          onChange={setPageId}
          options={pages.map((page) => ({
            value: page.id,
            label: page.name,
            help: page.instagramUsername
              ? `Instagram: @${page.instagramUsername}`
              : "No Instagram Business account linked",
          }))}
        />
      </div>
      <Button type="submit" busy={pending}>
        {pending ? "Connecting…" : "Connect this Page"}
      </Button>
    </form>
  );
}
