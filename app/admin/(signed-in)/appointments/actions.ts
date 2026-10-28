"use server";

import { revalidatePath } from "next/cache";
import { listQuery, parseFilters } from "@/lib/admin/appointments";
import { failure, mutate, type Outcome } from "@/lib/admin/mutation";
import { adminCall } from "@/lib/admin/session";
import { apiPath, type Api } from "@/lib/api/client";
import { ApiError } from "@/lib/api/problem";
import type {
  AppointmentDetail as Detail,
  AppointmentList,
  Communication,
  CommunicationKind,
  ManualAppointmentCreate,
} from "@/lib/api/types/appointments";
import type { AvailabilityPreview } from "@/lib/api/types/booking";
import type { Slot } from "@/lib/api/types/shared";
import { statuses } from "@/components/admin/status";

const BASE = "/admin/appointments";
const MONTH = /^\d{4}-\d{2}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const STALE =
  "This appointment has changed since you opened it. Refresh to see the latest.";

// "Show more" on the list (#65): the next page for the same filters.
export async function moreAppointments(
  params: Record<string, string | string[] | undefined>,
  timezone: string,
  cursor: string,
) {
  return adminCall((api) =>
    api.get<AppointmentList>(
      "/admin/appointments",
      listQuery(parseFilters(params), timezone, cursor),
    ),
  );
}

// Free times for the reschedule and manual-booking pickers: the admin
// preview, so Daw Mi sees exactly what the public sees (#69, #78). Null when
// they could not be loaded.
export async function previewMonth(serviceId: string, month: string) {
  if (!UUID.test(serviceId) || !MONTH.test(month)) return null;
  const [y, m] = month.split("-").map(Number);
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  try {
    return await adminCall((api) =>
      api.get<AvailabilityPreview>("/admin/availability/preview", {
        serviceId,
        from: `${month}-01`,
        to: `${month}-${last}`,
      }),
    );
  } catch (error) {
    if (error instanceof ApiError) return null;
    throw error;
  }
}

export type StatusAction =
  "confirm" | "decline" | "cancel" | "complete" | "no_show";

export type StatusBody = {
  version: number;
  messageToVisitor?: string;
  notifyVisitor?: boolean;
  meetingLink?: string;
};

// Booking UX §31, as written.
const notChanged = "The status was not changed. Status remains Confirmed.";
const failures: Record<StatusAction, string> = {
  confirm: "Appointment could not be confirmed. No status change was saved.",
  decline: "The request was not declined. Status remains Pending.",
  cancel: "The appointment was not cancelled. Status remains Confirmed.",
  complete: notChanged,
  no_show: notChanged,
};

function statusBody(action: StatusAction, body: StatusBody) {
  const { version, messageToVisitor, notifyVisitor = true, meetingLink } = body;
  const message = messageToVisitor?.trim() || undefined;
  switch (action) {
    case "confirm":
      return { version, ...(meetingLink && { meetingLink }) };
    case "decline":
      return { version, messageToVisitor: message };
    case "cancel":
      return { version, messageToVisitor: message, notifyVisitor };
    case "complete":
    case "no_show":
      return { version };
  }
}

// Confirm, decline, cancel, complete or no-show (#68), with the version the
// page showed. A refused move names the status the appointment has now.
export async function changeStatus(
  id: string,
  action: StatusAction,
  body: StatusBody,
): Promise<Outcome<Detail>> {
  if (!(action in failures)) throw new Error("Bad action");
  // The API's paths use hyphens: no_show is /no-show.
  const step = action.replace("_", "-");
  const outcome = await mutate(
    `${BASE}/${id}`,
    (api) =>
      api.post<Detail>(
        apiPath`/admin/appointments/${id}/${step}`,
        statusBody(action, body),
      ),
    { failure: failures[action], codes: { stale_version: STALE } },
  );
  if (outcome.ok || outcome.code !== "invalid_transition") return outcome;
  const now = await adminCall((api) =>
    api.get<Detail>(apiPath`/admin/appointments/${id}`),
  ).catch(() => null);
  const status = now && statuses.appointment[now.status].label;
  return {
    ...outcome,
    message: status ? `${STALE} Status is now ${status}.` : STALE,
  };
}

