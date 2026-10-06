// The video room's WebSocket frames, written by hand from
// `x-websocket-messages` on `connectVideoRoom` in the API's openapi.yaml,
// because openapi-typescript does not emit them. JSON text frames of at
// most 16 KiB, relayed to the other participant and never stored.

export type Role = "client" | "practitioner";
export type Presence = "connected" | "disconnected";
export type RoomState = "waiting" | "in_session" | "ended";

export type IceCandidate = {
  candidate: string;
  sdpMid?: string;
  sdpMLineIndex?: number;
};

export type SignalMessage =
  | { type: "offer"; sdp: string }
  | { type: "answer"; sdp: string }
  | { type: "ice"; candidate: IceCandidate };

export type ClientMessage =
  { type: "join" } | { type: "leave" } | SignalMessage;

export type ServerMessage =
  | SignalMessage
  | { type: "leave" }
  | {
      type: "peer-state";
      client: Presence;
      practitioner: Presence;
      room: RoomState;
    };

// Close codes the API sends (closeCodes in openapi.yaml).
export const CLOSE = {
  replaced: 4000, // a newer connection for the same role took over
  ticketInvalid: 4001, // ticket invalid or expired
  roomEnded: 4002,
  serverRestarting: 1001, // reconnect with a fresh ticket
  invalidMessage: 1008, // a bug on our side: never retried
  tooLarge: 1009,
} as const;

const PRESENCE = new Set(["connected", "disconnected"]);
const ROOM = new Set(["waiting", "in_session", "ended"]);

const isString = (value: unknown): value is string => typeof value === "string";

// A frame from the server, or null for anything malformed or unknown, which
// the caller ignores: a newer API may add a type this page does not know.
export function parseServerMessage(data: unknown): ServerMessage | null {
  if (!isString(data)) return null;
  let frame: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(data);
    if (typeof parsed !== "object" || parsed === null) return null;
    frame = parsed as Record<string, unknown>;
  } catch {
    return null;
  }
  switch (frame.type) {
    case "offer":
    case "answer":
      return isString(frame.sdp) ? { type: frame.type, sdp: frame.sdp } : null;
    case "ice": {
      const c = frame.candidate as Record<string, unknown> | null;
      if (typeof c !== "object" || c === null || !isString(c.candidate)) {
        return null;
      }
      return {
        type: "ice",
        candidate: {
          candidate: c.candidate,
          sdpMid: isString(c.sdpMid) ? c.sdpMid : undefined,
          sdpMLineIndex:
            typeof c.sdpMLineIndex === "number" ? c.sdpMLineIndex : undefined,
        },
      };
    }
    case "leave":
      return { type: "leave" };
    case "peer-state":
      if (
        !PRESENCE.has(frame.client as string) ||
        !PRESENCE.has(frame.practitioner as string) ||
        !ROOM.has(frame.room as string)
      ) {
        return null;
      }
      return {
        type: "peer-state",
        client: frame.client as Presence,
        practitioner: frame.practitioner as Presence,
        room: frame.room as RoomState,
      };
    default:
      return null;
  }
}

// The DTLS fingerprint in an SDP. A different one in a new offer means the
// other side started a fresh peer connection (a reload, or it saw us drop),
// so ours must start again too rather than renegotiate.
export function sdpFingerprint(sdp: string): string | null {
  return /^a=fingerprint:(.+)$/m.exec(sdp)?.[1].trim() ?? null;
}
