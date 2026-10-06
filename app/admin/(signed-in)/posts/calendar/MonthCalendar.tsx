import Link from "next/link";
import { statuses } from "@/components/admin/status";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { longDay } from "@/lib/admin/appointments";
import { clockShort, monthWeeks, type PostSummary } from "@/lib/admin/posts";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const linkClass =
  "underline decoration-1 underline-offset-4 transition-colors duration-150 hover:text-indigo motion-reduce:transition-none";

// A month of scheduled and published posts (#150): a grid from 768px, the
// days that have posts as a list below, where seven columns would not fit
// a title. Each post links to its editor.
export function MonthCalendar({
  month,
  label,
  days,
  today,
}: {
  month: string;
  label: string;
  days: Map<string, PostSummary[]>;
  today: string;
}) {
  return (
    <>
      <table className="hidden w-full table-fixed border-collapse text-[0.82rem] md:table">
        <caption className="sr-only">Posts in {label}</caption>
        <thead>
          <tr>
            {WEEKDAYS.map((day) => (
              <th
                key={day}
                scope="col"
                className="pb-3 text-left text-[0.75rem] font-semibold tracking-[0.1em] text-muted uppercase"
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {monthWeeks(month).map((week) => (
            <tr key={week.find(Boolean)}>
              {week.map((date, i) => (
                <td
                  key={date ?? `pad-${i}`}
                  className="h-28 border border-divider p-2 align-top data-[pad]:bg-paper/60"
                  data-pad={date ? undefined : ""}
                >
                  {date && (
                    <Day
                      date={date}
                      posts={days.get(date) ?? []}
                      today={date === today}
                    />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <ol
        aria-label={`Posts in ${label}`}
        className="flex flex-col gap-6 md:hidden"
      >
        {[...days].map(([date, posts]) => (
          <li key={date}>
            <h3 className="mb-3 font-body text-[0.75rem] font-semibold tracking-[0.1em] text-muted uppercase">
              {longDay(date)}
              {date === today && " · Today"}
            </h3>
            <ul className="flex flex-col gap-3">
              {posts.map((post) => (
                <li
                  key={post.id}
                  className="flex flex-col items-start gap-2 rounded-card border border-card-border bg-raised px-5 py-4"
                >
                  <Link
                    href={`/admin/posts/${post.id}`}
                    className={`font-semibold ${linkClass}`}
                  >
                    {post.title}
                  </Link>
                  <StatusBadge
                    kind="post"
                    status={post.status}
                    detail={
                      post.scheduledAt
                        ? clockShort(post.scheduledAt)
                        : undefined
                    }
                  />
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </>
  );
}

function Day({
  date,
  posts,
  today,
}: {
  date: string;
  posts: PostSummary[];
  today: boolean;
}) {
  return (
    <>
      <span
        className={`mb-1.5 inline-flex size-7 items-center justify-center rounded-pill font-semibold ${today ? "bg-indigo text-white" : "text-muted"}`}
      >
        <span className="sr-only">{longDay(date)}</span>
        <span aria-hidden="true">{Number(date.slice(8))}</span>
        {today && <span className="sr-only">, today</span>}
      </span>
      {posts.length > 0 && (
        <ul className="flex flex-col gap-1">
          {posts.map((post) => {
            const {
              tint,
              text,
              icon: Icon,
              label,
            } = statuses.post[post.status];
            return (
              <li key={post.id}>
                <Link
                  href={`/admin/posts/${post.id}`}
                  title={post.title}
                  className={`flex items-start gap-1 rounded-small px-1.5 py-1 leading-snug no-underline transition-colors duration-150 hover:bg-indigo/12 motion-reduce:transition-none ${tint} ${text}`}
                >
                  <Icon
                    aria-hidden="true"
                    size={14}
                    className="mt-0.5 shrink-0"
                  />
                  <span className="line-clamp-2 min-w-0 break-words">
                    {post.title}
                    <span className="sr-only">, {label}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
