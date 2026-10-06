"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  CircleNotch,
  HourglassMedium,
  SpeakerHigh,
  VideoCamera,
  VideoCameraSlash,
  WifiLow,
} from "@phosphor-icons/react";
import type { Phase } from "@/lib/session/machine";
import { ControlBar } from "./ControlBar";
import type { StageText } from "./text";
import type { TrackToggle } from "./useLocalMedia";
import "@/styles/session.css";

// Keeps the screen on while the call is up, where the browser allows it.
function useWakeLock() {
  useEffect(() => {
    let lock: WakeLockSentinel | null = null;
    const take = () => {
      if (document.visibilityState !== "visible") return;
      navigator.wakeLock?.request("screen").then(
        (sentinel) => (lock = sentinel),
        () => {},
      );
    };
    take();
    document.addEventListener("visibilitychange", take);
    return () => {
      document.removeEventListener("visibilitychange", take);
      void lock?.release();
    };
  }, []);
}

function Status({
  text,
  phase,
  otherLeft,
}: {
  text: StageText;
  phase: Phase;
  otherLeft: boolean;
}) {
  const pill =
    "inline-flex items-center gap-1.5 rounded-pill bg-canvas/12 px-3 py-1 text-[0.82rem] font-semibold";
  const spinner = (
    <CircleNotch
      aria-hidden="true"
      size={16}
      className="animate-spin motion-reduce:animate-none"
    />
  );
  if (phase === "in_session") {
    return (
      <span className={pill}>
        <VideoCamera aria-hidden="true" size={16} />
        {text.pillInSession}
      </span>
    );
  }
  if (phase === "waiting") {
    return (
      <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className={pill}>
          <HourglassMedium aria-hidden="true" size={16} />
          {text.pillWaiting}
        </span>
        <span className="text-[0.92rem]">
          {otherLeft ? text.otherLeft : text.waiting}
        </span>
      </span>
    );
  }
  return (
    <span className={pill}>
      {spinner}
      {phase === "reconnecting" ? text.reconnecting : text.connecting}
    </span>
  );
}

// Brief §9 stage (#80–#82): the #33334d stage over the whole viewport,
// Daw Mi's video large, this person's small and mirrored in the corner,
// the state at the top (a live region), the weak-link banner, and the
// controls above the phone's home bar. The remote video is not muted: her
// voice must play. If the browser blocks that, one tap starts it. The
// visitor's page and Daw Mi's call view in /admin (#83) both use it: the
// words come in as props, `corner` sits before the state (Daw Mi's way back
// to the appointment), and `children` holds the page's own dialogs.
export function SessionStage({
  text,
  corner,
  children,
  phase,
  otherLeft,
  weak,
  local,
  remote,
  mic,
  camera,
  onLeave,
}: {
  text: StageText;
  corner?: ReactNode;
  children?: ReactNode;
  phase: Phase;
  otherLeft: boolean;
  weak: boolean;
  local: MediaStream;
  remote: MediaStream | null;
  mic: TrackToggle;
  camera: TrackToggle;
  onLeave: () => void;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);
  const selfVideo = useRef<HTMLVideoElement>(null);
  const [blocked, setBlocked] = useState(false);
  useWakeLock();

  // The stage covers the page: whatever is behind it (the site header and
  // footer, or the admin shell) must neither scroll under it nor take
  // keyboard focus. That is every sibling of the stage and its ancestors.
  useEffect(() => {
    const root = document.documentElement;
    const behind: Element[] = [];
    let node: HTMLElement | null = stage.current;
    while (node && node !== document.body) {
      const parent: HTMLElement | null = node.parentElement;
      for (const sibling of parent?.children ?? []) {
        if (sibling !== node && !sibling.hasAttribute("inert")) {
          behind.push(sibling);
        }
      }
      node = parent;
    }
    root.classList.add("overflow-hidden");
    behind.forEach((element) => element.setAttribute("inert", ""));
    return () => {
      root.classList.remove("overflow-hidden");
      behind.forEach((element) => element.removeAttribute("inert"));
    };
  }, []);

  useEffect(() => {
    if (selfVideo.current) selfVideo.current.srcObject = local;
  }, [local]);

  useEffect(() => {
    const video = remoteVideo.current;
    if (!video) return;
    video.srcObject = remote;
    if (remote) {
      video.play().then(
        () => setBlocked(false),
        (error: DOMException) => setBlocked(error.name === "NotAllowedError"),
      );
    }
  }, [remote]);

  const showSelf = camera.available && camera.on;

  return (
    <div
      ref={stage}
      className="session-stage fixed inset-0 z-[200] flex h-dvh flex-col bg-stage text-canvas"
    >
      <div className="flex min-h-14 flex-wrap items-center gap-x-5 gap-y-2 px-4 pt-[max(12px,env(safe-area-inset-top))] md:px-6">
        {corner}
        <div role="status">
          <Status text={text} phase={phase} otherLeft={otherLeft} />
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        <video
          ref={remoteVideo}
          autoPlay
          playsInline
          aria-label={text.remote}
          className={`absolute inset-0 h-full w-full object-contain portrait:object-cover ${remote ? "" : "invisible"}`}
        />
        {!remote && (
          <div
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center text-canvas/40"
          >
            {phase === "waiting" ? (
              <HourglassMedium size={56} />
            ) : (
              <CircleNotch
                size={56}
                className="animate-spin motion-reduce:animate-none"
              />
            )}
          </div>
        )}

        {weak && (
          <div
            role="status"
            className="absolute inset-x-3 top-2 mx-auto flex max-w-[520px] items-start gap-2 rounded-notice bg-canvas px-4 py-3 text-[0.9rem] leading-[1.5] text-ink shadow-lifted"
          >
            <WifiLow aria-hidden="true" size={20} className="mt-px shrink-0" />
            <p>{text.weak}</p>
          </div>
        )}

        {blocked && (
          <button
            type="button"
            onClick={() => {
              void remoteVideo.current?.play().then(() => setBlocked(false));
            }}
            className="absolute top-1/2 left-1/2 inline-flex min-h-12 -translate-1/2 cursor-pointer items-center gap-2 rounded-pill bg-canvas px-6 font-semibold text-ink shadow-lifted"
          >
            <SpeakerHigh aria-hidden="true" size={20} />
            {text.tapAudio}
          </button>
        )}

        <div className="absolute right-3 bottom-3 aspect-[3/4] w-[120px] overflow-hidden rounded-inner bg-ink shadow-lifted md:w-[200px] landscape:aspect-video">
          <video
            ref={selfVideo}
            muted
            autoPlay
            playsInline
            aria-label={text.self}
            className={`h-full w-full -scale-x-100 object-cover ${showSelf ? "" : "invisible"}`}
          />
          {!showSelf && (
            <VideoCameraSlash
              aria-hidden="true"
              size={28}
              className="absolute inset-0 m-auto text-canvas/60"
            />
          )}
        </div>
      </div>

      <div className="px-4 pt-4 pb-[max(16px,env(safe-area-inset-bottom))]">
        <ControlBar text={text} mic={mic} camera={camera} onLeave={onLeave} />
      </div>
      {children}
    </div>
  );
}
