import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { fromLocalDateKey, toLocalDateKey } from "./localDate.ts";

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
