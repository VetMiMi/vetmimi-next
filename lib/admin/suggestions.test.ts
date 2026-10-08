import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { suggestedTexts, suggestionFailure } from "./suggestions.ts";

describe("suggestedTexts", () => {
  it("returns only the channels suggested", () => {
    assert.deepEqual(suggestedTexts({ facebook: { text: "Hello" } }), {
      facebook: "Hello",
    });
  });

  it("puts Instagram's hashtags after the caption, each with one #", () => {
    assert.deepEqual(
      suggestedTexts({
        instagram: {
          caption: "Colour and calm. ",
          hashtags: ["arttherapy", "#Sydney", "##wellbeing", " "],
        },
      }),
      { instagram: "Colour and calm.\n\n#arttherapy #Sydney #wellbeing" },
    );
  });

  it("leaves a caption without hashtags as it is", () => {
    assert.deepEqual(
      suggestedTexts({ instagram: { caption: "Just this.", hashtags: [] } }),
      { instagram: "Just this." },
    );
  });
});

describe("suggestionFailure", () => {
  it("says when the hourly limit lifts", () => {
    assert.match(
      suggestionFailure(429, "rate_limited", 600),
      /in about 10 minutes\.$/,
    );
    assert.match(
      suggestionFailure(429, "rate_limited", 30),
      /about 1 minute\./,
    );
    assert.match(suggestionFailure(429, "rate_limited"), /Try again later\.$/);
  });

  it("names what to do for each refusal", () => {
    assert.match(
      suggestionFailure(422, "action_not_allowed"),
      /website article first/,
    );
    assert.match(suggestionFailure(502, "ai_failed"), /Try again\.$/);
    assert.match(suggestionFailure(503, "feature_unavailable"), /switched off/);
    assert.match(suggestionFailure(403, "forbidden"), /cannot ask/);
    assert.match(suggestionFailure(503, "unavailable"), /few minutes/);
  });
});
