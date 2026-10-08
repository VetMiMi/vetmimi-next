// The publishing portal's list and calendar (#150, ADR-009): the URL ↔ API
// query mapping, the names the screens use and the month grid. Pure, so
// node:test covers it.
import type { components, operations } from "../api/schema.ts";
import { addMonths, monthGrid } from "../time.ts";
import { formatClock, formatDay, zonedParts } from "../zonedTime.ts";

type Schemas = components["schemas"];
export type PostSummary = Schemas["PostSummary"];
export type Channel = Schemas["Channel"];
type ListQuery = NonNullable<operations["listPosts"]["parameters"]["query"]>;

// Posts carry no timezone; the calendar is the practice's, in Sydney.
export const PRACTICE_TIMEZONE = "Australia/Sydney";

export const PAGE_SIZE = 50;

// The API's largest page, for the calendar's few statuses.
export const CALENDAR_LIMIT = 100;

// "All" first, so a search finds a post wherever it is in the workflow.
// Archived posts appear under All only.
export const views = [
  { id: "all", label: "All" },
  { id: "idea", label: "Ideas" },
  { id: "draft", label: "Drafts" },
  { id: "in_review", label: "In review" },
  { id: "approved", label: "Approved" },
  { id: "scheduled", label: "Scheduled" },
  { id: "published", label: "Published" },
] as const;
export type View = (typeof views)[number]["id"];

export const kindNames: Record<Schemas["PostKind"], string> = {
  insight: "Insight",
  true_story: "True Story",
  announcement: "Announcement",
};

export const channelNames: Record<Channel, string> = {
  website: "Website",
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
};

export const channelOrder: Channel[] = [
  "website",
  "facebook",
  "instagram",
  "linkedin",
];

export type ListFilters = { view: View; q?: string };

type SearchParams = Record<string, string | string[] | undefined>;
const one = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export function parseFilters(params: SearchParams): ListFilters {
  const view = views.find((v) => v.id === one(params.view))?.id ?? "all";
  const q = one(params.q)?.trim().slice(0, 100);
  return { view, ...(q && { q }) };
}

export function listQuery(filters: ListFilters, cursor?: string): ListQuery {
  return {
    ...(filters.view !== "all" && { status: filters.view }),
    ...(filters.q && { q: filters.q }),
    ...(cursor && { cursor }),
    limit: PAGE_SIZE,
  };
}

export function listHref(filters: ListFilters) {
  const params = new URLSearchParams();
  if (filters.view !== "all") params.set("view", filters.view);
  if (filters.q) params.set("q", filters.q);
  const query = params.toString();
  return query ? `/admin/posts?${query}` : "/admin/posts";
}

// Each enabled channel and, once publishing has started, how it went.
export type ChannelState = {
  channel: Channel;
  status?: Schemas["PublicationStatus"];
};

export function channelStates(
  post: Pick<PostSummary, "channels" | "publications">,
): ChannelState[] {
  return channelOrder
    .filter((channel) => post.channels.includes(channel))
    .map((channel) => {
      const status = post.publications.find(
        (p) => p.channel === channel,
      )?.status;
      return { channel, ...(status && { status }) };
    });
}

// What the list shows of a post: its channels with their states.
export type PostRow = Pick<
  PostSummary,
  "id" | "title" | "kind" | "status" | "scheduledAt" | "updatedAt"
> & { channels: ChannelState[] };

export const toRow = (post: PostSummary): PostRow => ({
  id: post.id,
  title: post.title,
  kind: post.kind,
  status: post.status,
  scheduledAt: post.scheduledAt,
  updatedAt: post.updatedAt,
  channels: channelStates(post),
});

// "Tue 13 Oct, 9:00 am" in Sydney time.
export function whenShort(instant: string) {
  const { date, time } = zonedParts(instant, PRACTICE_TIMEZONE);
  return `${formatDay(date)}, ${formatClock(time)}`;
}

// "9:00 am" in Sydney time.
export const clockShort = (instant: string) =>
  formatClock(zonedParts(instant, PRACTICE_TIMEZONE).time);

// ── Calendar ────────────────────────────────────────────────────────────

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

export function parseMonth(value: string | string[] | undefined, now: Date) {
  const month = one(value);
  return month && MONTH.test(month)
    ? month
    : zonedParts(now, PRACTICE_TIMEZONE).date.slice(0, 7);
}

export const monthHref = (month: string, offset = 0) =>
  `/admin/posts/calendar?month=${addMonths(month, offset)}`;

const monthFormat = new Intl.DateTimeFormat("en-AU", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

// "October 2026".
export function monthLabel(month: string) {
  const [y, m] = month.split("-").map(Number);
  return monthFormat.format(Date.UTC(y, m - 1, 1));
}

// When a post sits on the calendar: its scheduled time, or for a post
// published at once, when it went out.
export const calendarInstant = (post: PostSummary) =>
  post.scheduledAt ?? post.publishedAt ?? post.updatedAt;

// The month's posts under their Sydney date, earliest first within a day.
export function postsByDay(posts: readonly PostSummary[], month: string) {
  const days = new Map<string, PostSummary[]>();
  const sorted = [...posts].sort((a, b) =>
    calendarInstant(a).localeCompare(calendarInstant(b)),
  );
  for (const post of sorted) {
    const date = zonedParts(calendarInstant(post), PRACTICE_TIMEZONE).date;
    if (!date.startsWith(month)) continue;
    days.set(date, [...(days.get(date) ?? []), post]);
  }
  return days;
}

// The month as Monday-first weeks, padded with nulls to whole weeks.
export function monthWeeks(month: string): (string | null)[][] {
  const cells = monthGrid(month);
  const padded = [
    ...cells,
    ...Array<null>((7 - (cells.length % 7)) % 7).fill(null),
  ];
  return Array.from({ length: padded.length / 7 }, (_, i) =>
    padded.slice(i * 7, i * 7 + 7),
  );
}
