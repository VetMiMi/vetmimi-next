"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SlotPicker } from "@/components/booking/SlotPicker";
import { Button } from "@/components/admin/Button";
import { Checkbox } from "@/components/admin/Checkbox";
import { Dialog } from "@/components/admin/Dialog";
import { Notice } from "@/components/admin/Notice";
import { useToast } from "@/components/admin/Toast";
import { requestedTimes, whenLong } from "@/lib/admin/appointments";
import type { components } from "@/lib/api/schema";
import { zoneAbbreviation } from "@/lib/zonedTime";
import { reschedule } from "../../actions";
import { SlotChooser } from "../../_components/SlotChooser";

type Detail = components["schemas"]["AppointmentDetail"];
type Slot = components["schemas"]["Slot"];
type Failure = { message: string; stale: boolean; alternatives: Slot[] };

// Choose a free time, review old → new, then move (Booking UX §15). Every
// failure says the original time is still the one that counts.
export function RescheduleForm({
  appointment: a,
  today,
}: {
  appointment: Detail;
  today: string;
}) {
  const tz = a.timezone;
  const [slot, setSlot] = useState<Slot | null>(null);
  const [notify, setNotify] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [failure, setFailure] = useState<Failure>();
  const [pending, startTransition] = useTransition();
  const sending = useRef(false);
  const alertRef = useRef<HTMLDivElement>(null);
  const toast = useToast();
  const router = useRouter();
  const current = `${whenLong(a.startsAt, tz)} ${zoneAbbreviation(a.startsAt, tz)}`;
  const asked = requestedTimes(a.events);
  const full = (instant: string) =>
    `${whenLong(instant, tz)} ${zoneAbbreviation(instant, tz)}`;

  useEffect(() => {
    if (failure) alertRef.current?.focus();
  }, [failure]);

  function move() {
    if (!slot || sending.current) return;
    sending.current = true;
    startTransition(async () => {
      const outcome = await reschedule(a.id, {
        version: a.version,
        startsAt: slot.startsAt,
        notifyVisitor: notify,
      });
      sending.current = false;
      setReviewing(false);
      if (outcome.ok) {
        toast(`Appointment moved to ${whenLong(slot.startsAt, tz)}`);
        router.push(`/admin/appointments/${a.id}`);
        return;
      }
      setSlot(null);
      setFailure({
        message:
          outcome.code === "slot_unavailable"
            ? `That time has just been taken. The appointment was not rescheduled. The original appointment remains active: ${whenLong(a.startsAt, tz)}.`
            : outcome.message,
        stale: outcome.code === "stale_version",
        alternatives: outcome.alternatives,
      });
    });
  }

  return (
    <div className="flex max-w-[660px] flex-col gap-[22px]">
      <p className="text-[1.08rem]">
        Currently: <strong>{current}</strong>
      </p>
      {a.status === "pending" && (
        <Notice tone="info">
          This is still a request. Moving it keeps the status Pending.
        </Notice>
      )}
      {asked.length > 0 && (
        <div className="rounded-notice bg-paper px-6 py-5 text-[0.92rem]">
          <p className="font-semibold">The visitor asked to move to:</p>
          <ul className="mt-1 list-disc pl-5">
            {asked.map((t) => (
              <li key={t}>{full(t)}</li>
            ))}
          </ul>
          <p className="mt-2 text-muted">
            Pick one of these below if it is still free.
          </p>
        </div>
      )}
      {failure && (
        <div ref={alertRef} tabIndex={-1} className="flex flex-col gap-3">
          <Notice tone="error">{failure.message}</Notice>
          {failure.stale && (
            <Button
              variant="secondary"
              className="self-start"
              onClick={() => router.refresh()}
            >
              Refresh
            </Button>
          )}
          {failure.alternatives.length > 0 && (
            <div>
              <p className="mb-3 text-[0.9rem] font-semibold">
                Other free times
              </p>
              <SlotPicker
                slots={failure.alternatives}
                selected={slot?.startsAt}
                label="Other free times"
                time={(s) => whenLong(s, tz)}
                name={full}
                onSelect={setSlot}
              />
            </div>
          )}
        </div>
      )}

      <SlotChooser
        serviceId={a.service.id}
        timezone={tz}
        today={today}
        selected={slot}
        onSelect={setSlot}
      />
      <Checkbox
        label="Notify the visitor by email"
        name="notifyVisitor"
        checked={notify}
        onChange={(event) => setNotify(event.target.checked)}
      />
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Button size="page" disabled={!slot} onClick={() => setReviewing(true)}>
          Review move
        </Button>
        <Button href={`/admin/appointments/${a.id}`} variant="quiet">
          Keep current time
        </Button>
      </div>
      {!slot && (
        <p className="-mt-3 text-[0.88rem] text-muted">
          Choose a new time to review the move.
        </p>
      )}

      <Dialog
        open={reviewing}
        onClose={() => setReviewing(false)}
        title="Move this appointment?"
        cancelLabel="Keep current time"
        confirmLabel="Move appointment"
        busyLabel="Moving…"
        busy={pending}
        onConfirm={move}
      >
        {slot && (
          <div className="mb-4 flex flex-col gap-2">
            <p className="text-muted line-through">{current}</p>
            <p className="text-[1.2rem] leading-snug font-semibold text-ink">
              {full(slot.startsAt)}
            </p>
          </div>
        )}
        <p>
          The new time is secured before the old one is released.{" "}
          {notify
            ? "The visitor will be emailed the change."
            : "The visitor will not be emailed."}
        </p>
      </Dialog>
    </div>
  );
}