export async function saveNote(id: string, version: number, note: string) {
  return mutate(
    `${BASE}/${id}`,
    (api) =>
      api.put<Detail>(apiPath`/admin/appointments/${id}/note`, {
        version,
        note: note.slice(0, 2000),
      }),
    {
      failure: "The note was not saved. The previous note remains.",
      codes: { stale_version: STALE },
    },
  );
}

export async function resendEmail(id: string, communicationId: string) {
  return mutate(
    `${BASE}/${id}`,
    (api) =>
      api.post<Communication>(
        apiPath`/admin/appointments/${id}/communications/${communicationId}/resend`,
      ),
    {
      failure: "The email was not sent again. The earlier one is unchanged.",
      codes: {
        action_not_allowed:
          "This email cannot be sent again. A reminder can only be resent before a confirmed appointment.",
      },
    },
  );
}

export async function markCommunicated(
  id: string,
  kind: CommunicationKind,
  note: string,
) {
  return mutate(
    `${BASE}/${id}`,
    (api) =>
      api.post<Communication>(
        apiPath`/admin/appointments/${id}/mark-communicated`,
        { kind, note: note.trim().slice(0, 500) },
      ),
    { failure: "This was not recorded. Try again." },
  );
}

// A write that can lose its time to someone else: the failure also carries
// the HTTP status (for the idempotency key) and the API's alternatives.
export type SlotOutcome =
  | { ok: true; data: Detail }
  | (Extract<Outcome, { ok: false }> & {
      status: number;
      alternatives: Slot[];
    });

async function slotWrite(
  path: string,
  call: (api: Api) => Promise<Detail>,
  messages: { failure: string; codes: Record<string, string> },
): Promise<SlotOutcome> {
  try {
    const data = await adminCall(call);
    revalidatePath(path);
    return { ok: true, data };
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    return {
      ...failure(error, messages),
      status: error.status,
      alternatives: error.alternatives,
    };
  }
}

// Move to a new free time (#69). The API secures the new time before it
// releases the old one, so any failure leaves the original active.
export async function reschedule(
  id: string,
  body: { version: number; startsAt: string; notifyVisitor: boolean },
) {
  return slotWrite(
    `${BASE}/${id}`,
    (api) =>
      api.post<Detail>(apiPath`/admin/appointments/${id}/reschedule`, body),
    {
      failure:
        "The appointment was not rescheduled. The original appointment remains active.",
      codes: {
        stale_version: STALE,
        outside_booking_window: "That time is outside the booking window.",
      },
    },
  );
}

// An appointment taken by phone or email (#78), under the same conflict
// rules as a website booking. The key comes from the form, so a retry of the
// same submission can never add a second appointment.
export async function createManual(
  body: ManualAppointmentCreate,
  idempotencyKey: string,
) {
  if (!UUID.test(idempotencyKey)) throw new Error("Bad idempotency key");
  return slotWrite(
    BASE,
    (api) =>
      api.post<Detail>("/admin/appointments", body, {
        "Idempotency-Key": idempotencyKey,
      }),
    {
      failure: "The appointment was not added. Nothing was saved.",
      codes: {
        slot_unavailable: "That time is no longer free. Nothing was saved.",
        outside_booking_window:
          "That date is outside the booking window. Nothing was saved.",
        service_not_bookable:
          "This service is paused or not bookable. Nothing was saved.",
        idempotency_key_reused:
          "This appointment may already have been added. Check the appointments list before adding it again.",
        invalid_request: "Check the highlighted details. Nothing was saved.",
      },
    },
  );
}
