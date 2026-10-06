import "server-only";
import { apiConfigured, publicApi } from "./client";
import { ApiError, unwrap } from "./problem";
import type { components } from "./schema";

export type ManagedAppointment = components["schemas"]["ManagedAppointment"];

export type ManageProblem =
  "not_found" | "rate_limited" | "unavailable" | "not_connected";

export type ManageLoad =
  | { ok: true; appointment: ManagedAppointment }
  | { ok: false; problem: ManageProblem };

// The API's ManagementToken pattern. Anything else is a bad link and is
// never sent on.
const TOKEN = /^[A-Za-z0-9_-]{43}$/;

export const isManagementToken = (token: string) => TOKEN.test(token);

// The words a screen needs for a failed management-link call. The token is
// as good as a password, so logs carry the status and code only.
export function manageProblem(error: unknown, what: string): ManageProblem {
  const failure = error instanceof ApiError ? error : ApiError.unavailable();
  if (failure.status === 404) return "not_found";
  if (failure.status === 429) return "rate_limited";
  console.error(`${what}: ${failure.status} ${failure.code}`);
  return "unavailable";
}

// What a management-link holder may see (Booking UX §7), read server-side.
// Invalid and expired links are one answer, so the page reveals nothing.
export async function getManagedAppointment(
  token: string,
): Promise<ManageLoad> {
  if (!apiConfigured()) return { ok: false, problem: "not_connected" };
  if (!isManagementToken(token)) return { ok: false, problem: "not_found" };
  try {
    const appointment = unwrap(
      await publicApi().GET("/public/manage/{token}", {
        params: { path: { token } },
      }),
    );
    return { ok: true, appointment };
  } catch (error) {
    return { ok: false, problem: manageProblem(error, "managed appointment") };
  }
}
