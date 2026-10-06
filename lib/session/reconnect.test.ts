import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { backoffDelay } from "./reconnect.ts";

describe("reconnect backoff", () => {
  it("steps 1, 2, 4, 8, 16, 30 s and stays at 30", () => {
    const middle = () => 0.5;
    assert.deepEqual(
      [0, 1, 2, 3, 4, 5, 6, 20].map((n) => backoffDelay(n, middle)),
      [1000, 2000, 4000, 8000, 16000, 30000, 30000, 30000],
    );
  });

  it("spreads each step by at most 20 % either way", () => {
    assert.equal(
      backoffDelay(0, () => 0),
      800,
    );
    assert.equal(
      backoffDelay(0, () => 1),
      1200,
    );
    assert.equal(
      backoffDelay(5, () => 0),
      24000,
    );
    assert.equal(
      backoffDelay(5, () => 1),
      36000,
    );
    for (let i = 0; i < 100; i++) {
      const delay = backoffDelay(3);
      assert.ok(delay >= 6400 && delay <= 9600);
    }
  });
});
