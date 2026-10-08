// Settings → Connections (#153): what each platform connection's state
// reads as, and the words for a sign-in that did not finish. Pure, so
// node:test covers it.
import type { components } from "../api/schema.ts";

type Schemas = components["schemas"];
export type MetaConnection = Schemas["MetaConnection"];
export type LinkedInConnection = Schemas["LinkedInConnection"];

export type Provider = "meta" | "linkedin";
export type ConnectionStatus =
  LinkedInConnection["status"] | MetaConnection["status"];

export const providerNames: Record<Provider, string> = {
  meta: "Facebook",
  linkedin: "LinkedIn",
};

export const isProvider = (value: unknown): value is Provider =>
  value === "meta" || value === "linkedin";

// The API warns about LinkedIn a week ahead; Meta gets the same week.
const WARNING_MS = 7 * 24 * 60 * 60 * 1000;

// Meta's own status has no expiry states, so they come from the dates and
// the last error, as LinkedIn's do on the API.
export function metaStatus(
  connection: MetaConnection,
  now = new Date(),
): ConnectionStatus {
  if (connection.status !== "connected") return connection.status;
  if (connection.lastError === "reconnect_required")
    return connection.lastError;
  if (!connection.expiresAt) return "connected";
  const left = Date.parse(connection.expiresAt) - now.getTime();
  if (left <= 0) return "reconnect_required";
  return left <= WARNING_MS ? "expiring_soon" : "connected";
}

// The notice under a card that needs Daw Mi to act, or none.
export function connectionNotice(
  provider: Provider,
  status: ConnectionStatus,
): { tone: "info" | "error"; text: string } | undefined {
  const name = providerNames[provider];
  switch (status) {
    case "expiring_soon":
      return {
        tone: "info",
        text: `Access to ${name} ends soon. Connect again before then so scheduled posts keep going out.`,
      };
    case "reconnect_required":
      return {
        tone: "error",
        text: `${name} stopped accepting posts from the portal. Connect again; until then, use Copy & open for ${name} posts.`,
      };
    case "choosing_page":
      return {
        tone: "info",
        text: "You manage more than one Facebook Page. Choose the one to post to.",
      };
    default:
      return undefined;
  }
}

// Words for `lastError` codes other than the ones a status already says.
const lastErrors: Record<string, string> = {
  reconnect_required: "Facebook refused the portal's access.",
};
export const lastErrorText = (code: string) =>
  lastErrors[code] ?? `Publishing last failed (${code.replaceAll("_", " ")}).`;

// Why a sign-in came back without a connection, as the page's URL carries
// it: `?failed=<provider>&reason=<reason>`.
export type FailReason = "cancelled" | "expired" | "unavailable" | "failed";

const reasons: FailReason[] = ["cancelled", "expired", "unavailable", "failed"];

export function failMessage(
  provider: unknown,
  reason: unknown,
): string | undefined {
  if (!isProvider(provider)) return undefined;
  const name = providerNames[provider];
  const why = reasons.includes(reason as FailReason)
    ? (reason as FailReason)
    : "failed";
  return {
    cancelled: `The ${name} sign-in was cancelled, so nothing was connected. Choose Connect ${name} when you are ready.`,
    expired: `The ${name} sign-in took too long or was started in another window, so nothing was connected. Choose Connect ${name} to try again.`,
    unavailable: `${name} is not set up on the server yet, so it cannot be connected. Posts to it use Copy & open for now.`,
    failed: `${name} was not connected. Nothing changed. Try again in a few minutes.`,
  }[why];
}

// The platform's own `error` when it sends Daw Mi back without a code:
// Facebook says `access_denied`, LinkedIn `user_cancelled_login` or
// `user_cancelled_authorize` when she backs out.
export const platformErrorReason = (error: string): FailReason =>
  /cancel|denied/.test(error) ? "cancelled" : "failed";

// The reason for an API refusal of a sign-in step.
export function failReason(code: string): FailReason {
  if (code === "action_not_allowed") return "expired";
  if (code === "unavailable") return "unavailable";
  return "failed";
}

// Where a sign-in that did not finish sends Daw Mi back to.
export const failedHref = (provider: Provider, reason: FailReason) =>
  `/admin/settings/connections?${new URLSearchParams({ failed: provider, reason })}`;

// "Access ends" until the date has passed.
export const accessLabel = (expiresAt: string, now = new Date()) =>
  Date.parse(expiresAt) <= now.getTime() ? "Access ended" : "Access ends";
