"use client";

import { Button } from "@/components/admin/Button";
import { Notice } from "@/components/admin/Notice";

export default function EmailsError({ retry }: { retry: () => void }) {
  return (
    <div className="flex max-w-[660px] flex-col gap-6">
      <h1 className="text-[clamp(1.6rem,3vw,2.2rem)]">Emails</h1>
      <Notice tone="error">
        The emails could not be loaded. Nothing has changed.
      </Notice>
      <div>
        <Button onClick={retry}>Retry</Button>
      </div>
    </div>
  );
}
