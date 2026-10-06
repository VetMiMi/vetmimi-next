// What the ticket route handler tells the browser when the API refuses a
// room ticket (#81). The page only needs to know whether to stop (the
// link is gone or the session is not open) or to try again later.
export type TicketRefusal = {
  status: number;
  code: "not_found" | "not_ready" | "rate_limited" | "unavailable";
};

export function mapTicketError(apiStatus: number): TicketRefusal {
  if (apiStatus === 404) return { status: 404, code: "not_found" };
  if (apiStatus === 422) return { status: 409, code: "not_ready" };
  if (apiStatus === 429) return { status: 429, code: "rate_limited" };
  return { status: 502, code: "unavailable" };
}

// The API's JoinToken pattern; anything else never leaves this app.
export const isJoinToken = (token: string) => /^[A-Za-z0-9_-]{43}$/.test(token);
