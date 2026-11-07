import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import { buildSitemap } from "./sitemap.ts";

before(() => {
  process.env.SITE_URL = "https://vetmimi.example";
});

const build = (articles: { slug: string; publishedAt: string }[] = []) =>
  buildSitemap({
    services: ["individual-art-therapy"],
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

  it("includes services without a date", () => {
    const entry = build().find(
      (item) =>
        item.url === "https://vetmimi.example/services/individual-art-therapy",
    );
    assert.ok(entry);
    assert.equal(entry.lastModified, undefined);
  });

  it("dates published articles", () => {
    const article = build([
      { slug: "new-article", publishedAt: "2026-10-05T09:00:00Z" },
    ]).find(
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
