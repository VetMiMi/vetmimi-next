import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { components } from "../api/schema.ts";
import {
  firstName,
  roomWindow as withNbsp,
  videoPanelState,
} from "./videoSession.ts";

// The window line keeps each half on one line; compare it as plain text.
const roomWindow = (...args: Parameters<typeof withNbsp>) =>
  withNbsp(...args).replaceAll("\u00a0", " ");

type Room = components["schemas"]["VideoRoomSummary"];
type Action = components["schemas"]["AppointmentAction"];

const SYDNEY = "Australia/Sydney";

// Sydney's clocks went forward at 2 am on Sunday 4 October 2026: a 10 am
// session that day is 10 am AEDT (UTC+11), not AEST.
const room = (patch: Partial<Room> = {}): Room => ({
  id: "0b6c7f1e-1d2a-4f3b-9c4d-5e6f7a8b9c0d",
  state: "waiting",
  opensAt: "2026-10-03T22:45:00Z",
  closesAt: "2026-10-04T00:30:00Z",
  ...patch,
});

const detail = (
  videoRoom: Room | undefined,
  allowedActions: Action[] = [],
) => ({
  videoRoom,
  allowedActions,
});

describe("videoPanelState", () => {
  it("is none without a VetMiMi room", () => {
    assert.equal(
      videoPanelState(detail(undefined), "2026-10-03T23:00:00Z"),
      "none",
    );
  });

  it("waits for the window to open", () => {
    const a = detail(room(), ["cancel"]);
    assert.equal(videoPanelState(a, "2026-10-03T22:00:00Z"), "before_window");
  });

  it("offers Start session while the API allows it", () => {
    const a = detail(room(), ["start_video", "end_video"]);
    assert.equal(videoPanelState(a, "2026-10-03T22:50:00Z"), "can_start");
    const live = detail(room({ state: "in_session" }), [
      "start_video",
      "end_video",
    ]);
    assert.equal(videoPanelState(live, "2026-10-03T23:10:00Z"), "can_start");
  });

  it("is closed once the window has passed without an end", () => {
    const a = detail(room(), ["end_video"]);
    assert.equal(videoPanelState(a, "2026-10-04T00:31:00Z"), "closed");
  });

  it("is ended once the room has ended, whatever the clock says", () => {
    const a = detail(room({ state: "ended", endedAt: "2026-10-03T23:52:00Z" }));
    assert.equal(videoPanelState(a, "2026-10-03T23:55:00Z"), "ended");
  });
});

describe("roomWindow", () => {
  it("shows the window in the practice timezone across daylight saving", () => {
    assert.equal(
      roomWindow(room(), SYDNEY),
      "Opens 9:45 am · closes 11:30 am AEDT",
    );
    // The day before, still standard time: the same UTC times read an hour
    // earlier.
    const before = room({
      opensAt: "2026-10-02T22:45:00Z",
      closesAt: "2026-10-03T00:30:00Z",
    });
    assert.equal(
      roomWindow(before, SYDNEY),
      "Opens 8:45 am · closes 10:30 am AEST",
    );
  });
});

describe("firstName", () => {
  it("takes the first word, or the whole name", () => {
    assert.equal(firstName("  Ana Lin "), "Ana");
    assert.equal(firstName("Thiri"), "Thiri");
  });
});
