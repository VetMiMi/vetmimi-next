"use client";

import { Button } from "@/components/admin/Button";
import { Notice } from "@/components/admin/Notice";

// What an appointments page shows when its data could not be loaded: the
// shell stays, the sentence says nothing changed, Retry asks again.
export function LoadError({
  title,
  message,
  retry,
}: {
  title: string;
  message: string;
  retry: () => void;
}) {
  return (
    <div className="flex max-w-[660px] flex-col gap-6">
      <h1 className="text-[clamp(1.6rem,3vw,2.2rem)]">{title}</h1>
      <Notice tone="error">{message}</Notice>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Button onClick={retry}>Retry</Button>
        <Button href="/admin/appointments" variant="quiet">
          Back to appointments
        </Button>
      </div>
    </div>
  );
}
