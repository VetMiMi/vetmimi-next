// Reconnect timing (#82): 1, 2, 4, 8, 16, then 30 seconds between tries,
// each spread by ±20 % so two tabs or a restarted server's rooms do not
// all knock at once. The call gives up after RECONNECT_LIMIT_MS.
const STEPS_S = [1, 2, 4, 8, 16, 30];

export const RECONNECT_LIMIT_MS = 90_000;

export function backoffDelay(attempt: number, random = Math.random): number {
  const step = STEPS_S[Math.min(Math.max(attempt, 0), STEPS_S.length - 1)];
  return Math.round(step * 1000 * (0.8 + 0.4 * random()));
}
