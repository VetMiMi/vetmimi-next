import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  connectionNotice,
  failMessage,
  failReason,
  failedHref,
  metaStatus,
  platformErrorReason,
} from "./connections.ts";

const now = new Date("2026-10-08T00:00:00Z");
const day = 24 * 60 * 60 * 1000;
const inDays = (days: number) =>
  new Date(now.getTime() + days * day).toISOString();

describe("metaStatus", () => {
  it("passes through the states before a Page is connected", () => {
    assert.equal(metaStatus({ status: "not_connected" }, now), "not_connected");
    assert.equal(metaStatus({ status: "choosing_page" }, now), "choosing_page");
  });

  it("reads the expiry date like LinkedIn's: a week's warning, then reconnect", () => {
    const at = (days: number) =>
      metaStatus({ status: "connected", expiresAt: inDays(days) }, now);
    assert.equal(at(30), "connected");
    assert.equal(at(7), "expiring_soon");
    assert.equal(at(1), "expiring_soon");
    assert.equal(at(-1), "reconnect_required");
    assert.equal(metaStatus({ status: "connected" }, now), "connected");
  });

  it("asks to reconnect once Meta refused the token, whatever the date", () => {
    assert.equal(
      metaStatus(
        {
          status: "connected",
          expiresAt: inDays(60),
          lastError: "reconnect_required",
        },
        now,
      ),
      "reconnect_required",
    );
  });
});

describe("connectionNotice", () => {
  it("warns before expiry and errors once a reconnect is needed", () => {
    assert.equal(connectionNotice("linkedin", "expiring_soon")?.tone, "info");
    assert.match(
      connectionNotice("linkedin", "expiring_soon")!.text,
      /LinkedIn ends soon/,
    );
    assert.equal(connectionNotice("meta", "reconnect_required")?.tone, "error");
    assert.equal(connectionNotice("meta", "connected"), undefined);
    assert.equal(connectionNotice("linkedin", "not_connected"), undefined);
  });
});

describe("a sign-in that did not finish", () => {
  it("tells a cancel from a failure", () => {
    assert.equal(platformErrorReason("access_denied"), "cancelled");
    assert.equal(platformErrorReason("user_cancelled_login"), "cancelled");
    assert.equal(platformErrorReason("server_error"), "failed");
  });

  it("maps the API's refusals", () => {
    assert.equal(failReason("action_not_allowed"), "expired");
    assert.equal(failReason("unavailable"), "unavailable");
    assert.equal(failReason("unknown"), "failed");
  });

  it("round-trips through the page's URL", () => {
    const url = new URL(failedHref("linkedin", "cancelled"), "http://x");
    assert.equal(url.pathname, "/admin/settings/connections");
    assert.match(
      failMessage(
        url.searchParams.get("failed"),
        url.searchParams.get("reason"),
      )!,
      /LinkedIn sign-in was cancelled/,
    );
  });

  it("ignores a provider it does not know and words an odd reason as a failure", () => {
    assert.equal(failMessage("twitter", "cancelled"), undefined);
    assert.match(failMessage("meta", "<b>")!, /^Facebook was not connected/);
  });
});
