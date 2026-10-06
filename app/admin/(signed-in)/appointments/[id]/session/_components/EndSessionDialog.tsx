"use client";

import { useRef, useState, useTransition } from "react";
import { Dialog } from "@/components/admin/Dialog";
import { Notice } from "@/components/admin/Notice";
import { endVideo } from "../../videoActions";

// "End this session?" on the stage (#83). Ended, or already ended by the
// window or another tab, the call is over either way: `onEnded` closes it.
// Any other failure keeps the call going and says so.
export function EndSessionDialog({
  id,
  open,
  onClose,
  onEnded,
}: {
  id: string;
  open: boolean;
  onClose: () => void;
  onEnded: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const sending = useRef(false);

  function end() {
    // A second click while the first is on its way sends nothing.
    if (sending.current) return;
    sending.current = true;
    setError(undefined);
    startTransition(async () => {
      const outcome = await endVideo(id);
      sending.current = false;
      if (outcome.ok || outcome.code === "invalid_transition") onEnded();
      else setError(outcome.message);
    });
  }

  return (
    <Dialog
      open={open}
      onClose={() => {
        setError(undefined);
        onClose();
      }}
      title="End this session?"
      cancelLabel="Keep going"
      confirmLabel="End session"
      busyLabel="Ending…"
      busy={pending}
      onConfirm={end}
    >
      {error && (
        <div className="mb-4">
          <Notice tone="error">{error}</Notice>
        </div>
      )}
      <p>
        Both of you will be disconnected. The appointment stays Confirmed until
        you mark it.
      </p>
    </Dialog>
  );
}
