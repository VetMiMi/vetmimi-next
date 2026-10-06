"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { CalendarMonth } from "@/components/booking/CalendarMonth";
import { SlotPicker } from "@/components/booking/SlotPicker";
import { Button } from "@/components/admin/Button";
import { FieldError, labelClass } from "@/components/admin/Field";
import { Notice } from "@/components/admin/Notice";
import { clockWithZone, longDay } from "@/lib/admin/appointments";
import type { components } from "@/lib/api/schema";
import { fieldIds } from "@/lib/fieldIds";
import { addMonths, localDateKey } from "@/lib/time";
import { formatClock, zoneLabel, zonedParts } from "@/lib/zonedTime";
import { previewMonth } from "../actions";

type Slot = components["schemas"]["Slot"];
type Preview = components["schemas"]["AvailabilityPreview"];

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const monthTitle = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  month: "long",
  year: "numeric",
});
// Far enough for any booking window the settings allow.
const MONTHS_AHEAD = 12;

// The public calendar and time buttons, fed by the admin preview (#69,
// #78): only free times inside the booking window, never a typed time
// (Booking UX §21).
export function SlotChooser({
  serviceId,
  timezone,
  today,
  selected,
  onSelect,
  error,
  startMonth,
}: {
  serviceId: string;
  timezone: string;
  today: string;
  selected: Slot | null;
  onSelect: (slot: Slot) => void;
  error?: string;
  startMonth?: string;
}) {
  const [month, setMonth] = useState(startMonth ?? today.slice(0, 7));
  const [day, setDay] = useState(
    selected ? localDateKey(selected.startsAt, timezone) : "",
  );
  // Each month is kept while the page is open; null means it failed.
  const [results, setResults] = useState<Record<string, Preview | null>>({});
  const [loading, startTransition] = useTransition();
  const key = `${serviceId}|${month}`;
  const data = results[key];

  useEffect(() => {
    if (data !== undefined) return;
    startTransition(async () => {
      const preview = await previewMonth(serviceId, month);
      setResults((all) => ({ ...all, [key]: preview }));
    });
  }, [data, key, month, serviceId]);

  const busy = loading || data === undefined;
  const counts = new Map(data?.days.map((d) => [d.date, d.slots.length]));
  const slots = data?.days.find((d) => d.date === day)?.slots ?? [];
  const lastMonth = addMonths(today.slice(0, 7), MONTHS_AHEAD);
  const canPrevious = month > today.slice(0, 7);
  const canNext = month < lastMonth;
  const ids = fieldIds("slot");
  const [y, m] = month.split("-").map(Number);
  const time = (startsAt: string) =>
    formatClock(zonedParts(startsAt, timezone).time);

  return (
    <fieldset
      className="m-0 min-w-0 border-0 p-0"
      aria-describedby={error ? ids.error : undefined}
    >
      <legend className={labelClass}>
        Date and time
        <span aria-hidden="true" className="text-rose">
          {" "}
          *
        </span>
      </legend>
      {/* The error summary links here. */}
      <div id={ids.control} tabIndex={-1} />
      {data === null && (
        <div className="mb-4 flex flex-col items-start gap-3">
          <Notice tone="error">Free times could not be loaded.</Notice>
          <Button
            variant="secondary"
            onClick={() =>
              setResults((all) => {
                const rest = { ...all };
                delete rest[key];
                return rest;
              })
            }
          >
            Retry
          </Button>
        </div>
      )}
      {data && data.days.length === 0 && (
        <div className="mb-4">
          <Notice tone="info">
            No free times in this range.{" "}
            {canNext && (
              <button
                type="button"
                onClick={() => setMonth(addMonths(month, 1))}
                className="cursor-pointer font-semibold underline underline-offset-4"
              >
                Next month
              </button>
            )}
            {canNext && " · "}
            <Link
              href="/admin/availability"
              className="font-semibold underline underline-offset-4"
            >
              Edit availability
            </Link>
          </Notice>
        </div>
      )}
      <CalendarMonth
        month={month}
        counts={counts}
        selected={day}
        today={today}
        busy={busy}
        canPrevious={canPrevious}
        canNext={canNext}
        labels={{
          title: monthTitle.format(Date.UTC(y, m - 1, 1)),
          weekdaysShort: WEEKDAYS,
          previousMonth: "Previous month",
          nextMonth: "Next month",
          day: (date, count) =>
            count > 0
              ? `${longDay(date)}, ${count} ${count === 1 ? "time" : "times"} free`
              : `${longDay(date)}, unavailable`,
        }}
        onSelect={setDay}
        onMonthChange={(step) => setMonth(addMonths(month, step))}
      />
      {busy && (
        <p role="status" className="-mt-2 mb-4 text-[0.88rem] text-muted">
          Loading free times…
        </p>
      )}
      {day && slots.length > 0 && (
        <div>
          <p className="mb-3 text-[0.9rem] font-semibold">
            Free times on {longDay(day)}
          </p>
          <SlotPicker
            slots={slots}
            selected={selected?.startsAt}
            label={`Free times on ${longDay(day)}`}
            time={time}
            name={(startsAt) => clockWithZone(startsAt, timezone)}
            onSelect={onSelect}
          />
        </div>
      )}
      <p className="mt-1 text-[0.82rem] text-muted">
        Times shown in {zoneLabel(timezone)}.
      </p>
      <FieldError id={ids.error} error={error} />
    </fieldset>
  );
}
