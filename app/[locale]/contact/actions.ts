"use server";
import { publicApi } from "@/lib/api/client";
import { ApiError } from "@/lib/api/problem";
import type {
  ContactEnquiryCreate,
  ContactEnquiryReceipt,
} from "@/lib/api/types/contact";
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
  enquiry: ContactEnquiryCreate;
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
    const { reference } = await publicApi().post<ContactEnquiryReceipt>(
      "/public/contact-enquiries",
      input.enquiry,
      { "Idempotency-Key": input.idempotencyKey },
    );
    return { ok: true, reference };
  } catch (error) {
    const problem =
      error instanceof ApiError ? error : ApiError.unavailable(error);
    const log = problem.status >= 500 ? console.error : console.warn;
    log(`contact enquiry: ${problem.status} ${problem.code}`);
    return {
      ok: false,
      code: problem.status >= 500 ? "unavailable" : problem.code,
      fieldErrors: problem.fieldErrors,
      retryAfterSeconds: problem.retryAfterSeconds,
    };
  }
}
