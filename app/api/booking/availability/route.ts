import { publicApi } from "@/lib/api/client";
import { ApiError, problemResponse, unwrap } from "@/lib/api/problem";
import { addDays } from "@/lib/time";

// Free slots for the booking calendar (ADR-002: the browser asks Next, Next
// asks the API with the service key). Never cached: a slot taken a moment
// ago must disappear.
export const dynamic = "force-dynamic";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_RANGE_DAYS = 62;

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams;
  const service = query.get("service") ?? "";
  const from = query.get("from") ?? "";
  const to = query.get("to") ?? "";
  if (
    !SLUG.test(service) ||
    !DATE.test(from) ||
    !DATE.test(to) ||
    to < from ||
    to > addDays(from, MAX_RANGE_DAYS)
  ) {
    return problemResponse(
      new ApiError({ status: 400, code: "invalid_request" }),
    );
  }

  try {
    const availability = unwrap(
      await publicApi().GET("/public/availability", {
        params: { query: { service, from, to } },
      }),
    );
    return Response.json(availability, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const failure = error instanceof ApiError ? error : ApiError.unavailable();
    console.error(`availability: ${failure.status} ${failure.code}`);
    return problemResponse(failure);
  }
}
