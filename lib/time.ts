// Dates and times for the booking flow, always in the practice timezone.
// Instants (UTC RFC 3339 from the API) go through Intl with `timeZone`,
// never by adding hours. Calendar dates are "YYYY-MM-DD" keys and months
// "YYYY-MM"; their arithmetic runs on Date.UTC, so the visitor's own zone
// can never move a day (#24).
import type { components } from "./api/schema";
import { zonedParts } from "./zonedTime.ts";

export { zoneAbbreviation } from "./zonedTime.ts";

type Slot = components["schemas"]["Slot"];

// The practice-calendar date an instant falls on.
export function localDateKey(instant: string | Date, timeZone: string) {
  return zonedParts(instant, timeZone).date;
}

// The practice's wall clock at an instant, split for a 12-hour template:
// { hour: "2", minute: "30", period: "pm" }. Western digits in every locale.
export function clockParts(instant: string | Date, timeZone: string) {
  const [h, m] = zonedParts(instant, timeZone).time.split(":").map(Number);
  return {
    hour: String(h % 12 === 0 ? 12 : h % 12),
    minute: String(m).padStart(2, "0"),
    period: h < 12 ? "am" : "pm",
  } as const;
}

// Slots under the practice date they start on, in API order.
export function groupSlotsByDay(slots: readonly Slot[], timeZone: string) {
  const days = new Map<string, Slot[]>();
  for (const slot of slots) {
    const key = localDateKey(slot.startsAt, timeZone);
    days.set(key, [...(days.get(key) ?? []), slot]);
  }
  return days;
}

function utc(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d ?? 1));
}

function keyOf(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function addDays(key: string, days: number) {
  const date = utc(key);
  date.setUTCDate(date.getUTCDate() + days);
  return keyOf(date);
}

export function addMonths(month: string, months: number) {
  const date = utc(month);
  date.setUTCMonth(date.getUTCMonth() + months);
  return keyOf(date).slice(0, 7);
}

// 0 = Monday … 6 = Sunday (ISO weekdays, as availability_rules).
export function weekdayIndex(key: string) {
  return (utc(key).getUTCDay() + 6) % 7;
}

export function lastDayOfMonth(month: string) {
  return addDays(`${addMonths(month, 1)}-01`, -1);
}

// The month's days, with nulls before the 1st so that column 0 is Monday.
export function monthGrid(month: string): (string | null)[] {
  const first = `${month}-01`;
  const days = Number(lastDayOfMonth(month).slice(8));
  return [
    ...Array<null>(weekdayIndex(first)).fill(null),
    ...Array.from({ length: days }, (_, i) => addDays(first, i)),
  ];
}
