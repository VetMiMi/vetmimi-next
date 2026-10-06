"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/admin/Button";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Notice } from "@/components/admin/Notice";
import { TimeRangeField } from "@/components/admin/TimeRangeField";
import { useToast } from "@/components/admin/Toast";
import { fieldId } from "@/lib/fieldIds";
import type { components } from "@/lib/api/schema";
import { endsTooEarly, findOverlap } from "@/lib/timeRange";
import { formatClock } from "@/lib/zonedTime";
import { deleteRule, saveRule } from "./actions";

type Rule = components["schemas"]["AvailabilityRule"];

const range = (rule: { startTime: string; endTime: string }) =>
  `${formatClock(rule.startTime)}–${formatClock(rule.endTime)}`;

// One weekly period. A saved one shows Save only once changed; a new one
// (no `rule`) is focused when added and leaves through `onDone`.
export function PeriodRow({
  day,
  number,
  weekday,
  rule,
  others,
  onDone,
}: {
  day: string;
  number: number;
  weekday: number;
  rule?: Rule;
  others: Rule[];
  onDone?: () => void;
}) {
  const [times, setTimes] = useState({
    start: rule?.startTime ?? "",
    end: rule?.endTime ?? "",
  });
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const name = `${day.toLowerCase()}-${rule?.id ?? `new-${number}`}`;

  useEffect(() => {
    if (!rule) document.getElementById(fieldId(`${name}-start`))?.focus();
  }, [rule, name]);

  const changed =
    !rule || times.start !== rule.startTime || times.end !== rule.endTime;

  function check(): string | undefined {
    if (!times.start || !times.end) return "Enter a start and an end time.";
    if (endsTooEarly(times.start, times.end))
      return "End time must be after start time.";
    const overlap = findOverlap(
      { startTime: times.start, endTime: times.end },
      others,
    );
    return overlap && `This overlaps ${range(overlap)}.`;
  }

  function save() {
    const invalid = check();
    setError(invalid);
    setNotice(undefined);
    if (invalid) return;
    startTransition(async () => {
      const outcome = await saveRule(rule?.id, {
        weekday,
        startTime: times.start,
        endTime: times.end,
      });
      if (outcome.ok) {
        toast("Weekly hours saved");
        onDone?.();
      } else if (outcome.code === "overlapping_period") {
        // Another tab or person added a period; the list is a moment old.
        setError(check() ?? "This overlaps another period on this day.");
      } else {
        setNotice(outcome.message);
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:gap-4">
        <div className="min-w-0 md:w-[400px]">
          <TimeRangeField
            label={`${day} period ${number}`}
            name={name}
            start={times.start}
            end={times.end}
            error={error}
            disabled={pending}
            onChange={(start, end) => setTimes({ start, end })}
          />
        </div>
        <div className="flex flex-wrap gap-3 md:pt-[30px]">
          {changed && (
            <Button busy={pending} onClick={save}>
              {pending ? "Saving…" : notice ? "Try again" : "Save"}
            </Button>
          )}
          {rule ? (
            <ConfirmButton
              label="Remove"
              variant="quiet"
              title={`Remove ${day} ${range(rule)}?`}
              body="Future availability in this period disappears from public booking. Existing appointments are not changed."
              confirmLabel="Remove period"
              busyLabel="Removing…"
              action={() => deleteRule(rule.id)}
              success="Period removed"
            />
          ) : (
            <Button variant="quiet" onClick={onDone}>
              Cancel
            </Button>
          )}
        </div>
      </div>
      {notice && <Notice tone="error">{notice}</Notice>}
    </div>
  );
}
