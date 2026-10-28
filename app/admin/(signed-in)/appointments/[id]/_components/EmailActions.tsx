"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/admin/Button";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Dialog } from "@/components/admin/Dialog";
import { Notice } from "@/components/admin/Notice";
import { Textarea } from "@/components/admin/Textarea";
import { useToast } from "@/components/admin/Toast";
import type { Communication } from "@/lib/api/types/appointments";
import { markCommunicated, resendEmail } from "../../actions";

const MAX = 500;

// Send an email again, or record that Daw Mi told the visitor another way.
// Either one clears a failed email from "Needs attention".
export function EmailActions({
  appointmentId,
  email,
  name,
}: {
  appointmentId: string;
  email: Communication;
  name: string;
}) {
  const canResend =
    email.channel === "email" &&
    (email.status === "sent" || email.status === "failed");
  const canMark = email.audience === "visitor" && email.status === "failed";
  if (!canResend && !canMark) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {canResend && (
        <ConfirmButton
          label="Send again"
          variant="quiet"
          title="Send this email again?"
          body={`A new copy of “${name}” goes to ${email.audience === "visitor" ? "the visitor's current email address" : "you"}. The earlier one stays in the list.`}
          confirmLabel="Send again"
          busyLabel="Sending…"
          action={() => resendEmail(appointmentId, email.id)}
          success="Email queued to send again"
        />
      )}
      {canMark && (
        <MarkTold appointmentId={appointmentId} email={email} name={name} />
      )}
    </div>
  );
}

function MarkTold({
  appointmentId,
  email,
  name,
}: {
  appointmentId: string;
  email: Communication;
  name: string;
}) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  function close() {
    setOpen(false);
    setError(undefined);
  }

  function save() {
    if (note.trim() === "") {
      setError("Say how you told them, for example “Phoned her”.");
      return;
    }
    startTransition(async () => {
      const outcome = await markCommunicated(appointmentId, email.kind, note);
      if (!outcome.ok) {
        setError(outcome.message);
        return;
      }
      close();
      setNote("");
      toast("Recorded");
    });
  }

  return (
    <>
      <Button variant="quiet" onClick={() => setOpen(true)}>
        Mark as told
      </Button>
      <Dialog
        open={open}
        onClose={close}
        title={`Told them about “${name}”?`}
        confirmLabel="Record it"
        busyLabel="Saving…"
        cancelLabel="Cancel"
        busy={pending}
        onConfirm={save}
      >
        {error && (
          <div className="mb-4">
            <Notice tone="error">{error}</Notice>
          </div>
        )}
        <Textarea
          label="How you told them"
          name="note"
          help="Private — never sent to the visitor."
          maxLength={MAX}
          rows={3}
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </Dialog>
    </>
  );
}
