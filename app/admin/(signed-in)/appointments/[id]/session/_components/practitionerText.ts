import type { CheckText, StageText } from "@/components/session/text";

// Daw Mi's words for the shared device check and stage (#83). Admin is
// English only; the visitor's side never sees anything but "Daw Mi", but
// Daw Mi may see the visitor's first name.
export const checkText: CheckText = {
  preview: "Your camera preview",
  requesting: "Waiting for permission…",
  join: "Start session",
  noCamera: "No camera found",
  camera: "Camera",
  microphone: "Microphone",
  level: "Microphone level",
  tryAgain: "Try again",
  problems: {
    denied:
      "The camera and microphone are blocked. Allow them in the browser's address bar, then choose Try again.",
    deniedHelp:
      "On an iPhone or iPad, go to Settings › Safari › Camera and Microphone. In Chrome, select the camera icon in the address bar.",
    inUse: "Another app is using the camera. Close it and try again.",
    insecure: "Video sessions need a secure (https) connection.",
    noDevice: "No microphone was found. Connect one, then try again.",
    unknown: "The camera or microphone could not start. Try again.",
  },
};

export const stageText = (visitor: string): StageText => ({
  connecting: "Connecting…",
  reconnecting: "Reconnecting…",
  waiting: `Waiting for ${visitor} to join.`,
  otherLeft: `${visitor} has left. Waiting…`,
  pillWaiting: "Waiting",
  pillInSession: "In session",
  weak: "Your connection is weak. Video may pause; audio will try to continue.",
  remote: `${visitor}'s video`,
  self: "Your video",
  tapAudio: "Tap to start audio",
  controls: "Call controls",
  mute: "Mute",
  cameraOff: "Stop video",
  leave: "End session",
});
