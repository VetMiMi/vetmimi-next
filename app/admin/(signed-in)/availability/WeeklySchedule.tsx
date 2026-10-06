"use client";

import { useState } from "react";
import { Plus } from "@phosphor-icons/react";
import { Button } from "@/components/admin/Button";
import { EmptyState } from "@/components/admin/EmptyState";
import type { components } from "@/lib/api/schema";
import { PeriodRow } from "./PeriodRow";

type Rule = components["schemas"]["AvailabilityRule"];

// ISO weekdays, as the API numbers them.
const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

let nextDraft = 0;

// Seven days, each with its periods. Every period saves on its own (one row,
// one API call), so there is no whole-page save to lose. New periods live
// here until saved; saved ones come from the server after each change.
export function WeeklySchedule({ rules }: { rules: Rule[] }) {
  const [drafts, setDrafts] = useState<{ key: number; weekday: number }[]>([]);
  const dropDraft = (key: number) =>
    setDrafts((list) => list.filter((draft) => draft.key !== key));

  return (
    <div className="flex flex-col gap-6">
      {rules.length === 0 && (
        <EmptyState
          title="No weekly hours yet."
          text="Visitors cannot see any times until you add some. Choose “Add period” on a day to start."
          shape="petal"
        />
      )}
      <ul className="border-t border-divider">
        {DAYS.map((day, i) => {
          const weekday = i + 1;
          const saved = rules
            .filter((rule) => rule.weekday === weekday)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
          const dayDrafts = drafts.filter((d) => d.weekday === weekday);
          return (
            <li
              key={day}
              className="grid gap-4 border-b border-divider py-6 md:grid-cols-[160px_minmax(0,1fr)] md:gap-8"
            >
              <h2 className="text-[1.2rem]">{day}</h2>
              <div className="flex flex-col gap-5">
                {saved.length + dayDrafts.length === 0 && (
                  <p className="text-[0.95rem] text-muted">Closed</p>
                )}
                {saved.map((rule, n) => (
                  <PeriodRow
                    // A new key when the server's times change resets the
                    // row to them.
                    key={`${rule.id}-${rule.startTime}-${rule.endTime}`}
                    day={day}
                    number={n + 1}
                    weekday={weekday}
                    rule={rule}
                    others={saved.filter((other) => other.id !== rule.id)}
                  />
                ))}
                {dayDrafts.map((draft, n) => (
                  <PeriodRow
                    key={draft.key}
                    day={day}
                    number={saved.length + n + 1}
                    weekday={weekday}
                    others={saved}
                    onDone={() => dropDraft(draft.key)}
                  />
                ))}
                <div>
                  <Button
                    variant="secondary"
                    icon={<Plus aria-hidden="true" size={18} />}
                    onClick={() =>
                      setDrafts((list) => [
                        ...list,
                        { key: nextDraft++, weekday },
                      ])
                    }
                  >
                    Add period
                    <span className="sr-only"> on {day}</span>
                  </Button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
