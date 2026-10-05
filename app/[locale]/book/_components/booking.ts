// Shared types, helpers and styles for the booking flow.
import type { CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { C } from "@/lib/tokens";
import { fromLocalDateKey } from "@/lib/localDate";

export type BookingState =
  null | "success" | "failed" | "no-times" | "time-lost" | "unavailable";

// Stable ids kept in state; visible labels live in messages/<locale>/book.json.
export const SERVICE_IDS = ["individual", "group"] as const;
export type ServiceId = (typeof SERVICE_IDS)[number];

// Online only for now. To offer in-person sessions, add "inPerson" here and
// its labels in messages/<locale>/book.json.
export const FORMAT_IDS = ["online"] as const;
export type FormatId = (typeof FORMAT_IDS)[number];

export const TIME_SLOTS = ["10am", "11am", "2pm", "3pm"] as const;
export type TimeSlot = (typeof TIME_SLOTS)[number];

export interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  format: FormatId | "";
  note: string;
  privacyAck: boolean;
  policyAck: boolean;
}

export function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

// Indexed by Date.getMonth().
export const MONTH_IDS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
] as const;

// Indexed by Date.getDay() (Sunday first).
const WEEKDAY_IDS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

// Calendar column order (Monday first).
export const DAY_IDS = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
] as const;

export function isAvailableDate(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const fiveDaysFromNow = new Date(today);
  fiveDaysFromNow.setDate(today.getDate() + 5);
  const day = date.getDay();
  return date >= fiveDaysFromNow && (day === 2 || day === 4);
}

// Returns a formatter for a selected date in the visitor's language, e.g.
// "Tuesday 6 October 2026" or "အင်္ဂါနေ့၊ 2026 အောက်တိုဘာလ 6 ရက်". The word
// order comes from messages so each language can set its own; digits stay
// Western in both.
export function useFormatDate() {
  const t = useTranslations("book.calendar");
  return (dateStr: string): string => {
    if (!dateStr) return "";
    const d = fromLocalDateKey(dateStr);
    return t("fullDate", {
      weekday: t(`weekdays.${WEEKDAY_IDS[d.getDay()]}`),
      day: String(d.getDate()),
      month: t(`months.${MONTH_IDS[d.getMonth()]}`),
      year: String(d.getFullYear()),
    });
  };
}

// ── Input styles ─────────────────────────────────────────────────────────────

export const inputStyle: CSSProperties = {
  width: "100%",
  padding: "0.75rem 1rem",
  border: `1px solid ${C.ink}33`,
  borderRadius: 4,
  fontFamily: "var(--sans)",
  fontSize: "1rem",
  marginBottom: "1rem",
  backgroundColor: "#fff",
  color: C.ink,
  outline: "none",
  boxSizing: "border-box",
};
