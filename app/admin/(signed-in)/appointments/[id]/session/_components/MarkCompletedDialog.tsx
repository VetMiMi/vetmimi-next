"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/admin/Button";
import { Dialog } from "@/components/admin/Dialog";
import { Notice } from "@/components/admin/Notice";
import { useToast } from "@/components/admin/Toast";
import { changeStatus } from "../../../actions";

// The completed prompt after a session (#83, ADR-007): the appointment is
// completed only if Daw Mi says so. "Not now" goes back to the appointment,
// which still offers Complete and No-show.
export function MarkCompletedDialog({
  id,
  version,
  open,
}: {
  id: string;
  version: number;
  open: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const [stale, setStale] = useState(false);
  const sending = useRef(false);
  const detail = `/admin/appointments/${id}`;

  function complete() {
    if (sending.current) return;
    sending.current = true;
    setError(undefined);
    startTransition(async () => {
      const outcome = await changeStatus(id, "complete", { version });
      sending.current = false;
      if (outcome.ok) {
        toast("Marked as completed");
        router.push(detail);
        return;
      }
      setError(outcome.message);
      setStale(
        outcome.code === "stale_version" ||
          outcome.code === "invalid_transition",
      );
    });
  }

  return (
    <Dialog
      open={open}
      onClose={() => router.push(detail)}
      title="Mark this appointment as completed?"
      cancelLabel="Not now"
      confirmLabel="Mark as completed"
      busyLabel="Saving…"
      busy={pending}
      onConfirm={complete}
    >
      {error && (
        <div className="mb-4 flex flex-col gap-3">
          <Notice tone="error">{error}</Notice>
          {stale && (
            <Button
              variant="secondary"
              className="self-start"
              onClick={() => {
                setError(undefined);
                setStale(false);
                router.refresh();
              }}
            >
              Refresh
            </Button>
          )}
        </div>
      )}
      <p>
        This records that the session took place. Nothing is sent to the client.
      </p>
    </Dialog>
  );
}
