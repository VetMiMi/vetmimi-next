"use client";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { addDays, monthGrid, weekdayIndex } from "@/lib/time";

export type CalendarLabels = {
  title: string; // "October 2026"
  weekdaysShort: readonly string[]; // Monday first
  previousMonth: string;
  nextMonth: string;
  // Full accessible name of a day: "Tuesday 6 October 2026, 3 times available".
  day: (date: string, count: number) => string;
};

// One month of practice-calendar days ("YYYY-MM-DD"), Monday first. Days
// with a count above zero can be chosen. All arithmetic goes through
// lib/time.ts, so the visitor's own timezone can never shift a day.
// Arrow keys move by day and week, Home/End to the week's ends and
// PageUp/PageDown by month.
export function CalendarMonth({
  month,
  counts,
  selected,
  today,
  busy,
  canPrevious,
  canNext,
  labels,
  onSelect,
  onMonthChange,
}: {
  month: string;
  counts: ReadonlyMap<string, number>;
  selected?: string;
  today: string;
  busy?: boolean;
  canPrevious: boolean;
  canNext: boolean;
  labels: CalendarLabels;
  onSelect: (date: string) => void;
  onMonthChange: (step: -1 | 1) => void;
}) {
  const cells = monthGrid(month);
  const days = cells.filter((d): d is string => d !== null);
  const fallback = days.find((d) => counts.get(d)) ?? days[0];
  const [focusDay, setFocusDay] = useState<string>();
  const current = focusDay?.startsWith(month)
    ? focusDay
    : selected?.startsWith(month)
      ? selected
      : fallback;
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const keyboard = useRef(false);

  useEffect(() => {
    if (!keyboard.current) return;
    buttons.current.get(current)?.focus();
  }, [current]);

  const move = (target: string) => {
    keyboard.current = true;
    if (target.slice(0, 7) < month && canPrevious) onMonthChange(-1);
    else if (target.slice(0, 7) > month && canNext) onMonthChange(1);
    else if (!target.startsWith(month)) return;
    setFocusDay(target);
  };

  const onKeyDown = (e: KeyboardEvent, date: string) => {
    const step: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
      Home: -weekdayIndex(date),
      End: 6 - weekdayIndex(date),
    };
    if (e.key in step) move(addDays(date, step[e.key]));
    else if (e.key === "PageUp") move(addDays(date, -28));
    else if (e.key === "PageDown") move(addDays(date, 28));
    else return;
    e.preventDefault();
  };

  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <div className="mb-6 max-w-[420px] rounded-control border border-ink/9 bg-white p-6">
      <div className="mb-5 flex items-center justify-between">
        <MonthButton
          label={labels.previousMonth}
          disabled={!canPrevious}
          onClick={() => onMonthChange(-1)}
        >
          ‹
        </MonthButton>
        <span
          id={`calendar-${month}`}
          aria-live="polite"
          className="font-semibold text-ink"
        >
          {labels.title}
        </span>
        <MonthButton
          label={labels.nextMonth}
          disabled={!canNext}
          onClick={() => onMonthChange(1)}
        >
          ›
        </MonthButton>
      </div>

      <div
        role="grid"
        aria-labelledby={`calendar-${month}`}
        aria-busy={busy || undefined}
      >
        <div role="row" className={weekRow}>
          {labels.weekdaysShort.map((d) => (
            <div
              key={d}
              role="columnheader"
              className="mb-2 py-1 text-center text-[0.72rem] font-semibold text-muted"
            >
              {d}
            </div>
          ))}
        </div>
        {weeks.map((week, i) => (
          <div key={i} role="row" className={`mb-[2px] ${weekRow}`}>
            {week.map((date, j) =>
              date ? (
                <div key={date} role="gridcell">
                  <DayButton
                    date={date}
                    count={busy ? 0 : (counts.get(date) ?? 0)}
                    selected={date === selected}
                    today={date === today}
                    tabIndex={date === current ? 0 : -1}
                    label={labels.day(date, busy ? 0 : (counts.get(date) ?? 0))}
                    buttonRef={(el) => {
                      if (el) buttons.current.set(date, el);
                      else buttons.current.delete(date);
                    }}
                    onClick={() => {
                      keyboard.current = false;
                      setFocusDay(date);
                      onSelect(date);
                    }}
                    onKeyDown={(e) => onKeyDown(e, date)}
                  />
                </div>
              ) : (
                <div key={`empty-${j}`} role="gridcell" />
              ),
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const weekRow = "grid grid-cols-[repeat(7,1fr)] gap-[2px]";

function MonthButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`min-h-11 min-w-11 text-[1.1rem] ${disabled ? "cursor-default text-ink/20" : "cursor-pointer text-ink"}`}
    >
      <span aria-hidden>{children}</span>
    </button>
  );
}

function DayButton({
  date,
  count,
  selected,
  today,
  tabIndex,
  label,
  buttonRef,
  onClick,
  onKeyDown,
}: {
  date: string;
  count: number;
  selected: boolean;
  today: boolean;
  tabIndex: number;
  label: string;
  buttonRef: (el: HTMLButtonElement | null) => void;
  onClick: () => void;
  onKeyDown: (e: KeyboardEvent) => void;
}) {
  const available = count > 0;
  const tone = selected
    ? "border-indigo bg-indigo text-white"
    : available
      ? "border-transparent bg-coral/9 text-coral"
      : "border-transparent text-ink/20";
  const cursor = available ? "cursor-pointer" : "cursor-default";
  const weight = available || today ? "font-semibold" : "font-normal";
  return (
    <button
      ref={buttonRef}
      type="button"
      tabIndex={tabIndex}
      aria-label={label}
      aria-pressed={selected}
      aria-disabled={!available || undefined}
      aria-current={today ? "date" : undefined}
      onClick={available ? onClick : undefined}
      onKeyDown={onKeyDown}
      className={`flex aspect-square w-full items-center justify-center rounded-cell border-2 text-[0.82rem] transition-[background-color,color,border-color] ease-[ease] ${cursor} ${weight} ${tone}`}
    >
      {Number(date.slice(8))}
    </button>
  );
}
