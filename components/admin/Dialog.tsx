"use client";

import { useEffect, useId, useRef } from "react";
import { Button } from "./Button";

// A confirmation for an action that is hard to undo (Booking UX §30, brief
// §7 Dialogs). The native modal <dialog> traps focus, closes on Escape and
// gives focus back to the trigger; focus starts on the safe choice. The
// title names the action; the body says the consequence and what is kept.
export function Dialog({
  open,
  onClose,
  title,
  children,
  confirmLabel,
  busyLabel,
  onConfirm,
  busy = false,
  cancelLabel = "Keep it",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  confirmLabel: string;
  // Shown on the confirm button while `busy` ("Declining…").
  busyLabel?: string;
  onConfirm: () => void;
  busy?: boolean;
  cancelLabel?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const keep = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      keep.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      className="m-auto w-[min(560px,calc(100%-40px))] max-w-none rounded-card bg-white p-[clamp(24px,4vw,44px)] text-ink shadow-lifted backdrop:bg-ink/40"
    >
      <h2 id={titleId} className="mb-4 text-[1.35rem]">
        {title}
      </h2>
      <div className="text-[0.95rem] leading-[1.7] text-muted">{children}</div>
      <div className="mt-7 flex flex-wrap-reverse justify-end gap-x-5 gap-y-3">
        <Button ref={keep} variant="secondary" onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button variant="danger" busy={busy} onClick={onConfirm}>
          {busy && busyLabel ? busyLabel : confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
