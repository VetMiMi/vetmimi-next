// The appointment list's URL ↔ API query mapping and the words the
// appointment screens use for times and history. Pure, so node:test covers
// it. Times always go through the practice timezone (brief §10).
import type { components, operations } from "../api/schema.ts";
import { addDays } from "../time.ts";
import {
  formatClock,
  formatDay,
  zoneAbbreviation,
  zonedDayStart,
  zonedParts,
} from "../zonedTime.ts";

type Schemas = components["schemas"];
type Status = Schemas["AppointmentStatus"];
type Format = Schemas["Format"];
type Event = Schemas["AppointmentEvent"];
type Communication = Schemas["Communication"];
export type ListQuery = NonNullable<
  operations["listAppointments"]["parameters"]["query"]
>;

export const PAGE_SIZE = 50;

export const views = [
  { id: "upcoming", label: "Upcoming" },
  { id: "pending", label: "Pending" },
  { id: "past", label: "Past" },
  { id: "cancelled", label: "Cancelled" },
  { id: "all", label: "All" },
] as const;
export type View = (typeof views)[number]["id"];

export const statusOptions: { value: Status; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "declined", label: "Declined" },
  { value: "cancelled_by_client", label: "Cancelled by client" },
  { value: "cancelled_by_practitioner", label: "Cancelled by Daw Mi" },
  { value: "no_show", label: "No-show" },
  { value: "expired", label: "Expired" },
];

export const formatNames: Record<Format, string> = {
  online: "Online",
  in_person: "In person",
};

export type ListFilters = {
  view: View;
  status: Status[];
  serviceId?: string;
  from?: string;
  to?: string;
  format?: Format;
  q?: string;
};

type SearchParams = Record<string, string | string[] | undefined>;

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const all = (value: string | string[] | undefined) =>
  value === undefined ? [] : Array.isArray(value) ? value : [value];
const one = (value: string | string[] | undefined) => all(value)[0];

// Anything the URL holds that the API would refuse is dropped, so a
// mistyped link shows a list rather than an error.
export function parseFilters(params: SearchParams): ListFilters {
  const view = views.find((v) => v.id === one(params.view))?.id ?? "upcoming";
  const status = statusOptions
    .map((s) => s.value)
    .filter((s) => all(params.status).includes(s));
  const serviceId = one(params.serviceId);
  const from = one(params.from);
  const to = one(params.to);
  const format = one(params.format);
  const q = one(params.q)?.trim().slice(0, 100);
  return {
    view,
    status,
    ...(serviceId && UUID.test(serviceId) && { serviceId }),
    ...(from && DATE.test(from) && { from }),
    ...(to && DATE.test(to) && { to }),
    ...((format === "online" || format === "in_person") && { format }),
    ...(q && { q }),
  };
}

// Filters set in the folded panel, for its count badge.
export const filterCount = (filters: ListFilters) =>
  filters.status.length +
  [filters.serviceId, filters.from, filters.to, filters.format].filter(Boolean)
    .length;

// Whether anything narrows the view, so "Clear filters" has work to do.
export const hasFilters = (filters: ListFilters) =>
  filterCount(filters) > 0 || !!filters.q;

// Practice dates become instants at the handler edge: `from` is that day's
// local midnight and `to` the next day's, so the last day is included.
export function listQuery(
  filters: ListFilters,
  timeZone: string,
  cursor?: string,
): ListQuery {
  const { view, status, serviceId, from, to, format, q } = filters;
  return {
    view,
    ...(status.length > 0 && { status }),
    ...(serviceId && { serviceId }),
    ...(from && { from: zonedDayStart(from, timeZone) }),
    ...(to && { to: zonedDayStart(addDays(to, 1), timeZone) }),
    ...(format && { format }),
    ...(q && { q }),
    ...(cursor && { cursor }),
    limit: PAGE_SIZE,
  };
}

