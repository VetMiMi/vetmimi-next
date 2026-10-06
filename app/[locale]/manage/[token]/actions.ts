"use server";
import { publicApi } from "@/lib/api/client";
import {
  getManagedAppointment,
  isManagementToken,
  manageProblem,
  type ManagedAppointment,
} from "@/lib/api/manage";
import { ApiError, unwrap } from "@/lib/api/problem";

export type ManageOutcome =
  | { ok: true; appointment: ManagedAppointment }
  | {
      ok: false;
      code:
        | "not_found"
        | "rate_limited"
        | "unavailable"
        | "action_not_allowed"
        | "invalid_transition"
        | "invalid_request";
      // The appointment as it is now, when the API refused the change.
      appointment?: ManagedAppointment;
    };

const MAX_MESSAGE = 500;
const MAX_TIMES = 3;

const message = (text: string) =>
  text.trim().slice(0, MAX_MESSAGE) || undefined;

// A refusal that leaves the appointment as it was: the screen shows why and
// its current state, read again.
async function refused(
  token: string,
  error: unknown,
  what: string,
): Promise<ManageOutcome> {
  if (
    error instanceof ApiError &&
    (error.code === "action_not_allowed" || error.code === "invalid_transition")
  ) {
    const now = await getManagedAppointment(token);
    return {
      ok: false,
      code: error.code,
      appointment: now.ok ? now.appointment : undefined,
    };
  }
  if (error instanceof ApiError && error.status === 400) {
    return { ok: false, code: "invalid_request" };
  }
  return { ok: false, code: manageProblem(error, what) };
}

// Cancel from the management link (#60). No cookie goes to the API: the
// public client sends only the service key.
export async function cancelManaged(
  token: string,
  text: string,
): Promise<ManageOutcome> {
  if (!isManagementToken(token)) return { ok: false, code: "not_found" };
  try {
    const appointment = unwrap(
      await publicApi().POST("/public/manage/{token}/cancel", {
        params: { path: { token } },
        body: { message: message(text) },
      }),
    );
    return { ok: true, appointment };
  } catch (error) {
    return refused(token, error, "managed cancel");
  }
}

// Ask Daw Mi to move the appointment (#61): up to three slot starts exactly
// as availability gave them, and an optional message. The booked time stays.
export async function requestReschedule(
  token: string,
  input: { preferredTimes: string[]; message: string },
): Promise<ManageOutcome> {
  if (!isManagementToken(token)) return { ok: false, code: "not_found" };
  const preferredTimes = input.preferredTimes
    .filter((t) => !Number.isNaN(Date.parse(t)))
    .slice(0, MAX_TIMES);
  const note = message(input.message);
  if (preferredTimes.length === 0 && !note) {
    return { ok: false, code: "invalid_request" };
  }
  try {
    const appointment = unwrap(
      await publicApi().POST("/public/manage/{token}/reschedule-request", {
        params: { path: { token } },
        body: { preferredTimes, message: note },
      }),
    );
    return { ok: true, appointment };
  } catch (error) {
    return refused(token, error, "managed reschedule request");
  }
}
