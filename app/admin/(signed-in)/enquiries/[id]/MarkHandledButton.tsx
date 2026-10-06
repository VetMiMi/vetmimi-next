"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/admin/Button";
import { Notice } from "@/components/admin/Notice";
import { markHandled } from "../actions";

// Marking handled is not destructive and can be seen at once on the page,
// so it runs without a dialog (Booking UX §30); the page re-renders with
// the "Handled on" line.
export function MarkHandledButton({ id }: { id: string }) {
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function mark() {
    startTransition(async () => {
      const outcome = await markHandled(id);
      setError(outcome.ok ? undefined : outcome.message);
    });
  }

  return (
    <div className="flex flex-col items-start gap-4">
      {error && <Notice tone="error">{error}</Notice>}
      <Button busy={pending} onClick={mark}>
        {pending ? "Saving…" : "Mark as handled"}
      </Button>
    </div>
  );
}
