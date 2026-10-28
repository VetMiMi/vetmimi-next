import type { Format, Locale, LocalizedText, Page, SlotDay } from "./shared.ts";
import type { AppointmentStatus, AppointmentSummary } from "./appointments.ts";

export type BookingMode = "request_approval" | "instant";

// ── Services ──────────────────────────────────────────────────────────

type BookingAction = "book" | "request" | "enquiry_only" | "not_bookable";

export type ServiceState = "active" | "paused" | "archived";

export type Service = {
  id: string;
  slug: string;
  name: LocalizedText;
  description?: LocalizedText;
  bookingAction: BookingAction;
  durationMinutes?: number;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  formats: Format[];
  feeText?: LocalizedText;
  preparationText?: LocalizedText;
  sortOrder: number;
  state: ServiceState;
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type ServiceRef = { id: string; slug: string; name: LocalizedText };

// ── Availability ──────────────────────────────────────────────────────

export type AvailabilityRuleInput = {
  weekday: number;
  startTime: string;
  endTime: string;
};

export type AvailabilityRule = AvailabilityRuleInput & { id: string };

export type AvailabilityOverride = {
  id: string;
  onDate: string;
  kind: "open" | "replace";
  startsAt: string;
  endsAt: string;
  note?: string;
  createdAt: string;
};

export type AvailabilityBlock = {
  id: string;
  startsAt: string;
  endsAt: string;
  allDay: boolean;
  reason?: string;
  createdAt: string;
};

// A new block, with the booked appointments it now overlaps.
export type AvailabilityBlockSaved = {
  block: AvailabilityBlock;
  conflicts: AppointmentSummary[];
};

export type AvailabilityPreview = {
  timezone: string;
  serviceId: string;
  from: string;
  to: string;
  days: SlotDay[];
};

export type AvailabilityList<T> = Page<T> & { timezone: string };

// ── Public booking ────────────────────────────────────────────────────

export type PublicBookableService = {
  slug: string;
  name: string;
  description?: string;
  bookingAction: "book" | "request";
  durationMinutes: number;
  formats: Format[];
  feeText?: string;
};

export type PublicBookableServiceList = {
  bookingEnabled: boolean;
  bookingMode: BookingMode;
  timezone: string;
  items: PublicBookableService[];
};

export type PublicAvailability = {
  service: string;
  timezone: string;
  from: string;
  to: string;
  days: SlotDay[];
};

export type VisitorDetails = {
  name: string;
  email: string;
  phone?: string;
  note?: string;
};

export type AppointmentRequestCreate = {
  service: string;
  startsAt: string;
  format: Format;
  locale: Locale;
  visitor: VisitorDetails;
  privacyAcknowledged: true;
  policyAcknowledged: true;
};

export type PublicServiceRef = { slug: string; name: string };

export type AppointmentRequestReceipt = {
  reference: string;
  status: "pending" | "confirmed";
  service: PublicServiceRef;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  timezone: string;
  format: Format;
};

// What a management-link holder may see and do.
export type ManagedAppointment = {
  reference: string;
  status: AppointmentStatus;
  service: PublicServiceRef;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  timezone: string;
  format: Format;
  canCancel: boolean;
  canRequestReschedule: boolean;
  cancellationNoticeHours: number;
  lateIfCancelledNow: boolean;
  rescheduleRequested: boolean;
};
