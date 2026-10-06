"use server";

import { mutate } from "@/lib/admin/mutation";
import { adminCall } from "@/lib/admin/session";
import { ApiError, unwrap } from "@/lib/api/problem";
import type { TicketResult } from "@/lib/session/call";
import { mapTicketError } from "@/lib/session/ticket";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Daw Mi's five-minute room ticket (#83, ADR-007), asked for on every
// connection attempt as the visitor's is. Server Functions rather than
// route handlers: the session cookie is scoped to /admin, and a lost
// session goes to sign-in like every other admin call. Nothing here logs
// the ticket.
export async function startVideo(id: string): Promise<TicketResult> {
  if (!UUID.test(id)) return { ok: false, code: "not_found" };
  try {
    const ticket = await adminCall(async (api) =>
      unwrap(
        await api.POST("/admin/appointments/{appointmentId}/video-session", {
          params: { path: { appointmentId: id } },
        }),
      ),
    );
    return { ok: true, ticket };
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    const { code } = mapTicketError(error.status);
    if (code === "unavailable") {
      console.error(`practitioner ticket: ${error.status} ${error.code}`);
    }
    return { ok: false, code };
  }
}

// End the room for both people. The appointment keeps its status until
// Daw Mi marks it (ADR-007).
export async function endVideo(id: string) {
  return mutate(
    `/admin/appointments/${id}`,
    (api) =>
      api.POST("/admin/appointments/{appointmentId}/video-session/end", {
        params: { path: { appointmentId: id } },
      }),
    {
      failure: "The session was not ended. It is still open.",
      codes: { invalid_transition: "This session has already ended." },
    },
  );
}
