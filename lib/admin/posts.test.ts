import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  channelStates,
  listHref,
  listQuery,
  monthLabel,
  monthWeeks,
  parseFilters,
  parseMonth,
  postsByDay,
  type PostSummary,
} from "./posts.ts";

const post = (patch: Partial<PostSummary>): PostSummary => ({
  id: "0b6f7c1e-2d3a-4b5c-9d8e-7f6a5b4c3d2e",
  title: "Colour and calm",
  kind: "insight",
  status: "scheduled",
  channels: ["website"],
  version: 1,
  createdAt: "2026-10-01T00:00:00Z",
  updatedAt: "2026-10-01T00:00:00Z",
  ...patch,
});

describe("post list filters", () => {
  it("defaults to All and maps a view to the API status", () => {
    assert.deepEqual(parseFilters({}), { view: "all" });
    assert.deepEqual(listQuery(parseFilters({})), { limit: 50 });
    assert.deepEqual(
      listQuery(parseFilters({ view: "in_review", q: " calm " }), "c2"),
      { status: "in_review", q: "calm", cursor: "c2", limit: 50 },
    );
    assert.equal(parseFilters({ view: "archived" }).view, "all");
  });

  it("keeps the default view out of the address", () => {
    assert.equal(listHref({ view: "all" }), "/admin/posts");
    assert.equal(
      listHref({ view: "draft", q: "art & play" }),
      "/admin/posts?view=draft&q=art+%26+play",
    );
  });
});

describe("channel states", () => {
  it("lists enabled channels in order, with publishing results", () => {
    assert.deepEqual(
      channelStates(
        { status: "publishing", channels: ["instagram", "website"] },
        [
          { channel: "website", status: "published" },
          { channel: "instagram", status: "failed" },
        ],
      ),
      [
        { channel: "website", status: "published" },
        { channel: "instagram", status: "failed" },
      ],
    );
  });

  it("marks every channel of a published post published", () => {
    assert.deepEqual(
      channelStates({ status: "published", channels: ["linkedin"] }),
      [{ channel: "linkedin", status: "published" }],
    );
    assert.deepEqual(
      channelStates({ status: "draft", channels: ["website"] }),
      [{ channel: "website" }],
    );
  });
});

describe("calendar", () => {
  it("takes a valid month or the current Sydney month", () => {
    assert.equal(parseMonth("2026-02", new Date()), "2026-02");
    // 31 Oct 14:00 UTC is already 1 November in Sydney.
    assert.equal(
      parseMonth("2026-13", new Date("2026-10-31T14:00:00Z")),
      "2026-11",
    );
    assert.equal(monthLabel("2026-10"), "October 2026");
  });

  it("files posts under their Sydney date, earliest first", () => {
    const late = post({ id: "b", scheduledAt: "2026-10-06T22:00:00Z" });
    const early = post({ id: "a", scheduledAt: "2026-10-06T20:00:00Z" });
    const now = post({
      id: "c",
      status: "published",
      updatedAt: "2026-10-20T03:00:00Z",
    });
    const other = post({ id: "d", scheduledAt: "2026-11-02T00:00:00Z" });
    const days = postsByDay([late, now, early, other], "2026-10");
    assert.deepEqual(
      days.get("2026-10-07")?.map((p) => p.id),
      ["a", "b"],
    );
    assert.deepEqual(
      days.get("2026-10-20")?.map((p) => p.id),
      ["c"],
    );
    assert.equal(days.size, 2);
  });

  it("lays a month out in whole Monday-first weeks", () => {
    const weeks = monthWeeks("2026-10");
    assert.equal(weeks.length, 5);
    assert.deepEqual(weeks[0], [
      null,
      null,
      null,
      "2026-10-01",
      "2026-10-02",
      "2026-10-03",
      "2026-10-04",
    ]);
    assert.deepEqual(weeks[4].slice(4), ["2026-10-30", "2026-10-31", null]);
  });
});
