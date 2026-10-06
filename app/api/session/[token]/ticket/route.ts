import { publicApi } from "@/lib/api/client";
import { ApiError, unwrap } from "@/lib/api/problem";
import { isJoinToken, mapTicketError } from "@/lib/session/ticket";

// A five-minute room ticket for the visitor's browser (ADR-007): the
// browser asks Next, Next asks the API with the service key, and the
// browser opens the WebSocket itself with the ticket. The token is as good
// as a password, so nothing here logs it or the ticket.
export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" };

export async function POST(
  _request: Request,
  { params }: RouteContext<"/api/session/[token]/ticket">,
) {
  const { token } = await params;
  if (!isJoinToken(token)) {
    return Response.json(
      { code: "not_found" },
      { status: 404, headers: noStore },
    );
  }
  try {
    const ticket = unwrap(
      await publicApi().POST("/public/sessions/{token}/ticket", {
        params: { path: { token } },
      }),
    );
    return Response.json(ticket, { status: 201, headers: noStore });
  } catch (error) {
    const failure = error instanceof ApiError ? error : ApiError.unavailable();
    const { status, code } = mapTicketError(failure.status);
    if (code === "unavailable") {
      console.error(`room ticket: ${failure.status} ${failure.code}`);
    }
    const headers = new Headers(noStore);
    if (failure.retryAfterSeconds !== undefined) {
      headers.set("Retry-After", String(failure.retryAfterSeconds));
    }
    return Response.json({ code }, { status, headers });
  }
}
