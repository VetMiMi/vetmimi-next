import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  describedEnough,
  fileProblem,
  MAX_UPLOAD_BYTES,
  move,
  sizeFor,
} from "./media.ts";

describe("media library", () => {
  it("takes JPEG, PNG and WebP up to 20 MB", () => {
    assert.equal(fileProblem({ type: "image/webp", size: 1000 }), undefined);
    assert.equal(
      fileProblem({ type: "image/jpeg", size: MAX_UPLOAD_BYTES }),
      undefined,
    );
    assert.equal(
      fileProblem({ type: "image/heic", size: 1000 }),
      "Choose a JPEG, PNG or WebP image.",
    );
    assert.equal(
      fileProblem({ type: "image/png", size: MAX_UPLOAD_BYTES + 1 }),
      "This image is 20.0 MB. Choose one of 20 MB or less.",
    );
  });

  it("needs alt text in both languages", () => {
    assert.equal(
      describedEnough({ alt: { en: "A tree", my: "သစ်ပင်" } }),
      true,
    );
    assert.equal(describedEnough({ alt: { en: "A tree", my: " " } }), false);
    assert.equal(describedEnough({}), false);
  });

  it("picks the smallest web size that is wide enough", () => {
    const media = {
      sizes: [
        { width: 1600, url: "l" },
        { width: 800, url: "m" },
        { width: 400, url: "s" },
      ],
    };
    assert.equal(sizeFor(media, 300), "s");
    assert.equal(sizeFor(media, 401), "m");
    assert.equal(sizeFor(media, 2000), "l");
    assert.equal(sizeFor({ sizes: [] }, 400), undefined);
  });

  it("moves an image one place, never past either end", () => {
    assert.deepEqual(move(["a", "b", "c"], 1, -1), ["b", "a", "c"]);
    assert.deepEqual(move(["a", "b", "c"], 1, 1), ["a", "c", "b"]);
    assert.deepEqual(move(["a", "b"], 0, -1), ["a", "b"]);
    assert.deepEqual(move(["a", "b"], 1, 1), ["a", "b"]);
  });
});
