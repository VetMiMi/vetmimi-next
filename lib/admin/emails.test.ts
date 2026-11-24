import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { CommunicationListItem } from "../api/types/appointments.ts";
import { listHref, listQuery, parseView, toRow } from "./emails.ts";

const email = (
  patch: Partial<CommunicationListItem>,
): CommunicationListItem => ({
  id: "5c1d2e3f-4a5b-4c6d-8e7f-9a0b1c2d3e4f",
  appointmentId: "0b6f7c1e-2d3a-4b5c-9d8e-7f6a5b4c3d2e",
  appointmentReference: "VM-4K7Q2M",
  visitorName: "Sample Person",
  kind: "booking_confirmed",
  audience: "visitor",
  channel: "email",
  recipient: "sample@example.com",
  locale: "en",
  status: "sent",
  scheduledFor: "2026-10-06T23:30:00Z",
  sentAt: "2026-10-06T23:31:00Z",
  attempts: 1,
  createdAt: "2026-10-06T23:30:00Z",
  ...patch,
});

describe("email list tabs", () => {
  it("sends each tab's status, and none for All", () => {
    assert.deepEqual(listQuery(parseView({})), { limit: 50 });
    assert.deepEqual(listQuery(parseView({ view: "queued" }), "c2"), {
      status: "queued",
      cursor: "c2",
      limit: 50,
    });
    assert.equal(listHref("all"), "/admin/emails");
    assert.equal(listHref("failed"), "/admin/emails?view=failed");
  });

  it("shows All for a view it does not know", () => {
    assert.equal(parseView({ view: "delivered" }), "all");
  });
});

describe("email list rows", () => {
  it("name who an email went to and link to it, never the address", () => {
    const row = toRow(email({}));
    assert.equal(row.to, "Sample Person");
    assert.equal(row.name, "Booking confirmed");
    assert.equal(row.at, "2026-10-06T23:31:00Z");
    assert.equal(
      row.href,
      "/admin/appointments/0b6f7c1e-2d3a-4b5c-9d8e-7f6a5b4c3d2e#email-5c1d2e3f-4a5b-4c6d-8e7f-9a0b1c2d3e4f",
    );
    assert.ok(!JSON.stringify(row).includes("sample@example.com"));

    const practice = email({
      kind: "practitioner_new_booking",
      audience: "practitioner",
      status: "queued",
      sentAt: undefined,
    });
    assert.equal(toRow(practice).to, "Daw Mi");
    assert.equal(toRow(practice).at, "2026-10-06T23:30:00Z");
  });
});
