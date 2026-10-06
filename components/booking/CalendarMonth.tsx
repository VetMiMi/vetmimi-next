"use client";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { AA, C } from "@/lib/tokens";
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
    <div
      style={{
        backgroundColor: "#fff",
        border: `1px solid ${C.ink}18`,
        borderRadius: 10,
        padding: "1.5rem",
        marginBottom: "1.5rem",
        maxWidth: 420,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.25rem",
        }}
      >
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
          style={{ fontFamily: "var(--sans)", fontWeight: 600, color: C.ink }}
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
        <div role="row" style={rowStyle}>
          {labels.weekdaysShort.map((d) => (
            <div
              key={d}
              role="columnheader"
              style={{
                textAlign: "center",
                fontSize: "0.72rem",
                fontFamily: "var(--sans)",
                color: AA.muted,
                fontWeight: 600,
                padding: "0.25rem 0",
                marginBottom: "0.5rem",
              }}
            >
              {d}
            </div>
          ))}
        </div>
        {weeks.map((week, i) => (
          <div key={i} role="row" style={{ ...rowStyle, marginBottom: 2 }}>
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

const rowStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(7,1fr)",
  gap: "2px",
} as const;

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
      style={{
        background: "none",
        border: "none",
        cursor: disabled ? "default" : "pointer",
        fontSize: "1.1rem",
        color: disabled ? `${C.ink}33` : C.ink,
        minWidth: 44,
        minHeight: 44,
      }}
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
      className="booking-day"
      style={{
        width: "100%",
        aspectRatio: "1",
        border: selected ? `2px solid ${C.indigo}` : "2px solid transparent",
        borderRadius: 6,
        cursor: available ? "pointer" : "default",
        backgroundColor: selected
          ? C.indigo
          : available
            ? `${C.coral}18`
            : "transparent",
        color: selected ? "#fff" : available ? C.coral : `${C.ink}33`,
        fontFamily: "var(--sans)",
        fontSize: "0.82rem",
        fontWeight: available || today ? 600 : 400,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {Number(date.slice(8))}
    </button>
  );
}
