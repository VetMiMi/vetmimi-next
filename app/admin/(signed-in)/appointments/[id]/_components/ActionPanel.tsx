"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/admin/Button";
import { Checkbox } from "@/components/admin/Checkbox";
import { Dialog } from "@/components/admin/Dialog";
import { Notice } from "@/components/admin/Notice";
import { Textarea } from "@/components/admin/Textarea";
import { useToast } from "@/components/admin/Toast";
import { clockWithZone, formatNames, longDay } from "@/lib/admin/appointments";
import type { components } from "@/lib/api/schema";
import { localDateKey } from "@/lib/time";
import { changeStatus, type StatusAction } from "../../actions";

type Detail = components["schemas"]["AppointmentDetail"];

type Step = {
  label: string;
  title: string;
  body: string;
  keep: string;
  verb: string;
  busy: string;
  success: string;
  message?: boolean;
  notify?: boolean;
};

// Booking UX §13, §14 and §30: the title names the action, the body says
// what happens and what is kept, the safe choice comes first.
const steps: Record<StatusAction, Step> = {
  confirm: {
    label: "Confirm",
    title: "Confirm this appointment?",
    body: "The visitor will be emailed a confirmation.",
    keep: "Not yet",
    verb: "Confirm appointment",
    busy: "Confirming…",
    success: "Appointment confirmed",
  },
  decline: {
    label: "Decline",
    title: "Decline this request?",
    body: "The visitor will be told the request was not confirmed. The request stays in history.",
    keep: "Keep request",
    verb: "Decline request",
    busy: "Declining…",
    success: "Request declined",
    message: true,
  },
  cancel: {
    label: "Cancel appointment",
    title: "Cancel this appointment?",
    body: "The visitor will be notified. The appointment stays in history and the time becomes available again.",
    keep: "Keep appointment",
    verb: "Cancel appointment",
    busy: "Cancelling…",
    success: "Appointment cancelled",
    message: true,
    notify: true,
  },
  complete: {
    label: "Mark completed",
    title: "Mark as completed?",
    body: "This is an operational status only. The visitor is not emailed.",
    keep: "Not yet",
    verb: "Mark as completed",
    busy: "Saving…",
    success: "Marked as completed",
  },
  no_show: {
    label: "Mark no-show",
    title: "Mark as no-show?",
    body: "This is an operational status only. The visitor is not emailed.",
    keep: "Not yet",
    verb: "Mark as no-show",
    busy: "Saving…",
    success: "Marked as no-show",
  },
};

const order: StatusAction[] = [
  "confirm",
  "decline",
  "cancel",
  "complete",
  "no_show",
];
const NOT_STARTED = "This appointment has not started yet.";

// Buttons only for the actions the API allows now (#68); Reschedule opens
// its own page (#69).
export function ActionPanel({
  appointment: a,
  serviceName,
  now,
}: {
  appointment: Detail;
  serviceName: string;
  now: string;
}) {
  const [action, setAction] = useState<StatusAction>("confirm");
  const [open, setOpen] = useState(false);
  // A new key per opening empties the message from last time.
  const [opening, setOpening] = useState(0);
  const [error, setError] = useState<string>();
  const [stale, setStale] = useState(false);
  const [pending, startTransition] = useTransition();
  const sending = useRef(false);
  const form = useRef<HTMLFormElement>(null);
  const toast = useToast();
  const router = useRouter();
  const started = a.startsAt <= now;

  function show(next: StatusAction) {
    setAction(next);
    setOpening((n) => n + 1);
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setError(undefined);
    setStale(false);
  }

  function send(action: StatusAction) {
    // A second click while the first is on its way sends nothing (§30).
    if (sending.current) return;
    sending.current = true;
    const data = new FormData(form.current ?? undefined);
    startTransition(async () => {
      const outcome = await changeStatus(a.id, action, {
        version: a.version,
        messageToVisitor: String(data.get("messageToVisitor") ?? ""),
        notifyVisitor: steps[action].notify
          ? data.get("notifyVisitor") !== null
          : undefined,
      });
      sending.current = false;
      if (outcome.ok) {
        close();
        toast(steps[action].success);
        return;
      }
      const early =
        outcome.code === "invalid_transition" &&
        (action === "complete" || action === "no_show") &&
        !started;
      setError(early ? NOT_STARTED : outcome.message);
      setStale(
        outcome.code === "stale_version" ||
          outcome.code === "invalid_transition",
      );
    });
  }

  const allowed = order.filter((x) => a.allowedActions.includes(x));
  const step = steps[action];

  return (
    <div className="flex flex-col items-stretch gap-3">
      {allowed.map((x) => (
        <Button
          key={x}
          variant={x === "confirm" ? "primary" : "secondary"}
          disabled={(x === "complete" || x === "no_show") && !started}
          onClick={() => show(x)}
        >
          {steps[x].label}
        </Button>
      ))}
      {a.allowedActions.includes("reschedule") && (
        <Button
          href={`/admin/appointments/${a.id}/reschedule`}
          variant="secondary"
        >
          Reschedule
        </Button>
      )}
      {allowed.some((x) => x === "complete" || x === "no_show") && !started && (
        <p className="text-[0.88rem] text-muted">
          Completed and no-show can be marked once the session has started.
        </p>
      )}
      <Button
        href={`mailto:${a.visitorEmail}`}
        variant="quiet"
        className="self-start"
      >
        Contact visitor
      </Button>

      <Dialog
        open={open}
        onClose={close}
        title={step.title}
        cancelLabel={step.keep}
        confirmLabel={step.verb}
        busyLabel={step.busy}
        busy={pending}
        onConfirm={() => send(action)}
      >
        {error && (
          <div className="mb-4 flex flex-col gap-3">
            <Notice tone="error">{error}</Notice>
            {stale && (
              <Button
                variant="secondary"
                className="self-start"
                onClick={() => {
                  close();
                  router.refresh();
                }}
              >
                Refresh
              </Button>
            )}
          </div>
        )}
        {action === "confirm" && (
          <dl className="mb-4 grid grid-cols-[100px_1fr] gap-x-4 gap-y-1 text-ink">
            <dt className="text-muted">Service</dt>
            <dd>{serviceName}</dd>
            <dt className="text-muted">Date</dt>
            <dd>{longDay(localDateKey(a.startsAt, a.timezone))}</dd>
            <dt className="text-muted">Time</dt>
            <dd>{clockWithZone(a.startsAt, a.timezone)}</dd>
            <dt className="text-muted">Format</dt>
            <dd>{formatNames[a.format]}</dd>
          </dl>
        )}
        <p>{step.body}</p>
        {/* Extra answers for the request; #84 adds the meeting link here. */}
        <form key={opening} ref={form} onSubmit={(e) => e.preventDefault()}>
          {step.message && (
            <div className="mt-5 text-ink">
              <Textarea
                label="Message to the visitor"
                name="messageToVisitor"
                help="Sent to the visitor — do not include private reasons."
                maxLength={1000}
                rows={4}
              />
            </div>
          )}
          {step.notify && (
            <div className="mt-2 text-ink">
              <Checkbox
                label="Notify the visitor by email"
                name="notifyVisitor"
                defaultChecked
              />
            </div>
          )}
        </form>
      </Dialog>
    </div>
  );
}
