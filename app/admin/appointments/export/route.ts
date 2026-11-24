import { sessionToken } from "@/lib/admin/session";
import { exportAppointments } from "@/lib/api/client";
import { ApiError, problemResponse } from "@/lib/api/problem";

// Under /admin so the session cookie, scoped to /admin, comes with it.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const token = await sessionToken();
  if (!token)
    return problemResponse(
      new ApiError({ status: 401, code: "unauthenticated" }),
    );
  const query = new URL(request.url).searchParams;

  try {
    const response = await exportAppointments(
      token,
      query.get("from") ?? "",
      query.get("to") ?? "",
    );
    if (!response.ok) {
      const body: unknown = await response.json().catch(() => undefined);
      throw ApiError.fromResponse(response, body);
    }
    return new Response(response.body, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition":
          response.headers.get("Content-Disposition") ?? "attachment",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const failure = error instanceof ApiError ? error : ApiError.unavailable();
    console.error(`appointments export: ${failure.status} ${failure.code}`);
    return problemResponse(failure);
  }
}
