import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import { articleSlugs, indexNowPayload } from "./indexnow.ts";

before(() => {
  process.env.SITE_URL = "https://vetmimi.example";
});

describe("IndexNow", () => {
  it("pings only for the articles a revalidation names", () => {
    assert.deepEqual(
      articleSlugs(["articles", "article:first-light", "article:", "other"]),
      ["first-light"],
    );
    assert.deepEqual(articleSlugs(["articles"]), []);
  });

  it("sends both languages of the article and the stories list", () => {
    assert.deepEqual(indexNowPayload("abc12345", ["first-light"]), {
      host: "vetmimi.example",
      key: "abc12345",
      keyLocation: "https://vetmimi.example/indexnow.txt",
      urlList: [
        "https://vetmimi.example/stories/first-light",
        "https://vetmimi.example/my/stories/first-light",
        "https://vetmimi.example/stories",
        "https://vetmimi.example/my/stories",
      ],
    });
  });
});
