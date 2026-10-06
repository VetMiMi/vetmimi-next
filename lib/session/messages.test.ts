import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseServerMessage, sdpFingerprint } from "./messages.ts";
import { mapMediaError } from "./media.ts";
import { isJoinToken, mapTicketError } from "./ticket.ts";

describe("server frames", () => {
  it("reads peer-state, offers and candidates", () => {
    assert.deepEqual(
      parseServerMessage(
        '{"type":"peer-state","client":"connected","practitioner":"disconnected","room":"waiting"}',
      ),
      {
        type: "peer-state",
        client: "connected",
        practitioner: "disconnected",
        room: "waiting",
      },
    );
    assert.deepEqual(parseServerMessage('{"type":"offer","sdp":"v=0"}'), {
      type: "offer",
      sdp: "v=0",
    });
    assert.deepEqual(
      parseServerMessage(
        '{"type":"ice","candidate":{"candidate":"c","sdpMLineIndex":0}}',
      ),
      {
        type: "ice",
        candidate: { candidate: "c", sdpMid: undefined, sdpMLineIndex: 0 },
      },
    );
    assert.deepEqual(parseServerMessage('{"type":"leave"}'), { type: "leave" });
  });

  it("ignores unknown, malformed and binary frames", () => {
    for (const frame of [
      '{"type":"chat","text":"hi"}',
      '{"type":"peer-state","client":"connected","practitioner":"away","room":"waiting"}',
      '{"type":"offer"}',
      "not json",
      "null",
      new ArrayBuffer(4),
    ]) {
      assert.equal(parseServerMessage(frame), null);
    }
  });

  it("finds the DTLS fingerprint", () => {
    const sdp = "v=0\r\na=fingerprint:sha-256 AB:CD\r\na=setup:actpass\r\n";
    assert.equal(sdpFingerprint(sdp), "sha-256 AB:CD");
    assert.equal(sdpFingerprint("v=0\r\n"), null);
  });
});

describe("camera and microphone errors", () => {
  it("maps each DOMException name to what the page explains", () => {
    assert.equal(mapMediaError("NotAllowedError"), "denied");
    assert.equal(mapMediaError("NotFoundError"), "no-camera");
    assert.equal(mapMediaError("OverconstrainedError"), "no-camera");
    assert.equal(mapMediaError("NotReadableError"), "in-use");
    assert.equal(mapMediaError("TypeError"), "unknown");
  });
});

describe("room ticket route", () => {
  it("maps the API's refusals for the browser", () => {
    assert.deepEqual(mapTicketError(404), { status: 404, code: "not_found" });
    assert.deepEqual(mapTicketError(422), { status: 409, code: "not_ready" });
    assert.deepEqual(mapTicketError(429), {
      status: 429,
      code: "rate_limited",
    });
    assert.deepEqual(mapTicketError(500), { status: 502, code: "unavailable" });
    assert.deepEqual(mapTicketError(503), { status: 502, code: "unavailable" });
  });

  it("accepts only 43 base64url characters as a join token", () => {
    assert.equal(isJoinToken("a".repeat(43)), true);
    assert.equal(isJoinToken("A-_9".repeat(10) + "abc"), true);
    assert.equal(isJoinToken("a".repeat(42)), false);
    assert.equal(isJoinToken("a".repeat(42) + "="), false);
  });
});
