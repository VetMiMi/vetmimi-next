// The call's state, as a pure reducer (#81, #82): what the stage shows comes
// from the room (peer-state), the other participant, our peer connection
// and our WebSocket, plus the terminal outcomes the API's close codes give.
import { CLOSE, type Presence, type RoomState } from "./messages.ts";

export type Phase =
  | "connecting"
  | "waiting"
  | "in_session"
  | "reconnecting"
  | "left" // this person pressed Leave
  | "ended" // the room ended, or the link stopped working
  | "replaced" // joined from another tab or device
  | "failed";

type PeerState = RTCPeerConnectionState | "none";

export type CallState = {
  phase: Phase;
  ws: "connecting" | "open" | "closed";
  // True once a socket has opened, so a later close reads "reconnecting".
  opened: boolean;
  room: RoomState | null;
  other: Presence | null;
  pc: PeerState;
  // The other participant pressed Leave; cleared when they come back.
  otherLeft: boolean;
  // Consecutive 4001 closes: one gets a fresh ticket, two is a failure.
  ticketRejects: number;
  weak: boolean;
  // The call reached In session at least once (picks the failure copy).
  connectedOnce: boolean;
  // Asks the page to read the session state again (refused ticket, 4002).
  refresh: boolean;
};

export type CallEvent =
  | { type: "join" }
  | { type: "ws-open" }
  | { type: "ws-close"; code: number }
  | { type: "peer-state"; room: RoomState; other: Presence }
  | { type: "other-left" }
  | { type: "pc"; state: PeerState }
  | { type: "weak"; weak: boolean }
  | { type: "ticket-refused" }
  | { type: "give-up" }
  | { type: "leave" };

export const initialCall: CallState = {
  phase: "connecting",
  ws: "connecting",
  opened: false,
  room: null,
  other: null,
  pc: "none",
  otherLeft: false,
  ticketRejects: 0,
  weak: false,
  connectedOnce: false,
  refresh: false,
};

const TERMINAL = new Set<Phase>(["left", "ended", "replaced", "failed"]);

export const isTerminal = (phase: Phase) => TERMINAL.has(phase);

// What a socket close means: stop for good, try again at once with a new
// ticket, or back off and try again. 1006 (a refused handshake or a lost
// network) and 1001 (server restarting) back off like any other drop.
export function closeOutcome(
  code: number,
  ticketRejects: number,
): "replaced" | "ended" | "failed" | "retry-now" | "backoff" {
  if (code === CLOSE.replaced) return "replaced";
  if (code === CLOSE.roomEnded) return "ended";
  if (code === CLOSE.invalidMessage || code === CLOSE.tooLarge) return "failed";
  if (code === CLOSE.ticketInvalid) {
    return ticketRejects >= 1 ? "failed" : "retry-now";
  }
  return "backoff";
}

// The live phase from the facts. In session needs both the room and our
// own connection: the room says both sockets are present, the peer
// connection says media can flow.
function livePhase(s: CallState): Phase {
  if (s.ws !== "open") return s.opened ? "reconnecting" : "connecting";
  if (s.room === null) return "connecting";
  if (s.other !== "connected") return "waiting";
  if (s.pc === "disconnected" || s.pc === "failed") return "reconnecting";
  if (s.pc === "connected" && s.room === "in_session") return "in_session";
  return "connecting";
}

function settle(s: CallState): CallState {
  if (isTerminal(s.phase)) return s;
  const phase = livePhase(s);
  return {
    ...s,
    phase,
    connectedOnce: s.connectedOnce || phase === "in_session",
  };
}

export function callReducer(state: CallState, event: CallEvent): CallState {
  if (event.type === "join") return { ...initialCall };
  // Nothing moves a call out of a terminal phase except a new join.
  if (isTerminal(state.phase)) return state;

  switch (event.type) {
    case "ws-open":
      return settle({ ...state, ws: "open", opened: true });
    case "ws-close": {
      const outcome = closeOutcome(event.code, state.ticketRejects);
      const closed = {
        ...state,
        ws: "closed" as const,
        ticketRejects:
          event.code === CLOSE.ticketInvalid ? state.ticketRejects + 1 : 0,
      };
      if (outcome === "replaced" || outcome === "failed") {
        return { ...closed, phase: outcome };
      }
      if (outcome === "ended") {
        return { ...closed, phase: "ended", refresh: true };
      }
      return settle(closed);
    }
    case "peer-state":
      if (event.room === "ended") {
        return { ...state, phase: "ended", room: "ended", refresh: true };
      }
      return settle({
        ...state,
        room: event.room,
        other: event.other,
        otherLeft: event.other === "connected" ? false : state.otherLeft,
        ticketRejects: 0,
      });
    case "other-left":
      return settle({ ...state, otherLeft: true, other: "disconnected" });
    case "pc":
      return settle({ ...state, pc: event.state });
    case "weak":
      return { ...state, weak: event.weak };
    case "ticket-refused":
      return { ...state, phase: "ended", refresh: true };
    case "give-up":
      return { ...state, phase: "failed" };
    case "leave":
      return { ...state, phase: "left" };
  }
}
