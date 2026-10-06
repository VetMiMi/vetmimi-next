"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  requestMedia,
  stopStream,
  type DeviceChoice,
  type MediaProblem,
} from "@/lib/session/media";

export type LocalMedia =
  | { status: "idle" | "requesting" }
  | { status: "ready"; stream: MediaStream; audioOnly: boolean }
  | { status: "problem"; problem: MediaProblem };

// This person's camera and microphone, from the device check through the
// call. Tracks stop on `stop`, on a new request and when the page goes.
export function useLocalMedia() {
  const [local, setLocal] = useState<LocalMedia>({ status: "idle" });
  const stream = useRef<MediaStream | null>(null);
  // Only the latest request wins when a person switches devices quickly.
  const latest = useRef(0);

  const request = useCallback(async (choice: DeviceChoice = {}) => {
    const id = ++latest.current;
    stopStream(stream.current);
    stream.current = null;
    setLocal({ status: "requesting" });
    const result = await requestMedia(choice);
    if (id !== latest.current) {
      if (result.ok) stopStream(result.stream);
      return;
    }
    if (result.ok) {
      stream.current = result.stream;
      setLocal({
        status: "ready",
        stream: result.stream,
        audioOnly: result.audioOnly,
      });
    } else {
      setLocal({ status: "problem", problem: result.problem });
    }
  }, []);

  const stop = useCallback(() => {
    latest.current++;
    stopStream(stream.current);
    stream.current = null;
    setLocal({ status: "idle" });
  }, []);

  useEffect(() => () => stopStream(stream.current), []);

  return { local, request, stop };
}

// A microphone or camera switch: `track.enabled`, so turning it back on
// needs no new permission and no renegotiation.
export function useTrackToggle(
  stream: MediaStream | null,
  kind: "audio" | "video",
) {
  const [on, setOn] = useState(true);
  useEffect(() => {
    stream
      ?.getTracks()
      .filter((track) => track.kind === kind)
      .forEach((track) => (track.enabled = on));
  }, [stream, kind, on]);
  const available = Boolean(stream?.getTracks().some((t) => t.kind === kind));
  return { on, available, toggle: () => setOn((value) => !value) };
}

export type TrackToggle = ReturnType<typeof useTrackToggle>;
