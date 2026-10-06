// The weak-connection check (#82): every 2 s the call reads getStats() for
// the inbound video and the selected candidate pair. The banner shows when
// the round trip passes 400 ms or more than 5 % of packets were lost since
// the last reading, and hides only after 10 s below both.

export const STATS_INTERVAL_MS = 2_000;
const MAX_RTT_S = 0.4;
const MAX_LOSS = 0.05;
const CALM_MS = 10_000;

export type StatsSample = {
  rtt: number | null;
  packetsLost: number;
  packetsReceived: number;
};

type Stat = Record<string, unknown> & { type: string };

// Reads what the check needs from an RTCStatsReport (any Map of stats, so
// it runs in tests without a browser).
export function readSample(report: {
  forEach: (fn: (stat: Stat) => void) => void;
}): StatsSample {
  let rtt: number | null = null;
  let packetsLost = 0;
  let packetsReceived = 0;
  report.forEach((stat) => {
    if (stat.type === "inbound-rtp" && stat.kind === "video") {
      packetsLost += Number(stat.packetsLost ?? 0);
      packetsReceived += Number(stat.packetsReceived ?? 0);
    }
    if (
      stat.type === "candidate-pair" &&
      stat.nominated === true &&
      stat.state === "succeeded" &&
      typeof stat.currentRoundTripTime === "number"
    ) {
      rtt = stat.currentRoundTripTime;
    }
  });
  return { rtt, packetsLost, packetsReceived };
}

// Whether this window, from the previous reading to this one, is weak.
export function isWeakWindow(prev: StatsSample | null, next: StatsSample) {
  if (next.rtt !== null && next.rtt > MAX_RTT_S) return true;
  if (!prev) return false;
  const lost = next.packetsLost - prev.packetsLost;
  const received = next.packetsReceived - prev.packetsReceived;
  const total = lost + received;
  return total > 0 && lost / total > MAX_LOSS;
}

export type WeakState = { weak: boolean; calmSince: number | null };

// Raises at once; lowers after CALM_MS of calm readings in a row.
export function nextWeak(
  state: WeakState,
  weakNow: boolean,
  now: number,
): WeakState {
  if (weakNow) return { weak: true, calmSince: null };
  if (!state.weak) return state;
  const calmSince = state.calmSince ?? now;
  return now - calmSince >= CALM_MS
    ? { weak: false, calmSince: null }
    : { weak: true, calmSince };
}
