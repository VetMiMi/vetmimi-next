"use client";

import { useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import Link from "next/link";
import {
  CaretLeft,
  CaretRight,
  Check,
  CircleHalf,
  PencilSimple,
  Prohibit,
} from "@phosphor-icons/react";
import { buttonClass } from "@/components/admin/Button";
import { datesBetween, type CalendarDay } from "@/lib/admin/availability";
import { addDays, addMonths, weekdayIndex } from "@/lib/time";
import { DayCell } from "./DayCell";
import { DayPanel } from "./DayPanel";

const PATH = "/admin/availability";
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const monthTitle = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  month: "long",
  year: "numeric",
});

// One month of dates: click one to change it, or several (Select days,
// Shift for a run, Ctrl or ⌘ for one more) to change them together.
export function DaysCalendar({
  month,
  today,
  timezone,
  days,
}: {
  month: string;
  today: string;
  timezone: string;
  days: CalendarDay[];
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [anchor, setAnchor] = useState<string>();
  const [selecting, setSelecting] = useState(false);
  const future = days.filter((day) => !day.past).map((day) => day.date);
  const [focusDate, setFocusDate] = useState(future[0]);
  const buttons = useRef(new Map<string, HTMLButtonElement>());

  function pick(date: string, event: MouseEvent) {
    if (event.shiftKey && anchor) {
      const [from, to] = [anchor, date].sort();
      setSelected(datesBetween(from, to).filter((d) => future.includes(d)));
      setFocusDate(date);
      return;
    }
    setAnchor(date);
    setFocusDate(date);
    if (selecting || event.ctrlKey || event.metaKey)
      setSelected((list) =>
        list.includes(date) ? list.filter((d) => d !== date) : [...list, date],
      );
    else
      setSelected((list) =>
        list.length === 1 && list[0] === date ? [] : [date],
      );
  }

  function move(event: KeyboardEvent, date: string) {
    const step: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
      Home: -weekdayIndex(date),
      End: 6 - weekdayIndex(date),
    };
    if (!(event.key in step)) return;
    event.preventDefault();
    const target = addDays(date, step[event.key]);
    if (!future.includes(target)) return;
    setFocusDate(target);
    buttons.current.get(target)?.focus();
  }

  const [y, m] = month.split("-").map(Number);
  const blanks = weekdayIndex(`${month}-01`);
  const cells: (CalendarDay | null)[] = [
    ...Array<null>(blanks).fill(null),
    ...days,
  ];
  const weeks: (CalendarDay | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  const thisMonth = today.slice(0, 7);
  const stepClass =
    "grid size-11 place-items-center rounded-control text-ink hover:bg-indigo/12";

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="min-w-0">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            {month > thisMonth ? (
              <Link
                href={`${PATH}?month=${addMonths(month, -1)}`}
                scroll={false}
                aria-label="Previous month"
                className={stepClass}
              >
                <CaretLeft aria-hidden="true" size={20} />
              </Link>
            ) : (
              <span aria-hidden="true" className="size-11" />
            )}
            <h3
              id="calendar-month"
              aria-live="polite"
              className="min-w-[9.5rem] text-center text-[1.15rem]"
            >
              {monthTitle.format(Date.UTC(y, m - 1, 1))}
            </h3>
            <Link
              href={`${PATH}?month=${addMonths(month, 1)}`}
              scroll={false}
              aria-label="Next month"
              className={stepClass}
            >
              <CaretRight aria-hidden="true" size={20} />
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {month !== thisMonth && (
              <Link
                href={PATH}
                scroll={false}
                className="text-[0.88rem] font-semibold text-indigo underline underline-offset-4"
              >
                This month
              </Link>
            )}
            <button
              type="button"
              aria-pressed={selecting}
              onClick={() => setSelecting(!selecting)}
              className={buttonClass(
                "secondary",
                "control",
                "aria-pressed:bg-indigo aria-pressed:text-white",
              )}
            >
              {selecting && <Check aria-hidden="true" size={16} />}
              Select days
            </button>
          </div>
        </div>
        {selecting && (
          <p className="mb-3 text-[0.88rem] text-muted">
            Tap every day you want, then choose what to do with them.
          </p>
        )}

        <div
          role="grid"
          aria-labelledby="calendar-month"
          className="flex flex-col gap-px overflow-hidden rounded-inner border border-divider bg-divider"
        >
          <div role="row" className="grid grid-cols-7 gap-px">
            {WEEKDAYS.map((name) => (
              <div
                key={name}
                role="columnheader"
                className="bg-raised py-2 text-center text-[0.75rem] font-semibold text-muted"
              >
                {name}
              </div>
            ))}
          </div>
          {weeks.map((week, i) => (
            <div key={i} role="row" className="grid grid-cols-7 gap-px">
              {week.map((day, j) =>
                day ? (
                  <div key={day.date} role="gridcell" className="flex">
                    <DayCell
                      day={day}
                      today={day.date === today}
                      selected={selected.includes(day.date)}
                      focusable={day.date === focusDate}
                      buttonRef={(el) => {
                        if (el) buttons.current.set(day.date, el);
                        else buttons.current.delete(day.date);
                      }}
                      onClick={(event) => pick(day.date, event)}
                      onKeyDown={(event) => move(event, day.date)}
                    />
                  </div>
                ) : (
                  <div
                    key={`blank-${j}`}
                    role="gridcell"
                    className="bg-paper"
                  />
                ),
              )}
              {week.length < 7 &&
                Array.from({ length: 7 - week.length }, (_, k) => (
                  <div key={`end-${k}`} role="gridcell" className="bg-paper" />
                ))}
            </div>
          ))}
        </div>

        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[0.82rem] text-muted">
          <li className="flex items-center gap-1.5">
            <PencilSimple aria-hidden="true" size={16} /> Changed hours
          </li>
          <li className="flex items-center gap-1.5">
            <Prohibit aria-hidden="true" size={16} /> Day off
          </li>
          <li className="flex items-center gap-1.5">
            <CircleHalf aria-hidden="true" size={16} /> Off part of the day
          </li>
          <li className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="rounded-pill bg-indigo/12 px-1.5 text-[0.72rem] font-semibold text-indigo"
            >
              2
            </span>
            Appointments booked
          </li>
        </ul>
      </div>

      <DayPanel
        key={selected.join()}
        days={days.filter((day) => selected.includes(day.date))}
        timezone={timezone}
        onDone={() => setSelected([])}
      />
    </div>
  );
}
