// Bot traps for the public forms, with no third party and nothing a real
// visitor sees: a hidden field only a bot fills, and a signed timestamp of
// when the form was served, so a submit faster than a person can type is
// refused. The API's per-visitor rate limit is the third layer.
import { createHmac, timingSafeEqual } from "node:crypto";

export const MIN_FILL_MS = 3_000;

export type FormScope = "booking" | "contact";

// The key Next already shares with the API; a separate secret would only be
// one more thing to configure.
const serverSecret = () => process.env.API_SERVICE_KEY ?? "";

function signature(secret: string, scope: FormScope, issuedAt: number) {
  return createHmac("sha256", `vetmimi-form:${secret}`)
    .update(`${scope}.${issuedAt}`)
    .digest("base64url");
}

export function issueFormToken(
  scope: FormScope,
  now = Date.now(),
  secret = serverSecret(),
) {
  return `${now}.${signature(secret, scope, now)}`;
}

export type TrapResult = "ok" | "honeypot" | "too_fast" | "invalid";

export function checkTraps(
  scope: FormScope,
  { token, honeypot }: { token: string; honeypot: string },
  now = Date.now(),
  secret = serverSecret(),
): TrapResult {
  if (honeypot.trim() !== "") return "honeypot";
  const [issued, sig = ""] = token.split(".");
  const issuedAt = Number(issued);
  if (!/^\d+$/.test(issued ?? "")) return "invalid";
  const expected = Buffer.from(signature(secret, scope, issuedAt));
  const given = Buffer.from(sig);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return "invalid";
  }
  return now - issuedAt < MIN_FILL_MS ? "too_fast" : "ok";
}
