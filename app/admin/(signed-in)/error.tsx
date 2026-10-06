"use client";

import { Button } from "@/components/admin/Button";
import { Notice } from "@/components/admin/Notice";

// A page inside the shell failed: the shell stays, and the message says
// nothing was changed (brief §7 Errors). Never the error itself.
export default function PageError({ retry }: { retry: () => void }) {
  return (
    <div className="flex max-w-[660px] flex-col gap-6">
      <h1 className="text-[clamp(1.6rem,3vw,2.2rem)]">Something went wrong</h1>
      <Notice tone="error">
        This page could not be loaded. Nothing was changed.
      </Notice>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Button onClick={retry}>Try again</Button>
        <Button href="/admin" variant="quiet">
          Go to the dashboard
        </Button>
      </div>
    </div>
  );
}
