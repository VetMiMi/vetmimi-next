// The dashboard's sentence for each thing waiting on Daw Mi.
import type { AttentionItem } from "../api/types/appointments.ts";
import { addDays } from "../time.ts";
import { formatClock, formatDay, zonedParts } from "../zonedTime.ts";

export type LineContext = {
  timeZone: string;
  today: string;
  // Attention items do not carry it; the dashboard's pending list does.
  holdExpiresAt?: string;
};

type Line = (reference: string, context: LineContext) => string;

// "at 3:00 pm today", "at 9:00 am tomorrow" or "at 9:00 am on Thu 8 Oct".
function at(instant: string, { timeZone, today }: LineContext) {
  const { date, time } = zonedParts(instant, timeZone);
  const day =
    date === today
      ? "today"
      : date === addDays(today, 1)
        ? "tomorrow"
        : `on ${formatDay(date)}`;
  return `at ${formatClock(time)} ${day}`;
}

const lines: Record<AttentionItem["kind"], Line> = {
  pending_request: (ref) => `Request ${ref} awaits your reply`,
  hold_expiring: (ref, context) =>
    `Request ${ref} expires ${context.holdExpiresAt ? at(context.holdExpiresAt, context) : "soon"}`,
  failed_communication: (ref) => `An email for ${ref} failed to send`,
  reschedule_requested: (ref) => `${ref} asked to reschedule`,
  meeting_link_missing: (ref) => `${ref} has no meeting link`,
  completion_due: (ref) => `${ref} has passed — mark completed or no-show`,
  block_conflict: (ref) => `A block overlaps ${ref}`,
};

// The API may send a kind before this table knows it.
export function attentionLine(item: AttentionItem, context: LineContext) {
  const line: Line | undefined = lines[item.kind];
  return line
    ? line(item.reference, context)
    : `${item.reference} needs attention`;
}
