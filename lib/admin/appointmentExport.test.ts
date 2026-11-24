import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  defaultRange,
  exportFailure,
  exportFileName,
  rangeErrors,
} from "./appointmentExport.ts";

describe("appointments export", () => {
  it("defaults to the year ending 60 days ahead and names the file as the API does", () => {
    const range = defaultRange("2026-11-24");
    assert.deepEqual(range, { from: "2026-01-23", to: "2027-01-23" });
    assert.deepEqual(rangeErrors(range), {});
    assert.equal(
      exportFileName(
        'attachment; filename="vetmimi-appointments-2026-01-23-2027-01-23.csv"',
      ),
      "vetmimi-appointments-2026-01-23-2027-01-23.csv",
    );
  });

  it("stops From after To before asking, and words each refusal", () => {
    assert.deepEqual(rangeErrors({ from: "2026-03-02", to: "2026-03-01" }), {
      to: "Choose a To date on or after the From date.",
    });
    assert.deepEqual(rangeErrors({ from: "", to: "2026-03-01" }), {
      from: "Choose a From date.",
    });
    assert.equal(exportFailure(400), "Choose a range of a year or less.");
    assert.equal(exportFailure(503), "The export did not download. Try again.");
    assert.equal(exportFailure(), "The export did not download. Try again.");
  });
});
