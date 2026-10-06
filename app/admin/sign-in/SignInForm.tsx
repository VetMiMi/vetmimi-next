"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/admin/Button";
import { ErrorSummary } from "@/components/admin/ErrorSummary";
import { Input } from "@/components/admin/Input";
import { Notice } from "@/components/admin/Notice";
import { signIn, type SignInField, type SignInState } from "./actions";

const initialState: SignInState = { attempt: 0, email: "", fieldErrors: {} };

const fieldOrder: SignInField[] = ["email", "password", "code"];

// A client component for the sending state and for moving focus to what
// went wrong; the form itself posts to a Server Function, so it also works
// before (or without) JavaScript. React resets the form after each submit:
// the email comes back from the state, the password and code do not.
export function SignInForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(signIn, initialState);
  const noticeRef = useRef<HTMLDivElement>(null);
  const { attempt, email, fieldErrors, notice } = state;

  useEffect(() => {
    if (notice) noticeRef.current?.focus();
  }, [attempt, notice]);

  const summary = fieldOrder.flatMap((name) => {
    const message = fieldErrors[name];
    return message ? [{ name, message }] : [];
  });

  return (
    <form action={action} noValidate className="flex flex-col gap-[22px]">
      <input type="hidden" name="next" value={next} />
      {notice && (
        <Notice key={attempt} tone="error" ref={noticeRef}>
          {notice}
        </Notice>
      )}
      <ErrorSummary
        key={`summary-${attempt}`}
        title={
          summary.length === 1
            ? "One detail needs checking."
            : `${summary.length} details need checking.`
        }
        errors={summary}
      />
      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="username"
        spellCheck={false}
        required
        defaultValue={email}
        error={fieldErrors.email}
      />
      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        error={fieldErrors.password}
      />
      <Input
        label="6-digit code from your authenticator app"
        name="code"
        autoComplete="one-time-code"
        inputMode="numeric"
        maxLength={7}
        spellCheck={false}
        required
        error={fieldErrors.code}
      />
      <Button
        type="submit"
        size="page"
        busy={pending}
        className="mt-1.5 w-full"
      >
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
