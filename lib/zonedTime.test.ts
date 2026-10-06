import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatClock,
  formatDay,
  todayIn,
  zoneLabel,
  zonedDayStart,
  zonedInstant,
  zonedParts,
} from "./zonedTime.ts";

const SYDNEY = "Australia/Sydney";

describe("Sydney wall-clock time to an instant", () => {
  it("puts 9:00 on 13 October 2026 (AEDT) at 22:00 UTC the day before", () => {
    assert.equal(
      zonedInstant("2026-10-13", "09:00", SYDNEY),
      "2026-10-12T22:00:00.000Z",
    );
    assert.equal(
      zonedInstant("2026-10-13", "12:00", SYDNEY),
      "2026-10-13T01:00:00.000Z",
    );
  });

  it("puts a winter time (AEST) ten hours ahead", () => {
    assert.equal(
      zonedInstant("2026-07-01", "10:00", SYDNEY),
      "2026-07-01T00:00:00.000Z",
    );
  });

  // Clocks jump from 2:00 to 3:00 on 4 October 2026.
  it("has no 2:30 on the morning daylight saving starts", () => {
    assert.equal(zonedInstant("2026-10-04", "02:30", SYDNEY), null);
  });

  // Clocks go back from 3:00 to 2:00 on 5 April 2026, so 2:30 happens
  // twice; the first one, still in daylight time, is used.
  it("takes the first 2:30 on the morning daylight saving ends", () => {
    assert.equal(
      zonedInstant("2026-04-05", "02:30", SYDNEY),
      "2026-04-04T15:30:00.000Z",
    );
  });
});

describe("Sydney local days", () => {
  it("starts 12 October 2026 at 13:00 UTC the day before", () => {
    assert.equal(
      zonedDayStart("2026-10-12", SYDNEY),
      "2026-10-11T13:00:00.000Z",
    );
    assert.equal(
      zonedDayStart("2026-10-13", SYDNEY),
      "2026-10-12T13:00:00.000Z",
    );
  });

  it("makes 4 October 2026 23 hours long and 5 April 2026 25 hours", () => {
    assert.equal(
      zonedDayStart("2026-10-04", SYDNEY),
      "2026-10-03T14:00:00.000Z",
    );
    assert.equal(
      zonedDayStart("2026-10-05", SYDNEY),
      "2026-10-04T13:00:00.000Z",
    );
    assert.equal(
      zonedDayStart("2026-04-05", SYDNEY),
      "2026-04-04T13:00:00.000Z",
    );
    assert.equal(
      zonedDayStart("2026-04-06", SYDNEY),
      "2026-04-05T14:00:00.000Z",
    );
  });

  it("reads an instant back as the Sydney date and time", () => {
    assert.deepEqual(zonedParts("2026-10-12T22:00:00Z", SYDNEY), {
      date: "2026-10-13",
      time: "09:00",
    });
  });

  it("names Sydney's date while it is still yesterday in UTC", () => {
    assert.equal(
      todayIn(SYDNEY, new Date("2026-10-06T20:00:00Z")),
      "2026-10-07",
    );
  });
});

describe("wording", () => {
  it("names the zone with standard time first", () => {
    assert.equal(zoneLabel(SYDNEY, 2026), "Sydney time (AEST/AEDT)");
  });

  it("formats days and clock times", () => {
    assert.equal(formatDay("2026-10-13"), "Tue 13 Oct");
    assert.equal(formatClock("14:00"), "2:00 pm");
    assert.equal(formatClock("00:30"), "12:30 am");
    assert.equal(formatClock("12:00"), "12:00 pm");
  });
});
