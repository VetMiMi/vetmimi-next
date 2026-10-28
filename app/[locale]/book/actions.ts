"use server";
import { publicApi } from "@/lib/api/client";
import { ApiError } from "@/lib/api/problem";
import type {
  AppointmentRequestCreate,
  AppointmentRequestReceipt,
} from "@/lib/api/types/booking";
import type { Slot } from "@/lib/api/types/shared";
import { checkTraps } from "@/lib/spam";

export type SubmitOutcome =
  | { ok: true; receipt: AppointmentRequestReceipt }
  | {
      ok: false;
      code: string;
      fieldErrors: Record<string, string>;
      alternatives: Slot[];
      retryAfterSeconds?: number;
    };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const failed = (code: string): SubmitOutcome => ({
  ok: false,
  code,
  fieldErrors: {},
  alternatives: [],
});

// Sends one appointment request. The Idempotency-Key comes from the
// browser and is reused for retries of the same submission, so a double
// click or a retry after a lost response never creates a second request
// (ADR-004). A tripped bot trap answers like an outage and calls nothing:
// a Pending result may only follow a stored record.
export async function requestAppointment(input: {
  request: AppointmentRequestCreate;
  idempotencyKey: string;
  formToken: string;
  honeypot: string;
}): Promise<SubmitOutcome> {
  if (!UUID.test(input.idempotencyKey)) return failed("invalid_request");
  const trap = checkTraps("booking", {
    token: input.formToken,
    honeypot: input.honeypot,
  });
  if (trap !== "ok") {
    console.warn(`appointment request refused: ${trap}`);
    return failed("unavailable");
  }

  try {
    const receipt = await publicApi().post<AppointmentRequestReceipt>(
      "/public/appointments",
      input.request,
      { "Idempotency-Key": input.idempotencyKey },
    );
    return { ok: true, receipt };
  } catch (error) {
    const problem =
      error instanceof ApiError ? error : ApiError.unavailable(error);
    const log = problem.status >= 500 ? console.error : console.warn;
    log(`appointment request: ${problem.status} ${problem.code}`);
    return {
      ok: false,
      code: problem.status >= 500 ? "unavailable" : problem.code,
      fieldErrors: problem.fieldErrors,
      alternatives: problem.alternatives,
      retryAfterSeconds: problem.retryAfterSeconds,
    };
  }
}
