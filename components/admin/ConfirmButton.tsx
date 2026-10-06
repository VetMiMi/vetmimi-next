"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Outcome } from "@/lib/admin/mutation";
import { Button } from "./Button";
import { Dialog } from "./Dialog";
import { Notice } from "./Notice";
import { useToast } from "./Toast";

// A button that asks first (Booking UX §30), then runs a Server Function.
// Success closes the dialog with a toast (and moves on to `then`, if
// given); a failure stays in the dialog, saying what remains active.
export function ConfirmButton({
  label,
  variant = "secondary",
  title,
  body,
  confirmLabel,
  busyLabel,
  cancelLabel,
  action,
  success,
  then,
}: {
  label: string;
  variant?: "secondary" | "quiet" | "danger";
  title: string;
  body: string;
  confirmLabel: string;
  busyLabel: string;
  cancelLabel?: string;
  action: () => Promise<Outcome<unknown>>;
  success: string;
  then?: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const router = useRouter();

  function close() {
    setOpen(false);
    setError(undefined);
  }

  function confirm() {
    startTransition(async () => {
      const outcome = await action();
      if (!outcome.ok) {
        setError(outcome.message);
        return;
      }
      close();
      toast(success);
      if (then) router.push(then);
    });
  }

  return (
    <>
      <Button variant={variant} onClick={() => setOpen(true)}>
        {label}
      </Button>
      <Dialog
        open={open}
        onClose={close}
        title={title}
        confirmLabel={confirmLabel}
        busyLabel={busyLabel}
        cancelLabel={cancelLabel}
        busy={pending}
        onConfirm={confirm}
      >
        {error && (
          <div className="mb-4">
            <Notice tone="error">{error}</Notice>
          </div>
        )}
        <p>{body}</p>
      </Dialog>
    </>
  );
}
