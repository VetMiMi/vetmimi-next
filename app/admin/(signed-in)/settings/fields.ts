import type { components } from "@/lib/api/schema";

export type Settings = components["schemas"]["Settings"];
export type SettingsPatch = components["schemas"]["SettingsPatch"];
type Key = keyof SettingsPatch;
type Option = { value: string; label: string; help?: string };

export type Field =
  | {
      kind: "number";
      key: Key;
      label: string;
      unit: string;
      min: number;
      max: number;
      // data-model.md "Settings keys": only the 48-hour notice is confirmed
      // business policy; every other default is provisional.
      default: number;
      confirmed?: boolean;
    }
  | {
      kind: "choice" | "select";
      key: Key;
      label: string;
      options: Option[];
      help?: string;
    }
  | {
      kind: "toggle" | "email" | "localized" | "timezone";
      key: Key;
      label: string;
      help?: string;
    }
  | { kind: "methods"; key: Key; label: string; options: Option[] };

export type SectionId =
  "rules" | "cancellation" | "sessions" | "payment" | "practice";

const hours = (
  key: Key,
  label: string,
  min: number,
  max: number,
  value: number,
  confirmed = false,
): Field => ({
  kind: "number",
  key,
  label,
  unit: "hours",
  min,
  max,
  default: value,
  confirmed,
});

export const sections: Record<
  SectionId,
  { title: string; note?: string; fields: Field[] }
> = {
  rules: {
    title: "Booking rules",
    fields: [
      {
        kind: "choice",
        key: "bookingMode",
        label: "How requests are confirmed",
        options: [
          {
            value: "request_approval",
            label: "Request & approval",
            help: "You confirm each request.",
          },
          {
            value: "instant",
            label: "Instant confirmation",
            help: "Services set to Book are confirmed at once.",
          },
        ],
      },
      hours("minNoticeHours", "Minimum notice", 0, 720, 24),
      {
        kind: "number",
        key: "maxAdvanceDays",
        label: "Furthest ahead visitors can book",
        unit: "days",
        min: 1,
        max: 365,
        default: 60,
      },
      {
        kind: "number",
        key: "slotStepMinutes",
        label: "Gap between start times",
        unit: "minutes",
        min: 5,
        max: 120,
        default: 30,
      },
      hours(
        "pendingHoldHours",
        "How long a request holds its time",
        1,
        168,
        48,
      ),
      hours("reminderHours", "Reminder before an appointment", 1, 168, 24),
    ],
  },
  cancellation: {
    title: "Cancellation policy",
    note: "Wording only; VetMiMi never charges. Keep the Booking & Cancellation Policy page in step.",
    fields: [
      hours("cancellationNoticeHours", "Cancellation notice", 0, 168, 48, true),
      {
        kind: "number",
        key: "lateCancellationFeePercent",
        label: "Late cancellation fee",
        unit: "%",
        min: 0,
        max: 100,
        default: 50,
      },
      {
        kind: "toggle",
        key: "lateCancellationFirstWaived",
        label: "Waive the fee for a first late cancellation",
      },
      {
        kind: "number",
        key: "noShowFeePercent",
        label: "No-show fee",
        unit: "%",
        min: 0,
        max: 100,
        default: 100,
      },
    ],
  },
  sessions: {
    title: "Online sessions",
    fields: [
      {
        kind: "choice",
        key: "meetingLinkMode",
        label: "Meeting link",
        help: "Changing this affects appointments confirmed from now on.",
        options: [
          { value: "vetmimi_room", label: "VetMiMi video room" },
          {
            value: "manual_link",
            label: "I paste a meeting link per appointment",
          },
        ],
      },
    ],
  },
  payment: {
    title: "Payment wording",
    fields: [
      {
        kind: "methods",
        key: "paymentMethods",
        label: "Ways to pay, as emails describe them",
        options: [
          { value: "bank_transfer", label: "Bank transfer" },
          { value: "card", label: "Card" },
        ],
      },
      {
        kind: "select",
        key: "invoiceTiming",
        label: "When the invoice is sent",
        options: [{ value: "after_session", label: "After the session" }],
      },
    ],
  },
  practice: {
    title: "Practice",
    fields: [
      {
        kind: "timezone",
        key: "timezone",
        label: "Practice timezone",
        help: "Every time in admin, emails and booking is shown in this zone.",
      },
      {
        kind: "number",
        key: "retentionMonths",
        label: "Keep booking records for",
        unit: "months",
        min: 6,
        max: 120,
        default: 24,
      },
      {
        kind: "email",
        key: "contactEmail",
        label: "Contact email",
        help: "Sender and reply-to address for booking emails.",
      },
      {
        kind: "localized",
        key: "responseTime",
        label: "Response time",
        help: "Shown on the Contact page, e.g. “Usually within 2 business days”.",
      },
    ],
  },
};

export function numberHelp(field: Extract<Field, { kind: "number" }>) {
  const unit = field.unit === "%" ? "%" : ` ${field.unit}`;
  const range = `${field.min} to ${field.max}${unit}.`;
  return field.confirmed
    ? `${range} Default ${field.default}${unit}, confirmed by Daw Mi.`
    : `${range} Default ${field.default}${unit} — [To confirm] with Daw Mi.`;
}

export type Impact = {
  title: string;
  body: string;
  cancel: string;
  confirm: string;
};

// Changes that move things Daw Mi cannot see from this page ask first
// (Booking UX §25, §26); every other edit saves straight away (§30).
export function impactOf(
  key: Key,
  next: unknown,
  current: unknown,
): Impact | undefined {
  if (next === current) return undefined;
  if (key === "timezone")
    return {
      title: `Change the practice timezone to ${next}?`,
      body: "Weekly hours are reinterpreted in the new zone. Existing appointments keep their exact times, so their wall-clock time may change. Reminders follow the appointments.",
      cancel: `Keep ${current}`,
      confirm: "Change timezone",
    };
  if (key === "bookingMode" && next === "instant")
    return {
      title: "Switch to instant confirmation?",
      body: "New requests for services set to Book are confirmed immediately and the visitor is emailed a confirmation, not a pending notice.",
      cancel: "Keep request & approval",
      confirm: "Switch",
    };
  return undefined;
}
