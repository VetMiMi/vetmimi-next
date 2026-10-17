"use client";

import { Plus, X } from "@phosphor-icons/react";
import { Button } from "@/components/admin/Button";
import { FieldError, controlClass } from "@/components/admin/Field";
import { hoursText, type Hours } from "@/lib/admin/availability";
import { fieldIds } from "@/lib/fieldIds";

// The picker icon is hidden on a phone, where tapping the field opens the
// picker anyway, so "10:00 AM" fits in half a 375px screen.
const timeClass = `${controlClass} min-w-0 flex-1 px-2.5 max-sm:[&::-webkit-calendar-picker-indicator]:hidden`;

// Time ranges, one per row ([start] – [end] ×), with "Add hours". Inputs are
// named `${name}-${i}-start` and `-end`, so a caller can focus one.
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
  return (
    <div className="flex max-w-[420px] flex-col gap-3">
      {hours.map((range, i) => {
        const ids = fieldIds(`${name}-${i}`);
        const input = (which: "start" | "end") => {
          const id = fieldIds(`${name}-${i}-${which}`).control;
          return (
            <>
              <label htmlFor={id} className="sr-only">
                {`${day}, hours ${i + 1}, ${which === "start" ? "from" : "until"}`}
              </label>
              <input
                type="time"
                id={id}
                name={`${name}-${i}-${which}`}
                value={range[which]}
                disabled={disabled}
                aria-invalid={errors[i] ? true : undefined}
                aria-describedby={errors[i] ? ids.error : undefined}
                onChange={(event) =>
                  onChange(
                    hours.map((h, j) =>
                      j === i ? { ...h, [which]: event.target.value } : h,
                    ),
                  )
                }
                className={timeClass}
              />
            </>
          );
        };
        return (
          <div key={i}>
            <div className="flex items-center gap-2">
              {input("start")}
              <span aria-hidden="true" className="text-muted">
                –
              </span>
              {input("end")}
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(hours.filter((_, j) => j !== i))}
                aria-label={`Remove ${range.start && range.end ? hoursText(range) : "these hours"} on ${day}`}
                className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-control text-muted transition-colors duration-150 hover:text-action disabled:cursor-not-allowed motion-reduce:transition-none"
              >
                <X aria-hidden="true" size={18} />
              </button>
            </div>
            <FieldError id={ids.error} error={errors[i]} />
          </div>
        );
      })}
      <div>
        <Button
          variant="quiet"
          disabled={disabled}
          icon={<Plus aria-hidden="true" size={16} />}
          onClick={() => onChange([...hours, { start: "", end: "" }])}
        >
          Add hours<span className="sr-only"> on {day}</span>
        </Button>
      </div>
    </div>
  );
}
