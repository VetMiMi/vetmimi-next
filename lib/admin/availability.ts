// The availability page's rules: the week as Daw Mi edits it, what each
// calendar date looks like, and which saved changes touch the dates she
// picks. Pure, so node:test covers it.
import type { Settings } from "../api/types/admin.ts";
import type { AppointmentSummary } from "../api/types/appointments.ts";
import type {
  AvailabilityBlock,
  AvailabilityOverride,
  AvailabilityRuleInput,
} from "../api/types/booking.ts";
import { addDays, lastDayOfMonth, weekdayIndex } from "../time.ts";
import { endsTooEarly, findOverlap } from "../timeRange.ts";
import { formatClock, zonedDayStart, zonedParts } from "../zonedTime.ts";

type Rule = AvailabilityRuleInput;
type Override = AvailabilityOverride;
type Block = AvailabilityBlock;
type Appointment = AppointmentSummary;

export type Hours = { start: string; end: string };
// Index 0 is Monday; the API numbers weekdays 1 (Monday) to 7.
export type Week = Hours[][];

export const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const DEFAULT_HOURS: Hours = { start: "10:00", end: "17:00" };

const byStart = (a: Hours, b: Hours) => a.start.localeCompare(b.start);

export function weekFromRules(rules: readonly Rule[]): Week {
  return WEEKDAYS.map((_, i) =>
    rules
      .filter((rule) => rule.weekday === i + 1)
      .map((rule) => ({ start: rule.startTime, end: rule.endTime }))
      .sort(byStart),
  );
}

export function rulesFromWeek(week: Week): Rule[] {
  return week.flatMap((day, i) =>
    day.map((hours) => ({
      weekday: i + 1,
      startTime: hours.start,
      endTime: hours.end,
    })),
  );
}

