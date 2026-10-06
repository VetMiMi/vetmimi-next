"use server";
import { publicApi } from "@/lib/api/client";
import { ApiError } from "@/lib/api/problem";
import type { components } from "@/lib/api/schema";
import { checkTraps } from "@/lib/spam";

export type EnquiryOutcome =
  | { ok: true; reference: string | null }
  | {
      ok: false;
      code: string;
      fieldErrors: Record<string, string>;
      retryAfterSeconds?: number;
    };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const failed = (code: string): EnquiryOutcome => ({
  ok: false,
  code,
  fieldErrors: {},
});

// Sends a contact enquiry. A filled honeypot gets the normal success and
// nothing is sent, so a bot learns nothing; a submit too fast or with a
// forged timestamp gets the ordinary failure. The Idempotency-Key is made
// when the form mounts and reused on Try again.
export async function sendEnquiry(input: {
  enquiry: components["schemas"]["ContactEnquiryCreate"];
  idempotencyKey: string;
  formToken: string;
  honeypot: string;
}): Promise<EnquiryOutcome> {
  if (!UUID.test(input.idempotencyKey)) return failed("invalid_request");
  const trap = checkTraps("contact", {
    token: input.formToken,
    honeypot: input.honeypot,
  });
  if (trap !== "ok") console.warn(`contact enquiry refused: ${trap}`);
  if (trap === "honeypot") return { ok: true, reference: null };
  if (trap !== "ok") return failed("unavailable");

  try {
    const { data, error, response } = await publicApi().POST(
      "/public/contact-enquiries",
      {
        params: { header: { "Idempotency-Key": input.idempotencyKey } },
        body: input.enquiry,
      },
    );
    if (data) return { ok: true, reference: data.reference };
    const problem = ApiError.fromResponse(response, error);
    console.warn(`contact enquiry: ${problem.status} ${problem.code}`);
    return {
      ok: false,
      code: problem.status >= 500 ? "unavailable" : problem.code,
      fieldErrors: problem.fieldErrors,
      retryAfterSeconds: problem.retryAfterSeconds,
    };
  } catch (error) {
    const code = error instanceof ApiError ? error.code : "unavailable";
    console.error(`contact enquiry failed: ${code}`);
    return failed("unavailable");
  }
}
