import type { components } from "@/lib/api/schema";
import { addDays } from "@/lib/localDate";
import {
  formatClock,
  formatDay,
  zoneAbbreviation,
  zonedParts,
} from "@/lib/zonedTime";

type Block = components["schemas"]["AvailabilityBlock"];

// A block as the form edits it: whole days run to the midnight after the
// last day, so the last day is the day before the end.
export function blockFields(block: Block, timezone: string) {
  const start = zonedParts(block.startsAt, timezone);
  const end = zonedParts(block.endsAt, timezone);
  const lastDay = addDays(end.date, -1);
  const mode = !block.allDay
    ? "part"
    : lastDay === start.date
      ? "day"
      : "range";
  return { mode, date: start.date, lastDay, start: start.time, end: end.time };
}

// "Mon 12 Oct, all day", "Mon 19 Oct – Fri 23 Oct, all day" or
// "Tue 13 Oct, 1:00 pm–3:00 pm AEDT".
export function describeBlock(block: Block, timezone: string) {
  const { mode, date, lastDay, start, end } = blockFields(block, timezone);
  if (mode === "day") return `${formatDay(date)}, all day`;
  if (mode === "range")
    return `${formatDay(date)} – ${formatDay(lastDay)}, all day`;
  const zone = zoneAbbreviation(block.startsAt, timezone);
  return `${formatDay(date)}, ${formatClock(start)}–${formatClock(end)} ${zone}`;
}
