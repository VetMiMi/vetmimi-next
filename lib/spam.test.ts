import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { checkTraps, issueFormToken } from "./spam.ts";

const SECRET = "test-service-key";
const T0 = 1_790_000_000_000;

describe("form bot traps", () => {
  const token = issueFormToken("contact", T0, SECRET);

  it("lets a person through after a few seconds", () => {
    assert.equal(
      checkTraps("contact", { token, honeypot: "" }, T0 + 20_000, SECRET),
      "ok",
    );
  });

  it("catches a filled honeypot", () => {
    assert.equal(
      checkTraps(
        "contact",
        { token, honeypot: "https://spam.example" },
        T0 + 20_000,
        SECRET,
      ),
      "honeypot",
    );
  });

  it("refuses a submit within three seconds of the form being served", () => {
    assert.equal(
      checkTraps("contact", { token, honeypot: "" }, T0 + 1_000, SECRET),
      "too_fast",
    );
  });

  it("refuses a forged, re-dated, missing or other-form token", () => {
    const [, sig] = token.split(".");
    for (const forged of [
      `${T0 - 60_000}.${sig}`,
      `${T0}.not-a-signature`,
      "",
      issueFormToken("contact", T0, "another-key"),
      issueFormToken("booking", T0, SECRET),
    ]) {
      assert.equal(
        checkTraps(
          "contact",
          { token: forged, honeypot: "" },
          T0 + 20_000,
          SECRET,
        ),
        "invalid",
        forged,
      );
    }
  });
});
