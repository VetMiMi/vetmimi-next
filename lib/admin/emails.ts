// The Emails screen's URL ↔ API query mapping and the words for each email,
// shared with the appointment page. Pure, so node:test covers it.
import type {
  CommunicationKind,
  CommunicationListItem,
} from "../api/types/appointments.ts";

// Emails carry no timezone of their own; the list is the practice's, in Sydney.
export const PRACTICE_TIMEZONE = "Australia/Sydney";

export const PAGE_SIZE = 50;

// Each tab's id is the API status it lists; All lists them all.
export const views = [
  { id: "all", label: "All", empty: "No emails yet." },
  { id: "failed", label: "Failed", empty: "No failed emails." },
  { id: "queued", label: "Waiting", empty: "No emails waiting to be sent." },
  { id: "sent", label: "Sent", empty: "No emails sent yet." },
] as const;
export type View = (typeof views)[number]["id"];

export const emailNames: Record<CommunicationKind, string> = {
  request_received: "Request received",
  booking_confirmed: "Booking confirmed",
  request_declined: "Request declined",
  rescheduled: "New time",
  cancelled: "Cancellation",
  reminder: "Reminder",
  request_expired: "Request expired",
  practitioner_new_request: "To Daw Mi: new request",
  practitioner_new_booking: "To Daw Mi: new booking",
  practitioner_client_cancelled: "To Daw Mi: visitor cancelled",
  practitioner_reschedule_requested: "To Daw Mi: reschedule request",
  practitioner_new_enquiry: "To Daw Mi: new enquiry",
};

type SearchParams = Record<string, string | string[] | undefined>;
const one = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export function parseView(params: SearchParams): View {
  return views.find((v) => v.id === one(params.view))?.id ?? "all";
}

export function listQuery(view: View, cursor?: string) {
  return {
    ...(view !== "all" && { status: view }),
    ...(cursor && { cursor }),
    limit: PAGE_SIZE,
  };
}

export function listHref(view: View) {
  return view === "all" ? "/admin/emails" : `/admin/emails?view=${view}`;
}

// What a list row may carry to the browser: no address, no error text.
export type EmailRow = {
  href: string;
  reference: string;
  // When it was sent or, until then, when it is due.
  at: string;
  name: string;
  resent: boolean;
  to: string;
  status: CommunicationListItem["status"];
};

export function toRow(email: CommunicationListItem): EmailRow {
  return {
    // The appointment page gives each email this id, so the link lands on it.
    href: `/admin/appointments/${email.appointmentId}#email-${email.id}`,
    reference: email.appointmentReference,
    at: email.sentAt ?? email.scheduledFor,
    name: emailNames[email.kind],
    resent: !!email.resendOf,
    to: email.audience === "visitor" ? email.visitorName : "Daw Mi",
    status: email.status,
  };
}
