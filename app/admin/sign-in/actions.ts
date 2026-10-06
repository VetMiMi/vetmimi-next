"use server";

import { redirect } from "next/navigation";
import { publicApi } from "@/lib/api/client";
import { ApiError, unwrap } from "@/lib/api/problem";
import { safeNext } from "@/lib/admin/safe-next";
import { setSessionCookie } from "@/lib/admin/session";

export type SignInField = "email" | "password" | "code";

export type SignInState = {
  // Each submit counts up, so the error summary or notice is new and takes
  // focus again even when the message is the same.
  attempt: number;
  email: string;
  fieldErrors: Partial<Record<SignInField, string>>;
  notice?: string;
};

const NO_MATCH =
  "That email, password or code did not match. Check them and try again.";
const UNAVAILABLE =
  "Sign-in is not available right now. Nothing was changed. Try again in a few minutes.";

function waitMessage(seconds?: number): string {
  if (seconds === undefined) {
    return "Too many attempts. Wait a few minutes, then try again.";
  }
  const minutes = Math.max(1, Math.ceil(seconds / 60));
  const unit = minutes === 1 ? "minute" : "minutes";
  return `Too many attempts. Wait ${minutes} ${unit}, then try again.`;
}

// Never says which detail was wrong: that would tell a stranger which
// emails have accounts. A password under 12 characters comes back as a 400,
// and cannot be right either.
function noticeFor(error: unknown): string {
  if (!(error instanceof ApiError)) {
    console.error("Sign-in failed unexpectedly", error);
    return UNAVAILABLE;
  }
  if (error.code === "rate_limited") {
    return waitMessage(error.retryAfterSeconds);
  }
  if (error.status === 400 || error.status === 401) return NO_MATCH;
  return UNAVAILABLE;
}

export async function signIn(
  previous: SignInState,
  form: FormData,
): Promise<SignInState> {
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  // Authenticator apps show the code as "123 456".
  const code = String(form.get("code") ?? "").replace(/\s+/g, "");

  const fieldErrors: SignInState["fieldErrors"] = {};
  if (!email) fieldErrors.email = "Enter your email address.";
  if (!password) fieldErrors.password = "Enter your password.";
  if (!code) {
    fieldErrors.code = "Enter the 6-digit code from your authenticator app.";
  } else if (!/^\d{6}$/.test(code)) {
    fieldErrors.code = "Enter the code as 6 digits, like 123456.";
  }

  const attempt = previous.attempt + 1;
  if (Object.keys(fieldErrors).length > 0) {
    return { attempt, email, fieldErrors };
  }

  try {
    const session = unwrap(
      await publicApi().POST("/auth/sessions", {
        body: { email, password, totpCode: code },
      }),
    );
    await setSessionCookie(session.token, session.expiresAt);
  } catch (error) {
    return { attempt, email, fieldErrors: {}, notice: noticeFor(error) };
  }
  redirect(safeNext(form.get("next")));
}
