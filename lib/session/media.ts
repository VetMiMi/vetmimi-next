// Camera and microphone for the session (#80). getUserMedia's failures,
// reduced to what the device check can explain to a person.

export type MediaProblem =
  | "denied" // NotAllowedError: blocked in the browser or the system
  | "in-use" // NotReadableError: another app holds the camera
  | "no-device" // no microphone at all
  | "insecure" // no mediaDevices: plain http on a LAN address
  | "unknown";

export type MediaResult =
  | { ok: true; stream: MediaStream; audioOnly: boolean }
  | { ok: false; problem: MediaProblem };

export type DeviceChoice = { cameraId?: string; micId?: string };

export function mapMediaError(name: string): MediaProblem | "no-camera" {
  switch (name) {
    case "NotAllowedError":
    case "SecurityError":
      return "denied";
    case "NotFoundError":
    case "OverconstrainedError":
      return "no-camera";
    case "NotReadableError":
    case "AbortError":
      return "in-use";
    default:
      return "unknown";
  }
}

const errorName = (error: unknown) =>
  error instanceof Error || error instanceof DOMException ? error.name : "";

function constraints(choice: DeviceChoice, video: boolean) {
  const exact = (id?: string) => (id ? { deviceId: { exact: id } } : {});
  return {
    audio: {
      ...exact(choice.micId),
      echoCancellation: true,
      noiseSuppression: true,
    },
    video: video
      ? {
          ...exact(choice.cameraId),
          width: { ideal: 1280 },
          height: { ideal: 720 },
        }
      : false,
  } satisfies MediaStreamConstraints;
}

// Asks for camera and microphone; with no camera (or the chosen one gone),
// asks again for the microphone alone so the person can still join.
export async function requestMedia(choice: DeviceChoice): Promise<MediaResult> {
  if (!navigator.mediaDevices?.getUserMedia) {
    return { ok: false, problem: "insecure" };
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia(
      constraints(choice, true),
    );
    return { ok: true, stream, audioOnly: false };
  } catch (error) {
    const problem = mapMediaError(errorName(error));
    if (problem !== "no-camera") return { ok: false, problem };
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia(
      constraints(choice, false),
    );
    return { ok: true, stream, audioOnly: true };
  } catch (error) {
    const problem = mapMediaError(errorName(error));
    return {
      ok: false,
      problem: problem === "no-camera" ? "no-device" : problem,
    };
  }
}

export type Devices = { cameras: MediaDeviceInfo[]; mics: MediaDeviceInfo[] };

// Labels are only filled in once permission is granted, so this runs after.
export async function listDevices(): Promise<Devices> {
  const all = await navigator.mediaDevices.enumerateDevices();
  return {
    cameras: all.filter((d) => d.kind === "videoinput" && d.deviceId),
    mics: all.filter((d) => d.kind === "audioinput" && d.deviceId),
  };
}

export function stopStream(stream: MediaStream | null | undefined) {
  stream?.getTracks().forEach((track) => track.stop());
}
