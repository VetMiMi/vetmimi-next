import {
  parseServerMessage,
  type ClientMessage,
  type ServerMessage,
} from "./messages";

export type Signaling = {
  send: (message: ClientMessage) => void;
  close: () => void;
};

// The room's WebSocket (ADR-007: the one connection the browser makes to
// the API itself). Sends `join` as soon as it opens. Frames that do not
// parse are dropped, never thrown: a newer API may send a type this page
// does not know yet.
export function openSignaling(
  websocketUrl: string,
  ticket: string,
  on: {
    open: () => void;
    message: (message: ServerMessage) => void;
    close: (code: number) => void;
  },
): Signaling {
  const url = new URL(websocketUrl);
  url.searchParams.set("ticket", ticket);
  const ws = new WebSocket(url);
  const send = (message: ClientMessage) => {
    if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(message));
  };
  ws.onopen = () => {
    send({ type: "join" });
    on.open();
  };
  ws.onmessage = (event) => {
    const message = parseServerMessage(event.data);
    if (message) on.message(message);
  };
  ws.onclose = (event) => on.close(event.code);
  return {
    send,
    // Our own close: the caller already knows, so no close callback.
    close() {
      ws.onopen = ws.onmessage = ws.onclose = null;
      ws.close(1000);
    },
  };
}
