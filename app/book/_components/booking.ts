// Shared types, helpers and styles for the booking flow.
import type { CSSProperties } from "react";
import { C } from "@/lib/tokens";

export type BookingState =
  null | "success" | "failed" | "no-times" | "time-lost" | "unavailable";

export interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  format: string;
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

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const TIME_SLOTS = ["10:00 am", "11:00 am", "2:00 pm", "3:00 pm"];

export function isAvailableDate(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const fiveDaysFromNow = new Date(today);
  fiveDaysFromNow.setDate(today.getDate() + 5);
  const day = date.getDay();
  return date >= fiveDaysFromNow && (day === 2 || day === 4);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
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