// The weekdays of the chosen dates as indexes into a Week, Monday first.
export function weekdaysOf(dates: readonly string[]) {
  const days = dates.map(
    (date) => (new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7,
  );
  return [...new Set(days)].sort((a, b) => a - b);
}

// The week with each of `weekdays` set to `hours`; no hours stops that day.
export function withWeekdays(
  week: Week,
  weekdays: readonly number[],
  hours: readonly Hours[],
) {
  return week.map((day, i) =>
    weekdays.includes(i) ? hours.map((h) => ({ ...h })) : day,
  );
}

export const hoursText = (hours: Hours) =>
  `${formatClock(hours.start)}–${formatClock(hours.end)}`;

// "9am–12:30pm", short enough for a calendar cell.
export function shortHours({ start, end }: Hours) {
  const short = (time: string) =>
    formatClock(time).replace(":00", "").replace(" ", "");
  return `${short(start)}–${short(end)}`;
}

// One message per range, or undefined where it is fine. Touching ranges
// (10–1 and 1–5) are allowed, as in the API.
export function hoursErrors(day: readonly Hours[]): (string | undefined)[] {
  return day.map((hours, i) => {
    if (!hours.start || !hours.end) return "Enter a start and an end time.";
    if (endsTooEarly(hours.start, hours.end))
      return "End time must be after start time.";
    const earlier = day
      .slice(0, i)
      .filter((h) => h.start && h.end && !endsTooEarly(h.start, h.end))
      .map((h) => ({ startTime: h.start, endTime: h.end }));
    const overlap = findOverlap(
      { startTime: hours.start, endTime: hours.end },
      earlier,
    );
    return overlap
      ? `This overlaps ${hoursText({ start: overlap.startTime, end: overlap.endTime })}.`
      : undefined;
  });
}

export function datesBetween(first: string, last: string): string[] {
  const dates: string[] = [];
  for (let date = first; date <= last; date = addDays(date, 1))
    dates.push(date);
  return dates;
}

// Picked dates as runs of consecutive days, so a week away is one day off,
// not seven.
export function consecutiveRuns(dates: readonly string[]) {
  const sorted = [...new Set(dates)].sort();
  const runs: { first: string; last: string }[] = [];
  for (const date of sorted) {
    const run = runs.at(-1);
    if (run && addDays(run.last, 1) === date) run.last = date;
    else runs.push({ first: date, last: date });
  }
  return runs;
}

const ms = (instant: string) => Date.parse(instant);

// The local dates a block touches. One that ends at midnight does not
// touch the day after.
function blockDates(block: Block, timeZone: string) {
  const first = zonedParts(block.startsAt, timeZone).date;
  const end = zonedParts(block.endsAt, timeZone);
  const last = end.time === "00:00" ? addDays(end.date, -1) : end.date;
  return datesBetween(first, last < first ? first : last);
}

function wholeDayOff(block: Block, date: string, timeZone: string) {
  const dayStart = ms(zonedDayStart(date, timeZone));
  const dayEnd = ms(zonedDayStart(addDays(date, 1), timeZone));
  return ms(block.startsAt) <= dayStart && ms(block.endsAt) >= dayEnd;
}

export type DayState = "open" | "closed" | "changed" | "off";

export type CalendarDay = {
  date: string;
  past: boolean;
  state: DayState;
  // What clients can book that day before appointments: the weekly hours or
  // the changed ones. Empty on a day off.
  hours: Hours[];
  // Part-day time off, in local times.
  offHours: Hours[];
  // Private notes and reasons saved with that day's changes.
  notes: string[];
  appointments: Appointment[];
};

// The panel's one-line description of a chosen day.
export function daySummary(day: CalendarDay) {
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

// Every date of the month with its state. A whole-day block wins over
// changed hours; "replace" hours stand in for the week, "open" ones add to it.
export function calendarDays(
  month: string,
  data: {
    timeZone: string;
    today: string;
    week: Week;
    overrides: readonly Override[];
    blocks: readonly Block[];
    appointments: readonly Appointment[];
  },
): CalendarDay[] {
  const { timeZone, today, week, overrides, blocks, appointments } = data;
  const local = (instant: string) => zonedParts(instant, timeZone);

  return datesBetween(`${month}-01`, lastDayOfMonth(month)).map((date) => {
    const changes = overrides.filter((o) => o.onDate === date);
    const toHours = (o: Override) => ({
      start: local(o.startsAt).time,
      end: local(o.endsAt).time,
    });
    const replaced = changes.filter((o) => o.kind === "replace");
    const added = changes.filter((o) => o.kind === "open");
    const base = replaced.length
      ? replaced.map(toHours)
      : week[weekdayIndex(date)];

    const touching = blocks.filter((b) =>
      blockDates(b, timeZone).includes(date),
    );
    const off = touching.some((b) => wholeDayOff(b, date, timeZone));
    const offHours = off
      ? []
      : touching.map((b) => ({
          start:
            local(b.startsAt).date < date ? "00:00" : local(b.startsAt).time,
          end: local(b.endsAt).date > date ? "24:00" : local(b.endsAt).time,
        }));

    const hours = off ? [] : [...base, ...added.map(toHours)].sort(byStart);
    const state: DayState = off
      ? "off"
      : changes.length
        ? "changed"
        : hours.length
          ? "open"
          : "closed";
    return {
      date,
      past: date < today,
      state,
      hours,
      offHours: offHours.sort(byStart),
      notes: [
        ...changes.flatMap((o) => (o.note ? [o.note] : [])),
        ...touching.flatMap((b) => (b.reason ? [b.reason] : [])),
      ],
      appointments: appointments.filter(
        (a) =>
          (a.status === "pending" || a.status === "confirmed") &&
          local(a.startsAt).date === date,
      ),
    };
  });
}

// What has to go so the picked dates are back on the weekly hours: their
// changed hours and every block touching them. A block of whole days that
// also covers other dates is deleted and its other dates blocked again,
// with the same reason.
export function clearPlan(
  dates: readonly string[],
  overrides: readonly Override[],
  blocks: readonly Block[],
  timeZone: string,
) {
  const picked = new Set(dates);
  const deleteBlocks: string[] = [];
  const reblock: { first: string; last: string; reason?: string }[] = [];
  for (const block of blocks) {
    const touched = blockDates(block, timeZone);
    if (!touched.some((date) => picked.has(date))) continue;
    deleteBlocks.push(block.id);
    if (!block.allDay) continue;
    const kept = touched.filter((date) => !picked.has(date));
    for (const run of consecutiveRuns(kept))
      reblock.push({ ...run, reason: block.reason });
  }
  return {
    deleteOverrides: overrides
      .filter((o) => picked.has(o.onDate))
      .map((o) => o.id),
    deleteBlocks,
    reblock,
  };
}

// Picked dates a block already takes off completely; marking them off
// again would only split that block.
export function alreadyOff(
  dates: readonly string[],
  blocks: readonly Block[],
  timeZone: string,
) {
  return dates.filter((date) =>
    blocks.some((block) => wholeDayOff(block, date, timeZone)),
  );
}

// Why the client preview shows no times on a date, as far as the page can
// tell without asking the API.
export function noTimesReason({
  date,
  today,
  settings,
  servicePaused,
  day,
}: {
  date: string;
  today: string;
  settings: Pick<
    Settings,
    "publicBookingEnabled" | "maxAdvanceDays" | "minNoticeHours"
  >;
  servicePaused: boolean;
  day?: Pick<CalendarDay, "state">;
}) {
  const { publicBookingEnabled, maxAdvanceDays, minNoticeHours } = settings;
  if (publicBookingEnabled === false)
    return "Online booking is switched off in Settings, so clients cannot book any time.";
  if (servicePaused)
    return "This service is paused, so clients cannot book it.";
  if (maxAdvanceDays !== undefined && date > addDays(today, maxAdvanceDays))
    return `Clients can book up to ${maxAdvanceDays} days ahead.`;
  if (day?.state === "off") return "You marked this date as a day off.";
  if (day?.state === "closed") return "You are not working that day.";
  if (minNoticeHours && date <= addDays(today, Math.ceil(minNoticeHours / 24)))
    return `Clients need ${minNoticeHours} hours' notice, or the day may be fully booked.`;
  return "Every time that day is booked, or too short for this service.";
}
