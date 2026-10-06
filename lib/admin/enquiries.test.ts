import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { components } from "../api/schema.ts";
import {
  listHref,
  listQuery,
  parseFilters,
  replyHref,
  subjectLine,
  toRow,
} from "./enquiries.ts";

type Enquiry = components["schemas"]["ContactEnquiry"];

const enquiry = (patch: Partial<Enquiry>): Enquiry => ({
  id: "0b6f7c1e-2d3a-4b5c-9d8e-7f6a5b4c3d2e",
  reference: "EN-4K7Q2M",
  name: "Sample Person",
  email: "sample@example.com",
  enquiryType: "workshop",
  message: "Hello",
  locale: "en",
  status: "new",
  createdAt: "2026-10-06T23:30:00Z",
  ...patch,
});

describe("enquiry list filters", () => {
  it("defaults to New and maps views to the API status", () => {
    assert.deepEqual(parseFilters({}), { view: "new" });
    assert.deepEqual(listQuery(parseFilters({})), { status: "new", limit: 50 });
    assert.deepEqual(
      listQuery(parseFilters({ view: "all", q: " art " }), "c2"),
      {
        q: "art",
        cursor: "c2",
        limit: 50,
      },
    );
    assert.equal(parseFilters({ view: "junk" }).view, "new");
  });

  it("keeps the default view out of the URL", () => {
    assert.equal(listHref({ view: "new" }), "/admin/enquiries");
    assert.equal(
      listHref({ view: "handled", q: "school" }),
      "/admin/enquiries?view=handled&q=school",
    );
  });
});

describe("enquiry overview privacy (Booking UX §28)", () => {
  const long = `${"word ".repeat(40)}SECRET-TAIL`;

  it("shows the subject, else at most 80 characters of the message", () => {
    assert.equal(
      subjectLine(enquiry({ subject: "Workshop in May" })),
      "Workshop in May",
    );
    const line = subjectLine(enquiry({ message: long }));
    assert.ok(line.length <= 80, `${line.length} characters`);
    assert.ok(line.endsWith("…"));
    assert.equal(
      subjectLine(enquiry({ message: "Short\nnote" })),
      "Short note",
    );
  });

  it("leaves the email and the message out of a list row", () => {
    const row = JSON.stringify(toRow(enquiry({ message: long })));
    assert.ok(!row.includes("SECRET-TAIL"));
    assert.ok(!row.includes("sample@example.com"));
    assert.ok(row.includes("Workshop / Program"));
  });
});

describe("reply link", () => {
  it("prefills the subject with the reference", () => {
    assert.equal(
      replyHref(enquiry({ subject: "Art & wellbeing" })),
      "mailto:sample@example.com?subject=Re%3A%20Art%20%26%20wellbeing%20(EN-4K7Q2M)",
    );
    assert.equal(
      replyHref(enquiry({})),
      "mailto:sample@example.com?subject=Re%3A%20Workshop%20%2F%20Program%20(EN-4K7Q2M)",
    );
  });
});
