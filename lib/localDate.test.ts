import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { addDays, fromLocalDateKey, toLocalDateKey } from "./localDate.ts";

const TUESDAY = 2;
const SUNDAY = 0;
const originalTz = process.env.TZ;

afterEach(() => {
  process.env.TZ = originalTz;
});

// Sydney is ahead of UTC and Los Angeles behind it, so a UTC-based key slips
// a day back in one and a parsed key slips a day back in the other.
for (const tz of ["Australia/Sydney", "America/Los_Angeles"]) {
  describe(`local date key in ${tz}`, () => {
    it("keys local midnight on Tuesday 6 October 2026 as that day", () => {
      process.env.TZ = tz;
      assert.equal(toLocalDateKey(new Date(2026, 9, 6)), "2026-10-06");
    });

    it("reads 2026-10-06 back as local midnight on a Tuesday", () => {
      process.env.TZ = tz;
      const date = fromLocalDateKey("2026-10-06");
      assert.equal(date.getDay(), TUESDAY);
      assert.equal(date.getDate(), 6);
      assert.equal(date.getHours(), 0);
    });

    // Sydney's daylight saving starts at 2am that day, so midnight exists.
    it("round-trips Sunday 4 October 2026", () => {
      process.env.TZ = tz;
      const date = fromLocalDateKey("2026-10-04");
      assert.equal(date.getDay(), SUNDAY);
      assert.equal(toLocalDateKey(date), "2026-10-04");
    });
  });
}

describe("adding days to a key", () => {
  it("crosses the start of daylight saving in Sydney as one day", () => {
    process.env.TZ = "Australia/Sydney";
    assert.equal(addDays("2026-10-03", 1), "2026-10-04");
    assert.equal(addDays("2026-10-04", 1), "2026-10-05");
  });

  it("crosses a month end backwards", () => {
    assert.equal(addDays("2026-11-01", -1), "2026-10-31");
  });
});
