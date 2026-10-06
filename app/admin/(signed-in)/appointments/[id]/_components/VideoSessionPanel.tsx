"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { VideoCamera } from "@phosphor-icons/react";
import { Button } from "@/components/admin/Button";
import { Dialog } from "@/components/admin/Dialog";
import { Notice } from "@/components/admin/Notice";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useToast } from "@/components/admin/Toast";
import type { components } from "@/lib/api/schema";
import { clock, roomWindow, videoPanelState } from "@/lib/admin/videoSession";
import { endVideo, startVideo } from "../videoActions";

type Detail = components["schemas"]["AppointmentDetail"];

const DAY = 86_400_000;

const notStartable = (closesAt: string) =>
  Date.now() < Date.parse(closesAt)
    ? "This session cannot be started now. Refresh to see the latest."
    : "The session window has closed. The appointment stays Confirmed until you mark it.";

// The appointment's VetMiMi room (#83): its state and window, Start session
// while the API allows it (the page's primary action then), End session
// once the window has opened. Before the window the page refreshes itself
// when it opens, so the button wakes up without a reload.
export function VideoSessionPanel({
  appointment: a,
  now,
}: {
  appointment: Detail & { videoRoom: NonNullable<Detail["videoRoom"]> };
  now: string;
}) {
  const room = a.videoRoom;
  const state = videoPanelState(a, now);
  const router = useRouter();
  const toast = useToast();
  const [starting, startTransition] = useTransition();
  const [ending, endTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string>();
  const [endError, setEndError] = useState<string>();
  const sending = useRef(false);

  useEffect(() => {
    if (state !== "before_window") return;
    const wait = Date.parse(room.opensAt) - Date.parse(now);
    if (wait > DAY) return;
    const timer = setTimeout(() => router.refresh(), wait + 1000);
    return () => clearTimeout(timer);
  }, [state, room.opensAt, now, router]);

  function start() {
    setError(undefined);
    startTransition(async () => {
      const result = await startVideo(a.id);
      if (result.ok) {
        router.push(`/admin/appointments/${a.id}/session`);
        return;
      }
      setError(
        result.code === "not_ready"
          ? notStartable(room.closesAt)
          : result.code === "forbidden"
            ? "Your account cannot start sessions. If you need to, ask the site administrator."
            : "The session could not be started. Nothing has changed; try again.",
      );
    });
  }

  function end() {
    if (sending.current) return;
    sending.current = true;
    endTransition(async () => {
      const outcome = await endVideo(a.id);
      sending.current = false;
      if (outcome.ok) {
        setConfirming(false);
        toast("Session ended");
        return;
      }
      if (outcome.code === "invalid_transition") {
        setConfirming(false);
        setError(outcome.message);
        router.refresh();
        return;
      }
      setEndError(outcome.message);
    });
  }

  return (
    <div className="flex flex-col items-stretch gap-3 text-[0.95rem]">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <StatusBadge kind="room" status={room.state} />
        <span className="text-muted">{roomWindow(room, a.timezone)}</span>
      </div>

      {state === "can_start" && (
        <Button
          size="page"
          busy={starting}
          icon={<VideoCamera aria-hidden="true" size={20} />}
          onClick={start}
        >
          {starting
            ? "Starting…"
            : room.state === "in_session"
              ? "Rejoin session"
              : "Start session"}
        </Button>
      )}
      {state === "before_window" && (
        <>
          <Button
            size="page"
            disabled
            icon={<VideoCamera aria-hidden="true" size={20} />}
          >
            Start session
          </Button>
          <p className="text-[0.88rem] text-muted">
            Opens at {clock(room.opensAt, a.timezone)}.
          </p>
        </>
      )}
      {state === "ended" && room.endedAt && (
        <p className="text-muted">
          Session ended {clock(room.endedAt, a.timezone)}.
        </p>
      )}
      {state === "closed" && (
        <p className="text-muted">
          The session window closed at {clock(room.closesAt, a.timezone)}.
        </p>
      )}
      {error && <Notice tone="error">{error}</Notice>}
      {error && (
        <Button
          variant="secondary"
          className="self-start"
          onClick={() => {
            setError(undefined);
            router.refresh();
          }}
        >
          Refresh
        </Button>
      )}

      {a.allowedActions.includes("end_video") && (
        <Button
          variant="quiet"
          className="self-start"
          onClick={() => {
            setEndError(undefined);
            setConfirming(true);
          }}
        >
          End session
        </Button>
      )}

      <Dialog
        open={confirming}
        onClose={() => setConfirming(false)}
        title="End this session?"
        cancelLabel="Keep going"
        confirmLabel="End session"
        busyLabel="Ending…"
        busy={ending}
        onConfirm={end}
      >
        {endError && (
          <div className="mb-4">
            <Notice tone="error">{endError}</Notice>
          </div>
        )}
        <p>
          Both of you will be disconnected. The appointment stays Confirmed
          until you mark it.
        </p>
      </Dialog>
    </div>
  );
}
