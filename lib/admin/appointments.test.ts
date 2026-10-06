import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { components } from "../api/schema.ts";
import {
  eventSentence,
  failedNotifications,
  hasFilters,
  listHref,
  listQuery,
  parseFilters,
  requestedTimes,
  whenLong,
} from "./appointments.ts";

type Event = components["schemas"]["AppointmentEvent"];
type Communication = components["schemas"]["Communication"];

const SYDNEY = "Australia/Sydney";
const SERVICE = "6f1c2a7e-3b4d-4c5e-8f90-1a2b3c4d5e6f";

const event = (patch: Partial<Event>): Event => ({
  id: 1,
  kind: "created",
  actor: "admin",
  detail: {},
  createdAt: "2026-10-01T00:00:00Z",
  ...patch,
});

describe("list filters in the URL", () => {
  it("builds the exact API query from the URL", () => {
    const filters = parseFilters({
      view: "pending",
      status: "pending",
      q: "VM-7",
    });
    assert.deepEqual(listQuery(filters, SYDNEY), {
      view: "pending",
      status: ["pending"],
      q: "VM-7",
      limit: 50,
    });
  });

  it("drops values the API would refuse and defaults to upcoming", () => {
    const filters = parseFilters({
      view: "everything",
      status: ["confirmed", "lost"],
      serviceId: "not-a-uuid",
      from: "5 Oct",
      format: "phone",
    });
    assert.deepEqual(filters, { view: "upcoming", status: ["confirmed"] });
  });

  it("round-trips through the address, leaving the default view out", () => {
    const filters = parseFilters({
      status: ["pending", "confirmed"],
      serviceId: SERVICE,
      from: "2026-10-05",
      q: "Sample",
    });
    const href = listHref(filters);
    assert.equal(
      href,
      `/admin/appointments?status=pending&status=confirmed&serviceId=${SERVICE}&from=2026-10-05&q=Sample`,
    );
    const back = Object.fromEntries(
      [...new URL(href, "http://x").searchParams.keys()].map((k) => [
        k,
        new URL(href, "http://x").searchParams.getAll(k),
      ]),
    );
    assert.deepEqual(parseFilters(back), filters);
    assert.equal(hasFilters(filters), true);
    assert.equal(hasFilters(parseFilters({ view: "past" })), false);
  });
});

describe("date range at the local-date boundary", () => {
  it("starts from local midnight in AEDT and ends at the next midnight", () => {
    const query = listQuery(
      parseFilters({ from: "2026-10-05", to: "2026-10-05" }),
      SYDNEY,
    );
    assert.equal(query.from, "2026-10-04T13:00:00.000Z");
    assert.equal(query.to, "2026-10-05T13:00:00.000Z");
  });

  it("uses AEST for an April date after daylight saving ends", () => {
    const query = listQuery(parseFilters({ from: "2026-04-10" }), SYDNEY);
    assert.equal(query.from, "2026-04-09T14:00:00.000Z");
  });
});

describe("times and history in words", () => {
  it("names the practice date and time", () => {
    assert.equal(
      whenLong("2026-10-05T23:00:00Z", SYDNEY),
      "Tuesday 6 October, 10:00 am",
    );
  });

  it("writes each history line with the actor", () => {
    const line = (patch: Partial<Event>) => eventSentence(event(patch), SYDNEY);
    assert.equal(
      line({ kind: "created", actor: "visitor" }),
      "Request submitted by visitor",
    );
    assert.equal(
      line({ kind: "confirmed", actorName: "Daw Mi" }),
      "Confirmed by Daw Mi",
    );
    assert.equal(
      line({
        kind: "rescheduled",
        actorName: "Daw Mi",
        previousStartsAt: "2026-10-05T23:00:00Z",
        newStartsAt: "2026-10-08T03:00:00Z",
      }),
      "Rescheduled from Tue 6 Oct 10:00 am to Thu 8 Oct 2:00 pm by Daw Mi",
    );
    assert.equal(
      line({ kind: "cancelled", actor: "visitor", detail: { late: true } }),
      "Cancelled by visitor (late)",
    );
    assert.equal(line({ kind: "expired", actor: "system" }), "Expired");
  });

  it("reads the visitor's preferred times only from the latest request", () => {
    const asked = event({
      id: 2,
      kind: "reschedule_requested",
      actor: "visitor",
      createdAt: "2026-10-02T00:00:00Z",
      detail: { preferredTimes: ["2026-10-08T03:00:00Z", "junk"] },
    });
    assert.deepEqual(requestedTimes([event({}), asked]), [
      "2026-10-08T03:00:00Z",
    ]);
    const later = event({ id: 3, kind: "confirmed", createdAt: "2026-10-03" });
    assert.deepEqual(requestedTimes([asked, later]), []);
  });
});

describe("partial failure", () => {
  const comm = (patch: Partial<Communication>): Communication => ({
    id: "c1",
    kind: "booking_confirmed",
    audience: "visitor",
    channel: "email",
    locale: "en",
    status: "failed",
    scheduledFor: "2026-10-01T00:00:00Z",
    attempts: 3,
    createdAt: "2026-10-01T00:00:00Z",
    ...patch,
  });

  it("names a failed confirmation email without reverting anything", () => {
    assert.deepEqual(failedNotifications([comm({})]), [
      "Appointment confirmed. Visitor notification failed.",
    ]);
  });

  it("ignores a failure that was resent, and practitioner emails", () => {
    assert.deepEqual(
      failedNotifications([
        comm({}),
        comm({ id: "c2", status: "sent", resendOf: "c1" }),
        comm({ id: "c3", audience: "practitioner" }),
      ]),
      [],
    );
  });
});
