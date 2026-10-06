import "server-only";
import { isJoinToken } from "@/lib/session/ticket";
import { apiConfigured, publicApi } from "./client";
import { ApiError, unwrap } from "./problem";
import type { components } from "./schema";

export type PublicSession = components["schemas"]["PublicSessionState"];

export type SessionLoad =
  | { ok: true; session: PublicSession }
  | {
      ok: false;
      problem: "not_found" | "rate_limited" | "unavailable" | "not_connected";
    };

// The join page's state (ADR-007), read fresh on every visit. A malformed
// token is answered here without calling the API, and an unknown one the
// same way, so the page never says whether an appointment exists. Logs
// carry the status and code only, never the token.
export async function getSessionState(token: string): Promise<SessionLoad> {
  if (!apiConfigured()) return { ok: false, problem: "not_connected" };
  if (!isJoinToken(token)) return { ok: false, problem: "not_found" };
  try {
    const session = unwrap(
      await publicApi().GET("/public/sessions/{token}", {
        params: { path: { token } },
      }),
    );
    return { ok: true, session };
  } catch (error) {
    const failure = error instanceof ApiError ? error : ApiError.unavailable();
    if (failure.status === 404) return { ok: false, problem: "not_found" };
    if (failure.status === 429) return { ok: false, problem: "rate_limited" };
    console.error(`session state: ${failure.status} ${failure.code}`);
    return { ok: false, problem: "unavailable" };
  }
}
