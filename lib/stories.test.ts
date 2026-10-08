import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mergeStories } from "./stories.ts";

const article = (slug: string, publishedAt: string) => ({
  slug,
  from: "api",
  publishedAt,
});
const written = (slug: string) => ({ slug, from: "messages" });

describe("stories merged from the API and the messages", () => {
  it("lists published articles newest first, then the written stories", () => {
    const merged = mergeStories(
      [
        article("older", "2026-09-01T09:00:00Z"),
        article("newer", "2026-10-01T09:00:00.5Z"),
      ],
      [written("art-and-words"), written("creativity-in-healthcare")],
    );
    assert.deepEqual(
      merged.map((item) => item.slug),
      ["newer", "older", "art-and-words", "creativity-in-healthcare"],
    );
  });

  it("takes a slug in both from the API, once", () => {
    const merged = mergeStories(
      [article("art-and-words", "2026-10-01T09:00:00Z")],
      [written("stop-trying-make-perfect"), written("art-and-words")],
    );
    assert.deepEqual(
      merged.map(({ slug, from }) => `${slug}:${from}`),
      ["art-and-words:api", "stop-trying-make-perfect:messages"],
    );
  });

  it("keeps every written story when the API has nothing", () => {
    const stories = [written("a"), written("b")];
    assert.deepEqual(mergeStories([], stories), stories);
  });
});
