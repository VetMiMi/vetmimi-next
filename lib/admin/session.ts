import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { adminApi, type AdminApi } from "@/lib/api/client";
import { ApiError, unwrap } from "@/lib/api/problem";
import type { components } from "@/lib/api/schema";
import { canUse, type Role } from "./roles";
import { safeNext } from "./safe-next";

export type CurrentUser = components["schemas"]["CurrentUser"];

// The API's session token (ADR-002). httpOnly, so no script on the page can
// read it, and scoped to /admin, so the public pages never send it.
const COOKIE = "vm_session";
const COOKIE_PATH = "/admin";

// Only Server Functions can write cookies.
export async function setSessionCookie(token: string, expiresAt: string) {
  const seconds = Math.floor((Date.parse(expiresAt) - Date.now()) / 1000);
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: COOKIE_PATH,
    maxAge: Math.max(seconds, 0),
  });
}

export async function clearSessionCookie() {
  (await cookies()).delete({ name: COOKIE, path: COOKIE_PATH });
}

export async function sessionToken(): Promise<string | undefined> {
  return (await cookies()).get(COOKIE)?.value;
}

const isUnauthenticated = (error: unknown) =>
  error instanceof ApiError && error.status === 401;

// Asked once per request however many components want the user.
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const token = await sessionToken();
  if (!token) return null;
  try {
    return unwrap(await adminApi(token).GET("/auth/me"));
  } catch (error) {
    if (isUnauthenticated(error)) return null;
    throw error;
  }
});

// Back to sign-in, then to the page Daw Mi asked for (Booking UX §29). A
// cookie the API refused means the session ended, which sign-in says.
async function redirectToSignIn(): Promise<never> {
  const params = new URLSearchParams({
    next: safeNext((await headers()).get("x-admin-path")),
  });
  if (await sessionToken()) params.set("expired", "1");
  redirect(`/admin/sign-in?${params}`);
}

export async function requireUser(): Promise<CurrentUser> {
  return (await getCurrentUser()) ?? redirectToSignIn();
}

// For a page open to some roles only: null means the page renders
// <NoAccess /> and loads no data (Booking UX §29).
export async function requireRole(
  ...allowed: Role[]
): Promise<CurrentUser | null> {
  const user = await requireUser();
  return canUse(user.roles, allowed) ? user : null;
}

// Every admin API call goes through here, not only the page's first check:
// layouts do not re-render on client navigation, so a session that ends
// mid-visit is caught by the call that finds it.
export async function adminCall<T>(fn: (api: AdminApi) => Promise<T>) {
  const token = await sessionToken();
  if (!token) return redirectToSignIn();
  try {
    return await fn(adminApi(token));
  } catch (error) {
    if (isUnauthenticated(error)) return redirectToSignIn();
    throw error;
  }
}
