import type { KeyboardEvent, MouseEvent } from "react";
import {
  Check,
  CircleHalf,
  PencilSimple,
  Prohibit,
} from "@phosphor-icons/react";
import {
  hoursText,
  shortHours,
  type CalendarDay,
} from "@/lib/admin/availability";
import { longDay } from "@/lib/admin/appointments";

function describe(day: CalendarDay) {
  const hours = day.hours.map(hoursText).join(" and ");
  const state = {
    open: `open ${hours}`,
    closed: "not working",
    changed: `changed hours ${hours}`,
    off: "day off",
  }[day.state];
  const partOff = day.offHours.length
    ? `, off ${day.offHours.map(hoursText).join(" and ")}`
    : "";
  const count = day.appointments.length;
  const booked = count
    ? `, ${count} ${count === 1 ? "appointment" : "appointments"}`
    : "";
  return `${longDay(day.date)}: ${state}${partOff}${booked}`;
}

function cellText(day: CalendarDay) {
  if (day.state === "off") return "Day off";
  if (day.offHours.length) return `Off ${shortHours(day.offHours[0])}`;
  if (day.state === "closed") return "Not working";
  // The whole working span; the panel and the button's name list each range.
  const end = day.hours
    .map((h) => h.end)
    .sort()
    .at(-1)!;
  return shortHours({ start: day.hours[0].start, end });
}

const icons = { off: Prohibit, changed: PencilSimple };

// One date in the calendar. Its full state is in the button's name; the
// cell shows a short version, and only the icon and count on a phone.
export function DayCell({
  day,
  today,
  selected,
  focusable,
  buttonRef,
  onClick,
  onKeyDown,
}: {
  day: CalendarDay;
  today: boolean;
  selected: boolean;
  focusable: boolean;
  buttonRef: (el: HTMLButtonElement | null) => void;
  onClick: (event: MouseEvent) => void;
  onKeyDown: (event: KeyboardEvent) => void;
}) {
  const number = Number(day.date.slice(8));
  if (day.past)
    return (
      <div className="min-h-14 w-full bg-paper p-1.5 text-[0.82rem] text-caption sm:min-h-20">
        <span aria-hidden="true">{number}</span>
        <span className="sr-only">{longDay(day.date)}, past</span>
      </div>
    );

  const Icon =
    day.state === "off" || day.state === "changed"
      ? icons[day.state]
      : day.offHours.length
        ? CircleHalf
        : null;
  const tone = selected
    ? "bg-indigo text-white"
    : day.state === "closed" || day.state === "off"
      ? "bg-paper text-muted hover:bg-indigo/12"
      : "bg-white text-ink hover:bg-indigo/12";

  return (
    <button
      ref={buttonRef}
      type="button"
      tabIndex={focusable ? 0 : -1}
      aria-label={describe(day)}
      title={describe(day)}
      aria-pressed={selected}
      aria-current={today ? "date" : undefined}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={`relative flex min-h-14 w-full cursor-pointer flex-col items-start gap-1 p-1.5 text-left transition-colors duration-150 motion-reduce:transition-none sm:min-h-20 ${tone}`}
    >
      <span
        className={`grid size-6 place-items-center rounded-pill text-[0.82rem] leading-none font-semibold ${today ? "ring-2 ring-rose" : ""} ${day.state === "off" ? "line-through" : ""}`}
      >
        {number}
      </span>
      {selected && (
        <Check
          aria-hidden="true"
          size={14}
          className="absolute top-1.5 right-1.5"
        />
      )}
      <span
        aria-hidden="true"
        className="hidden w-full truncate text-[0.72rem] leading-tight sm:block"
      >
        {cellText(day)}
      </span>
      <span
        aria-hidden="true"
        className="mt-auto flex w-full items-center justify-between gap-1"
      >
        {Icon ? <Icon size={14} /> : <span />}
        {day.appointments.length > 0 && (
          <span
            className={`rounded-pill px-1.5 text-[0.72rem] font-semibold ${selected ? "bg-white text-indigo" : "bg-indigo/12 text-indigo"}`}
          >
            {day.appointments.length}
          </span>
        )}
      </span>
    </button>
  );
}
