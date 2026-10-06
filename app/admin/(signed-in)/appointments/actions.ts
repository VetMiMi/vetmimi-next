"use server";

import { revalidatePath } from "next/cache";
import { listQuery, parseFilters } from "@/lib/admin/appointments";
import { failure, mutate, type Outcome } from "@/lib/admin/mutation";
import { adminCall } from "@/lib/admin/session";
import type { AdminApi } from "@/lib/api/client";
import { ApiError, unwrap } from "@/lib/api/problem";
import type { components } from "@/lib/api/schema";
import { statuses } from "@/components/admin/status";

type Schemas = components["schemas"];
type Detail = Schemas["AppointmentDetail"];
type Slot = Schemas["Slot"];

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
  return adminCall(async (api) =>
    unwrap(
      await api.GET("/admin/appointments", {
        params: { query: listQuery(parseFilters(params), timezone, cursor) },
      }),
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
    return await adminCall(async (api) =>
      unwrap(
        await api.GET("/admin/availability/preview", {
          params: {
            query: { serviceId, from: `${month}-01`, to: `${month}-${last}` },
          },
        }),
      ),
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

function post(
  api: AdminApi,
  id: string,
  action: StatusAction,
  body: StatusBody,
) {
  const params = { path: { appointmentId: id } };
  const { version, messageToVisitor, notifyVisitor = true, meetingLink } = body;
  const message = messageToVisitor?.trim() || undefined;
  switch (action) {
    case "confirm":
      return api.POST("/admin/appointments/{appointmentId}/confirm", {
        params,
        body: { version, ...(meetingLink && { meetingLink }) },
      });
    case "decline":
      return api.POST("/admin/appointments/{appointmentId}/decline", {
        params,
        body: { version, messageToVisitor: message },
      });
    case "cancel":
      return api.POST("/admin/appointments/{appointmentId}/cancel", {
        params,
        body: { version, messageToVisitor: message, notifyVisitor },
      });
    case "complete":
      return api.POST("/admin/appointments/{appointmentId}/complete", {
        params,
        body: { version },
      });
    case "no_show":
      return api.POST("/admin/appointments/{appointmentId}/no-show", {
        params,
        body: { version },
      });
  }
}

// Confirm, decline, cancel, complete or no-show (#68), with the version the
// page showed. A refused move names the status the appointment has now.
export async function changeStatus(
  id: string,
  action: StatusAction,
  body: StatusBody,
): Promise<Outcome<Detail>> {
  const outcome = await mutate(
    `${BASE}/${id}`,
    (api) => post(api, id, action, body),
    { failure: failures[action], codes: { stale_version: STALE } },
  );
  if (outcome.ok || outcome.code !== "invalid_transition") return outcome;
  const now = await adminCall(async (api) =>
    unwrap(
      await api.GET("/admin/appointments/{appointmentId}", {
        params: { path: { appointmentId: id } },
      }),
    ),
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
      api.PUT("/admin/appointments/{appointmentId}/note", {
        params: { path: { appointmentId: id } },
        body: { version, note: note.slice(0, 2000) },
      }),
    {
      failure: "The note was not saved. The previous note remains.",
      codes: { stale_version: STALE },
    },
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
  call: (api: AdminApi) => Promise<{
    data?: Detail;
    error?: unknown;
    response: Response;
  }>,
  messages: { failure: string; codes: Record<string, string> },
): Promise<SlotOutcome> {
  try {
    const result = await adminCall(async (api) => {
      const answer = await call(api);
      // A lost session goes to sign-in, as every other admin call.
      if (answer.response.status === 401) unwrap(answer);
      return answer;
    });
    if (result.data !== undefined && result.response.ok) {
      revalidatePath(path);
      return { ok: true, data: result.data };
    }
    const error = ApiError.fromResponse(result.response, result.error);
    const alternatives =
      error.code === "slot_unavailable"
        ? ((result.error as Schemas["SlotUnavailableProblem"]).alternatives ??
          [])
        : [];
    return { ...failure(error, messages), status: error.status, alternatives };
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    return {
      ...failure(error, messages),
      status: error.status,
      alternatives: [],
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
      api.POST("/admin/appointments/{appointmentId}/reschedule", {
        params: { path: { appointmentId: id } },
        body,
      }),
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
  body: Schemas["ManualAppointmentCreate"],
  idempotencyKey: string,
) {
  if (!UUID.test(idempotencyKey)) throw new Error("Bad idempotency key");
  return slotWrite(
    BASE,
    (api) =>
      api.POST("/admin/appointments", {
        params: { header: { "Idempotency-Key": idempotencyKey } },
        body,
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
