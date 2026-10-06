import "server-only";
import { revalidatePath } from "next/cache";
import type { AdminApi } from "@/lib/api/client";
import { ApiError, unwrap } from "@/lib/api/problem";
import { adminCall } from "./session";

// What a Server Function hands back to the form that called it: the data,
// or the words to show and the fields to mark. A failure never carries the
// API's own detail (lib/api/problem.ts).
export type Outcome<T = null> =
  | { ok: true; data: T }
  | {
      ok: false;
      code: string;
      message: string;
      fieldErrors: Record<string, string>;
    };

export const NO_PERMISSION =
  "Your account cannot change this. If you need to, ask the site administrator.";

type Messages = {
  // The sentence for any failure not listed below: what was not done and
  // what stays active (brief §7 Errors).
  failure: string;
  // Words for particular Problem codes, e.g. `overlapping_period`.
  codes?: Record<string, string>;
};

// "/name/en" or "name.en" → "name.en", the form field's name.
const fieldName = (pointer: string) =>
  pointer.replace(/^\/+/, "").replaceAll("/", ".");

export function failure(
  error: ApiError,
  { failure, codes = {} }: Messages,
): Extract<Outcome, { ok: false }> {
  const message =
    codes[error.code] ?? (error.status === 403 ? NO_PERMISSION : failure);
  return {
    ok: false,
    code: error.code,
    message,
    fieldErrors: Object.fromEntries(
      Object.entries(error.fieldErrors).map(([field, text]) => [
        fieldName(field),
        text,
      ]),
    ),
  };
}

// One admin API call from a Server Function: signed in as the user (a lost
// session goes to sign-in), the page at `path` re-rendered on success, and
// an API refusal turned into words. Anything else is a bug and is thrown.
export async function mutate<T>(
  path: string,
  call: (api: AdminApi) => Promise<{
    data?: T;
    error?: unknown;
    response: Response;
  }>,
  messages: Messages,
): Promise<Outcome<T>> {
  try {
    const data = await adminCall(async (api) => unwrap(await call(api)));
    revalidatePath(path);
    return { ok: true, data };
  } catch (error) {
    if (error instanceof ApiError) return failure(error, messages);
    throw error;
  }
}
