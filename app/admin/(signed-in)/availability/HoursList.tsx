"use client";

import { useState } from "react";
import { Plus, X } from "@phosphor-icons/react";
import { Button } from "@/components/admin/Button";
import { TimeRangeField } from "@/components/admin/TimeRangeField";
import { hoursText, type Hours } from "@/lib/admin/availability";

// Time ranges with Remove and "Add hours". The time fields keep their own
// state, so the version number remounts them when a range is added or
// removed; a parent that replaces the hours remounts the list with a key.
export function HoursList({
  name,
  day,
  hours,
  errors,
  disabled,
  onChange,
}: {
  name: string;
  // "Monday" or "Tuesday 10 November", for screen readers.
  day: string;
  hours: Hours[];
  errors: (string | undefined)[];
  disabled?: boolean;
  onChange: (hours: Hours[]) => void;
}) {
  const [version, setVersion] = useState(0);
  const reshape = (next: Hours[]) => {
    setVersion((n) => n + 1);
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      {hours.map((range, i) => (
        <div key={`${version}-${i}`} className="flex items-start gap-2">
          <div className="min-w-0 grow md:max-w-[380px]">
            <TimeRangeField
              label={`${day}, hours ${i + 1}`}
              hideLabel
              name={`${name}-${i}`}
              start={range.start}
              end={range.end}
              error={errors[i]}
              disabled={disabled}
              onChange={(start, end) =>
                onChange(hours.map((h, j) => (j === i ? { start, end } : h)))
              }
            />
          </div>
          <button
            type="button"
            disabled={disabled}
            onClick={() => reshape(hours.filter((_, j) => j !== i))}
            aria-label={`Remove ${range.start && range.end ? hoursText(range) : "these hours"} on ${day}`}
            className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-control text-muted transition-colors duration-150 hover:text-action disabled:cursor-not-allowed motion-reduce:transition-none"
          >
            <X aria-hidden="true" size={18} />
          </button>
        </div>
      ))}
      <div>
        <Button
          variant="quiet"
          disabled={disabled}
          icon={<Plus aria-hidden="true" size={16} />}
          onClick={() => reshape([...hours, { start: "", end: "" }])}
        >
          Add hours<span className="sr-only"> on {day}</span>
        </Button>
      </div>
    </div>
  );
}
