// The export dialog's dates and messages, pure so node:test covers them.
import { addDays } from "../time.ts";

type Range = { from: string; to: string };

// The API takes at most 366 days: the year ending 60 days from today.
export function defaultRange(today: string): Range {
  const to = addDays(today, 60);
  return { from: addDays(to, -365), to };
}

// What stops the dates being sent, keyed by the field to mark.
export function rangeErrors({ from, to }: Range): {
  from?: string;
  to?: string;
} {
  if (!from) return { from: "Choose a From date." };
  if (!to) return { to: "Choose a To date." };
  if (from > to) return { to: "Choose a To date on or after the From date." };
  return {};
}

// No status means the request never got an answer.
export function exportFailure(status?: number) {
  if (status === 400) return "Choose a range of a year or less.";
  if (status === 401)
    return "Your session has ended. Sign in again, then download the file.";
  return "The export did not download. Try again.";
}

export function exportFileName(disposition: string | null) {
  return (
    disposition?.match(/filename="([^"]+)"/)?.[1] ?? "vetmimi-appointments.csv"
  );
}
