import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { slugify } from "./slug.ts";

describe("slug from a service name", () => {
  it("joins words with single hyphens", () => {
    assert.equal(slugify("Individual Art Therapy"), "individual-art-therapy");
  });

  it("drops punctuation, accents and spaces at the ends", () => {
    assert.equal(
      slugify("  Workshops & Programs — Café! "),
      "workshops-programs-cafe",
    );
  });

  it("gives nothing for a name in Burmese only", () => {
    assert.equal(slugify("အနုပညာ"), "");
  });
});
