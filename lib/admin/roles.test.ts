import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { canUse } from "./roles.ts";

describe("canUse", () => {
  it("opens an item without roles to anyone signed in", () => {
    assert.equal(canUse([], []), true);
    assert.equal(canUse(["content_editor"], []), true);
  });

  it("needs one of the item's roles", () => {
    assert.equal(canUse(["booking_admin"], ["booking_admin"]), true);
    assert.equal(canUse(["content_editor"], ["booking_admin"]), false);
    assert.equal(canUse([], ["booking_admin"]), false);
  });

  it("lets site_admin use everything", () => {
    assert.equal(canUse(["site_admin"], ["booking_admin"]), true);
    assert.equal(canUse(["site_admin"], ["content_editor"]), true);
  });
});
