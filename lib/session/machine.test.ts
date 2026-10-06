import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  callReducer,
  closeOutcome,
  initialCall,
  type CallEvent,
  type CallState,
} from "./machine.ts";

const run = (...events: CallEvent[]) =>
  events.reduce<CallState>(callReducer, initialCall);

const joined: CallEvent[] = [
  { type: "ws-open" },
  { type: "peer-state", room: "in_session", other: "connected" },
  { type: "pc", state: "connected" },
];

describe("the call state machine", () => {
  it("starts connecting and stays there until the room answers", () => {
    assert.equal(run().phase, "connecting");
    assert.equal(run({ type: "ws-open" }).phase, "connecting");
  });

  it("waits while the other participant is not in the room", () => {
    const state = run(
      { type: "ws-open" },
      { type: "peer-state", room: "waiting", other: "disconnected" },
    );
    assert.equal(state.phase, "waiting");
  });

  it("needs both the room and the peer connection for In session", () => {
    const roomOnly = run(
      { type: "ws-open" },
      { type: "peer-state", room: "in_session", other: "connected" },
    );
    assert.equal(roomOnly.phase, "connecting");
    const pcOnly = run(
      { type: "ws-open" },
      { type: "peer-state", room: "waiting", other: "connected" },
      { type: "pc", state: "connected" },
    );
    assert.equal(pcOnly.phase, "connecting");
    const both = run(...joined);
    assert.equal(both.phase, "in_session");
    assert.equal(both.connectedOnce, true);
  });

  it("reconnects when the socket drops or the media path fails", () => {
    assert.equal(
      run(...joined, { type: "ws-close", code: 1006 }).phase,
      "reconnecting",
    );
    assert.equal(
      run(...joined, { type: "ws-close", code: 1001 }).phase,
      "reconnecting",
    );
    assert.equal(
      run(...joined, { type: "pc", state: "disconnected" }).phase,
      "reconnecting",
    );
    assert.equal(
      run(...joined, { type: "pc", state: "failed" }).phase,
      "reconnecting",
    );
  });

  it("returns to In session after a reconnect", () => {
    const state = run(...joined, { type: "ws-close", code: 1006 }, ...joined);
    assert.equal(state.phase, "in_session");
  });

  it("goes back to waiting when the other side leaves, and says so", () => {
    const state = run(...joined, { type: "other-left" });
    assert.equal(state.phase, "waiting");
    assert.equal(state.otherLeft, true);
    const back = callReducer(state, {
      type: "peer-state",
      room: "in_session",
      other: "connected",
    });
    assert.equal(back.otherLeft, false);
  });

  it("4000 is replaced and never reconnecting", () => {
    const state = run(...joined, { type: "ws-close", code: 4000 });
    assert.equal(state.phase, "replaced");
    assert.equal(callReducer(state, { type: "ws-open" }).phase, "replaced");
    assert.equal(closeOutcome(4000, 0), "replaced");
  });

  it("4002 and an ended room end the call and ask for the state", () => {
    const closed = run(...joined, { type: "ws-close", code: 4002 });
    assert.equal(closed.phase, "ended");
    assert.equal(closed.refresh, true);
    const ended = run(
      { type: "ws-open" },
      { type: "peer-state", room: "ended", other: "disconnected" },
    );
    assert.equal(ended.phase, "ended");
  });

  it("gets one new ticket after 4001 and fails on the second", () => {
    assert.equal(closeOutcome(4001, 0), "retry-now");
    assert.equal(closeOutcome(4001, 1), "failed");
    const once = run(...joined, { type: "ws-close", code: 4001 });
    assert.equal(once.phase, "reconnecting");
    const twice = callReducer(once, { type: "ws-close", code: 4001 });
    assert.equal(twice.phase, "failed");
  });

  it("a 4001 after the room let us in again counts from zero", () => {
    const state = run(...joined, { type: "ws-close", code: 4001 }, ...joined, {
      type: "ws-close",
      code: 4001,
    });
    assert.equal(state.phase, "reconnecting");
  });

  it("never retries 1008 or 1009", () => {
    assert.equal(closeOutcome(1008, 0), "failed");
    assert.equal(closeOutcome(1009, 0), "failed");
    assert.equal(
      run(...joined, { type: "ws-close", code: 1008 }).phase,
      "failed",
    );
  });

  it("backs off on a refused handshake (1006) and a restart (1001)", () => {
    assert.equal(closeOutcome(1006, 0), "backoff");
    assert.equal(closeOutcome(1001, 0), "backoff");
  });

  it("stops on a refused ticket, a give-up and a leave", () => {
    const refused = run({ type: "ticket-refused" });
    assert.equal(refused.phase, "ended");
    assert.equal(refused.refresh, true);
    assert.equal(run(...joined, { type: "give-up" }).phase, "failed");
    assert.equal(run(...joined, { type: "leave" }).phase, "left");
  });

  it("a new join starts over from a terminal phase", () => {
    const state = run(...joined, { type: "leave" }, { type: "join" });
    assert.deepEqual(state, initialCall);
  });

  it("keeps the weak flag apart from the phase", () => {
    const state = run(...joined, { type: "weak", weak: true });
    assert.equal(state.phase, "in_session");
    assert.equal(state.weak, true);
  });
});
