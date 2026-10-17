"use client";

import { useState, useTransition } from "react";
import { Copy } from "@phosphor-icons/react";
import { Button } from "@/components/admin/Button";
import { Notice } from "@/components/admin/Notice";
import { Switch } from "@/components/admin/Switch";
import { useToast } from "@/components/admin/Toast";
import {
  DEFAULT_HOURS,
  WEEKDAYS,
  copyDay,
  hoursErrors,
  rulesFromWeek,
  weekFromRules,
  type Week,
} from "@/lib/admin/availability";
import type { components } from "@/lib/api/schema";
import { fieldId } from "@/lib/fieldIds";
import { saveWeeklyHours } from "./actions";
import { CopyHoursDialog } from "./CopyHoursDialog";
import { HoursList } from "./HoursList";

type Rule = components["schemas"]["AvailabilityRule"];

// The whole week is edited here and saved in one go.
export function WeeklyHours({ rules }: { rules: Rule[] }) {
  const [saved, setSaved] = useState(() => weekFromRules(rules));
  const [week, setWeek] = useState(saved);
  // Bumped when the week is replaced from outside a day (switch, copy,
  // undo, save), so that day's time fields start again from the new hours.
  const [layout, setLayout] = useState(0);
  const [checked, setChecked] = useState(false);
  const [notice, setNotice] = useState<string>();
  const [copyFrom, setCopyFrom] = useState<number>();
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  const dirty = JSON.stringify(week) !== JSON.stringify(saved);
  const errors = week.map((day) => (checked ? hoursErrors(day) : []));
  const hasErrors = errors.some((day) => day.some(Boolean));

  function replace(next: Week) {
    setWeek(next);
    setLayout((n) => n + 1);
  }

  function save() {
    const problems = week.map(hoursErrors);
    const day = problems.findIndex((d) => d.some(Boolean));
    setChecked(true);
    setNotice(undefined);
    if (day !== -1) {
      const i = problems[day].findIndex(Boolean);
      document.getElementById(fieldId(`hours-${day}-${i}-start`))?.focus();
      return;
    }
    startTransition(async () => {
      const outcome = await saveWeeklyHours(rulesFromWeek(week));
      if (!outcome.ok) {
        setNotice(outcome.message);
        return;
      }
      const fresh = weekFromRules(outcome.data.items);
      setSaved(fresh);
      replace(fresh);
      setChecked(false);
      toast("Weekly hours saved");
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <ul className="border-t border-divider">
        {WEEKDAYS.map((name, day) => (
          <li
            key={name}
            className="grid gap-3 border-b border-divider py-5 md:grid-cols-[170px_minmax(0,1fr)] md:gap-6"
          >
            <Switch
              label={name}
              checked={week[day].length > 0}
              onChange={(on) =>
                replace(
                  week.map((h, i) =>
                    i === day ? (on ? [DEFAULT_HOURS] : []) : h,
                  ),
                )
              }
            />
            {week[day].length === 0 ? (
              <p className="text-[0.95rem] text-muted md:pt-2.5">Not working</p>
            ) : (
              <div className="flex flex-wrap items-start justify-between gap-x-6">
                <div className="min-w-0 grow">
                  <HoursList
                    key={`${layout}-${day}`}
                    name={`hours-${day}`}
                    day={name}
                    hours={week[day]}
                    errors={errors[day]}
                    disabled={pending}
                    onChange={(hours) =>
                      setWeek((current) =>
                        current.map((h, i) => (i === day ? hours : h)),
                      )
                    }
                  />
                </div>
                <Button
                  variant="quiet"
                  icon={<Copy aria-hidden="true" size={16} />}
                  onClick={() => setCopyFrom(day)}
                >
                  Copy to…
                  <span className="sr-only"> (copy {name}’s hours)</span>
                </Button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {hasErrors && (
        <Notice tone="error">
          Some hours need fixing before the week can be saved.
        </Notice>
      )}
      {notice && <Notice tone="error">{notice}</Notice>}

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Button size="page" busy={pending} disabled={!dirty} onClick={save}>
          {pending ? "Saving…" : "Save weekly hours"}
        </Button>
        {dirty && !pending && (
          <>
            <p className="text-[0.88rem] text-muted">
              You have unsaved changes.
            </p>
            <Button variant="quiet" onClick={() => replace(saved)}>
              Undo changes
            </Button>
          </>
        )}
      </div>

      {copyFrom !== undefined && (
        <CopyHoursDialog
          from={copyFrom}
          onClose={() => setCopyFrom(undefined)}
          onCopy={(to) => {
            replace(copyDay(week, copyFrom, to));
            setCopyFrom(undefined);
          }}
        />
      )}
    </div>
  );
}
