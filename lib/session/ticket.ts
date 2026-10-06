// What the browser is told when the API refuses a room ticket (#81, #83).
// The page only needs to know whether to stop (the link is gone, the
// session is not open, or this account may not join) or to try again later.
export type TicketRefusal = {
  status: number;
  code:
    "not_found" | "not_ready" | "forbidden" | "rate_limited" | "unavailable";
};

export function mapTicketError(apiStatus: number): TicketRefusal {
  if (apiStatus === 404) return { status: 404, code: "not_found" };
  if (apiStatus === 403) return { status: 403, code: "forbidden" };
  if (apiStatus === 422) return { status: 409, code: "not_ready" };
  if (apiStatus === 429) return { status: 429, code: "rate_limited" };
  return { status: 502, code: "unavailable" };
}

// The API's JoinToken pattern; anything else never leaves this app.
export const isJoinToken = (token: string) => /^[A-Za-z0-9_-]{43}$/.test(token);
