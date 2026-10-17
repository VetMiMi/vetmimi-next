"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/admin/Button";
import { Notice } from "@/components/admin/Notice";
import { TimeRangeField } from "@/components/admin/TimeRangeField";
import { useToast } from "@/components/admin/Toast";
import type { Outcome } from "@/lib/admin/mutation";
import {
  DEFAULT_HOURS,
  hoursErrors,
  hoursText,
  type CalendarDay,
  type Hours,
} from "@/lib/admin/availability";
import { longDay, statusOptions } from "@/lib/admin/appointments";
import { formatClock, formatDay, zonedParts } from "@/lib/zonedTime";
import {
  backToNormal,
  changeHours,
  markDaysOff,
  markPartDayOff,
  type Conflict,
} from "./actions";
import { ConflictsAlert } from "./ConflictsAlert";
import { HoursList } from "./HoursList";

type Mode = "menu" | "hours" | "part" | "confirm-off" | "confirm-part";

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

function summary(day: CalendarDay) {
  const hours = day.hours.map(hoursText).join(", ");
  const text = {
    open: `Your weekly hours: ${hours}.`,
    closed: "Not working on this weekday.",
    changed: `Changed hours: ${hours}.`,
    off: "Day off.",
  }[day.state];
  const part = day.offHours.length
    ? ` Off ${day.offHours.map(hoursText).join(", ")}.`
    : "";
  return text + part;
}

