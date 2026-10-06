"use client";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { SessionCall } from "./call";
import { callReducer, initialCall, isTerminal } from "./machine";
import { RECONNECT_LIMIT_MS } from "./reconnect";

// The call as React state for the stage (#81, #82). `join` starts a call
// with the given tracks; `leave` ends it on purpose. A call that has been
// connecting or reconnecting for 90 s in a row gives up as `failed`.
export function useSession(token: string) {
  const [state, dispatch] = useReducer(callReducer, initialCall);
  const [remote, setRemote] = useState<MediaStream | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const call = useRef<SessionCall | null>(null);

  useEffect(() => {
    if (!stream) return;
    const current = new SessionCall({
      token,
      stream,
      dispatch,
      onRemote: setRemote,
    });
    call.current = current;
    current.start();
    // Closing the tab or going back: say goodbye if the socket is still
    // up; the API's ping notices anything else.
    const onPageHide = () => current.leave();
    window.addEventListener("pagehide", onPageHide);
    return () => {
      window.removeEventListener("pagehide", onPageHide);
      current.leave();
      call.current = null;
    };
  }, [token, stream]);

  const struggling =
    state.phase === "connecting" || state.phase === "reconnecting";
  useEffect(() => {
    if (!struggling) return;
    const timer = setTimeout(() => {
      call.current?.stop();
      dispatch({ type: "give-up" });
    }, RECONNECT_LIMIT_MS);
    return () => clearTimeout(timer);
  }, [struggling]);

  // A terminal phase closes the call; the tracks stay with the page.
  const terminal = isTerminal(state.phase);
  useEffect(() => {
    if (terminal) call.current?.stop();
  }, [terminal]);

  const join = useCallback((media: MediaStream) => {
    dispatch({ type: "join" });
    setRemote(null);
    // A new object each time, so the effect runs again for a rejoin.
    setStream(new MediaStream(media.getTracks()));
  }, []);

  const leave = useCallback(() => {
    call.current?.leave();
    dispatch({ type: "leave" });
    setStream(null);
  }, []);

  return { state, remote, join, leave };
}
