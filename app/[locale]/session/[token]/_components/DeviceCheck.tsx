"use client";
import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Microphone,
  MicrophoneSlash,
  VideoCamera,
  VideoCameraSlash,
} from "@phosphor-icons/react";
import { Button } from "@/components/admin/Button";
import { Select } from "@/components/admin/Select";
import type {
  LocalMedia,
  TrackToggle,
} from "@/components/session/useLocalMedia";
import {
  listDevices,
  type DeviceChoice,
  type Devices,
} from "@/lib/session/media";
import { MicLevel } from "./MicLevel";

const PROBLEM_KEYS = {
  denied: "denied",
  "in-use": "inUse",
  insecure: "insecure",
  "no-device": "noDevice",
  unknown: "unknown",
} as const;

// Brief §9 Check devices (#80): a mirrored camera preview (muted, so no
// sound plays by itself), a microphone level, the two switches, device
// pickers when there is a choice, and Join. Every failure says what to do.
export function DeviceCheck({
  local,
  request,
  mic,
  camera,
  onJoin,
}: {
  local: LocalMedia;
  request: (choice?: DeviceChoice) => Promise<void>;
  mic: TrackToggle;
  camera: TrackToggle;
  onJoin: (stream: MediaStream) => void;
}) {
  const t = useTranslations("session.check");
  const video = useRef<HTMLVideoElement>(null);
  const noCameraId = useId();
  const [devices, setDevices] = useState<Devices>({ cameras: [], mics: [] });
  const stream = local.status === "ready" ? local.stream : null;

  useEffect(() => {
    if (local.status === "idle") void request();
  }, [local.status, request]);

  useEffect(() => {
    if (video.current) video.current.srcObject = stream;
    if (stream) void listDevices().then(setDevices, () => {});
  }, [stream]);

  const current = (kind: "audio" | "video") =>
    stream
      ?.getTracks()
      .find((track) => track.kind === kind)
      ?.getSettings().deviceId ?? "";
  const choose = (choice: DeviceChoice) =>
    void request({
      cameraId: choice.cameraId ?? (current("video") || undefined),
      micId: choice.micId ?? (current("audio") || undefined),
    });

  const showVideo = stream && camera.available && camera.on;
  const toggleClass =
    "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-control border-2 px-4 py-2 text-[0.9rem] font-semibold transition-colors duration-150 motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-60 aria-pressed:border-indigo aria-pressed:bg-indigo/12 aria-pressed:text-indigo border-input-border text-ink";

  return (
    <>
      <div className="relative aspect-video overflow-hidden rounded-inner bg-stage">
        <video
          ref={video}
          muted
          autoPlay
          playsInline
          aria-label={t("preview")}
          className={`h-full w-full -scale-x-100 object-cover ${showVideo ? "" : "invisible"}`}
        />
        {!showVideo && (
          <div className="absolute inset-0 flex items-center justify-center text-canvas">
            <VideoCameraSlash aria-hidden="true" size={40} />
          </div>
        )}
      </div>

      {local.status === "problem" && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-notice border border-red/27 bg-red/7 px-5 py-4 text-[0.95rem] leading-[1.65] text-action"
        >
          <p>{t(`problems.${PROBLEM_KEYS[local.problem]}`)}</p>
          {local.problem === "denied" && (
            <p className="text-ink/80">{t("problems.deniedHelp")}</p>
          )}
          {local.problem !== "insecure" && (
            <Button
              variant="secondary"
              className="self-start"
              onClick={() => void request()}
            >
              {t("tryAgain")}
            </Button>
          )}
        </div>
      )}

      {stream && (
        <div className="flex flex-col gap-4">
          <MicLevel stream={stream} on={mic.on} label={t("level")} />
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              aria-pressed={mic.on}
              onClick={mic.toggle}
              className={toggleClass}
            >
              {mic.on ? (
                <Microphone aria-hidden="true" size={20} />
              ) : (
                <MicrophoneSlash aria-hidden="true" size={20} />
              )}
              {t("microphone")}
            </button>
            <div>
              <button
                type="button"
                aria-pressed={camera.available && camera.on}
                disabled={!camera.available}
                aria-describedby={camera.available ? undefined : noCameraId}
                onClick={camera.toggle}
                className={toggleClass}
              >
                {camera.available && camera.on ? (
                  <VideoCamera aria-hidden="true" size={20} />
                ) : (
                  <VideoCameraSlash aria-hidden="true" size={20} />
                )}
                {t("camera")}
              </button>
              {!camera.available && (
                <p id={noCameraId} className="mt-1 text-[0.85rem] text-muted">
                  {t("noCamera")}
                </p>
              )}
            </div>
          </div>
          {(devices.cameras.length > 1 || devices.mics.length > 1) && (
            <div className="grid gap-4 sm:grid-cols-2">
              {devices.cameras.length > 1 && (
                <Select
                  label={t("camera")}
                  name="camera"
                  value={current("video")}
                  onChange={(e) => choose({ cameraId: e.target.value })}
                  options={devices.cameras.map((d, i) => ({
                    value: d.deviceId,
                    label: d.label || `${t("camera")} ${i + 1}`,
                  }))}
                />
              )}
              {devices.mics.length > 1 && (
                <Select
                  label={t("microphone")}
                  name="microphone"
                  value={current("audio")}
                  onChange={(e) => choose({ micId: e.target.value })}
                  options={devices.mics.map((d, i) => ({
                    value: d.deviceId,
                    label: d.label || `${t("microphone")} ${i + 1}`,
                  }))}
                />
              )}
            </div>
          )}
        </div>
      )}

      <Button
        size="page"
        className="self-stretch sm:self-start"
        disabled={!stream}
        busy={local.status === "requesting"}
        onClick={() => stream && onJoin(stream)}
      >
        {local.status === "requesting" ? t("requesting") : t("join")}
      </Button>
    </>
  );
}
