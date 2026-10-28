import type { Format, Locale, Page } from "./shared.ts";
import type { ServiceRef, VisitorDetails } from "./booking.ts";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "declined"
  | "cancelled_by_client"
  | "cancelled_by_practitioner"
  | "no_show"
  | "expired";

export type AppointmentAction =
  | "confirm"
  | "decline"
  | "reschedule"
  | "cancel"
  | "complete"
  | "no_show"
  | "set_note"
  | "set_meeting_link"
  | "start_video"
  | "end_video"
  | "mark_communicated";

export type AppointmentSummary = {
  id: string;
  reference: string;
  status: AppointmentStatus;
  service: ServiceRef;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  timezone: string;
  format: Format;
  source: "website" | "manual";
  visitorName: string;
  holdExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type AppointmentList = Page<AppointmentSummary> & { timezone: string };

export type AppointmentEvent = {
  id: number;
  kind:
    | "created"
    | "confirmed"
    | "declined"
    | "rescheduled"
    | "reschedule_requested"
    | "cancelled"
    | "completed"
    | "no_show"
    | "expired"
    | "note_updated"
    | "meeting_link_set";
  fromStatus?: AppointmentStatus;
  toStatus?: AppointmentStatus;
  previousStartsAt?: string;
  previousEndsAt?: string;
  newStartsAt?: string;
  newEndsAt?: string;
  actor: "visitor" | "admin" | "system";
  actorName?: string;
  detail: Record<string, unknown>;
  createdAt: string;
};

export type CommunicationKind =
  | "request_received"
  | "booking_confirmed"
  | "request_declined"
  | "rescheduled"
  | "cancelled"
  | "reminder"
  | "request_expired"
  | "practitioner_new_request"
  | "practitioner_new_booking"
  | "practitioner_client_cancelled"
  | "practitioner_reschedule_requested"
  | "practitioner_new_enquiry";

export type CommunicationStatus = "queued" | "sent" | "failed" | "cancelled";

export type Communication = {
  id: string;
  appointmentId?: string;
  contactEnquiryId?: string;
  kind: CommunicationKind;
  audience: "visitor" | "practitioner";
  channel: "email" | "manual";
  recipient?: string;
  locale: Locale;
  status: CommunicationStatus;
  scheduledFor: string;
  sentAt?: string;
  error?: string;
  attempts: number;
  resendOf?: string;
  note?: string;
  createdAt: string;
};

export type VideoRoomSummary = {
  id: string;
  state: "waiting" | "in_session" | "ended";
  opensAt: string;
  closesAt: string;
  startedAt?: string;
  endedAt?: string;
};

export type AppointmentDetail = AppointmentSummary & {
  visitorEmail: string;
  visitorPhone?: string;
  visitorNote?: string;
  adminNote?: string;
  locale: Locale;
  meetingLink?: string;
  lateCancellation: boolean;
  privacyAcknowledgedAt?: string;
  policyAcknowledgedAt?: string;
  version: number;
  allowedActions: AppointmentAction[];
  events: AppointmentEvent[];
  communications: Communication[];
  videoRoom?: VideoRoomSummary;
};

export type ManualAppointmentCreate = {
  serviceId: string;
  startsAt: string;
  format: Format;
  locale: Locale;
  visitor: VisitorDetails;
  adminNote?: string;
  status: "confirmed" | "pending";
  notifyVisitor: boolean;
};

export type AttentionItem = {
  kind:
    | "pending_request"
    | "hold_expiring"
    | "failed_communication"
    | "reschedule_requested"
    | "meeting_link_missing"
    | "completion_due"
    | "block_conflict";
  appointmentId: string;
  reference: string;
  startsAt?: string;
  detail?: string;
};

export type BookingDashboard = {
  timezone: string;
  counts: {
    pending: number;
    confirmed: number;
    today: number;
    thisWeek: number;
  };
  attentionRequired: AttentionItem[];
  pending: AppointmentSummary[];
  today: AppointmentSummary[];
  upcoming: AppointmentSummary[];
};
