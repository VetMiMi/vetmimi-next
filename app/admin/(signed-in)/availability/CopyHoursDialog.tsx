"use client";

import { useState } from "react";
import { Button } from "@/components/admin/Button";
import { Checkbox } from "@/components/admin/Checkbox";
import { Dialog } from "@/components/admin/Dialog";
import { WEEKDAYS } from "@/lib/admin/availability";

const WEEKDAYS_ONLY = [0, 1, 2, 3, 4];
const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

export function CopyHoursDialog({
  from,
  onClose,
  onCopy,
}: {
  from: number;
  onClose: () => void;
  onCopy: (to: number[]) => void;
}) {
  const [to, setTo] = useState<number[]>([]);
  const others = (days: number[]) => days.filter((day) => day !== from);

  return (
    <Dialog
      open
      onClose={onClose}
      title={`Copy ${WEEKDAYS[from]}’s hours`}
      confirmLabel="Copy hours"
      cancelLabel="Cancel"
      onConfirm={() => onCopy(to)}
    >
      <div className="text-ink">
        <p className="mb-3 text-muted">
          The days you choose get the same hours as {WEEKDAYS[from]}. Save the
          week afterwards to keep them.
        </p>
        <div className="mb-2 flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={() => setTo(others(WEEKDAYS_ONLY))}
          >
            Weekdays
          </Button>
          <Button variant="secondary" onClick={() => setTo(others(ALL_DAYS))}>
            All days
          </Button>
        </div>
        <fieldset className="m-0 border-0 p-0">
          <legend className="sr-only">Copy to</legend>
          {others(ALL_DAYS).map((day) => (
            <Checkbox
              key={day}
              label={WEEKDAYS[day]}
              name={`copy-to-${day}`}
              checked={to.includes(day)}
              onChange={(event) =>
                setTo(
                  event.target.checked
                    ? [...to, day]
                    : to.filter((d) => d !== day),
                )
              }
            />
          ))}
        </fieldset>
      </div>
    </Dialog>
  );
}
