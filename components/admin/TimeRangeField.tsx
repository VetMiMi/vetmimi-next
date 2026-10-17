"use client";

import { useState } from "react";
import { describedBy, fieldIds } from "@/lib/fieldIds";
import { endsTooEarly } from "@/lib/timeRange";
import {
  FieldError,
  FieldHelp,
  Requirement,
  controlClass,
  labelClass,
  type FieldProps,
} from "./Field";

const TOO_EARLY = "End time must be after start time.";

type TimeRangeFieldProps = FieldProps & {
  // The first values, as "HH:MM"; the field keeps its own state after that.
  start?: string;
  end?: string;
  disabled?: boolean;
  onChange?: (start: string, end: string) => void;
};

// One weekly period ("10:00 to 13:00"). The inputs are named
// `${name}-start` and `${name}-end`, so an error summary links to either.
export function TimeRangeField({
  label,
  name,
  help,
  error,
  required,
  start = "",
  end = "",
  disabled,
  onChange,
}: TimeRangeFieldProps) {
  const [range, setRange] = useState({ start, end });
  // Checked from the first blur on, then again on every change, so the
  // message goes away as soon as the times are put right.
  const [checking, setChecking] = useState(false);

  const tooEarly = checking && endsTooEarly(range.start, range.end);
  const message = tooEarly ? TOO_EARLY : error;

  const ids = fieldIds(name);
  const startIds = fieldIds(`${name}-start`);
  const endIds = fieldIds(`${name}-end`);
  const description = describedBy(ids, { help: !!help, error: !!message });

  function update(next: { start: string; end: string }) {
    setRange(next);
    onChange?.(next.start, next.end);
  }

  const input = (which: "start" | "end") => (
    <input
      type="time"
      id={which === "start" ? startIds.control : endIds.control}
      name={`${name}-${which}`}
      value={range[which]}
      required={required}
      disabled={disabled}
      // The end is what is wrong when it comes too early; an error from the
      // server is about the whole period.
      aria-invalid={(which === "end" && tooEarly) || error ? true : undefined}
      aria-describedby={description}
      onChange={(event) => update({ ...range, [which]: event.target.value })}
      onBlur={() => setChecking(true)}
      className={`${controlClass} min-w-0`}
    />
  );

  return (
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <legend className={labelClass}>
        {label}
        <Requirement required={required} />
      </legend>
      <FieldHelp id={ids.help} help={help} />
      <label htmlFor={startIds.control} className="sr-only">
        Start time
      </label>
      <label htmlFor={endIds.control} className="sr-only">
        End time
      </label>
      {/* Side by side once each time has room for "10:00 AM" and the
          picker icon; stacked in a narrower column, e.g. on a phone. */}
      <div className="@container">
        <div className="grid grid-cols-1 items-center gap-x-3 gap-y-1 @min-[20rem]:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          {input("start")}
          <span aria-hidden="true" className="text-[0.9rem] text-muted">
            to
          </span>
          {input("end")}
        </div>
      </div>
      <FieldError id={ids.error} error={message} />
    </fieldset>
  );
}
