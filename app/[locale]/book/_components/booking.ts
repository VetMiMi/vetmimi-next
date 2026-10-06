// Shared types and formatters for the booking flow.
import type { CSSProperties } from "react";
import { useTranslations } from "next-intl";
import type { components } from "@/lib/api/schema";
import { C } from "@/lib/tokens";
import {
  clockParts,
  localDateKey,
  weekdayIndex,
  zoneAbbreviation,
} from "@/lib/time";

type Schemas = components["schemas"];
export type BookableService = Schemas["PublicBookableService"];
export type ServiceList = Schemas["PublicBookableServiceList"];
export type Availability = Schemas["PublicAvailability"];
export type Slot = Schemas["Slot"];
export type Format = Schemas["Format"];
export type Receipt = Schemas["AppointmentRequestReceipt"];

const MONTH_IDS = [
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

// Calendar column order: Monday first, as lib/time.ts weekdayIndex.
export const DAY_IDS = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
] as const;

// Words for practice dates and times in the visitor's language: "Tuesday 6
// October 2026", "10:00 am", "AEDT". Names and word order come from
// messages (Intl's Burmese uses Burmese digits and other month names);
// the clock and zone always come from the practice timezone.
export function usePracticeFormat(timeZone: string) {
  const t = useTranslations("book.calendar");
  const date = (key: string) => {
    const [year, month, day] = key.split("-").map(Number);
    return t("fullDate", {
      weekday: t(`weekdays.${DAY_IDS[weekdayIndex(key)]}`),
      day: String(day),
      month: t(`months.${MONTH_IDS[month - 1]}`),
      year: String(year),
    });
  };
  const time = (instant: string) => t("clock", clockParts(instant, timeZone));
  const zone = (instant: string) => zoneAbbreviation(instant, timeZone);
  return {
    date,
    time,
    zone,
    month: (month: string) =>
      t("monthYear", {
        month: t(`months.${MONTH_IDS[Number(month.slice(5)) - 1]}`),
        year: month.slice(0, 4),
      }),
    dateTime: (instant: string) =>
      t("dateAtTime", {
        date: date(localDateKey(instant, timeZone)),
        time: time(instant),
      }),
  };
}

// The quiet text button used for Back and Edit.
export const textButton: CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  fontFamily: "var(--sans)",
  color: `${C.ink}88`,
  fontSize: "0.9rem",
  padding: 0,
};

export const stepTitle: CSSProperties = {
  fontFamily: "var(--serif)",
  fontSize: "clamp(1.6rem,3vw,2.2rem)",
  color: C.ink,
  marginBottom: "0.5rem",
};

export const stepIntro: CSSProperties = {
  fontFamily: "var(--sans)",
  color: `${C.ink}BB`,
  marginBottom: "2rem",
};
