import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { describedBy, fieldId, fieldIds } from "./fieldIds.ts";

describe("field ids", () => {
  it("derives the control id from a plain name", () => {
    assert.equal(fieldId("email"), "field-email");
  });

  // An id with brackets or dots breaks a #fragment link and a CSS selector.
  it("turns brackets and dots into single dashes", () => {
    assert.equal(fieldId("periods[0].start"), "field-periods-0-start");
  });

  it("names the help and error after the control", () => {
    assert.deepEqual(fieldIds("note"), {
      control: "field-note",
      help: "field-note-help",
      error: "field-note-error",
    });
  });
});

describe("aria-describedby", () => {
  const ids = fieldIds("note");

  it("lists help before the error, as they appear", () => {
    assert.equal(
      describedBy(ids, { help: true, error: true }),
      "field-note-help field-note-error",
    );
  });

  it("points at the error alone when there is no help", () => {
    assert.equal(describedBy(ids, { error: true }), "field-note-error");
  });

  // An empty aria-describedby is an id reference to nothing.
  it("is left out when there is neither help nor error", () => {
    assert.equal(describedBy(ids, {}), undefined);
  });
});
