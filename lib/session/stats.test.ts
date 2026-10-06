import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isWeakWindow, nextWeak, readSample } from "./stats.ts";

const report = (stats: Record<string, unknown>[]) =>
  new Map(stats.map((s, i) => [String(i), s])) as unknown as Parameters<
    typeof readSample
  >[0];

describe("weak connection check", () => {
  it("reads inbound video loss and the selected pair's round trip", () => {
    const sample = readSample(
      report([
        {
          type: "inbound-rtp",
          kind: "video",
          packetsLost: 5,
          packetsReceived: 95,
        },
        {
          type: "inbound-rtp",
          kind: "audio",
          packetsLost: 50,
          packetsReceived: 50,
        },
        {
          type: "candidate-pair",
          nominated: false,
          state: "succeeded",
          currentRoundTripTime: 2,
        },
        {
          type: "candidate-pair",
          nominated: true,
          state: "succeeded",
          currentRoundTripTime: 0.12,
        },
      ]),
    );
    assert.deepEqual(sample, {
      rtt: 0.12,
      packetsLost: 5,
      packetsReceived: 95,
    });
  });

  it("is weak above 400 ms round trip or 5 % loss in the window", () => {
    const base = { rtt: 0.1, packetsLost: 0, packetsReceived: 0 };
    assert.equal(isWeakWindow(null, { ...base, rtt: 0.41 }), true);
    assert.equal(isWeakWindow(null, { ...base, rtt: 0.4 }), false);
    assert.equal(
      isWeakWindow(base, { rtt: 0.1, packetsLost: 6, packetsReceived: 94 }),
      true,
    );
    assert.equal(
      isWeakWindow(base, { rtt: 0.1, packetsLost: 5, packetsReceived: 95 }),
      false,
    );
    // Old losses do not count again in the next window.
    assert.equal(
      isWeakWindow(
        { rtt: 0.1, packetsLost: 50, packetsReceived: 100 },
        { rtt: 0.1, packetsLost: 50, packetsReceived: 200 },
      ),
      false,
    );
  });

  it("raises at once and lowers only after 10 s of calm", () => {
    let state = nextWeak({ weak: false, calmSince: null }, true, 0);
    assert.equal(state.weak, true);
    state = nextWeak(state, false, 2_000);
    state = nextWeak(state, false, 10_000);
    assert.equal(state.weak, true);
    state = nextWeak(state, true, 11_000);
    state = nextWeak(state, false, 12_000);
    state = nextWeak(state, false, 21_999);
    assert.equal(state.weak, true);
    state = nextWeak(state, false, 22_000);
    assert.equal(state.weak, false);
  });
});
