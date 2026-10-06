"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  CircleNotch,
  HourglassMedium,
  SpeakerHigh,
  VideoCamera,
  VideoCameraSlash,
  WifiLow,
} from "@phosphor-icons/react";
import { Dialog } from "@/components/admin/Dialog";
import type { Phase } from "@/lib/session/machine";
import { ControlBar } from "./ControlBar";
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

function Status({ phase, otherLeft }: { phase: Phase; otherLeft: boolean }) {
  const t = useTranslations("session.stage");
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
        {t("pillInSession")}
      </span>
    );
  }
  if (phase === "waiting") {
    return (
      <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className={pill}>
          <HourglassMedium aria-hidden="true" size={16} />
          {t("pillWaiting")}
        </span>
        <span className="text-[0.92rem]">
          {otherLeft ? t("otherLeft") : t("waiting")}
        </span>
      </span>
    );
  }
  return (
    <span className={pill}>
      {spinner}
      {phase === "reconnecting" ? t("reconnecting") : t("connecting")}
    </span>
  );
}

// Brief §9 stage (#80–#82): the #33334d stage over the whole viewport,
// Daw Mi's video large, this person's small and mirrored in the corner,
// the state at the top (a live region), the weak-link banner, and the
// controls above the phone's home bar. The remote video is not muted: her
// voice must play. If the browser blocks that, one tap starts it.
export function SessionStage({
  phase,
  otherLeft,
  weak,
  local,
  remote,
  mic,
  camera,
  onLeave,
}: {
  phase: Phase;
  otherLeft: boolean;
  weak: boolean;
  local: MediaStream;
  remote: MediaStream | null;
  mic: TrackToggle;
  camera: TrackToggle;
  onLeave: () => void;
}) {
  const t = useTranslations("session");
  const remoteVideo = useRef<HTMLVideoElement>(null);
  const selfVideo = useRef<HTMLVideoElement>(null);
  const [blocked, setBlocked] = useState(false);
  const [confirming, setConfirming] = useState(false);
  useWakeLock();

  // The stage covers the page; the page behind must not scroll under it.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("overflow-hidden");
    return () => root.classList.remove("overflow-hidden");
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
    <div className="session-stage fixed inset-0 z-50 flex h-dvh flex-col bg-stage text-canvas">
      <div
        role="status"
        className="flex min-h-14 items-center px-4 pt-[max(12px,env(safe-area-inset-top))] md:px-6"
      >
        <Status phase={phase} otherLeft={otherLeft} />
      </div>

      <div className="relative min-h-0 flex-1">
        <video
          ref={remoteVideo}
          autoPlay
          playsInline
          aria-label={t("stage.remote")}
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
            <p>{t("stage.weak")}</p>
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
            {t("stage.tapAudio")}
          </button>
        )}

        <div className="absolute right-3 bottom-3 aspect-[3/4] w-[120px] overflow-hidden rounded-inner bg-ink shadow-lifted md:w-[200px] landscape:aspect-video">
          <video
            ref={selfVideo}
            muted
            autoPlay
            playsInline
            aria-label={t("stage.self")}
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
        <ControlBar
          mic={mic}
          camera={camera}
          onLeave={() => setConfirming(true)}
        />
      </div>

      <Dialog
        open={confirming}
        onClose={() => setConfirming(false)}
        title={t("leave.title")}
        cancelLabel={t("leave.stay")}
        confirmLabel={t("leave.confirm")}
        onConfirm={() => {
          setConfirming(false);
          onLeave();
        }}
      >
        <p>{t("leave.text")}</p>
      </Dialog>
    </div>
  );
}
