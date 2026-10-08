// The publishing workflow in the post editor (#152): which actions each
// role has at each status, scheduling in Sydney time, how a channel's
// failure reads, and what "Copy & open" copies. Pure, so node:test covers
// it. The API decides every transition; this only chooses what to offer.
import type { components } from "../api/schema.ts";
import type { SocialChannel } from "./postDraft.ts";
import { channelNames, PRACTICE_TIMEZONE } from "./posts.ts";
import { addDays } from "../time.ts";
import { todayIn, zonedInstant, zonedParts } from "../zonedTime.ts";

type Schemas = components["schemas"];
type Post = Schemas["Post"];
type PostStatus = Schemas["PostStatus"];

export type WorkflowAction =
  | "submit"
  | "requestChanges"
  | "approve"
  | "schedule"
  | "unschedule"
  | "publish"
  | "archive";

// A content editor submits; only a site administrator reviews, schedules,
// publishes and archives (vetmimi-api internal/httpapi/roles.go).
export function workflowActions(
  status: PostStatus,
  canReview: boolean,
): WorkflowAction[] {
  const actions: WorkflowAction[] = [];
  if (status === "idea" || status === "draft") actions.push("submit");
  if (!canReview) return actions;
  if (status === "in_review") actions.push("approve", "requestChanges");
  if (status === "approved") actions.push("schedule", "publish");
  if (status === "scheduled") actions.push("publish", "schedule", "unschedule");
  if (status !== "archived") actions.push("archive");
  return actions;
}

// ── Scheduling ──────────────────────────────────────────────────────────

export type ScheduleParts = { date: string; time: string };

// The form's starting value: the post's time, else 9:00 am tomorrow.
export function scheduleStart(
  scheduledAt: string | undefined,
  now: Date,
): ScheduleParts {
  if (scheduledAt) {
    const { date, time } = zonedParts(scheduledAt, PRACTICE_TIMEZONE);
    return { date, time: time.slice(0, 5) };
  }
  return { date: addDays(todayIn(PRACTICE_TIMEZONE, now), 1), time: "09:00" };
}

// The instant to send, or why the date and time cannot be used.
export function scheduleInstant(
  { date, time }: ScheduleParts,
  now: Date,
): { instant: string } | { error: string } {
  if (!date || !time) return { error: "Choose a date and a time." };
  const instant = zonedInstant(date, time, PRACTICE_TIMEZONE);
  if (!instant)
    return {
      error:
        "That time does not exist in Sydney: the clocks go forward. Choose another time.",
    };
  if (Date.parse(instant) <= now.getTime())
    return { error: "Choose a time in the future." };
  return { instant };
}

// ── Channels ────────────────────────────────────────────────────────────

const reasons: Record<string, string> = {
  not_connected:
    "Not connected to the platform yet. Use Copy & open to post it yourself, then mark it as posted.",
  connection_failed:
    "The platform could not be reached after three tries. Retry, or use Copy & open.",
  rejected:
    "The platform refused the post. Check its text and images, then Retry, or use Copy & open.",
  reconnect_required:
    "The connection to the platform has expired and needs connecting again. Use Copy & open now, or Retry once it is reconnected.",
  unknown_outcome:
    "The platform did not confirm the post. It may have posted — check the platform, then Retry or Mark as posted.",
};

// Why a channel failed, in words; an unknown code still says what to do.
export const failureReason = (error: string | undefined) =>
  (error && reasons[error]) ??
  "The post did not go out. Retry, or use Copy & open.";

export const platformHome: Record<SocialChannel, string> = {
  facebook: "https://www.facebook.com/",
  instagram: "https://www.instagram.com/",
  linkedin: "https://www.linkedin.com/feed/",
};

export const isSocial = (channel: string): channel is SocialChannel =>
  channel === "facebook" || channel === "instagram" || channel === "linkedin";

// What Copy & open puts on the clipboard: the post's text, and its link
// on a line of its own when the text does not already hold it.
export function copyText(post: Pick<Post, "versions">, channel: SocialChannel) {
  const { facebook, instagram, linkedin } = post.versions;
  if (channel === "instagram") return instagram?.caption ?? "";
  const version = channel === "facebook" ? facebook : linkedin;
  const text = version?.text ?? "";
  const link = version?.link;
  return link && !text.includes(link)
    ? `${text.trimEnd()}\n\n${link}`.trim()
    : text;
}

export const imageIdsOf = (
  post: Pick<Post, "versions">,
  channel: SocialChannel,
) => post.versions[channel]?.imageIds ?? [];

// A channel Daw Mi may post by hand now: still waiting or failed, or
// already posted by hand (to correct the link), while the post is out.
export function canMarkPosted(
  postStatus: PostStatus,
  publication: Pick<Schemas["Publication"], "channel" | "status">,
) {
  return (
    isSocial(publication.channel) &&
    (postStatus === "publishing" || postStatus === "published") &&
    ["pending", "failed", "manual"].includes(publication.status)
  );
}

export const canRetry = (
  postStatus: PostStatus,
  publication: Pick<Schemas["Publication"], "channel" | "status">,
) =>
  postStatus === "publishing" &&
  isSocial(publication.channel) &&
  publication.status === "failed";

// ── Approval problems ───────────────────────────────────────────────────

const fieldLabels: Record<string, string> = {
  slug: "the web address",
  title: "the title",
  excerpt: "the excerpt",
  body: "the article",
  text: "the post text",
  caption: "the caption",
  coverImageId: "the cover image",
};

const locales: Record<string, string> = {
  en: " in English",
  my: " in Burmese",
};

// One problem from a refused approval, from its field and the API's
// message: "versions.website.title.en" + "is required" → "Website: the
// title in English is required."
export function approvalProblem(field: string, message: string) {
  if (field === "consent.confirmed") return "True Story: confirm consent.";
  const [, channel, name, rest] = field.split(".");
  if (!channel) return "Turn on at least one channel.";
  const where = channelNames[channel as keyof typeof channelNames] ?? channel;
  if (name === "imageIds")
    return rest === undefined
      ? `${where}: ${message}.`
      : `${where}: image ${Number(rest) + 1} ${message}.`;
  const what = fieldLabels[name] ?? name;
  const locale = locales[rest ?? ""] ?? "";
  return `${where}: ${what}${locale} ${message}.`;
}
