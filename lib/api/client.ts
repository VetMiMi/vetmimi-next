import "server-only";
import createClient, { type Middleware } from "openapi-fetch";
import { headers } from "next/headers";
import type { paths } from "./schema";
import { ApiError } from "./problem";

const TIMEOUT_MS = 10_000;

// Content reads may opt into Next's data cache with tags (ADR-008); every
// other call is fresh. A call known to be slow (the AI assistant) may wait
// longer than the usual ten seconds.
export type CallOptions = { tags?: string[]; timeoutMs?: number };

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

function apiClient(
  auth: Record<string, string>,
  { tags, timeoutMs = TIMEOUT_MS }: CallOptions,
) {
  const cache: RequestInit = tags ? { next: { tags } } : { cache: "no-store" };
  return createClient<paths>({
    baseUrl: requireEnv("API_URL"),
    headers: auth,
    async fetch(request) {
      try {
        return await fetch(request, {
          ...cache,
          signal: AbortSignal.timeout(timeoutMs),
        });
      } catch (cause) {
        throw ApiError.unavailable(cause);
      }
    },
  });
}

// The API limits sign-in and booking per visitor, so it needs the address
// of the person behind this request, not of the Next server. Vercel puts it
// first in x-forwarded-for.
const forwardVisitorIp: Middleware = {
  async onRequest({ request }) {
    const forwarded = (await headers()).get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim();
    if (ip) request.headers.set("X-Visitor-IP", ip);
    return request;
  },
};

// Public routes and sign-in: authenticated as this Next app (ADR-002).
// A cached content read is shared by every visitor, so it forwards no
// visitor address, and reading the request headers would stop the page
// from being static.
export function publicApi(options: CallOptions = {}) {
  const client = apiClient(
    { "X-Service-Key": requireEnv("API_SERVICE_KEY") },
    options,
  );
  if (!options.tags) client.use(forwardVisitorIp);
  return client;
}

// Admin routes, as the signed-in user. lib/admin/session.ts supplies the
// token from the cookie; this file knows nothing about cookies.
export function adminApi(token: string, options: CallOptions = {}) {
  return apiClient({ Authorization: `Bearer ${token}` }, options);
}

export type AdminApi = ReturnType<typeof adminApi>;

const UPLOAD_TIMEOUT_MS = 120_000;

// The media upload (uploadMedia), streamed on as it arrived: the generated
// client would hold the whole 20 MB body in memory, and the API gives an
// upload two minutes, not ten seconds.
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
