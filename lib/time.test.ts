import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  addDays,
  addMonths,
  clockParts,
  groupSlotsByDay,
  localDateKey,
  monthGrid,
  weekdayIndex,
  zoneAbbreviation,
} from "./time.ts";

const SYDNEY = "Australia/Sydney";

describe("practice dates from instants", () => {
  it("puts 23:30 UTC on 5 October on Sydney's 6 October (#24)", () => {
    assert.equal(localDateKey("2026-10-05T23:30:00Z", SYDNEY), "2026-10-06");
  });

  it("names AEST before and AEDT after clocks go forward on 4 October", () => {
    // 01:30 AEST and 03:00 AEDT, half an hour apart in real time.
    const before = "2026-10-03T15:30:00Z";
    const after = "2026-10-03T16:00:00Z";
    assert.equal(zoneAbbreviation(before, SYDNEY), "AEST");
    assert.equal(zoneAbbreviation(after, SYDNEY), "AEDT");
    assert.deepEqual(clockParts(before, SYDNEY), {
      hour: "1",
      minute: "30",
      period: "am",
    });
    assert.deepEqual(clockParts(after, SYDNEY), {
      hour: "3",
      minute: "00",
      period: "am",
    });
  });

  it("names AEDT then AEST when clocks go back on 5 April", () => {
    assert.equal(zoneAbbreviation("2026-04-04T14:30:00Z", SYDNEY), "AEDT");
    assert.equal(zoneAbbreviation("2026-04-04T16:30:00Z", SYDNEY), "AEST");
    assert.equal(localDateKey("2026-04-04T16:30:00Z", SYDNEY), "2026-04-05");
  });

  it("formats noon and midnight on a 12-hour clock", () => {
    assert.deepEqual(clockParts("2026-07-01T02:00:00Z", SYDNEY), {
      hour: "12",
      minute: "00",
      period: "pm",
    });
    assert.equal(clockParts("2026-06-30T14:00:00Z", SYDNEY).hour, "12");
    assert.equal(clockParts("2026-06-30T14:00:00Z", SYDNEY).period, "am");
  });
});

describe("groupSlotsByDay", () => {
  it("keeps API order and drops nothing", () => {
    const slot = (startsAt: string) => ({ startsAt, endsAt: startsAt });
    const slots = [
      slot("2026-10-05T23:00:00Z"), // 6 Oct 10:00
      slot("2026-10-06T03:00:00Z"), // 6 Oct 14:00
      slot("2026-10-06T23:00:00Z"), // 7 Oct 10:00
    ];
    const days = groupSlotsByDay(slots, SYDNEY);
    assert.deepEqual([...days.keys()], ["2026-10-06", "2026-10-07"]);
    assert.deepEqual(days.get("2026-10-06"), slots.slice(0, 2));
    assert.deepEqual(days.get("2026-10-07"), slots.slice(2));
  });
});

// Run under TZ=America/Los_Angeles and TZ=Australia/Sydney as well: none of
// these may depend on the machine's zone.
describe("date-only arithmetic", () => {
  it("starts October 2026 on Thursday with 31 days", () => {
    const grid = monthGrid("2026-10");
    assert.equal(grid.indexOf("2026-10-01"), 3);
    assert.equal(grid.filter(Boolean).length, 31);
    assert.equal(grid.at(-1), "2026-10-31");
  });

  it("starts April 2027 on Thursday with 30 days", () => {
    const grid = monthGrid("2027-04");
    assert.equal(grid.indexOf("2027-04-01"), 3);
    assert.equal(grid.filter(Boolean).length, 30);
  });

  it("counts whole days and months across daylight saving and years", () => {
    assert.equal(addDays("2026-10-03", 1), "2026-10-04");
    assert.equal(addDays("2026-10-04", 1), "2026-10-05");
    assert.equal(addDays("2026-12-31", 1), "2027-01-01");
    assert.equal(addMonths("2026-12", 1), "2027-01");
    assert.equal(addMonths("2026-01", -1), "2025-12");
    assert.equal(weekdayIndex("2026-10-05"), 0);
    assert.equal(weekdayIndex("2026-10-04"), 6);
  });
});