// The list page's address for these filters; the default view stays out
// of the URL so the plain address is the one to share.
export function listHref(filters: ListFilters) {
  const params = new URLSearchParams();
  if (filters.view !== "upcoming") params.set("view", filters.view);
  for (const s of filters.status) params.append("status", s);
  for (const key of ["serviceId", "from", "to", "format", "q"] as const) {
    const value = filters[key];
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `/admin/appointments?${query}` : "/admin/appointments";
}

const longDayFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  weekday: "long",
  day: "numeric",
  month: "long",
});

// "Tuesday 6 October" for a practice date key.
export function longDay(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return longDayFormat.format(Date.UTC(y, m - 1, d));
}

// "Tuesday 6 October, 10:00 am" in the practice timezone.
export function whenLong(instant: string, timeZone: string) {
  const { date, time } = zonedParts(instant, timeZone);
  return `${longDay(date)}, ${formatClock(time)}`;
}

// "Tue 6 Oct 10:00 am", for history lines and table cells.
export function whenShort(instant: string, timeZone: string) {
  const { date, time } = zonedParts(instant, timeZone);
  return `${formatDay(date)} ${formatClock(time)}`;
}

// "10:00 am AEDT".
export function clockWithZone(instant: string, timeZone: string) {
  const { time } = zonedParts(instant, timeZone);
  return `${formatClock(time)} ${zoneAbbreviation(instant, timeZone)}`;
}

const actorFallback: Record<Event["actor"], string> = {
  visitor: "visitor",
  admin: "an administrator",
  system: "VetMiMi",
};

// Detail keys are the API's snake_case EventDetail JSON names
// (internal/booking/events.go): late_cancellation, by, source, length,
// preferred.
const late = (event: Event) => event.detail.late_cancellation === true;

// One history line (Booking UX §17), e.g. "Confirmed by Daw Mi".
export function eventSentence(event: Event, timeZone: string): string {
  const by = `by ${event.actorName ?? actorFallback[event.actor]}`;
  switch (event.kind) {
    case "created":
      return event.actor === "visitor"
        ? "Request submitted by visitor"
        : `Created ${by}`;
    case "confirmed":
      return `Confirmed ${by}`;
    case "declined":
      return `Declined ${by}`;
    case "rescheduled": {
      const from = event.previousStartsAt;
      const to = event.newStartsAt;
      return from && to
        ? `Rescheduled from ${whenShort(from, timeZone)} to ${whenShort(to, timeZone)} ${by}`
        : `Rescheduled ${by}`;
    }
    case "reschedule_requested":
      return `Reschedule requested ${by}`;
    case "cancelled":
      return `Cancelled ${by}${late(event) ? " (late)" : ""}`;
    case "completed":
      return `Marked as completed ${by}`;
    case "no_show":
      return `Marked as no-show ${by}`;
    case "expired":
      return "Expired";
    case "note_updated":
      return `Note updated ${by}`;
    case "meeting_link_set":
      return `Meeting link set ${by}`;
  }
}

// The times a visitor asked to move to, when the latest event is their
// reschedule request (#69). Only well-formed instants are kept.
export function requestedTimes(events: readonly Event[]): string[] {
  const latest = [...events].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  )[0];
  if (latest?.kind !== "reschedule_requested") return [];
  const times = latest.detail.preferred;
  return Array.isArray(times)
    ? times.filter(
        (t): t is string =>
          typeof t === "string" && !Number.isNaN(Date.parse(t)),
      )
    : [];
}

// What a visitor email reported, for the partial-failure alert (Booking UX
// §31: "Appointment confirmed. Visitor notification failed.").
const doneFor: Partial<Record<Communication["kind"], string>> = {
  request_received: "Request recorded.",
  booking_confirmed: "Appointment confirmed.",
  request_declined: "Request declined.",
  rescheduled: "Appointment moved.",
  cancelled: "Appointment cancelled.",
};

// A failed email that was later resent is dealt with.
export function failedNotifications(communications: readonly Communication[]) {
  return communications
    .filter(
      (c) =>
        c.audience === "visitor" &&
        c.status === "failed" &&
        !communications.some((other) => other.resendOf === c.id),
    )
    .map((c) =>
      doneFor[c.kind]
        ? `${doneFor[c.kind]} Visitor notification failed.`
        : "A visitor email could not be sent.",
    );
}
