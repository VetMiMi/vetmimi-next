import type { Metadata } from "next";
import Link from "next/link";
import {
  CaretLeft,
  CaretRight,
  ListBullets,
} from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/admin/Button";
import { EmptyState } from "@/components/admin/EmptyState";
import { NoAccess } from "@/components/admin/NoAccess";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  CALENDAR_LIMIT,
  monthHref,
  monthLabel,
  parseMonth,
  postsByDay,
  PRACTICE_TIMEZONE,
} from "@/lib/admin/posts";
import { adminCall, requireRole } from "@/lib/admin/session";
import { ApiError, unwrap } from "@/lib/api/problem";
import { todayIn } from "@/lib/zonedTime";
import { NewPostButton } from "../_components/NewPostButton";
import { MonthCalendar } from "./MonthCalendar";

export const metadata: Metadata = { title: "Post calendar" };

const SHOWN = ["scheduled", "publishing", "published"] as const;

const navClass =
  "inline-flex size-11 items-center justify-center rounded-control border-2 border-indigo text-indigo transition-colors duration-150 hover:bg-indigo/12 motion-reduce:transition-none";

// Scheduled and published posts by Sydney date (#150). The newest
// hundred of each status cover years of posts at Daw Mi's pace.
export default async function PostCalendarPage({
  searchParams,
}: PageProps<"/admin/posts/calendar">) {
  if (!(await requireRole("content_editor"))) return <NoAccess />;
  const now = new Date();
  const month = parseMonth((await searchParams).month, now);
  const label = monthLabel(month);

  const posts = await adminCall((api) =>
    Promise.all(
      SHOWN.map(
        async (status) =>
          unwrap(
            await api.GET("/admin/posts", {
              params: { query: { status, limit: CALENDAR_LIMIT } },
            }),
          ).items,
      ),
    ),
  ).catch((error) => {
    if (error instanceof ApiError && error.status === 403) return null;
    throw error;
  });
  if (!posts) return <NoAccess />;
  const days = postsByDay(posts.flat(), month);

  return (
    <>
      <PageHeader
        title="Post calendar"
        description="Scheduled and published posts by day, in Sydney time."
        breadcrumb={[{ label: "Posts", href: "/admin/posts" }]}
        action={<NewPostButton />}
      />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href={monthHref(month, -1)} className={navClass}>
            <CaretLeft aria-hidden="true" size={18} />
            <span className="sr-only">Previous month</span>
          </Link>
          <h2
            className="min-w-[10ch] text-center text-[1.35rem]"
            aria-live="polite"
          >
            {label}
          </h2>
          <Link href={monthHref(month, 1)} className={navClass}>
            <CaretRight aria-hidden="true" size={18} />
            <span className="sr-only">Next month</span>
          </Link>
        </div>
        <Button
          href="/admin/posts"
          variant="quiet"
          icon={<ListBullets aria-hidden="true" size={18} />}
        >
          List
        </Button>
      </div>

      {days.size === 0 && (
        <div className="mb-8 md:hidden">
          <EmptyState
            headingLevel={3}
            title={`Nothing scheduled or published in ${label}.`}
            text="Approved posts appear here once they are scheduled."
          />
        </div>
      )}
      <MonthCalendar
        month={month}
        label={label}
        days={days}
        today={todayIn(PRACTICE_TIMEZONE, now)}
      />
      <ul aria-label="Key" className="mt-6 hidden flex-wrap gap-2 md:flex">
        {SHOWN.map((status) => (
          <li key={status}>
            <StatusBadge kind="post" status={status} />
          </li>
        ))}
      </ul>
    </>
  );
}
