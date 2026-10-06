import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { endsTooEarly, findOverlap } from "./timeRange.ts";

describe("end after start", () => {
  it("flags 14:00 to 13:00", () => {
    assert.equal(endsTooEarly("14:00", "13:00"), true);
  });

  it("flags an end equal to the start", () => {
    assert.equal(endsTooEarly("14:00", "14:00"), true);
  });

  it("accepts 10:00 to 13:00", () => {
    assert.equal(endsTooEarly("10:00", "13:00"), false);
  });

  // Compared as text, "9:30" would sort after "10:00"; the input pads it.
  it("orders 09:30 before 10:00", () => {
    assert.equal(endsTooEarly("09:30", "10:00"), false);
  });

  it("does not run past midnight", () => {
    assert.equal(endsTooEarly("23:00", "01:00"), true);
  });

  it("accepts an end with seconds just after the start", () => {
    assert.equal(endsTooEarly("14:00", "14:00:30"), false);
  });

  // Daw Mi may still be typing the other end; that is not an error yet.
  it("waits until both ends are filled", () => {
    assert.equal(endsTooEarly("14:00", ""), false);
    assert.equal(endsTooEarly("", "13:00"), false);
  });
});

describe("overlapping periods", () => {
  const tuesday = [{ id: "a", startTime: "10:00", endTime: "13:00" }];

  it("finds 12:00 to 15:00 overlapping 10:00 to 13:00", () => {
    const found = findOverlap(
      { startTime: "12:00", endTime: "15:00" },
      tuesday,
    );
    assert.equal(found?.id, "a");
  });

  it("lets 14:00 to 17:00 sit beside it", () => {
    assert.equal(
      findOverlap({ startTime: "14:00", endTime: "17:00" }, tuesday),
      undefined,
    );
  });

  it("lets periods touch at 13:00", () => {
    assert.equal(
      findOverlap({ startTime: "13:00", endTime: "17:00" }, tuesday),
      undefined,
    );
  });
});
