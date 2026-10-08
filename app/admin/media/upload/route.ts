import { sessionToken } from "@/lib/admin/session";
import { uploadMedia } from "@/lib/api/client";
import { ApiError, problemResponse } from "@/lib/api/problem";

// An image for the media library (#151). A route handler rather than a
// Server Function so the browser can show upload progress; under /admin so
// the session cookie, scoped to /admin, comes with it. Thin as ADR-002
// asks: check, stream the body on to the API, map the answer.
export const dynamic = "force-dynamic";

// The API's own body cap (21 MiB); it holds the image itself to 20 MiB.
const BODY_CAP = 21 << 20;

const refuse = (status: number, code: string) =>
  problemResponse(new ApiError({ status, code }));

export async function POST(request: Request) {
  // The cookie is SameSite=Lax already; this also refuses a same-site page
  // on another origin.
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    return refuse(403, "forbidden");
  const token = await sessionToken();
  if (!token) return refuse(401, "unauthenticated");
  const type = request.headers.get("content-type") ?? "";
  if (!type.startsWith("multipart/form-data") || !request.body)
    return refuse(400, "invalid_request");
  if (Number(request.headers.get("content-length")) > BODY_CAP)
    return refuse(413, "payload_too_large");

  try {
    const response = await uploadMedia(token, request.body, type);
    const body: unknown = await response.json().catch(() => undefined);
    if (!response.ok) throw ApiError.fromResponse(response, body);
    return Response.json(body, {
      status: 201,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const failure = error instanceof ApiError ? error : ApiError.unavailable();
    console.error(`media upload: ${failure.status} ${failure.code}`);
    return problemResponse(failure);
  }
}
