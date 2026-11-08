"use client";
import { useCallback, useEffect, useReducer, useRef } from "react";
import {
  boardReducer,
  initialBoard,
  parseBoardMessage,
  syncMessages,
  type BoardMessage,
  type Role,
} from "./board";

// The whiteboard for one side of the call. The board lives here, not on the
// peer connection, so a reconnect keeps the drawing; when the new channel
// opens, both sides send theirs and the one with more changes is kept.
export function useWhiteboard(role: Role) {
  const [state, dispatch] = useReducer(boardReducer, initialBoard);
  const channel = useRef<RTCDataChannel | null>(null);
  const board = useRef(state.board);

  useEffect(() => {
    board.current = state.board;
  }, [state.board]);

  const send = useCallback((message: BoardMessage) => {
    const open = channel.current;
    if (open?.readyState === "open") open.send(JSON.stringify(message));
  }, []);

  // A change made here: shown at once, then sent to the other side.
  const act = useCallback(
    (message: BoardMessage) => {
      dispatch(message);
      send(message);
    },
    [send],
  );

  const attach = useCallback((next: RTCDataChannel) => {
    channel.current = next;
    next.onopen = () => {
      for (const message of syncMessages(board.current)) {
        next.send(JSON.stringify(message));
      }
    };
    next.onmessage = ({ data }) => {
      const message = parseBoardMessage(data);
      if (message) dispatch(message);
    };
    next.onclose = () => {
      if (channel.current === next) channel.current = null;
      dispatch({ t: "pointer-off" });
    };
  }, []);

  return {
    role,
    board: state.board,
    pointer: state.pointer,
    act,
    send,
    attach,
  };
}

export type Whiteboard = ReturnType<typeof useWhiteboard>;
