"use server";

import { redirect } from "next/navigation";
import { adminApi } from "@/lib/api/client";
import { ApiError, unwrap } from "@/lib/api/problem";
import { clearSessionCookie, sessionToken } from "@/lib/admin/session";

export async function signOut() {
  const token = await sessionToken();
  if (token) {
    try {
      unwrap(await adminApi(token).DELETE("/auth/sessions/current"));
    } catch (error) {
      // A 401 means the session had already ended. Any other failure still
      // signs this device out: the cookie goes, and the API ends the session
      // at its own expiry.
      if (!(error instanceof ApiError)) throw error;
    }
  }
  await clearSessionCookie();
  redirect("/admin/sign-in?signed-out=1");
}
