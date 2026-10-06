"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/admin/Card";
import { Checkbox } from "@/components/admin/Checkbox";
import { Dialog } from "@/components/admin/Dialog";
import { Notice } from "@/components/admin/Notice";
import { useToast } from "@/components/admin/Toast";
import { updateSettings } from "./actions";

// Pausing public booking is an essential task on a phone (Booking UX §33)
// and needs a confirmation (§30); opening it again does not. Weekly hours,
// overrides, blocks and appointments are untouched either way (§19).
export function PublicBookingSwitch({ enabled }: { enabled: boolean }) {
  const [asking, setAsking] = useState(false);
  const [failure, setFailure] = useState<string>();
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  function set(open: boolean) {
    startTransition(async () => {
      const outcome = await updateSettings({ publicBookingEnabled: open });
      setAsking(false);
      setFailure(outcome.ok ? undefined : outcome.message);
      if (outcome.ok)
        toast(open ? "Public booking is open" : "Public booking paused");
    });
  }

  return (
    <Card as="section" className="max-w-[660px]">
      <h2 className="mb-4 text-[1.35rem]">Public booking</h2>
      {failure && (
        <div className="mb-4">
          <Notice tone="error">{failure}</Notice>
        </div>
      )}
      <Checkbox
        label="Public booking is open"
        name="publicBookingEnabled"
        checked={enabled}
        disabled={pending}
        help={
          enabled
            ? "Visitors can request appointments in the hours you set."
            : "Paused. Visitors see that booking is not available and are pointed to Contact."
        }
        onChange={(event) =>
          event.target.checked ? set(true) : setAsking(true)
        }
      />
      <Dialog
        open={asking}
        onClose={() => setAsking(false)}
        title="Pause public booking?"
        cancelLabel="Keep open"
        confirmLabel="Pause booking"
        busyLabel="Pausing…"
        busy={pending}
        onConfirm={() => set(false)}
      >
        <p>
          Visitors will see that booking is not available and will be pointed to
          Contact. Your weekly hours, overrides, blocks and all appointments
          stay as they are.
        </p>
      </Dialog>
    </Card>
  );
}