// What to do with the dates chosen in the calendar.
export function DayPanel({
  days,
  timezone,
  onDone,
}: {
  days: CalendarDay[];
  timezone: string;
  onDone: () => void;
}) {
  const [mode, setMode] = useState<Mode>("menu");
  const [hours, setHours] = useState<Hours[]>(() =>
    days[0]?.hours.length ? days[0].hours : [DEFAULT_HOURS],
  );
  const [partHours, setPartHours] = useState({ start: "13:00", end: "17:00" });
  const [checked, setChecked] = useState(false);
  const [notice, setNotice] = useState<string>();
  const [kept, setKept] = useState<Conflict[]>([]);
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  if (days.length === 0)
    return (
      <section className="self-start rounded-inner border border-divider bg-white p-5 text-[0.92rem] text-muted">
        <h3 className="mb-2 text-[1.05rem] text-ink">Change a day</h3>
        <p>
          Choose a date to take it off or give it different hours. To change
          several at once, use Select days, or hold Shift or Ctrl (⌘ on a Mac)
          while you click.
        </p>
      </section>
    );

  const single = days.length === 1 ? days[0] : undefined;
  const dates = days.map((day) => day.date);
  const booked = days.flatMap((day) => day.appointments);
  const local = (instant: string) => zonedParts(instant, timezone).time;
  const bookedInPart = booked.filter(
    (a) =>
      local(a.startsAt) < partHours.end && local(a.endsAt) > partHours.start,
  );
  const changed = days.some(
    (d) => d.state === "changed" || d.state === "off" || d.offHours.length,
  );
  const allOff = days.every((d) => d.state === "off");

  function run(
    action: () => Promise<Outcome<Conflict[]>>,
    success: string,
    warned = false,
  ) {
    setNotice(undefined);
    startTransition(async () => {
      const outcome = await action();
      if (!outcome.ok) {
        setNotice(outcome.message);
        return;
      }
      toast(success);
      if (outcome.data.length > 0 && !warned) setKept(outcome.data);
      else onDone();
    });
  }

  const dayOff = (warned = false) =>
    run(
      () => markDaysOff(dates),
      single
        ? "Marked as a day off"
        : `${plural(days.length, "day")} marked off`,
      warned,
    );
  const partOff = (warned = false) =>
    run(() => markPartDayOff(dates[0], partHours), "Time off saved", warned);

  if (kept.length > 0)
    return (
      <ConflictsAlert
        conflicts={kept}
        timezone={timezone}
        message={`Saved. ${plural(kept.length, "appointment")} still booked in that time. Open each one to move or cancel it.`}
      >
        <Button onClick={onDone}>Done</Button>
      </ConflictsAlert>
    );

  if (mode === "confirm-off" || mode === "confirm-part") {
    const hit = mode === "confirm-off" ? booked : bookedInPart;
    return (
      <ConflictsAlert
        conflicts={hit}
        timezone={timezone}
        message={`${plural(hit.length, "appointment")} booked in that time. Taking it off does not cancel ${hit.length === 1 ? "it" : "them"}; you can move or cancel each one afterwards.`}
      >
        <Button
          busy={pending}
          onClick={() =>
            mode === "confirm-off" ? dayOff(true) : partOff(true)
          }
        >
          {pending ? "Saving…" : "Take the time off"}
        </Button>
        <Button variant="quiet" onClick={() => setMode("menu")}>
          Cancel
        </Button>
      </ConflictsAlert>
    );
  }

  return (
    <section
      aria-labelledby="day-panel-title"
      className="flex flex-col gap-4 self-start rounded-inner border border-divider bg-white p-5"
    >
      <div>
        <h3 id="day-panel-title" className="text-[1.15rem]">
          {single
            ? longDay(single.date)
            : `${plural(days.length, "day")} chosen`}
        </h3>
        <p className="mt-1 text-[0.9rem] text-muted">
          {single ? summary(single) : dates.map(formatDay).join(", ")}
        </p>
        {single?.notes.map((note) => (
          <p key={note} className="mt-1 text-[0.88rem] text-muted">
            Note: {note}
          </p>
        ))}
      </div>

      {booked.length > 0 && (
        <ul className="flex flex-col gap-1 text-[0.88rem]">
          {booked.map((a) => (
            <li key={a.id}>
              <Link
                href={`/admin/appointments/${a.id}`}
                className="font-semibold underline underline-offset-4 hover:text-indigo"
              >
                {single
                  ? ""
                  : `${formatDay(zonedParts(a.startsAt, timezone).date)} `}
                {formatClock(local(a.startsAt))} · {a.visitorName}
              </Link>{" "}
              <span className="text-muted">
                ({statusOptions.find((s) => s.value === a.status)?.label})
              </span>
            </li>
          ))}
        </ul>
      )}

      {notice && <Notice tone="error">{notice}</Notice>}

      {mode === "hours" && (
        <HoursList
          name="day-hours"
          day={single ? longDay(single.date) : "the chosen days"}
          hours={hours}
          errors={checked ? hoursErrors(hours) : []}
          disabled={pending}
          onChange={setHours}
        />
      )}
      {mode === "part" && (
        <TimeRangeField
          label="Time off"
          name="part-off"
          start={partHours.start}
          end={partHours.end}
          error={checked ? hoursErrors([partHours])[0] : undefined}
          disabled={pending}
          onChange={(start, end) => setPartHours({ start, end })}
        />
      )}

      <div className="flex flex-wrap gap-3">
        {mode === "menu" && (
          <>
            {!allOff && (
              <Button
                busy={pending}
                onClick={() =>
                  booked.length ? setMode("confirm-off") : dayOff()
                }
              >
                Mark as day off
              </Button>
            )}
            <Button variant="secondary" onClick={() => setMode("hours")}>
              Set different hours
            </Button>
            {single && single.state !== "off" && (
              <Button variant="secondary" onClick={() => setMode("part")}>
                Off part of the day
              </Button>
            )}
            {changed && (
              <Button
                variant="quiet"
                busy={pending}
                onClick={() =>
                  run(() => backToNormal(dates), "Back to normal hours")
                }
              >
                Back to normal hours
              </Button>
            )}
          </>
        )}
        {mode === "hours" && (
          <Button
            busy={pending}
            disabled={hours.length === 0}
            onClick={() => {
              setChecked(true);
              if (!hoursErrors(hours).some(Boolean))
                run(() => changeHours(dates, hours), "Hours changed");
            }}
          >
            {pending ? "Saving…" : "Save hours"}
          </Button>
        )}
        {mode === "part" && (
          <Button
            busy={pending}
            onClick={() => {
              setChecked(true);
              if (hoursErrors([partHours])[0]) return;
              if (bookedInPart.length) setMode("confirm-part");
              else partOff();
            }}
          >
            {pending ? "Saving…" : "Take this time off"}
          </Button>
        )}
        <Button
          variant="quiet"
          onClick={mode === "menu" ? onDone : () => setMode("menu")}
        >
          {mode === "menu" ? "Close" : "Cancel"}
        </Button>
      </div>
    </section>
  );
}
