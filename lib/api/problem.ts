import type { components } from "./schema";

type Problem = components["schemas"]["Problem"];

type ApiErrorInit = {
  status: number;
  code: string;
  fieldErrors?: Record<string, string>;
  retryAfterSeconds?: number;
};

// A failed API call, reduced to what a screen needs to choose its own words.
// The Problem's `detail` is for developers and is deliberately not kept, so
// it can never reach a page.
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fieldErrors: Record<string, string>;
  readonly retryAfterSeconds?: number;

  constructor(init: ApiErrorInit, options?: ErrorOptions) {
    super(`API ${init.status} ${init.code}`, options);
    this.name = "ApiError";
    this.status = init.status;
    this.code = init.code;
    this.fieldErrors = init.fieldErrors ?? {};
    this.retryAfterSeconds = init.retryAfterSeconds;
  }

  // The API did not answer: refused, reset or timed out.
  static unavailable(cause?: unknown): ApiError {
    return new ApiError({ status: 503, code: "unavailable" }, { cause });
  }

  static fromResponse(response: Response, body: unknown): ApiError {
    const problem = isProblem(body) ? body : undefined;
    const fallback = response.status >= 500 ? "unavailable" : "unknown";
    return new ApiError({
      status: response.status,
      code: problem?.code ?? fallback,
      fieldErrors: Object.fromEntries(
        (problem?.errors ?? []).map(({ field, message }) => [field, message]),
      ),
      retryAfterSeconds: retryAfter(response.headers.get("Retry-After")),
    });
  }
}

function isProblem(body: unknown): body is Problem {
  return (
    typeof body === "object" &&
    body !== null &&
    typeof (body as Problem).code === "string"
  );
}

// The API sends whole seconds; an HTTP date or junk is ignored.
function retryAfter(header: string | null): number | undefined {
  if (header === null || !/^\d+$/.test(header.trim())) return undefined;
  return Number(header.trim());
}

// Returns the data of an openapi-fetch result, or throws its ApiError, so a
// caller handles success in line and failure in one catch.
export function unwrap<T>(result: {
  data?: T;
  error?: unknown;
  response: Response;
}): T {
  if (result.error !== undefined || !result.response.ok) {
    throw ApiError.fromResponse(result.response, result.error);
  }
  return result.data as T;
}

// The Problem a route handler sends the browser: status, code and field
// errors, never the API's `detail`. A 5xx becomes 503 `unavailable`, so the
// page shows its own "try again" state, never a Next error page.
export function problemResponse(error: ApiError): Response {
  const status = error.status >= 500 ? 503 : error.status;
  const code = error.status >= 500 ? "unavailable" : error.code;
  const headers = new Headers({
    "Content-Type": "application/problem+json",
    "Cache-Control": "no-store",
  });
  if (error.retryAfterSeconds !== undefined) {
    headers.set("Retry-After", String(error.retryAfterSeconds));
  }
  const body = {
    type: `urn:vetmimi:problem:${code}`,
    title: code,
    status,
    code,
    errors: Object.entries(error.fieldErrors).map(([field, message]) => ({
      field,
      message,
    })),
  };
  return new Response(JSON.stringify(body), { status, headers });
}
