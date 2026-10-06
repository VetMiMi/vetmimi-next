"use server";
import { publicApi } from "@/lib/api/client";
import { ApiError } from "@/lib/api/problem";
import type { components } from "@/lib/api/schema";
import { checkTraps } from "@/lib/spam";

type Schemas = components["schemas"];

export type SubmitOutcome =
  | { ok: true; receipt: Schemas["AppointmentRequestReceipt"] }
  | {
      ok: false;
      code: string;
      fieldErrors: Record<string, string>;
      alternatives: Schemas["Slot"][];
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
  request: Schemas["AppointmentRequestCreate"];
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
    const { data, error, response } = await publicApi().POST(
      "/public/appointments",
      {
        params: { header: { "Idempotency-Key": input.idempotencyKey } },
        body: input.request,
      },
    );
    if (data) return { ok: true, receipt: data };
    const problem = ApiError.fromResponse(response, error);
    console.warn(`appointment request: ${problem.status} ${problem.code}`);
    return {
      ok: false,
      code: problem.status >= 500 ? "unavailable" : problem.code,
      fieldErrors: problem.fieldErrors,
      alternatives:
        problem.code === "slot_unavailable"
          ? ((error as Schemas["SlotUnavailableProblem"]).alternatives ?? [])
          : [],
      retryAfterSeconds: problem.retryAfterSeconds,
    };
  } catch (error) {
    const code = error instanceof ApiError ? error.code : "unavailable";
    console.error(`appointment request failed: ${code}`);
    return failed("unavailable");
  }
}
