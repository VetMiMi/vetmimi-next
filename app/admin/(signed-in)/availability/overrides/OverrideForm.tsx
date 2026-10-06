"use client";

import { startTransition, useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/admin/Button";
import { DateField } from "@/components/admin/DateField";
import { ErrorSummary } from "@/components/admin/ErrorSummary";
import { Notice } from "@/components/admin/Notice";
import { RadioCards } from "@/components/admin/RadioCards";
import { Textarea } from "@/components/admin/Textarea";
import { TimeRangeField } from "@/components/admin/TimeRangeField";
import { useToast } from "@/components/admin/Toast";
import type { components } from "@/lib/api/schema";
import { zonedParts } from "@/lib/zonedTime";
import { saveOverride, type FormState } from "../actions";
import { summaryOf } from "../formSummary";

type Override = components["schemas"]["AvailabilityOverride"];

const BASE = "/admin/availability/overrides";
const initial: FormState = { attempt: 0, fieldErrors: {} };

// Submitted by hand rather than through `action`, so React does not reset
// the fields: a failed save keeps everything typed.
export function OverrideForm({
  timezone,
  override,
  today,
}: {
  timezone: string;
  override?: Override;
  today: string;
}) {
  const [state, dispatch, pending] = useActionState(
    saveOverride.bind(null, override?.id),
    initial,
  );
  const router = useRouter();
  const toast = useToast();
  const noticeRef = useRef<HTMLDivElement>(null);
  const { attempt, saved, message, fieldErrors } = state;

  useEffect(() => {
    if (saved) {
      toast("Override saved");
      router.push(BASE);
    } else if (message) noticeRef.current?.focus();
  }, [attempt, saved, message, toast, router]);

  const start = override && zonedParts(override.startsAt, timezone).time;
  const end = override && zonedParts(override.endsAt, timezone).time;

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        startTransition(() => dispatch(form));
      }}
      className="flex flex-col gap-[22px]"
    >
      <input type="hidden" name="timezone" value={timezone} />
      {message && (
        <Notice key={attempt} tone="error" ref={noticeRef}>
          {message}
        </Notice>
      )}
      <ErrorSummary
        key={`summary-${attempt}`}
        title="Check the highlighted details."
        errors={summaryOf(fieldErrors, ["date", "kind", "time", "note"])}
      />
      <DateField
        label="Date"
        name="date"
        value={override?.onDate}
        min={today}
        required
        error={fieldErrors.date}
      />
      <RadioCards
        label="What happens on this date"
        name="kind"
        defaultValue={override?.kind ?? "open"}
        error={fieldErrors.kind}
        options={[
          { value: "open", label: "Add extra hours on this date" },
          {
            value: "replace",
            label: "Replace this date's weekly hours",
            help: "Only this date changes. Add every period you want that day.",
          },
        ]}
      />
      <TimeRangeField
        label="Time"
        name="time"
        start={start}
        end={end}
        required
        error={fieldErrors.time}
      />
      <Textarea
        label="Private note"
        name="note"
        help="Never shown publicly."
        maxLength={500}
        defaultValue={override?.note}
        error={fieldErrors.note}
      />
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Button type="submit" size="page" busy={pending}>
          {pending ? "Saving…" : "Save override"}
        </Button>
        <Button href={BASE} variant="quiet">
          Cancel
        </Button>
      </div>
    </form>
  );
}
