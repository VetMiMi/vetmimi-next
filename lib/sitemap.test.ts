import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import { buildSitemap } from "./sitemap.ts";

before(() => {
  process.env.SITE_URL = "https://vetmimi.example";
});

const build = (articles: { slug: string; publishedAt: string }[] = []) =>
  buildSitemap({
    services: ["individual-art-therapy"],
    stories: ["art-and-words", "creativity-in-healthcare"],
    articles,
  });

describe("sitemap", () => {
  it("lists each English URL once, with its Burmese alternate", () => {
    const about = build().find(
      (entry) => entry.url === "https://vetmimi.example/about",
    );
    assert.deepEqual(about, {
      url: "https://vetmimi.example/about",
      alternates: {
        languages: {
          en: "https://vetmimi.example/about",
          my: "https://vetmimi.example/my/about",
        },
      },
    });
    const urls = build().map((entry) => entry.url);
    assert.equal(new Set(urls).size, urls.length);
    assert.ok(urls.every((url) => !url.includes("/my/")));
  });

  it("includes services and written stories, without a date", () => {
    const entries = build();
    for (const path of [
      "/services/individual-art-therapy",
      "/stories/art-and-words",
    ]) {
      const entry = entries.find(
        (item) => item.url === `https://vetmimi.example${path}`,
      );
      assert.ok(entry, path);
      assert.equal(entry.lastModified, undefined);
    }
  });

  it("dates published articles and lets them replace a story's slug", () => {
    const entries = build([
      { slug: "art-and-words", publishedAt: "2026-10-01T09:00:00Z" },
      { slug: "new-article", publishedAt: "2026-10-05T09:00:00Z" },
    ]);
    const story = entries.filter(
      (entry) => entry.url === "https://vetmimi.example/stories/art-and-words",
    );
    assert.equal(story.length, 1);
    assert.equal(story[0].lastModified, "2026-10-01T09:00:00Z");
    const article = entries.find(
      (entry) => entry.url === "https://vetmimi.example/stories/new-article",
    );
    assert.equal(article?.lastModified, "2026-10-05T09:00:00Z");
  });

  it("leaves out private routes", () => {
    const urls = build().map((entry) => entry.url);
    for (const part of ["/admin", "/manage", "/session", "/api", "/portfolio/"])
      assert.ok(
        urls.every((url) => !url.includes(part)),
        part,
      );
  });
});
