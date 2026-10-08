import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { revalidateSecretMatches } from "./revalidateSecret.ts";

describe("revalidate secret", () => {
  it("accepts the configured secret", () => {
    assert.equal(
      revalidateSecretMatches("shared-secret", "shared-secret"),
      true,
    );
  });

  it("rejects a wrong or partial secret", () => {
    assert.equal(
      revalidateSecretMatches("shared-secreT", "shared-secret"),
      false,
    );
    assert.equal(revalidateSecretMatches("shared", "shared-secret"), false);
  });

  it("rejects a missing header", () => {
    assert.equal(revalidateSecretMatches(null, "shared-secret"), false);
    assert.equal(revalidateSecretMatches("", "shared-secret"), false);
  });

  it("stays closed when no secret is configured", () => {
    assert.equal(revalidateSecretMatches("", ""), false);
    assert.equal(revalidateSecretMatches("anything", undefined), false);
  });
});
