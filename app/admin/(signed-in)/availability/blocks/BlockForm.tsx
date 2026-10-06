"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/admin/Button";
import { DateField } from "@/components/admin/DateField";
import { ErrorSummary } from "@/components/admin/ErrorSummary";
import { Notice } from "@/components/admin/Notice";
import { RadioCards } from "@/components/admin/RadioCards";
import { Textarea } from "@/components/admin/Textarea";
import { TimeRangeField } from "@/components/admin/TimeRangeField";
import { useToast } from "@/components/admin/Toast";
import { saveBlock, type FormState } from "../actions";
import { summaryOf } from "../formSummary";
import type { blockFields } from "./blockTimes";
import { ConflictsAlert } from "./ConflictsAlert";

const BASE = "/admin/availability/blocks";
const initialState: FormState = { attempt: 0, fieldErrors: {} };

const modes = [
  { value: "part", label: "Part of a day" },
  { value: "day", label: "Whole day" },
  { value: "range", label: "Several days" },
];

export function BlockForm({
  timezone,
  id,
  initial,
  reason,
  today,
}: {
  timezone: string;
  id?: string;
  initial?: ReturnType<typeof blockFields>;
  reason?: string;
  today: string;
}) {
  const [state, dispatch, pending] = useActionState(
    saveBlock.bind(null, id),
    initialState,
  );
  const [mode, setMode] = useState<string>(initial?.mode ?? "part");
  const router = useRouter();
  const toast = useToast();
  const noticeRef = useRef<HTMLDivElement>(null);
  const { attempt, saved, message, fieldErrors, conflicts = [] } = state;

  useEffect(() => {
    if (saved && conflicts.length === 0) {
      toast("Time blocked");
      router.push(BASE);
    } else if (message) noticeRef.current?.focus();
  }, [attempt, saved, conflicts.length, message, toast, router]);

  if (saved && conflicts.length > 0)
    return <ConflictsAlert conflicts={conflicts} timezone={timezone} />;

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
        errors={summaryOf(fieldErrors, ["date", "last-date", "time", "reason"])}
      />
      <RadioCards
        label="What to block"
        name="mode"
        value={mode}
        onChange={setMode}
        options={modes}
        columns={3}
      />
      <div className="grid gap-[22px] md:grid-cols-2">
        <DateField
          label={mode === "range" ? "First day" : "Date"}
          name="date"
          value={initial?.date}
          min={id ? undefined : today}
          required
          error={fieldErrors.date}
        />
        {mode === "range" && (
          <DateField
            label="Last day (included)"
            name="last-date"
            value={initial?.lastDay}
            required
            error={fieldErrors["last-date"]}
          />
        )}
      </div>
      {mode === "part" && (
        <TimeRangeField
          label="Time"
          name="time"
          start={initial?.mode === "part" ? initial.start : undefined}
          end={initial?.mode === "part" ? initial.end : undefined}
          required
          error={fieldErrors.time}
        />
      )}
      <Textarea
        label="Private reason"
        name="reason"
        help="Never shown publicly."
        maxLength={500}
        defaultValue={reason}
        error={fieldErrors.reason}
      />
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Button type="submit" size="page" busy={pending}>
          {pending ? "Saving…" : "Block time"}
        </Button>
        <Button href={BASE} variant="quiet">
          Cancel
        </Button>
      </div>
    </form>
  );
}
