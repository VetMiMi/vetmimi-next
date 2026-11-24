import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AttentionItem } from "../api/types/appointments.ts";
import { attentionLine } from "./dashboard.ts";

const line = (kind: string, holdExpiresAt?: string) =>
  attentionLine(
    {
      kind: kind as AttentionItem["kind"],
      appointmentId: "a1",
      reference: "VM-C6HAVZ",
      startsAt: "2026-10-08T23:00:00Z",
    },
    { timeZone: "Australia/Sydney", today: "2026-10-06", holdExpiresAt },
  );

describe("attention wording", () => {
  it("words every known kind", () => {
    assert.equal(
      line("pending_request"),
      "Request VM-C6HAVZ awaits your reply",
    );
    assert.equal(
      line("hold_expiring", "2026-10-06T04:00:00Z"),
      "Request VM-C6HAVZ expires at 3:00 pm today",
    );
    assert.equal(
      line("failed_communication"),
      "An email for VM-C6HAVZ failed to send",
    );
    assert.equal(line("reschedule_requested"), "VM-C6HAVZ asked to reschedule");
    assert.equal(line("meeting_link_missing"), "VM-C6HAVZ has no meeting link");
    assert.equal(
      line("completion_due"),
      "VM-C6HAVZ has passed — mark completed or no-show",
    );
    assert.equal(line("block_conflict"), "A block overlaps VM-C6HAVZ");
  });

  it("names the day a hold ends, or says soon when its time is unknown", () => {
    assert.equal(
      line("hold_expiring", "2026-10-06T22:00:00Z"),
      "Request VM-C6HAVZ expires at 9:00 am tomorrow",
    );
    assert.equal(
      line("hold_expiring", "2026-10-07T22:00:00Z"),
      "Request VM-C6HAVZ expires at 9:00 am on Thu 8 Oct",
    );
    assert.equal(line("hold_expiring"), "Request VM-C6HAVZ expires soon");
  });

  it("still gives a kind it does not know a line", () => {
    assert.equal(line("payment_overdue"), "VM-C6HAVZ needs attention");
  });
});
