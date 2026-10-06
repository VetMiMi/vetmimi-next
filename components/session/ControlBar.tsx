"use client";
import type { KeyboardEvent, ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  Microphone,
  MicrophoneSlash,
  PhoneDisconnect,
  VideoCamera,
  VideoCameraSlash,
} from "@phosphor-icons/react";
import type { TrackToggle } from "./useLocalMedia";

// Arrow keys move between the buttons of the one toolbar; Tab still
// reaches each of them.
function moveFocus(event: KeyboardEvent<HTMLDivElement>) {
  const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[
    event.key
  ];
  if (!step) return;
  const buttons = [...event.currentTarget.querySelectorAll("button")];
  const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
  buttons.at((index + step) % buttons.length)?.focus();
  event.preventDefault();
}

function ControlButton({
  label,
  pressed,
  danger = false,
  disabled = false,
  onClick,
  children,
}: {
  label: string;
  pressed?: boolean;
  danger?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  const tone = danger
    ? "bg-action hover:bg-action-hover"
    : "bg-canvas/12 hover:bg-canvas/24 aria-pressed:bg-canvas aria-pressed:text-stage";
  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        type="button"
        aria-label={label}
        aria-pressed={pressed}
        title={label}
        disabled={disabled}
        onClick={onClick}
        className={`flex size-12 cursor-pointer items-center justify-center rounded-full text-canvas transition-colors duration-150 motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-50 ${tone}`}
      >
        {children}
      </button>
      <span aria-hidden="true" className="hidden text-[0.78rem] md:block">
        {label}
      </span>
    </div>
  );
}

// Brief §9 In session: 48px round buttons (the lightbox's tint) for the
// microphone, the camera and Leave, which is #ab4347. A pressed switch is
// filled canvas and shows the crossed-out icon, never colour alone.
export function ControlBar({
  mic,
  camera,
  onLeave,
}: {
  mic: TrackToggle;
  camera: TrackToggle;
  onLeave: () => void;
}) {
  const t = useTranslations("session.stage");
  return (
    <div
      role="toolbar"
      aria-label={t("controls")}
      onKeyDown={moveFocus}
      className="flex items-start justify-center gap-5 md:gap-8"
    >
      <ControlButton label={t("mute")} pressed={!mic.on} onClick={mic.toggle}>
        {mic.on ? (
          <Microphone aria-hidden="true" size={22} />
        ) : (
          <MicrophoneSlash aria-hidden="true" size={22} />
        )}
      </ControlButton>
      <ControlButton
        label={t("cameraOff")}
        pressed={camera.available ? !camera.on : undefined}
        disabled={!camera.available}
        onClick={camera.toggle}
      >
        {camera.available && camera.on ? (
          <VideoCamera aria-hidden="true" size={22} />
        ) : (
          <VideoCameraSlash aria-hidden="true" size={22} />
        )}
      </ControlButton>
      <ControlButton label={t("leave")} danger onClick={onLeave}>
        <PhoneDisconnect aria-hidden="true" size={22} />
      </ControlButton>
    </div>
  );
}
