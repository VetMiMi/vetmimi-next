import type { Metadata } from "next";
import Form from "next/form";
import { CalendarBlank } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/admin/Button";
import { EmptyState } from "@/components/admin/EmptyState";
import { controlClass, labelClass } from "@/components/admin/Field";
import { NoAccess } from "@/components/admin/NoAccess";
import { PageHeader } from "@/components/admin/PageHeader";
import { Tabs } from "@/components/admin/Tabs";
import {
  CALENDAR_LIMIT,
  listHref,
  listQuery,
  parseFilters,
  views,
} from "@/lib/admin/posts";
import { adminCall, requireRole } from "@/lib/admin/session";
import { ApiError, unwrap } from "@/lib/api/problem";
import { NewPostButton } from "./_components/NewPostButton";
import { PostList } from "./_components/PostList";
import { toRows } from "./rows";

export const metadata: Metadata = { title: "Posts" };

// The publishing portal (#150, ADR-009): every post newest first, by
// workflow status, with each channel's state.
export default async function PostsPage({
  searchParams,
}: PageProps<"/admin/posts">) {
  if (!(await requireRole("content_editor"))) return <NoAccess />;
  const params = await searchParams;
  const filters = parseFilters(params);

  const page = await adminCall(async (api) => {
    const list = unwrap(
      await api.GET("/admin/posts", { params: { query: listQuery(filters) } }),
    );
    // Published also shows the posts still going out, so a channel that
    // failed or waits to be posted by hand is in view.
    if (filters.view !== "published") return list;
    const publishing = unwrap(
      await api.GET("/admin/posts", {
        params: {
          query: { status: "publishing", q: filters.q, limit: CALENDAR_LIMIT },
        },
      }),
    );
    return { ...list, items: [...publishing.items, ...list.items] };
  }).catch((error) => {
    if (error instanceof ApiError && error.status === 403) return null;
    throw error;
  });
  if (!page) return <NoAccess />;
  const rows = await toRows(page.items);

  const empty = filters.q ? (
    <EmptyState
      title="Nothing matches your search."
      action={{ label: "Clear search", href: listHref({ view: filters.view }) }}
    />
  ) : filters.view === "all" ? (
    <EmptyState
      title="No posts yet."
      text="Write a post once, then shape it for the website, Facebook, Instagram and LinkedIn."
      shape="petal"
    />
  ) : (
    <EmptyState
      title={`No posts in ${views.find((v) => v.id === filters.view)?.label}.`}
      action={{ label: "View all posts", href: "/admin/posts" }}
    />
  );

  return (
    <>
      <PageHeader
        title="Posts"
        description="Articles for the website and their Facebook, Instagram and LinkedIn versions. Times are Sydney time."
        action={<NewPostButton />}
      />
      <div className="mb-6">
        <Tabs
          label="Post status"
          active={filters.view}
          items={views.map((view) => ({
            id: view.id,
            label: view.label,
            href: listHref({ ...filters, view: view.id }),
          }))}
        />
      </div>
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <Form action="/admin/posts" className="w-full max-w-[560px]">
          {filters.view !== "all" && (
            <input type="hidden" name="view" value={filters.view} />
          )}
          <label htmlFor="field-q" className={labelClass}>
            Search by title
          </label>
          <div className="flex gap-3">
            <input
              id="field-q"
              name="q"
              type="search"
              defaultValue={filters.q}
              autoComplete="off"
              enterKeyHint="search"
              className={`${controlClass} min-w-0`}
            />
            <Button type="submit" variant="secondary">
              Search
            </Button>
          </div>
        </Form>
        <Button
          href="/admin/posts/calendar"
          variant="quiet"
          className="self-start md:self-auto"
          icon={<CalendarBlank aria-hidden="true" size={18} />}
        >
          Calendar
        </Button>
      </div>

      <PostList
        // A new list for a new view or search: "Show more" starts again.
        key={listHref(filters)}
        params={params}
        first={{ items: rows, nextCursor: page.nextCursor }}
        empty={empty}
      />
    </>
  );
}
