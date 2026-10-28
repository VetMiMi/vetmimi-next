import "server-only";
import { headers } from "next/headers";
import { ApiError } from "./problem";

const TIMEOUT_MS = 10_000;
const UPLOAD_TIMEOUT_MS = 120_000;

// Content reads may opt into Next's data cache with tags (ADR-008); every
// other call is fresh. A call known to be slow (the AI assistant) may wait
// longer than the usual ten seconds.
export type CallOptions = { tags?: string[]; timeoutMs?: number };

export type Query = Record<
  string,
  string | number | boolean | string[] | undefined
>;

type Request = {
  method: string;
  path: string;
  query?: Query;
  body?: unknown;
  headers?: Record<string, string>;
};

// Read when a call is made, not at import, so `pnpm build` passes in CI
// without the secrets.
function requireEnv(name: "API_URL" | "API_SERVICE_KEY"): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set. See .env.example and the README.`);
  }
  return value;
}

// False until the Go API is deployed and its address and key are set. Pages
// that depend on it show a "not available yet" state instead of an error.
export function apiConfigured(): boolean {
  return Boolean(process.env.API_URL && process.env.API_SERVICE_KEY);
}

// An API path with each value encoded, so an id can never change the path.
export function apiPath(parts: TemplateStringsArray, ...values: string[]) {
  return parts.reduce(
    (path, part, i) => path + encodeURIComponent(values[i - 1]) + part,
  );
}

function apiUrl(path: string, query: Query = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    for (const item of [value].flat()) {
      if (item !== undefined) search.append(key, String(item));
    }
  }
  const base = requireEnv("API_URL").replace(/\/+$/, "");
  return search.size > 0 ? `${base}${path}?${search}` : `${base}${path}`;
}

// The parsed JSON body, or the raw text when an error page is not JSON.
function parseBody(text: string) {
  try {
    return text ? JSON.parse(text) : undefined;
  } catch {
    return text;
  }
}

// One call: the data on success (undefined for 204), an ApiError otherwise.
async function send<T>(
  auth: Record<string, string>,
  { tags, timeoutMs = TIMEOUT_MS }: CallOptions,
  { method, path, query, body, headers: extra }: Request,
): Promise<T> {
  let response: Response;
  let text: string;
  try {
    response = await fetch(apiUrl(path, query), {
      method,
      headers: {
        ...(body !== undefined && { "Content-Type": "application/json" }),
        ...auth,
        ...extra,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
      ...(tags ? { next: { tags } } : { cache: "no-store" }),
    });
    text = await response.text();
  } catch (cause) {
    throw ApiError.unavailable(cause);
  }
  if (!response.ok) throw ApiError.fromResponse(response, parseBody(text));
  return (text ? JSON.parse(text) : undefined) as T;
}

function client(
  auth: () => Promise<Record<string, string>>,
  options: CallOptions,
) {
  const call = async <T>(request: Request) =>
    send<T>(await auth(), options, request);
  return {
    get: <T>(path: string, query?: Query) =>
      call<T>({ method: "GET", path, query }),
    post: <T = void>(
      path: string,
      body?: unknown,
      headers?: Record<string, string>,
    ) => call<T>({ method: "POST", path, body, headers }),
    put: <T = void>(path: string, body: unknown) =>
      call<T>({ method: "PUT", path, body }),
    patch: <T = void>(path: string, body: unknown) =>
      call<T>({ method: "PATCH", path, body }),
    delete: (path: string) => call<void>({ method: "DELETE", path }),
  };
}

export type Api = ReturnType<typeof client>;

// The API limits sign-in and booking per visitor, so it needs the address
// of the person behind this request, not of the Next server. Vercel puts it
// first in x-forwarded-for.
async function visitorIp(): Promise<Record<string, string>> {
  const forwarded = (await headers()).get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim();
  return ip ? { "X-Visitor-IP": ip } : {};
}

// Public routes and sign-in: authenticated as this Next app (ADR-002).
// A cached content read is shared by every visitor, so it forwards no
// visitor address, and reading the request headers would stop the page
// from being static.
export function publicApi(options: CallOptions = {}) {
  return client(
    async () => ({
      "X-Service-Key": requireEnv("API_SERVICE_KEY"),
      ...(options.tags ? {} : await visitorIp()),
    }),
    options,
  );
}

// Admin routes, as the signed-in user. lib/admin/session.ts supplies the
// token from the cookie; this file knows nothing about cookies.
export function adminApi(token: string, options: CallOptions = {}) {
  return client(async () => ({ Authorization: `Bearer ${token}` }), options);
}

// The media upload, streamed on as it arrived rather than held whole in
// memory, and given the two minutes the API allows an upload.
export async function uploadMedia(
  token: string,
  body: ReadableStream<Uint8Array>,
  contentType: string,
) {
  const init: RequestInit & { duplex: "half" } = {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": contentType },
    body,
    duplex: "half",
    cache: "no-store",
    signal: AbortSignal.timeout(UPLOAD_TIMEOUT_MS),
  };
  try {
    return await fetch(`${requireEnv("API_URL")}/admin/media`, init);
  } catch (cause) {
    throw ApiError.unavailable(cause);
  }
}
