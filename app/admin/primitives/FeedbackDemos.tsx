"use client";

import { useState } from "react";
import { Button } from "@/components/admin/Button";
import { Dialog } from "@/components/admin/Dialog";
import { useToast } from "@/components/admin/Toast";

// The dialog as a decline would use it: confirming shows the busy state
// for a moment, then closes.
export function DialogDemo() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const confirm = () => {
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setOpen(false);
    }, 1200);
  };
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Decline request…
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Decline this request?"
        confirmLabel="Decline request"
        busyLabel="Declining…"
        onConfirm={confirm}
        busy={busy}
      >
        <p>
          Aung Aung will be told the time is not available. The request stays in
          history as Declined.
        </p>
      </Dialog>
    </>
  );
}

export function ToastDemo() {
  const toast = useToast();
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-3">
      <Button variant="secondary" onClick={() => toast("Availability saved.")}>
        Show a success toast
      </Button>
      <Button
        variant="secondary"
        onClick={() => toast("The confirmation email is on its way.", "info")}
      >
        Show an info toast
      </Button>
    </div>
  );
}
