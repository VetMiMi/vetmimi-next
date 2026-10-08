import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  approvalProblem,
  canMarkPosted,
  canRetry,
  copyText,
  failureReason,
  scheduleInstant,
  scheduleStart,
  workflowActions,
} from "./postWorkflow.ts";

// 10:00 am, Wednesday 7 October 2026 in Sydney (AEDT, UTC+11).
const now = new Date("2026-10-06T23:00:00Z");

describe("workflow actions", () => {
  it("lets an editor submit and nothing more", () => {
    assert.deepEqual(workflowActions("draft", false), ["submit"]);
    assert.deepEqual(workflowActions("in_review", false), []);
    assert.deepEqual(workflowActions("approved", false), []);
  });

  it("gives a site administrator the review and publishing steps", () => {
    assert.deepEqual(workflowActions("idea", true), ["submit", "archive"]);
    assert.deepEqual(workflowActions("in_review", true), [
      "approve",
      "requestChanges",
      "archive",
    ]);
    assert.deepEqual(workflowActions("approved", true), [
      "schedule",
      "publish",
      "archive",
    ]);
    assert.deepEqual(workflowActions("scheduled", true), [
      "publish",
      "schedule",
      "unschedule",
      "archive",
    ]);
    assert.deepEqual(workflowActions("published", true), ["archive"]);
    assert.deepEqual(workflowActions("archived", true), []);
  });
});

describe("scheduling in Sydney time", () => {
  it("starts at 9:00 am tomorrow, or the post's own time", () => {
    assert.deepEqual(scheduleStart(undefined, now), {
      date: "2026-10-08",
      time: "09:00",
    });
    assert.deepEqual(scheduleStart("2026-10-12T22:30:00Z", now), {
      date: "2026-10-13",
      time: "09:30",
    });
  });

  it("turns a Sydney date and time into the instant", () => {
    assert.deepEqual(
      scheduleInstant({ date: "2026-10-08", time: "09:00" }, now),
      {
        instant: "2026-10-07T22:00:00.000Z",
      },
    );
  });

  it("refuses the past, a skipped hour and a missing value", () => {
    assert.deepEqual(
      scheduleInstant({ date: "2026-10-07", time: "09:00" }, now),
      {
        error: "Choose a time in the future.",
      },
    );
    assert.match(
      String(
        Object.values(
          scheduleInstant({ date: "2027-10-03", time: "02:30" }, now),
        )[0],
      ),
      /does not exist in Sydney/,
    );
    assert.deepEqual(scheduleInstant({ date: "", time: "09:00" }, now), {
      error: "Choose a date and a time.",
    });
  });
});

describe("channels", () => {
  it("says why a channel failed and what to do", () => {
    assert.match(failureReason("not_connected"), /Copy & open/);
    assert.match(failureReason("rejected"), /refused/);
    assert.match(failureReason("reconnect_required"), /connecting again/);
    assert.match(
      failureReason("unknown_outcome"),
      /may have posted — check the platform, then Retry or Mark as posted/,
    );
    assert.match(failureReason("something_new"), /did not go out/);
  });

  it("copies the text with its link, once", () => {
    const post = {
      versions: {
        facebook: {
          enabled: true,
          text: "New article ",
          link: "https://vetmimi.com/stories/calm",
        },
        linkedin: {
          enabled: true,
          text: "Read https://vetmimi.com/stories/calm",
          link: "https://vetmimi.com/stories/calm",
        },
        instagram: { enabled: true, caption: "Hi #art" },
      },
    };
    assert.equal(
      copyText(post, "facebook"),
      "New article\n\nhttps://vetmimi.com/stories/calm",
    );
    assert.equal(
      copyText(post, "linkedin"),
      "Read https://vetmimi.com/stories/calm",
    );
    assert.equal(copyText(post, "instagram"), "Hi #art");
  });

  it("offers retry and mark-as-posted only when the API allows them", () => {
    const failed = { channel: "instagram", status: "failed" } as const;
    assert.equal(canRetry("publishing", failed), true);
    assert.equal(canRetry("published", failed), false);
    assert.equal(
      canRetry("publishing", { ...failed, channel: "website" }),
      false,
    );
    assert.equal(canMarkPosted("publishing", failed), true);
    assert.equal(
      canMarkPosted("published", { channel: "linkedin", status: "manual" }),
      true,
    );
    assert.equal(
      canMarkPosted("publishing", { channel: "facebook", status: "published" }),
      false,
    );
  });
});

describe("approval problems", () => {
  it("names the channel and the field", () => {
    assert.equal(
      approvalProblem("versions.website.title.en", "is required"),
      "Website: the title in English is required.",
    );
    assert.equal(
      approvalProblem(
        "versions.instagram.imageIds",
        "needs at least one image",
      ),
      "Instagram: needs at least one image.",
    );
    assert.equal(
      approvalProblem(
        "versions.facebook.imageIds.1",
        "is not in the media library",
      ),
      "Facebook: image 2 is not in the media library.",
    );
    assert.equal(
      approvalProblem(
        "consent.confirmed",
        "must be confirmed for a True Story",
      ),
      "True Story: confirm consent.",
    );
    assert.equal(
      approvalProblem("versions", "needs at least one enabled channel"),
      "Turn on at least one channel.",
    );
  });
});
